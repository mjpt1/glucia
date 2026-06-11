import { Controller, Get, Post, Body, Query, UseGuards, Param } from '@nestjs/common';
import { MealsService } from './meals.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@Controller('meals')
@UseGuards(JwtGuard)
export class MealsController {
  constructor(private meals: MealsService) {}

  @Get('foods')
  getFoods(@Query('q') q: string, @Query('category') category: string) {
    return q ? this.meals.searchFoods(q, category) : this.meals.getAllFoods(category);
  }

  @Get('foods/:id')
  getFood(@Param('id') id: string) { return this.meals.getFoodById(id); }

  @Post()
  logMeal(@CurrentUser('sub') userId: string, @Body() dto: any) { return this.meals.logMeal(userId, dto); }

  @Get()
  getMeals(@CurrentUser('sub') userId: string, @Query() query: any) { return this.meals.getMeals(userId, query); }

  @Get('stats')
  getStats(@CurrentUser('sub') userId: string, @Query('days') days: number) { return this.meals.getMealStats(userId, days ?? 7); }
}
