import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ReturnsService } from './returns.service';
import { CreateCustomerReturnDto, CreateSupplierReturnDto } from './dto/create-return.dto';

@ApiTags('returns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER, Role.CASHIER)
@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  // ==================== MÜŞTƏRİ İADƏSİ ====================

  // Yeni müştəri iadəsi yaratmaq (müştəri malı mağazaya geri qaytarır)
  @Post('customer')
  @ApiOperation({ summary: 'Yeni müştəri iadəsi yarat (mal mağazaya geri qayıdır, stok artır)' })
  createCustomerReturn(@Body() dto: CreateCustomerReturnDto, @Req() req: any) {
    return this.returnsService.createCustomerReturn(req.user.id, dto);
  }

  // Müştəri iadələrinin tarixçəsini gətirmək
  @Get('customer')
  @ApiOperation({ summary: 'Müştəri iadələrinin tarixçəsini gətir (filterlərlə)' })
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
  findAllCustomerReturns(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.returnsService.findAllCustomerReturns(startDate, endDate);
  }

  // ==================== TƏDARİKÇİ İADƏSİ ====================

  // Yeni tədarikçi iadəsi yaratmaq (mağaza malı toptançıya geri qaytarır)
  @Post('supplier')
  @ApiOperation({ summary: 'Yeni tədarikçi iadəsi yarat (mal mağazadan çıxır, stok azalır)' })
  createSupplierReturn(@Body() dto: CreateSupplierReturnDto, @Req() req: any) {
    return this.returnsService.createSupplierReturn(req.user.id, dto);
  }

  // Tədarikçi iadələrinin tarixçəsini gətirmək
  @Get('supplier')
  @ApiOperation({ summary: 'Tədarikçi iadələrinin tarixçəsini gətir (filterlərlə)' })
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
  findAllSupplierReturns(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.returnsService.findAllSupplierReturns(startDate, endDate);
  }
}
