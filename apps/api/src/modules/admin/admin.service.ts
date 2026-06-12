import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

const SETTING_KEYS = ['openai_api_key', 'openai_model', 'openai_base_url', 'ai_provider'] as const;

const FOOD_CATEGORY_FA: Record<string, string> = {
  'برنج': 'RICE', 'نان': 'BREAD', 'سوپ': 'SOUP', 'آش': 'SOUP', 'خورشت': 'STEW', 'خورش': 'STEW',
  'کباب': 'KEBAB', 'سالاد': 'SALAD', 'لبنیات': 'DAIRY', 'میوه': 'FRUIT', 'سبزیجات': 'VEGETABLE',
  'سبزی': 'VEGETABLE', 'حبوبات': 'LEGUME', 'آجیل': 'NUTS', 'شیرینی': 'SWEETS', 'دسر': 'SWEETS',
  'نوشیدنی': 'DRINK', 'فست فود': 'FAST_FOOD', 'فست‌فود': 'FAST_FOOD', 'سنتی': 'TRADITIONAL',
  'صبحانه': 'BREAKFAST_ITEM', 'سس': 'SAUCE',
};
const FOOD_CATEGORIES = [
  'RICE', 'BREAD', 'SOUP', 'STEW', 'KEBAB', 'SALAD', 'DAIRY', 'FRUIT', 'VEGETABLE',
  'LEGUME', 'NUTS', 'SWEETS', 'DRINK', 'FAST_FOOD', 'TRADITIONAL', 'BREAKFAST_ITEM', 'SAUCE',
];

function giLevelOf(gi: number): string {
  if (gi <= 30) return 'VERY_LOW';
  if (gi <= 55) return 'LOW';
  if (gi <= 69) return 'MEDIUM';
  if (gi <= 85) return 'HIGH';
  return 'VERY_HIGH';
}

function normalizeFoodRow(row: any): { data: any; error: string | null } {
  const nameFa = String(row.nameFa ?? row['نام'] ?? row['نام غذا'] ?? '').trim();
  if (!nameFa) return { data: null, error: 'nameFa/نام غذا خالی است' };
  const num = (v: any, fallback = 0) => {
    const n = Number(String(v ?? '').replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))));
    return Number.isFinite(n) ? n : fallback;
  };
  const rawCat = String(row.category ?? row['دسته'] ?? '').trim();
  const category = FOOD_CATEGORIES.includes(rawCat.toUpperCase())
    ? rawCat.toUpperCase()
    : FOOD_CATEGORY_FA[rawCat] ?? 'TRADITIONAL';
  const carbsG = num(row.carbsG ?? row['کربوهیدرات']);
  const glycemicIndex = Math.round(num(row.glycemicIndex ?? row['شاخص گلیسمی'], 50));
  const glycemicLoad = num(row.glycemicLoad ?? row['بار گلیسمی'], Math.round(((glycemicIndex * carbsG) / 100) * 10) / 10);
  return {
    error: null,
    data: {
      nameFa,
      nameEn: String(row.nameEn ?? row['نام انگلیسی'] ?? '').trim() || null,
      category: category as any,
      servingDesc: String(row.servingDesc ?? row['واحد'] ?? 'یک پرس').trim(),
      servingGrams: Math.max(1, Math.round(num(row.servingGrams ?? row['گرم'], 100))),
      calories: Math.max(0, Math.round(num(row.calories ?? row['کالری']))),
      carbsG,
      proteinG: num(row.proteinG ?? row['پروتئین']),
      fatG: num(row.fatG ?? row['چربی']),
      fiberG: num(row.fiberG ?? row['فیبر']),
      sugarG: num(row.sugarG ?? row['قند']),
      glycemicIndex,
      giLevel: giLevelOf(glycemicIndex) as any,
      glycemicLoad,
      sugarSpikeNote: String(row.sugarSpikeNote ?? row['توضیح قند'] ?? '').trim() || null,
      healthierSwap: String(row.healthierSwap ?? row['جایگزین سالم'] ?? '').trim() || null,
    },
  };
}

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

  async getFoods(query: any) {
    return this.prisma.iranianFood.findMany({
      where: query.search
        ? { OR: [{ nameFa: { contains: query.search, mode: 'insensitive' } }, { nameEn: { contains: query.search, mode: 'insensitive' } }] }
        : undefined,
      orderBy: [{ category: 'asc' }, { nameFa: 'asc' }],
      take: 500,
    });
  }

  async createFood(dto: any) {
    const normalized = normalizeFoodRow(dto);
    if (normalized.error) throw new BadRequestException(normalized.error);
    const exists = await this.prisma.iranianFood.findUnique({ where: { nameFa: normalized.data.nameFa } });
    if (exists) throw new ConflictException('غذایی با این نام قبلاً ثبت شده است');
    return this.prisma.iranianFood.create({ data: normalized.data });
  }

  async importFoods(rows: any[]) {
    if (!Array.isArray(rows) || !rows.length) throw new BadRequestException('فایل خالی است');
    if (rows.length > 2000) throw new BadRequestException('حداکثر ۲۰۰۰ ردیف در هر ایمپورت');
    let created = 0;
    let updated = 0;
    const errors: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      const normalized = normalizeFoodRow(rows[i]);
      if (normalized.error) {
        errors.push(`ردیف ${i + 1}: ${normalized.error}`);
        continue;
      }
      try {
        const existing = await this.prisma.iranianFood.findUnique({ where: { nameFa: normalized.data.nameFa } });
        if (existing) {
          await this.prisma.iranianFood.update({ where: { nameFa: normalized.data.nameFa }, data: normalized.data });
          updated++;
        } else {
          await this.prisma.iranianFood.create({ data: normalized.data });
          created++;
        }
      } catch (e: any) {
        errors.push(`ردیف ${i + 1} (${normalized.data.nameFa}): ${e.message?.substring(0, 80)}`);
      }
    }
    return { created, updated, errors, total: rows.length };
  }

  async deleteFood(id: string) {
    try {
      await this.prisma.iranianFood.delete({ where: { id } });
      return { deleted: true };
    } catch {
      throw new ConflictException('این غذا در وعده‌های ثبت‌شده استفاده شده و قابل حذف نیست');
    }
  }

  async updateSettings(dto: Record<string, string>) {
    for (const key of SETTING_KEYS) {
      const value = dto[key];
      if (typeof value !== 'string') continue;
      if (value === '__CLEAR__') {
        await this.prisma.appSetting.deleteMany({ where: { key } });
      } else if (value.trim() !== '') {
        await this.prisma.appSetting.upsert({
          where: { key },
          create: { key, value: value.trim() },
          update: { value: value.trim() },
        });
      }
    }
    return this.getSettings();
  }
}
