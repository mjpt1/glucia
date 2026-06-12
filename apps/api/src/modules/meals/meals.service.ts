import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { estimateGlucoseRise } from '../../common/utils/health-math';

@Injectable()
export class MealsService {
  constructor(private prisma: PrismaService) {}

  async searchFoods(query: string, category?: string) {
    return this.prisma.iranianFood.findMany({
      where: {
        ...(category && { category: category as any }),
        OR: [
          { nameFa: { contains: query, mode: 'insensitive' } },
          { nameEn: { contains: query, mode: 'insensitive' } },
          { nameTranslit: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { nameFa: 'asc' },
      take: 50,
    });
  }

  async getAllFoods(category?: string) {
    return this.prisma.iranianFood.findMany({
      where: { ...(category && { category: category as any }) },
      orderBy: [{ category: 'asc' }, { nameFa: 'asc' }],
    });
  }

  async getFoodById(id: string) {
    const food = await this.prisma.iranianFood.findUnique({ where: { id } });
    if (!food) throw new NotFoundException('غذا یافت نشد');
    return food;
  }

  async logMeal(userId: string, dto: any) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundException();

    const items: Array<{ foodId: string; servingGrams?: number; servings?: number }> = dto.items ?? [];
    const foods = await this.prisma.iranianFood.findMany({
      where: { id: { in: items.map((i) => i.foodId) } },
    });
    const foodMap = new Map(foods.map((f) => [f.id, f]));

    let totalCalories = 0;
    let totalCarbsG = 0;
    let totalProteinG = 0;
    let totalFatG = 0;
    let estimatedGl = 0;

    const itemRows = items
      .filter((i) => foodMap.has(i.foodId))
      .map((i) => {
        const food = foodMap.get(i.foodId)!;
        const grams = i.servingGrams ?? (i.servings ?? 1) * food.servingGrams;
        const ratio = grams / food.servingGrams;
        totalCalories += food.calories * ratio;
        totalCarbsG += food.carbsG * ratio;
        totalProteinG += food.proteinG * ratio;
        totalFatG += food.fatG * ratio;
        estimatedGl += food.glycemicLoad * ratio;
        return { foodId: i.foodId, servings: ratio, gramsEaten: grams };
      });

    const meal = await this.prisma.meal.create({
      data: {
        patientId: patient.id,
        type: dto.mealType ?? dto.type ?? 'LUNCH',
        eatenAt: dto.eatenAt ? new Date(dto.eatenAt) : new Date(),
        note: dto.note,
        photoUrl: dto.photoUrl,
        totalCalories: Math.round(totalCalories),
        totalCarbsG: Math.round(totalCarbsG * 10) / 10,
        totalProteinG: Math.round(totalProteinG * 10) / 10,
        totalFatG: Math.round(totalFatG * 10) / 10,
        estimatedGl: Math.round(estimatedGl * 10) / 10,
        items: { create: itemRows },
      },
      include: { items: { include: { food: true } } },
    });

    const avgGi = foods.length ? foods.reduce((a, f) => a + f.glycemicIndex, 0) / foods.length : 50;
    return { ...meal, estimatedGlucoseRise: Math.round(estimateGlucoseRise(totalCarbsG, avgGi)) };
  }

  async getMeals(userId: string, query: any) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundException();
    return this.prisma.meal.findMany({
      where: {
        patientId: patient.id,
        type: query.mealType ?? query.type,
        eatenAt: {
          gte: query.from ? new Date(query.from) : new Date(Date.now() - 7 * 86400000),
          lte: query.to ? new Date(query.to) : undefined,
        },
      },
      include: { items: { include: { food: true } } },
      orderBy: { eatenAt: 'desc' },
      take: Math.min(Number(query.limit ?? 100), 500),
    });
  }

  async getMealStats(userId: string, days = 7) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundException();
    const from = new Date(Date.now() - days * 86400000);
    const meals = await this.prisma.meal.findMany({
      where: { patientId: patient.id, eatenAt: { gte: from } },
      select: { totalCalories: true, totalCarbsG: true },
    });
    const count = meals.length;
    const avgCalories = count ? meals.reduce((a, m) => a + m.totalCalories, 0) / count : 0;
    const avgCarbs = count ? meals.reduce((a, m) => a + m.totalCarbsG, 0) / count : 0;
    return { mealCount: count, avgCaloriesPerMeal: Math.round(avgCalories), avgCarbsPerMeal: Math.round(avgCarbs), days };
  }
}
