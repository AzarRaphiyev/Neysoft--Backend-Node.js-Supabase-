import { Controller, Get, Post, Body, Query, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@ApiTags('sales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER, Role.CASHIER)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  // Yeni satış yaratmaq (fiziki kassa əməliyyatı)
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Yeni satış yarat (kassadan)' })
  async create(@Body() createSaleDto: CreateSaleDto, @Req() req: any) {
    // userId-nin gəldiyini yoxlayırıq
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('İstifadəçi məlumatı tapılmadı.');
    }
    // userId-ni service-ə ötürürük
    return this.salesService.create(createSaleDto, req.user.id);
  }

  // Satış tarixçəsini filterlərlə gətirmək
  @Get()
  @ApiOperation({ summary: 'Satış tarixçəsini gətir (filterlərlə)' })
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
  @ApiQuery({
    name: 'receiptNo',
    required: false,
    description: 'Qəbz nömrəsi ilə axtarış (məs: REC-12345678)',
  })
  @ApiQuery({
    name: 'isReturned',
    required: false,
    type: Boolean,
    description: 'Yalnız iadə edilmiş satışları gətir (true/false)',
  })
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('receiptNo') receiptNo?: string,
    @Query('isReturned') isReturned?: string,
  ) {
    return this.salesService.findAll(startDate, endDate, receiptNo, isReturned === 'true');
  }
}