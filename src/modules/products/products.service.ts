import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductPriceDto } from './dto/update-product-price.dto';
import { PrismaService } from '../../prisma/prisma.service';
import * as bwipjs from 'bwip-js';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // --- KÖMƏKÇİ FUNKSİYALAR ---

  // 1. Avtomatik 13 rəqəmli barkod yaradan funksiya (Əgər istifadəçi boş buraxarsa)
  private generateBarcode(): string {
    const randomNum = Math.floor(Math.random() * 10000000000000);
    return randomNum.toString().padStart(13, '0');
  }

  // 2. Qara-ağ ştrixkod şəkli (PNG Buffer) yaradan funksiya (Çap etmək üçün)
  async generateBarcodeImage(text: string): Promise<Buffer> {
    try {
      const buffer = await bwipjs.toBuffer({
        bcid: 'code128',       // Standart ştrixkod növü
        text: text,            // Ştrixkodun içinə yazılacaq kod
        scale: 3,              // Şəklin böyüklüyü
        height: 10,            // Xətlərin hündürlüyü
        includetext: true,     // Rəqəmləri ştrixkodun altında göstər
        textxalign: 'center',  // Rəqəmləri mərkəzlə
      });
      return buffer;
    } catch (error) {
      throw new BadRequestException('Ştrixkod şəkli yaradıla bilmədi');
    }
  }

  // --- ƏSAS CRUD (MƏHSUL) FUNKSİYALARI ---

  async create(createProductDto: CreateProductDto) {
    // 1. Əgər barkod göndərilməyibsə və ya boşdursa, avtomatik yarat!
    const finalBarcode = createProductDto.barcode && createProductDto.barcode.trim() !== ''
      ? createProductDto.barcode
      : this.generateBarcode();

    // 2. Barkodun unikal olub-olmadığını yoxlayırıq
    const existingProduct = await this.prisma.product.findUnique({
      where: { barcode: finalBarcode },
    });

    if (existingProduct) {
      throw new BadRequestException('Bu barkod ilə məhsul artıq mövcuddur');
    }

    // 3. Məhsulu bazaya yazırıq
    return this.prisma.product.create({
      data: {
        ...createProductDto,
        barcode: finalBarcode, // DTO-dakı barkodu əzib öz tapdığımız/yaratdığımızı qoyuruq
      },
    });
  }

 // --- Axtarış və Filterləmə funksiyası ---
  async findAll(search?: string, isOutOfStock?: boolean) {
    const whereCondition: any = {};

    // 1. Əgər 'search' (axtarış) sözü göndərilibsə: həm ada, həm də barkoda görə axtar
    if (search) {
      whereCondition.OR = [
        { name: { contains: search, mode: 'insensitive' } }, // Ada görə (Böyük/kiçik hərf həssaslığı olmadan)
        { barcode: { contains: search } },                   // Barkoda görə
      ];
    }

    // 2. Əgər 'isOutOfStock' true olaraq seçilibsə: yalnız stoku 0 olanları gətir
    if (isOutOfStock) {
      whereCondition.stockQuantity = 0;
    }

    return this.prisma.product.findMany({
      where: whereCondition,
      include: {
        category: true,
        color: true,
        size: true,
        supplier: true,
      },
      orderBy: {
        name: 'asc', // Adına görə əlifba sırası ilə düzür
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        color: true,
        size: true,
        supplier: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Məhsul tapılmadı');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    // Məhsulun ümumiyyətlə mövcud olub-olmadığını yoxlayırıq
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Yeniləmək üçün məhsul tapılmadı');
    }

    // Əgər fərqli bir barkod göndərilibsə, onun unikal olub-olmadığını yoxlayırıq
    if (updateProductDto.barcode && updateProductDto.barcode !== product.barcode) {
      const existingProduct = await this.prisma.product.findUnique({
        where: { barcode: updateProductDto.barcode },
      });

      if (existingProduct) {
        throw new BadRequestException('Bu barkod ilə artıq başqa məhsul mövcuddur');
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  // Barkoda görə məhsulun satış qiymətini yeniləmək
  async updatePriceByBarcode(dto: UpdateProductPriceDto) {
    // Barkoda uyğun məhsulu tapırıq
    const product = await this.prisma.product.findUnique({
      where: { barcode: dto.barcode },
    });

    if (!product) {
      throw new NotFoundException('Bu barkoda uyğun məhsul tapılmadı');
    }

    // Məhsulun satış qiymətini yeniləyirik
    const updatedProduct = await this.prisma.product.update({
      where: { id: product.id },
      data: {
        salePrice: dto.newSalePrice,
      },
      include: {
        category: true,
        color: true,
        size: true,
        supplier: true,
      },
    });

    return updatedProduct;
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Silmək üçün məhsul tapılmadı');
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }
}