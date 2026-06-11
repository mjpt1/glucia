import { Controller, Get, Post, Patch, Body, Query, Param, UseGuards } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@Controller('appointments')
@UseGuards(JwtGuard)
export class AppointmentsController {
  constructor(private appts: AppointmentsService) {}

  @Get('doctors')
  getDoctors() { return this.appts.getDoctors(); }

  @Post()
  create(@CurrentUser('sub') userId: string, @Body() dto: any) { return this.appts.create(userId, dto); }

  @Get('patient')
  getPatient(@CurrentUser('sub') userId: string, @Query() query: any) { return this.appts.getPatientAppointments(userId, query); }

  @Get('doctor')
  getDoctor(@CurrentUser('sub') userId: string, @Query() query: any) { return this.appts.getDoctorAppointments(userId, query); }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string; notes?: string }) { return this.appts.updateStatus(id, body.status, body.notes); }
}
