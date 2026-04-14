import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateColorDto } from './dto/create-color.dto';
import { CreateSizeDto } from './dto/create-size.dto';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { CreateTemplateDto } from './dto/create-template.dto';

@Injectable()
export class ParametersService {
  constructor(private prisma: PrismaService) {}

  // --- KATEQORİYA (CATEGORY) ---
  async createCategory(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException('Bu adda kateqoriya artıq mövcuddur');
    }
    return this.prisma.category.create({ data: { name: dto.name } });
  }

  async getCategories() {
    return this.prisma.category.findMany();
  }

  async deleteCategory(id: string) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Kateqoriya tapılmadı');
    }
    return this.prisma.category.delete({ where: { id } });
  }

  // --- RƏNG (COLOR) ---
  async createColor(dto: CreateColorDto) {
    const existing = await this.prisma.color.findUnique({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException('Bu adda rəng artıq mövcuddur');
    }
    return this.prisma.color.create({ data: { name: dto.name } });
  }

  async getColors() {
    return this.prisma.color.findMany();
  }

  async deleteColor(id: string) {
    const existing = await this.prisma.color.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Rəng tapılmadı');
    }
    return this.prisma.color.delete({ where: { id } });
  }

  // --- ÖLÇÜ (SIZE) ---
  async createSize(dto: CreateSizeDto) {
    const existing = await this.prisma.size.findUnique({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException('Bu adda ölçü artıq mövcuddur');
    }
    return this.prisma.size.create({ data: { name: dto.name } });
  }

  async getSizes() {
    return this.prisma.size.findMany();
  }

  async deleteSize(id: string) {
    const existing = await this.prisma.size.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Ölçü tapılmadı');
    }
    return this.prisma.size.delete({ where: { id } });
  }

  // --- TƏCHİZATÇI (SUPPLIER) ---
  async createSupplier(dto: CreateSupplierDto) {
    const existing = await this.prisma.supplier.findFirst({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException('Bu adda təchizatçı artıq mövcuddur');
    }
    return this.prisma.supplier.create({ data: { name: dto.name, contact: dto.contact } });
  }

  async getSuppliers() {
    return this.prisma.supplier.findMany();
  }

  async getSupplierById(id: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) {
      throw new NotFoundException('Təchizatçı tapılmadı');
    }
    return supplier;
  }

  async updateSupplier(id: string, dto: UpdateSupplierDto) {
    const existing = await this.prisma.supplier.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Təchizatçı tapılmadı');
    }

    if (dto.name && dto.name !== existing.name) {
      const nameCheck = await this.prisma.supplier.findFirst({ where: { name: dto.name } });
      if (nameCheck) {
        throw new ConflictException('Bu adda təchizatçı artıq mövcuddur');
      }
    }

    return this.prisma.supplier.update({
      where: { id },
      data: dto,
    });
  }

  async deleteSupplier(id: string) {
    const existing = await this.prisma.supplier.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Təchizatçı tapılmadı');
    }
    return this.prisma.supplier.delete({ where: { id } });
  }

  // --- MƏHSUL ŞABLONLARI (PRODUCT TEMPLATES) ---
  async createTemplate(dto: CreateTemplateDto) {
    // Kateqoriyanı yoxlayaq
    const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
    if (!category) {
      throw new NotFoundException('Kateqoriya tapılmadı');
    }

    if (dto.colorId) {
      const color = await this.prisma.color.findUnique({ where: { id: dto.colorId } });
      if (!color) {
        throw new NotFoundException('Rəng tapılmadı');
      }
    }

    if (dto.sizeId) {
      const size = await this.prisma.size.findUnique({ where: { id: dto.sizeId } });
      if (!size) {
        throw new NotFoundException('Ölçü tapılmadı');
      }
    }

    return this.prisma.productTemplate.create({
      data: dto,
      include: {
        category: true,
        color: true,
        size: true,
      },
    });
  }

  async findAllTemplates() {
    return this.prisma.productTemplate.findMany({
      include: {
        category: true,
        color: true,
        size: true,
      },
    });
  }

 async removeTemplate(id: string) {
    const existing = await this.prisma.productTemplate.findUnique({ 
      where: { id } 
    });
    
    if (!existing) {
      throw new NotFoundException('Şablon tapılmadı');
    }
    
    return this.prisma.productTemplate.delete({ 
      where: { id } 
    });
  }
}
