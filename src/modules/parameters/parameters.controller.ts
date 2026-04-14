import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { ParametersService } from './parameters.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateColorDto } from './dto/create-color.dto';
import { CreateSizeDto } from './dto/create-size.dto';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('parameters')
@ApiBearerAuth()
@Controller('parameters')
export class ParametersController {
  constructor(private readonly parametersService: ParametersService) {}

  // --- KATEQORİYA (CATEGORY) ---
  @Post('category')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Yeni kateqoriya əlavə et' })
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.parametersService.createCategory(createCategoryDto);
  }

  @Get('category')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Bütün kateqoriyaları gətir' })
  getCategories() {
    return this.parametersService.getCategories();
  }

  @Delete('category/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Kateqoriyanı sil' })
  @ApiParam({ name: 'id', description: 'Kateqoriya ID-si' })
  deleteCategory(@Param('id') id: string) {
    return this.parametersService.deleteCategory(id);
  }

  // --- RƏNG (COLOR) ---
  @Post('color')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Yeni rəng əlavə et' })
  createColor(@Body() createColorDto: CreateColorDto) {
    return this.parametersService.createColor(createColorDto);
  }

  @Get('color')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Bütün rəngləri gətir' })
  getColors() {
    return this.parametersService.getColors();
  }

  @Delete('color/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Rəngi sil' })
  @ApiParam({ name: 'id', description: 'Rəng ID-si' })
  deleteColor(@Param('id') id: string) {
    return this.parametersService.deleteColor(id);
  }

  // --- ÖLÇÜ (SIZE) ---
  @Post('size')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Yeni ölçü əlavə et' })
  createSize(@Body() createSizeDto: CreateSizeDto) {
    return this.parametersService.createSize(createSizeDto);
  }

  @Get('size')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Bütün ölçüləri gətir' })
  getSizes() {
    return this.parametersService.getSizes();
  }

  @Delete('size/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Ölçünü sil' })
  @ApiParam({ name: 'id', description: 'Ölçü ID-si' })
  deleteSize(@Param('id') id: string) {
    return this.parametersService.deleteSize(id);
  }

  // --- TƏCHİZATÇI (SUPPLIER) ---
  @Post('supplier')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Yeni təchizatçı əlavə et' })
  createSupplier(@Body() createSupplierDto: CreateSupplierDto) {
    return this.parametersService.createSupplier(createSupplierDto);
  }

  @Get('supplier')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Bütün təchizatçıları gətir' })
  getSuppliers() {
    return this.parametersService.getSuppliers();
  }

  @Get('supplier/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Təchizatçını ID-yə əsasən gətir' })
  @ApiParam({ name: 'id', description: 'Təchizatçı ID-si' })
  getSupplierById(@Param('id') id: string) {
    return this.parametersService.getSupplierById(id);
  }

  @Patch('supplier/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Təchizatçı məlumatlarını yenilə' })
  @ApiParam({ name: 'id', description: 'Təchizatçı ID-si' })
  updateSupplier(@Param('id') id: string, @Body() updateSupplierDto: UpdateSupplierDto) {
    return this.parametersService.updateSupplier(id, updateSupplierDto);
  }

  @Delete('supplier/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Təchizatçını sil' })
  @ApiParam({ name: 'id', description: 'Təchizatçı ID-si' })
  deleteSupplier(@Param('id') id: string) {
    return this.parametersService.deleteSupplier(id);
  }

  // --- MƏHSUL ŞABLONLARI (PRODUCT TEMPLATES) ---
  @Post('template')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Yeni məhsul şablonu əlavə et' })
  createTemplate(@Body() createTemplateDto: CreateTemplateDto) {
    return this.parametersService.createTemplate(createTemplateDto);
  }

  @Get('template')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Bütün şablonları gətir' })
  findAllTemplates() {
    return this.parametersService.findAllTemplates();
  }

  @Delete('template/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Şablonu sil' })
  @ApiParam({ name: 'id', description: 'Şablon ID-si' })
  removeTemplate(@Param('id') id: string) {
    return this.parametersService.removeTemplate(id);
  }
}
