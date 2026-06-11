import { Controller, Get, Post, Body, Query, UseGuards, Param } from '@nestjs/common';
import { GlucoseService } from './glucose.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('glucose')
@UseGuards(JwtGuard)
export class GlucoseController {
  constructor(
    private glucose: GlucoseService,
    private prisma: PrismaService,
  ) {}

  @Post()
  async create(@CurrentUser('sub') userId: string, @Body() dto: any) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    return this.glucose.create(patient!.id, dto);
  }

  @Get()
  async list(@CurrentUser('sub') userId: string, @Query() query: any) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    return this.glucose.list(patient!.id, query);
  }

  @Get('stats')
  async stats(@CurrentUser('sub') userId: string, @Query('days') days: number) {
    const patient = await this.prisma.patient.findUnique({ where: { userId } });
    return this.glucose.stats(patient!.id, days ?? 14);
  }
}
