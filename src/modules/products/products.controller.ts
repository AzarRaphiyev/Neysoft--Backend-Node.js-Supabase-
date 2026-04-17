import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductPriceDto } from './dto/update-product-price.dto';
import type { Response } from 'express'; // Şəkil (Buffer) qaytarmaq üçün əlavə edildi
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Yeni məhsul əlavə etmək' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Bütün məhsulları gətirmək və filterləmək (Barkod, Ad və Stok)' })
  @ApiQuery({ name: 'search', required: false, description: 'Barkod və ya məhsulun adına görə axtarış' })
  @ApiQuery({ name: 'outOfStock', required: false, type: Boolean, description: 'Yalnız stoku "0" olan (bitən) məhsulları gətir' })
  findAll(
    @Query('search') search?: string,
    @Query('outOfStock') outOfStock?: string,
  ) {
    // Swagger-dən gələn dəyər string olduğu üçün onu boolean-a (true/false) çeviririk
    const isOutOfStock = outOfStock === 'true';
    return this.productsService.findAll(search, isOutOfStock);
  }

  // --- YENİ ƏLAVƏ EDİLƏN ŞTRİXKOD API-Sİ ---
  @Get('barcode/:code')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Verilən koda uyğun qara-ağ ştrixkod şəkli (PNG) qaytarır' })
  async getBarcodeImage(@Param('code') code: string, @Res() res: Response) {
    const buffer = await this.productsService.generateBarcodeImage(code);
    
    // Brauzerə və ya frontendə bunun bir PNG şəkli olduğunu deyirik
    res.set('Content-Type', 'image/png');
    res.send(buffer);
  }

  @Patch(':id/price')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Məhsulun yalnız satış qiymətini yeniləmək' })
  updatePriceById(
    @Param('id') id: string,
    @Body('satis_qiymeti') satisQiymeti: number,
  ) {
    return this.productsService.updateSalePrice(id, Number(satisQiymeti));
  }

  // Barkoda görə məhsulun satış qiymətini sürətli yeniləmək
  @Patch('update-price')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Barkoda görə məhsulun satış qiymətini yenilə' })
  updatePrice(@Body() updateProductPriceDto: UpdateProductPriceDto) {
    return this.productsService.updatePriceByBarcode(updateProductPriceDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Qeyd edilmiş ID üzrə məhsulu əlaqəli məlumatlarla birlikdə gətirmək' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Qeyd edilmiş ID üzrə məhsulu yeniləmək' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Qeyd edilmiş ID üzrə məhsulu silmək' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}