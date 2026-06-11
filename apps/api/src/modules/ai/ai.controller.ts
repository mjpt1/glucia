import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('ai')
@UseGuards(JwtGuard)
export class AiController {
  constructor(private ai: AiService, private prisma: PrismaService) {}

  @Post('insights/generate')
  async generateInsights(@CurrentUser('sub') userId: string) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    return this.ai.generateInsights(patient!.id);
  }

  @Get('insights')
  async getInsights(@CurrentUser('sub') userId: string) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    return this.prisma.aiInsight.findMany({ where: { patientId: patient!.id, expiresAt: { gt: new Date() } }, orderBy: { createdAt: 'desc' }, take: 20 });
  }

  @Post('analyze-meal')
  analyzeMeal(@Body() body: { foodIds: string[]; servings: number[] }) {
    return this.ai.analyzeMeal(body.foodIds, body.servings);
  }

  @Post('chat')
  async chat(@CurrentUser('sub') userId: string, @Body('message') message: string) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    return this.ai.chat(patient!.id, message);
  }
}
