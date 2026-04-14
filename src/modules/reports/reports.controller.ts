import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // Dashboard üçün ümumi hesabatları gətirmək
  @Get('dashboard')
  @ApiOperation({ summary: 'Dashboard üçün ümumi hesabatları gətir (Satış, Xərc, İadə, Xalis Qazanc)' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Başlanğıc tarix (məs: 2025-01-01)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Son tarix (məs: 2025-12-31)',
  })
  getDashboardStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getDashboardStats(startDate, endDate);
  }
}
