import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

const SETTING_KEYS = ['openai_api_key', 'openai_model', 'openai_base_url'] as const;

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [users, patients, doctors, glucose, meals, appointments] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.patient.count(),
      this.prisma.doctor.count(),
      this.prisma.glucoseLog.count(),
      this.prisma.meal.count(),
      this.prisma.appointment.count(),
    ]);
    const recentUsers = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, fullName: true, phone: true, role: true, createdAt: true },
    });
    return { totals: { users, patients, doctors, glucose, meals, appointments }, recentUsers };
  }

  async getUsers(query: any) {
    return this.prisma.user.findMany({
      where: {
        role: query.role,
        OR: query.search
          ? [
              { fullName: { contains: query.search, mode: 'insensitive' } },
              { phone: { contains: query.search } },
            ]
          : undefined,
      },
      select: { id: true, fullName: true, phone: true, email: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Number(query.limit ?? 50), 200),
      skip: Number(query.offset ?? 0),
    });
  }

  async createUser(dto: any) {
    if (!/^09[0-9]{9}$/.test(dto.phone ?? '')) throw new BadRequestException('شماره موبایل معتبر نیست');
    if (!dto.password || dto.password.length < 8) throw new BadRequestException('رمز عبور حداقل ۸ کاراکتر');
    if (!dto.fullName || dto.fullName.trim().length < 2) throw new BadRequestException('نام معتبر نیست');
    const role = ['PATIENT', 'DOCTOR', 'ADMIN'].includes(dto.role) ? dto.role : 'PATIENT';

    const exists = await this.prisma.user.findFirst({ where: { phone: dto.phone } });
    if (exists) throw new ConflictException('این شماره قبلاً ثبت شده است');

    const hash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: { phone: dto.phone, fullName: dto.fullName.trim(), passwordHash: hash, role, email: dto.email || undefined },
    });

    if (role === 'PATIENT') {
      await this.prisma.patient.create({ data: { userId: user.id } });
    } else if (role === 'DOCTOR') {
      await this.prisma.doctor.create({
        data: {
          userId: user.id,
          medicalCode: `MD-${Date.now()}`,
          specialty: dto.specialty?.trim() || 'غدد و متابولیسم',
        },
      });
    }

    return { id: user.id, phone: user.phone, fullName: user.fullName, role: user.role, createdAt: user.createdAt };
  }

  async toggleUserActive(userId: string, isActive: boolean) {
    return this.prisma.user.update({ where: { id: userId }, data: { isActive } });
  }

  async getAuditLogs(query: any) {
    return this.prisma.auditLog.findMany({
      where: { userId: query.userId, action: query.action },
      include: { user: { select: { fullName: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getSettings() {
    const rows = await this.prisma.appSetting.findMany({ where: { key: { in: [...SETTING_KEYS] } } });
    const map: Record<string, string> = {};
    for (const row of rows) map[row.key] = row.value;
    // Never return the full API key — only enough to show it is configured.
    if (map.openai_api_key) {
      map.openai_api_key_masked = `${map.openai_api_key.slice(0, 6)}…${map.openai_api_key.slice(-4)}`;
      map.openai_api_key = '';
      map.openai_api_key_set = 'true';
    }
    return map;
  }

  async updateSettings(dto: Record<string, string>) {
    const updates = SETTING_KEYS.filter((k) => typeof dto[k] === 'string' && dto[k].trim() !== '');
    for (const key of updates) {
      await this.prisma.appSetting.upsert({
        where: { key },
        create: { key, value: dto[key].trim() },
        update: { value: dto[key].trim() },
      });
    }
    if (dto.openai_api_key === '__CLEAR__') {
      await this.prisma.appSetting.deleteMany({ where: { key: 'openai_api_key' } });
    }
    return this.getSettings();
  }
}
