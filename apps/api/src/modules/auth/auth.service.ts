import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes, createHash } from 'crypto';
import { RegisterDto, LoginDto, RefreshDto } from './dto/auth.dto';

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto, ip?: string) {
    const exists = await this.prisma.user.findFirst({
      where: { OR: [{ phone: dto.phone }, ...(dto.email ? [{ email: dto.email }] : [])] },
    });
    if (exists) throw new ConflictException('این شماره یا ایمیل قبلاً ثبت شده است');

    const hash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        email: dto.email,
        passwordHash: hash,
        fullName: dto.fullName,
        role: dto.role ?? 'PATIENT',
      },
    });

    // Create associated profile
    if (user.role === 'PATIENT') {
      await this.prisma.patient.create({ data: { userId: user.id } });
    }

    await this.audit(user.id, 'REGISTER', ip);
    return this.issueTokens(user.id, user.role);
  }

  async login(dto: LoginDto, ip?: string, ua?: string) {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ phone: dto.phone }, ...(dto.phone.includes('@') ? [{ email: dto.phone }] : [])] },
    });
    if (!user) throw new UnauthorizedException('شماره یا رمز اشتباه است');
    if (!user.isActive) throw new ForbiddenException('حساب شما غیرفعال شده است');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('شماره یا رمز اشتباه است');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await this.audit(user.id, 'LOGIN', ip, ua);
    return this.issueTokens(user.id, user.role);
  }

  async refresh(dto: RefreshDto) {
    const hash = sha256(dto.refreshToken);
    const token = await this.prisma.refreshToken.findUnique({ where: { tokenHash: hash } });
    if (!token || token.revokedAt || token.expiresAt < new Date()) {
      throw new UnauthorizedException('توکن نامعتبر یا منقضی شده');
    }
    const user = await this.prisma.user.findUnique({ where: { id: token.userId } });
    if (!user || !user.isActive) throw new ForbiddenException();

    await this.prisma.refreshToken.update({ where: { id: token.id }, data: { revokedAt: new Date() } });
    return this.issueTokens(user.id, user.role);
  }

  async logout(refreshToken: string) {
    const hash = sha256(refreshToken);
    await this.prisma.refreshToken.updateMany({ where: { tokenHash: hash }, data: { revokedAt: new Date() } });
  }

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, phone: true, email: true, fullName: true, avatarUrl: true,
        role: true, isActive: true, isVerified: true, lastLoginAt: true, createdAt: true,
        patient: { select: { id: true, diabetesType: true, healthScore: true, streakDays: true, totalPoints: true } },
        doctor: { select: { id: true, specialty: true, isVerified: true, rating: true } },
      },
    });
  }

  private async issueTokens(userId: string, role: Role) {
    const payload = { sub: userId, role };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET ?? 'dev-secret',
      expiresIn: process.env.JWT_ACCESS_TTL ?? '15m',
    });
    const refreshToken = randomBytes(48).toString('hex');
    const days = parseInt(process.env.JWT_REFRESH_TTL ?? '30', 10);
    await this.prisma.refreshToken.create({
      data: {
        tokenHash: sha256(refreshToken),
        userId,
        expiresAt: new Date(Date.now() + days * 86400000),
      },
    });
    return { accessToken, refreshToken, role };
  }

  private audit(userId: string, action: string, ip?: string, ua?: string) {
    return this.prisma.auditLog.create({ data: { userId, action, ip, userAgent: ua } });
  }
}
