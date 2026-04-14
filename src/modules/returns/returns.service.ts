import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerReturnDto } from './dto/create-return.dto';
import { CreateSupplierReturnDto } from './dto/create-return.dto';

@Injectable()
export class ReturnsService {
  constructor(private prisma: PrismaService) {}

  // ==================== MÜŞTƏRİ İADƏSİ ====================

  // Müştəri iadəsi yaratmaq metodu (müştəri malı mağazaya geri qaytarır, stok ARTIR)
  async createCustomerReturn(userId: string, dto: CreateCustomerReturnDto) {
    const { saleId, reason, items } = dto;

    // Unikal iadə kodu yaratmaq
    const returnCode = await this.generateReturnCode('CRET');

    // Ümumi iadə məbləğini hesablamaq
    const totalAmount = items.reduce((sum, item) => sum + item.refundAmount, 0);

    // Transaction ilə bütün əməliyyatları atomik şəkildə icra edirik
    const customerReturn = await this.prisma.$transaction(async (tx) => {
      // 1. Hər bir məhsulun anbar qalığını iadə miqdarı qədər ARTIRIRQ
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new BadRequestException(
            `Məhsul tapılmadı: ${item.productId}`,
          );
        }

        // Stoku iadə miqdarı qədər artırırıq (müştəri geri qaytardığı üçün)
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              increment: item.quantity,
            },
          },
        });
      }

      // 2. Müştəri iadəsi qeydini yaradırıq
      const newReturn = await tx.customerReturn.create({
        data: {
          returnCode,
          totalAmount,
          reason,
          saleId,
          userId,
          items: {
            create: items.map((item) => ({
              quantity: item.quantity,
              refundAmount: item.refundAmount,
              productId: item.productId,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          sale: true,
          user: true,
        },
      });

      return newReturn;
    });

    return customerReturn;
  }

  // Müştəri iadələrinin tarixçəsini filterlərlə gətirmək
  async findAllCustomerReturns(startDate?: string, endDate?: string) {
    // Prisma where filtri qururuq
    const where: any = {};

    // Tarix aralığı filtri
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    // Müştəri iadələrini əlaqəli məlumatlarla birlikdə gətiririk
    const returns = await this.prisma.customerReturn.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        sale: true,
        // DÜZƏLİŞ: ad və soyad silindi, yalnız mövcud olan username qaldı
        user: { select: { id: true, username: true } },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return returns;
  }

  // ==================== TƏDARİKÇİ İADƏSİ ====================

  // Tədarikçi iadəsi yaratmaq metodu (mağaza malı toptançıya geri qaytarır, stok AZALIR)
  async createSupplierReturn(userId: string, dto: CreateSupplierReturnDto) {
    const { receiptId, reason, items } = dto;

    // Unikal iadə kodu yaratmaq
    const returnCode = await this.generateReturnCode('SRET');

    // Ümumi iadə məbləğini hesablamaq
    const totalAmount = items.reduce((sum, item) => sum + item.refundAmount, 0);

    // Transaction ilə bütün əməliyyatları atomik şəkildə icra edirik
    const supplierReturn = await this.prisma.$transaction(async (tx) => {
      // 1. Hər bir məhsulun anbar qalığını yoxlayırıq və iadə miqdarı qədər AZALDIRIQ
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new BadRequestException(
            `Məhsul tapılmadı: ${item.productId}`,
          );
        }

        // Stok yetərsizdirsə xəta veririk
        if (product.stockQuantity < item.quantity) {
          throw new BadRequestException(
            `"${product.name}" məhsulu üçün anbarda kifayət qədər məhsul yoxdur. Mövcud: ${product.stockQuantity}, Tələb olunan: ${item.quantity}`,
          );
        }

        // Stoku iadə miqdarı qədər azaldırıq (mağazadan çıxdığı üçün)
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 2. Tədarikçi iadəsi qeydini yaradırıq
      const newReturn = await tx.supplierReturn.create({
        data: {
          returnCode,
          totalAmount,
          reason,
          receiptId,
          userId,
          items: {
            create: items.map((item) => ({
              quantity: item.quantity,
              refundAmount: item.refundAmount,
              productId: item.productId,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          receipt: true,
          user: true,
        },
      });

      return newReturn;
    });

    return supplierReturn;
  }

  // Tədarikçi iadələrinin tarixçəsini filterlərlə gətirmək
  async findAllSupplierReturns(startDate?: string, endDate?: string) {
    // Prisma where filtri qururuq
    const where: any = {};

    // Tarix aralığı filtri
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    // Tədarikçi iadələrini əlaqəli məlumatlarla birlikdə gətiririk
    const returns = await this.prisma.supplierReturn.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        receipt: {
          include: {
            supplier: true,
          },
        },
        // DÜZƏLİŞ: ad və soyad silindi, yalnız mövcud olan username qaldı
        user: { select: { id: true, username: true } },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return returns;
  }

  // ==================== YARDIMÇI METODLAR ====================

  // Benzersiz iadə kodu generasiya metodu
  private async generateReturnCode(prefix: string): Promise<string> {
    let returnCode = '';
    let exists = true;

    // Unikal kod tapılana qədər davam edirik
    while (exists) {
      const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
      returnCode = `${prefix}-${randomNumber}`;

      // Həm müştəri, həm də tədarikçi iadələrində yoxlayırıq
      if (prefix === 'CRET') {
        const existing = await this.prisma.customerReturn.findUnique({
          where: { returnCode },
        });
        exists = !!existing;
      } else {
        const existing = await this.prisma.supplierReturn.findUnique({
          where: { returnCode },
        });
        exists = !!existing;
      }
    }

    return returnCode;
  }
}