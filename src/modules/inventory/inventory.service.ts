import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  // Yeni qaimə yaratmaq metodu (anbara mal daxil etmə)
  async create(createInventoryDto: CreateInventoryDto, userId: string) {
    const { supplierId, items } = createInventoryDto;

    // Benzersiz qaimə kodu yaratmaq
    const receiptCode = await this.generateReceiptCode();

    // Ümumi qaimə məbləğini hesablamaq: hər bir məhsulun (alış qiyməti * miqdar) cəmi
    const totalAmount = items.reduce((sum, item) => {
      return sum + item.purchasePrice * item.quantity;
    }, 0);

    // Transaction ilə bütün əməliyyatları atomik şəkildə icra edirik
    const receipt = await this.prisma.$transaction(async (tx) => {
      // 1. Hər bir məhsulun mövcudluğunu yoxlayırıq və stokunu artırırıq
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new BadRequestException(
            `Məhsul tapılmadı: ${item.productId}`,
          );
        }

        // Anbar qalığını daxil olan miqdar qədər artırırıq
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              increment: item.quantity,
            },
          },
        });
      }

      // 2. Yeni qaimə qeydi yaradırıq (təchizatçı və əməliyyatı edən istifadəçi ilə əlaqəli)
      const newReceipt = await tx.inventoryReceipt.create({
        data: {
          receiptCode,
          totalAmount,
          supplierId,
          userId, // 🟢 BURA DƏYİŞDİ: Əməliyyatı edən şəxsin ID-si bazaya yazılır
          items: {
            create: items.map((item) => ({
              quantity: item.quantity,
              purchasePrice: item.purchasePrice,
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
          supplier: true,
          user: true, // 🟢 ƏLAVƏ EDİLDİ: Cavabda istifadəçi məlumatlarını da görmək üçün
        },
      });

      return newReceipt;
    });

    return receipt;
  }

  // Keçmiş qaimələri (mal daxil olma tarixçəsini) filterlərlə gətirmək metodu
  async findAll(startDate?: string, endDate?: string, receiptCode?: string) {
    const where: any = {};

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (receiptCode) {
      where.receiptCode = {
        contains: receiptCode,
        mode: 'insensitive',
      };
    }

    const receipts = await this.prisma.inventoryReceipt.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        supplier: true,
        user: { // 🟢 ƏLAVƏ EDİLDİ: Tarixçədə qaiməni kimin vurduğunu görmək üçün
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return receipts;
  }

  private async generateReceiptCode(): Promise<string> {
    let receiptCode = '';
    let exists = true;

    while (exists) {
      const randomNumber = Math.floor(100000 + Math.random() * 900000);
      receiptCode = `INV-${randomNumber}`;

      const existingReceipt = await this.prisma.inventoryReceipt.findUnique({
        where: { receiptCode },
      });

      exists = !!existingReceipt;
    }

    return receiptCode;
  }
}