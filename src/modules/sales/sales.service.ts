import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  // Yeni satış yaratmaq metodu (fiziki kassa əməliyyatı)
  async create(createSaleDto: CreateSaleDto, userId: string) {
    // DTO-dan gələn məlumatlar, əgər paidAmount və changeAmount göndərilməyibsə 0 olaraq təyin edirik
    const { discount, paymentMethod, items, paidAmount = 0, changeAmount = 0 } = createSaleDto;

    // Benzersiz qəbz nömrəsi yaratmaq
    const receiptNo = await this.generateReceiptNo();

    // Ümumi məbləği hesablamaq: hər bir məhsulun (qiymət * miqdar - endirim) cəmi
    const totalAmount = items.reduce((sum, item) => {
      const itemDiscount = item.discount || 0;
      return sum + (item.price * item.quantity - itemDiscount);
    }, 0);

    // Yekun məbləğ: ümumi məbləğdən fiş üzrə ümumi endirimi çıxarırıq
    const finalAmount = totalAmount - discount;

    // Transaction ilə bütün əməliyyatları atomik şəkildə icra edirik
    const sale = await this.prisma.$transaction(async (tx) => {
      // 1. Hər bir məhsulun anbar qalığını yoxlayırıq və azaldırıq
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new BadRequestException(
            `Məhsul tapılmadı: ${item.productId}`,
          );
        }

        if (product.stockQuantity < item.quantity) {
          throw new BadRequestException(
            `"${product.name}" məhsulu üçün anbarda kifayət qədər məhsul yoxdur. Mövcud: ${product.stockQuantity}, Tələb olunan: ${item.quantity}`,
          );
        }

        // 2. 🟢 YENİ: Qiymət yoxlaması (Tələb 2.3)
        // Qiymət 0 ola bilər (hədiyyə/bonus), amma mənfi ola bilməz.
        if (item.price < 0) {
          throw new BadRequestException(
            `"${product.name}" üçün satış qiyməti mənfi ola bilməz!`,
          );
        }

        // Anbar qalığını satılan miqdar qədər azaldırıq
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 2. Yeni satış qeydi yaradırıq (kassirin userId-si ilə)
      const newSale = await tx.sale.create({
        data: {
          receiptNo,
          totalAmount,
          discount,
          finalAmount,
          paymentMethod,
          userId: userId,
          paidAmount,
          changeAmount,
          items: {
            create: items.map((item) => ({
              quantity: item.quantity,
              price: item.price,
              discount: item.discount || 0,
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
          user: true,
        },
      });

      return newSale;
    });

    return sale;
  }

  // Keçmiş satışları (fiş tarixçəsini) filterlərlə gətirmək metodu
  async findAll(startDate?: string, endDate?: string, receiptNo?: string, isReturned?: boolean) {
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

    // Qəbz nömrəsi filtri
    if (receiptNo) {
      where.receiptNo = {
        contains: receiptNo,
        mode: 'insensitive',
      };
    }

    // İadə edilmiş satışlar filtri (ən azı 1 müştəri iadəsi olan satışlar)
    if (isReturned) {
      where.customerReturns = {
        some: {},
      };
    }

    // Satışları əlaqəli məlumatlarla birlikdə gətiririk
    const sales = await this.prisma.sale.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        // Satış tarixçəsində əməliyyatı edən kassirin adını, id-sini və istifadəçi adını gətiririk
        user: { select: { id: true, username: true } },
        customerReturns: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return sales;
  }

  // Benzersiz qəbz nömrəsi generasiya metodu
  private async generateReceiptNo(): Promise<string> {
    let receiptNo = '';
    let exists = true;

    // Unikal nömrə tapılana qədər davam edirik
    while (exists) {
      const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
      receiptNo = `REC-${randomNumber}`;

      const existingSale = await this.prisma.sale.findUnique({
        where: { receiptNo },
      });

      exists = !!existingSale;
    }

    return receiptNo;
  }
}
