import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(patientUserId: string, dto: any) {
    const patient = await this.prisma.patient.findUnique({ where: { userId: patientUserId } });
    if (!patient) throw new NotFoundException();
    const scheduledAt = new Date(dto.scheduledAt);
    if (scheduledAt <= new Date()) throw new BadRequestException('زمان نوبت باید در آینده باشد');
    return this.prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: dto.doctorId,
        scheduledAt,
        durationMin: dto.durationMin ?? 30,
        kind: dto.kind ?? 'IN_PERSON',
        reason: dto.reason,
        meetUrl: dto.kind === 'VIDEO' ? `https://meet.glucia.ir/${Date.now()}` : null,
      },
      include: { doctor: { include: { user: { select: { firstName: true, lastName: true } } } } },
    });
  }

  async getPatientAppointments(patientUserId: string, query: any) {
    const patient = await this.prisma.patient.findUnique({ where: { userId: patientUserId } });
    if (!patient) throw new NotFoundException();
    return this.prisma.appointment.findMany({
      where: {
        patientId: patient.id,
        status: query.status,
        scheduledAt: query.upcoming ? { gte: new Date() } : undefined,
      },
      include: { doctor: { include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } } } },
      orderBy: { scheduledAt: query.upcoming ? 'asc' : 'desc' },
    });
  }

  async getDoctorAppointments(doctorUserId: string, query: any) {
    const doctor = await this.prisma.doctor.findUnique({ where: { userId: doctorUserId } });
    if (!doctor) throw new NotFoundException();
    return this.prisma.appointment.findMany({
      where: { doctorId: doctor.id, status: query.status, scheduledAt: query.date ? { gte: new Date(query.date), lt: new Date(new Date(query.date).getTime() + 86400000) } : undefined },
      include: { patient: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } } },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async updateStatus(appointmentId: string, status: string, notes?: string) {
    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: status as any, doctorNotes: notes },
    });
  }

  async getDoctors() {
    return this.prisma.doctor.findMany({
      where: { isActive: true },
      include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
      orderBy: { user: { lastName: 'asc' } },
    });
  }
}
