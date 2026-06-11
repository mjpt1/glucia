import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@Controller('patients')
@UseGuards(JwtGuard)
export class PatientsController {
  constructor(private patients: PatientsService) {}

  @Get('profile')
  getProfile(@CurrentUser('sub') userId: string) { return this.patients.getProfile(userId); }

  @Patch('profile')
  updateProfile(@CurrentUser('sub') userId: string, @Body() dto: any) { return this.patients.updateProfile(userId, dto); }

  @Get('dashboard')
  getDashboard(@CurrentUser('sub') userId: string) { return this.patients.getDashboard(userId); }

  @Get('badges')
  getBadges(@CurrentUser('sub') userId: string) { return this.patients.getBadges(userId); }

  @Get('challenges')
  getChallenges(@CurrentUser('sub') userId: string) { return this.patients.getChallenges(userId); }
}
