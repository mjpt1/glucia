import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId },
      include: { user: { select: { id: true, phone: true, email: true, fullName: true, avatarUrl: true, role: true } } },
    });
    if (!patient) throw new NotFoundException('بیمار یافت نشد');
    return patient;
  }

  async updateProfile(userId: string, dto: any) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundException('بیمار یافت نشد');
    const [updatedUser, updatedPatient] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { fullName: dto.fullName ?? undefined, email: dto.email || undefined, avatarUrl: dto.avatarUrl ?? undefined },
      }),
      this.prisma.patient.update({
        where: { id: patient.id },
        data: {
          birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
          gender: dto.gender ?? undefined,
          diabetesType: dto.diabetesType ?? undefined,
          diagnosisYear: dto.diagnosisYear ? Number(dto.diagnosisYear) : undefined,
          weightKg: dto.weightKg ? Number(dto.weightKg) : undefined,
          heightCm: dto.heightCm ? Number(dto.heightCm) : undefined,
          targetGlucoseMin: dto.targetGlucoseMin ? Number(dto.targetGlucoseMin) : undefined,
          targetGlucoseMax: dto.targetGlucoseMax ? Number(dto.targetGlucoseMax) : undefined,
          activityLevel: dto.activityLevel ?? undefined,
        },
      }),
    ]);
    return { ...updatedPatient, user: updatedUser };
  }

  async getDashboard(userId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId },
      include: { user: { select: { fullName: true, avatarUrl: true } } },
    });
    if (!patient) throw new NotFoundException();
    const now = new Date();
    const today = new Date(now.toDateString());
    const [recentGlucose, todayMeals, upcomingAppointment, recentInsights, badges] = await Promise.all([
      this.prisma.glucoseLog.findMany({
        where: { patientId: patient.id, measuredAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        orderBy: { measuredAt: 'desc' },
        take: 10,
      }),
      this.prisma.meal.findMany({
        where: { patientId: patient.id, eatenAt: { gte: today } },
        include: { items: { include: { food: true } } },
      }),
      this.prisma.appointment.findFirst({
        where: { patientId: patient.id, scheduledAt: { gte: now }, status: { in: ['PENDING', 'CONFIRMED'] } },
        include: { doctor: { include: { user: { select: { fullName: true } } } } },
        orderBy: { scheduledAt: 'asc' },
      }),
      this.prisma.aiInsight.findMany({
        where: { patientId: patient.id, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
      this.prisma.patientBadge.findMany({
        where: { patientId: patient.id },
        include: { badge: true },
        orderBy: { earnedAt: 'desc' },
        take: 5,
      }),
    ]);
    return { patient, recentGlucose, todayMeals, upcomingAppointment, recentInsights, badges };
  }

  async getBadges(userId: string) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundException();
    const [earned, all] = await Promise.all([
      this.prisma.patientBadge.findMany({ where: { patientId: patient.id }, include: { badge: true }, orderBy: { earnedAt: 'desc' } }),
      this.prisma.badge.findMany(),
    ]);
    const earnedIds = new Set(earned.map((e) => e.badgeId));
    return { earned, locked: all.filter((b) => !earnedIds.has(b.id)) };
  }

  async getChallenges(userId: string) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundException();
    return this.prisma.patientChallenge.findMany({
      where: { patientId: patient.id },
      include: { challenge: true },
      orderBy: { startedAt: 'desc' },
    });
  }

  async logHealth(userId: string, dto: any) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundException();
    return this.prisma.healthLog.create({
      data: {
        patientId: patient.id,
        kind: dto.kind ?? 'BLOOD_PRESSURE',
        systolic: dto.systolic ? Number(dto.systolic) : undefined,
        diastolic: dto.diastolic ? Number(dto.diastolic) : undefined,
        value: dto.value ? Number(dto.value) : undefined,
        text: dto.text,
        unit: dto.unit,
        loggedAt: dto.loggedAt ? new Date(dto.loggedAt) : new Date(),
      },
    });
  }

  async getHealthLogs(userId: string, query: any) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundException();
    return this.prisma.healthLog.findMany({
      where: { patientId: patient.id, kind: query.kind ?? undefined },
      orderBy: { loggedAt: 'desc' },
      take: Math.min(Number(query.limit ?? 100), 500),
    });
  }
}
