import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@Controller('doctors')
@UseGuards(JwtGuard)
export class DoctorsController {
  constructor(private doctors: DoctorsService) {}

  @Get('profile')
  getProfile(@CurrentUser('sub') userId: string) { return this.doctors.getProfile(userId); }

  @Get('dashboard')
  getDashboard(@CurrentUser('sub') userId: string) { return this.doctors.getDashboard(userId); }

  @Get('patients')
  getPatients(@CurrentUser('sub') userId: string, @Query() query: any) { return this.doctors.getPatients(userId, query); }

  @Get('patients/:id')
  getPatient(@CurrentUser('sub') userId: string, @Param('id') id: string) { return this.doctors.getPatientDetails(userId, id); }

  @Post('prescriptions')
  createPrescription(@CurrentUser('sub') userId: string, @Body() dto: any) { return this.doctors.createPrescription(userId, dto); }

  @Get('prescriptions')
  getPrescriptions(@CurrentUser('sub') userId: string) { return this.doctors.getPrescriptions(userId); }
}
