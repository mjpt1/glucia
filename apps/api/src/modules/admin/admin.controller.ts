import { Controller, Get, Patch, Body, Query, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('stats')
  getStats() { return this.admin.getStats(); }

  @Get('users')
  getUsers(@Query() query: any) { return this.admin.getUsers(query); }

  @Patch('users/:id/toggle')
  toggleUser(@Param('id') id: string, @Body('isActive') isActive: boolean) { return this.admin.toggleUserActive(id, isActive); }

  @Get('audit-logs')
  getAuditLogs(@Query() query: any) { return this.admin.getAuditLogs(query); }
}
