import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { hba1cFromAvg, timeInRange, estimateGlucoseRise } from '../../common/utils/health-math';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI | null = null;

  constructor(private prisma: PrismaService) {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
  }

  async generateInsights(patientId: string) {
    const patient = await this.prisma.patient.findUnique({ where: { id: patientId }, include: { user: true } });
    if (!patient) return [];
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    const glucoseLogs = await this.prisma.glucoseLog.findMany({ where: { patientId, measuredAt: { gte: sevenDaysAgo } }, take: 200 });
    const meals = await this.prisma.meal.findMany({ where: { patientId, eatenAt: { gte: sevenDaysAgo } }, include: { items: { include: { food: true } } }, take: 50 });
    const insights = [];
    if (glucoseLogs.length >= 5) {
      const values = glucoseLogs.map((l) => l.valueMgDl);
      const tir = timeInRange(values, patient.targetGlucoseMin, patient.targetGlucoseMax);
      const nightLogs = glucoseLogs.filter((l) => { const h = new Date(l.measuredAt).getHours(); return h >= 0 && h <= 6; });
      if (nightLogs.length >= 3) {
        const nightAvg = nightLogs.reduce((a, b) => a + b.valueMgDl, 0) / nightLogs.length;
        if (nightAvg < patient.targetGlucoseMin) {
          insights.push({ type: 'PATTERN', severity: 'HIGH', title: 'الگوی افت قند شبانه', body: `میانگین قند شما بین ساعت ۰ تا ۶ صبح ${Math.round(nightAvg)} mg/dL بوده که زیر حد هدف است. با پزشک مشورت کنید.`, forDoctor: true });
        }
      }
      if (tir >= 70) {
        insights.push({ type: 'ACHIEVEMENT', severity: 'INFO', title: `عالی! ${tir}٪ وقت در محدوده هدف`, body: `هفته گذشته ${tir}٪ از زمان قند خون شما در محدوده هدف بود. ادامه دهید!`, forDoctor: false });
      } else if (tir < 50) {
        insights.push({ type: 'RECOMMENDATION', severity: 'HIGH', title: 'زمان در محدوده هدف کم است', body: `فقط ${tir}٪ در محدوده هدف هستید. وعده‌های منظم‌تر، ورزش روزانه و مصرف به‌موقع دارو کمک می‌کند.`, forDoctor: false });
      }
    }
    if (this.openai && glucoseLogs.length >= 10) {
      try {
        const values = glucoseLogs.map((l) => l.valueMgDl);
        const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
        const tir = timeInRange(values, patient.targetGlucoseMin, patient.targetGlucoseMax);
        const prompt = `تحلیل دیابت نوع ${patient.diabetesType}: میانگین قند=${avg}، TIR=${tir}%. یک بینش مختصر فارسی بنویس.`;
        const res = await this.openai.chat.completions.create({ model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 150 });
        const text = res.choices[0]?.message?.content;
        if (text) insights.push({ type: 'RECOMMENDATION', severity: 'INFO', title: 'بینش هوش مصنوعی', body: text, forDoctor: false });
      } catch (e) { this.logger.warn('OpenAI failed'); }
    }
    const saved = [];
    for (const insight of insights) {
      saved.push(await this.prisma.aiInsight.create({ data: { patientId, type: insight.type as any, severity: insight.severity as any, title: insight.title, body: insight.body, forDoctor: insight.forDoctor, expiresAt: new Date(Date.now() + 7 * 86400000) } }));
    }
    return saved;
  }

  async analyzeMeal(foodIds: string[], servings: number[]) {
    const foods = await this.prisma.iranianFood.findMany({ where: { id: { in: foodIds } } });
    const analysis = foods.map((food, i) => {
      const s = servings[i] ?? 1;
      return { food: food.nameFa, servings: s, calories: Math.round(food.calories * s), carbs: Math.round(food.carbsG * s * 10) / 10, glycemicIndex: food.glycemicIndex, giLevel: food.giLevel, estimatedGlucoseRise: estimateGlucoseRise(food.carbsG * s, food.glycemicIndex), sugarSpikeNote: food.sugarSpikeNote, healthierSwap: food.healthierSwap };
    });
    const totalCarbs = analysis.reduce((a, b) => a + b.carbs, 0);
    const avgGi = foods.length ? foods.reduce((a, b) => a + b.glycemicIndex, 0) / foods.length : 0;
    return { foods: analysis, totalCarbs, totalCalories: analysis.reduce((a, b) => a + b.calories, 0), averageGi: Math.round(avgGi), recommendation: avgGi > 70 ? 'GI بالا - با سالاد شروع و بعد پیاده‌روی کنید' : avgGi > 55 ? 'GI متوسط - ورزش سبک بعد از غذا توصیه می‌شود' : 'GI مناسب برای بیماران دیابتی' };
  }

  async chat(patientId: string, message: string) {
    if (!this.openai) return { reply: 'هوش مصنوعی فعال نیست. با پزشک مشورت کنید.' };
    const patient = await this.prisma.patient.findUnique({ where: { id: patientId }, include: { user: { select: { fullName: true } } } });
    const completion = await this.openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `تو دستیار هوشمند دیابت هستی. همیشه فارسی پاسخ بده. مشاوره علمی، دلسوزانه و ساده بده. این مشاوره جایگزین پزشک نیست. بیمار: ${patient?.user.fullName}` },
        { role: 'user', content: message },
      ],
      max_tokens: 400,
    });
    return { reply: completion.choices[0]?.message?.content ?? 'پاسخی دریافت نشد.' };
  }
}
