import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
      include: { user: { select: { id: true, phone: true, email: true, fullName: true, avatarUrl: true } } },
    });
    if (!doctor) throw new NotFoundException('پزشک یافت نشد');
    return doctor;
  }

  async getPatients(doctorUserId: string, query: any) {
    const doctor = await this.prisma.doctor.findUnique({ where: { userId: doctorUserId } });
    if (!doctor) throw new NotFoundException();
    return this.prisma.patient.findMany({
      where: {
        primaryDoctorId: doctor.id,
        user: query.search
          ? {
              OR: [
                { fullName: { contains: query.search, mode: 'insensitive' } },
                { phone: { contains: query.search } },
              ],
            }
          : undefined,
      },
      include: {
        user: { select: { id: true, fullName: true, phone: true, email: true, avatarUrl: true } },
        _count: { select: { glucoseLogs: true } },
      },
      orderBy: { healthScore: 'asc' },
      take: Math.min(Number(query.limit ?? 50), 200),
    });
  }

  async getPatientDetails(doctorUserId: string, patientId: string) {
    const doctor = await this.prisma.doctor.findUnique({ where: { userId: doctorUserId } });
    if (!doctor) throw new NotFoundException();
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, primaryDoctorId: doctor.id },
      include: {
        user: { select: { fullName: true, phone: true, email: true, avatarUrl: true } },
        glucoseLogs: { orderBy: { measuredAt: 'desc' }, take: 20 },
        aiInsights: {
          where: { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
    if (!patient) throw new NotFoundException('بیمار یافت نشد');
    return patient;
  }

  async createPrescription(doctorUserId: string, dto: any) {
    const doctor = await this.prisma.doctor.findUnique({ where: { userId: doctorUserId } });
    if (!doctor) throw new NotFoundException();
    return this.prisma.prescription.create({
      data: {
        patientId: dto.patientId,
        doctorId: doctor.id,
        diagnosis: dto.diagnosis,
        notes: dto.notes,
        dietPlan: dto.dietPlan,
        exercisePlan: dto.exercisePlan,
        followUpDays: dto.followUpDays ? Number(dto.followUpDays) : undefined,
        items: {
          create: (dto.items ?? []).map((item: any) => ({
            drugName: item.drugName ?? item.medicationName,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration ?? 'تا اطلاع بعدی',
            instruction: item.instruction ?? item.instructions,
          })),
        },
      },
      include: { items: true },
    });
  }

  async getPrescriptions(doctorUserId: string) {
    const doctor = await this.prisma.doctor.findUnique({ where: { userId: doctorUserId } });
    if (!doctor) throw new NotFoundException();
    return this.prisma.prescription.findMany({
      where: { doctorId: doctor.id },
      include: { patient: { include: { user: { select: { fullName: true } } } }, items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDashboard(doctorUserId: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: doctorUserId },
      include: { user: { select: { fullName: true } } },
    });
    if (!doctor) throw new NotFoundException();
    const [patientCount, pendingAppointments, criticalPatients] = await Promise.all([
      this.prisma.patient.count({ where: { primaryDoctorId: doctor.id } }),
      this.prisma.appointment.findMany({
        where: { doctorId: doctor.id, status: 'PENDING', scheduledAt: { gte: new Date() } },
        include: { patient: { include: { user: { select: { fullName: true } } } } },
        orderBy: { scheduledAt: 'asc' },
        take: 10,
      }),
      this.prisma.patient.findMany({
        where: { primaryDoctorId: doctor.id, healthScore: { lt: 50 } },
        include: { user: { select: { fullName: true, phone: true } } },
        orderBy: { healthScore: 'asc' },
        take: 5,
      }),
    ]);
    return { doctor, patientCount, pendingAppointments, criticalPatients };
  }
}
