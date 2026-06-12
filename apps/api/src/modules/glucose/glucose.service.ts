import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { hba1cFromAvg, timeInRange, classifyGlucose, coefficientOfVariation } from '../../common/utils/health-math';

@Injectable()
export class GlucoseService {
  constructor(
    private prisma: PrismaService,
    private realtime: RealtimeGateway,
  ) {}

  async create(patientId: string, dto: any) {
    const log = await this.prisma.glucoseLog.create({
      data: {
        patientId,
        valueMgDl: dto.valueMgDl,
        context: dto.context ?? 'RANDOM',
        note: dto.note,
        source: dto.source ?? 'manual',
        measuredAt: dto.measuredAt ? new Date(dto.measuredAt) : new Date(),
      },
    });

    // Real-time alerts
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: { user: true },
    });

    if (patient) {
      const classification = classifyGlucose(dto.valueMgDl, patient.targetGlucoseMin, patient.targetGlucoseMax);

      if (dto.valueMgDl < patient.targetGlucoseMin) {
        this.realtime.emitToUser(patient.userId, 'alert', {
          severity: dto.valueMgDl < 54 ? 'CRITICAL' : 'HIGH',
          title: dto.valueMgDl < 54 ? 'هشدار افت شدید قند خون' : 'هشدار افت قند خون',
          body: `قند شما ${dto.valueMgDl} mg/dL است. ${dto.valueMgDl < 54 ? 'فوراً با اورژانس تماس بگیرید!' : 'سریعاً ۱۵ گرم کربوهیدرات مصرف کنید.'}`,
          value: dto.valueMgDl,
        });
      } else if (dto.valueMgDl > 250) {
        this.realtime.emitToUser(patient.userId, 'alert', {
          severity: 'HIGH',
          title: 'هشدار قند خون بالا',
          body: `قند شما ${dto.valueMgDl} mg/dL است. آب بنوشید و با پزشک تماس بگیرید.`,
          value: dto.valueMgDl,
        });
      }

      this.realtime.emitToUser(patient.userId, 'glucose:new', { ...log, classification });

      // Update health score
      await this.updateHealthScore(patientId);
    }

    return { ...log, classification: classifyGlucose(dto.valueMgDl) };
  }

  async list(patientId: string, query: any) {
    return this.prisma.glucoseLog.findMany({
      where: {
        patientId,
        measuredAt: {
          gte: query.from ? new Date(query.from) : undefined,
          lte: query.to ? new Date(query.to) : undefined,
        },
        context: query.context,
      },
      orderBy: { measuredAt: 'desc' },
      take: Math.min(query.limit ?? 500, 1000),
      skip: query.offset ?? 0,
    });
  }

  async stats(patientId: string, days = 14) {
    const patient = await this.prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) throw new ForbiddenException();

    const from = new Date(Date.now() - days * 86400000);
    const logs = await this.prisma.glucoseLog.findMany({
      where: { patientId, measuredAt: { gte: from } },
      select: { valueMgDl: true, measuredAt: true, context: true },
      orderBy: { measuredAt: 'asc' },
    });

    if (!logs.length) {
      return {
        count: 0,
        days,
        average: 0,
        min: 0,
        max: 0,
        estimatedHba1c: 0,
        timeInRange: 0,
        timeBelow: 0,
        timeAbove: 0,
        coefficientOfVariation: 0,
        dailyAverages: [] as Array<{ date: string; avg: number; min: number; max: number; count: number }>,
        targetMin: patient.targetGlucoseMin,
        targetMax: patient.targetGlucoseMax,
      };
    }

    const values = logs.map((l) => l.valueMgDl);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const tir = timeInRange(values, patient.targetGlucoseMin, patient.targetGlucoseMax);
    const cv = coefficientOfVariation(values);

    // Daily averages for chart
    const dailyMap = new Map<string, number[]>();
    logs.forEach((l) => {
      const key = l.measuredAt.toISOString().split('T')[0];
      if (!dailyMap.has(key)) dailyMap.set(key, []);
      dailyMap.get(key)!.push(l.valueMgDl);
    });
    const dailyAverages = Array.from(dailyMap.entries()).map(([date, vals]) => ({
      date,
      avg: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
      min: Math.min(...vals),
      max: Math.max(...vals),
      count: vals.length,
    }));

    return {
      count: values.length,
      days,
      average: Math.round(avg),
      min: Math.min(...values),
      max: Math.max(...values),
      estimatedHba1c: hba1cFromAvg(avg),
      timeInRange: tir,
      timeBelow: Math.round((values.filter((v) => v < patient.targetGlucoseMin).length / values.length) * 100),
      timeAbove: Math.round((values.filter((v) => v > patient.targetGlucoseMax).length / values.length) * 100),
      coefficientOfVariation: cv,
      dailyAverages,
      targetMin: patient.targetGlucoseMin,
      targetMax: patient.targetGlucoseMax,
    };
  }

  private async updateHealthScore(patientId: string) {
    const stats = await this.stats(patientId, 7);
    if (!stats.count) return;
    const score = Math.min(100, Math.round(stats.timeInRange * 0.8 + (100 - (stats.coefficientOfVariation ?? 30)) * 0.2));
    await this.prisma.patient.update({ where: { id: patientId }, data: { healthScore: score } });
  }
}
