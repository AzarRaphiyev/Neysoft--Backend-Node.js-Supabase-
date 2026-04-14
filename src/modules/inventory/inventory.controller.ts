import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';

@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER, Role.CASHIER)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // Yeni qaimə yaratmaq (anbara mal daxil etmə)
// src/modules/inventory/inventory.controller.ts

@Post()
@UseGuards(JwtAuthGuard) // ⚠️ Mütləq lazımdır ki, token deşifrə olunsun
@ApiOperation({ summary: 'Yeni qaimə yarat (anbara mal daxil et)' })
async create(@Body() createInventoryDto: CreateInventoryDto, @Req() req: any) {
  // Yoxlama əlavə edirik (Sales-də etdiyimiz kimi)
  if (!req.user || !req.user.id) {
    throw new UnauthorizedException('İstifadəçi məlumatı tapılmadı. Yenidən giriş edin.');
  }
  
  return this.inventoryService.create(createInventoryDto, req.user.id);
}

  // Qaimə tarixçəsini filterlərlə gətirmək
  @Get()
  @ApiOperation({ summary: 'Qaimə tarixçəsini gətir (filterlərlə)' })
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
    name: 'receiptCode',
    required: false,
    description: 'Qaimə kodu ilə axtarış (məs: INV-123456)',
  })
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('receiptCode') receiptCode?: string,
  ) {
    return this.inventoryService.findAll(startDate, endDate, receiptCode);
  }
}
