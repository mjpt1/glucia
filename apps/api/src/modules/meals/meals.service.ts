import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { estimateGlucoseRise } from '../../common/utils/health-math';

@Injectable()
export class MealsService {
  constructor(private prisma: PrismaService) {}

  async searchFoods(query: string, category?: string) {
    return this.prisma.iranianFood.findMany({
      where: {
        isActive: true,
        ...(category && { category: category as any }),
        OR: [
          { nameFa: { contains: query, mode: 'insensitive' } },
          { nameEn: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { nameFa: 'asc' },
      take: 50,
    });
  }

  async getAllFoods(category?: string) {
    return this.prisma.iranianFood.findMany({
      where: { isActive: true, ...(category && { category: category as any }) },
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
    const meal = await this.prisma.meal.create({
      data: {
        patientId: patient.id,
        mealType: dto.mealType ?? 'LUNCH',
        eatenAt: dto.eatenAt ? new Date(dto.eatenAt) : new Date(),
        note: dto.note,
        photoUrl: dto.photoUrl,
        items: {
          create: dto.items.map((item: any) => ({
            foodId: item.foodId,
            servingGrams: item.servingGrams,
          })),
        },
      },
      include: { items: { include: { food: true } } },
    });

    // Compute nutrition totals
    const totals = this.computeTotals(meal.items as any);
    await this.prisma.meal.update({
      where: { id: meal.id },
      data: {
        totalCalories: totals.calories,
        totalCarbsG: totals.carbs,
        totalProteinG: totals.protein,
        totalFatG: totals.fat,
        totalFiberG: totals.fiber,
        estimatedGlucoseRise: totals.glucoseRise,
      },
    });

    return { ...meal, totals };
  }

  async getMeals(userId: string, query: any) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundException();
    return this.prisma.meal.findMany({
      where: {
        patientId: patient.id,
        mealType: query.mealType,
        eatenAt: {
          gte: query.from ? new Date(query.from) : new Date(Date.now() - 7 * 86400000),
          lte: query.to ? new Date(query.to) : undefined,
        },
      },
      include: { items: { include: { food: true } } },
      orderBy: { eatenAt: 'desc' },
      take: Math.min(query.limit ?? 100, 500),
    });
  }

  async getMealStats(userId: string, days = 7) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    if (!patient) throw new NotFoundException();
    const from = new Date(Date.now() - days * 86400000);
    const meals = await this.prisma.meal.findMany({
      where: { patientId: patient.id, eatenAt: { gte: from } },
      include: { items: { include: { food: true } } },
    });
    const totals = meals.map(m => this.computeTotals(m.items as any));
    const avgCalories = totals.length ? totals.reduce((a, b) => a + b.calories, 0) / totals.length : 0;
    const avgCarbs = totals.length ? totals.reduce((a, b) => a + b.carbs, 0) / totals.length : 0;
    return { mealCount: meals.length, avgCaloriesPerMeal: Math.round(avgCalories), avgCarbsPerMeal: Math.round(avgCarbs), days };
  }

  private computeTotals(items: Array<{ servingGrams: number; food: any }>) {
    return items.reduce(
      (acc, item) => {
        const ratio = item.servingGrams / 100;
        const gi = item.food.glycemicIndex ?? 50;
        const carbs = (item.food.carbsPer100g ?? 0) * ratio;
        acc.calories += (item.food.caloriesPer100g ?? 0) * ratio;
        acc.carbs += carbs;
        acc.protein += (item.food.proteinPer100g ?? 0) * ratio;
        acc.fat += (item.food.fatPer100g ?? 0) * ratio;
        acc.fiber += (item.food.fiberPer100g ?? 0) * ratio;
        acc.glucoseRise += estimateGlucoseRise(carbs, gi);
        return acc;
      },
      { calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0, glucoseRise: 0 },
    );
  }
}
