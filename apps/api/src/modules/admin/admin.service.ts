import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

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
}
