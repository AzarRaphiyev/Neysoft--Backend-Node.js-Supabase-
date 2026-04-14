import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  // Yeni xərc əlavə etmək
  async create(dto: CreateExpenseDto) {
    const expense = await this.prisma.expense.create({
      data: {
        title: dto.title,
        amount: dto.amount,
        description: dto.description,
        userId: dto.userId,
      },
      include: {
        user: true,
      },
    });

    return expense;
  }

  // Bütün xərcləri gətirmək (tarix aralığı filtri ilə)
  async findAll(startDate?: string, endDate?: string) {
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

    // Xərcləri əlaqəli istifadəçi məlumatları ilə birlikdə gətiririk
    const expenses = await this.prisma.expense.findMany({
      where,
      include: {
        user: { select: { id: true, username: true } },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return expenses;
  }

  // ID-yə görə tək bir xərc gətirmək
  async findOne(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!expense) {
      throw new NotFoundException('Xərc tapılmadı');
    }

    return expense;
  }

  // ID-yə görə xərci yeniləmək
  async update(id: string, dto: UpdateExpenseDto) {
    // Əvvəlcə xərcin mövcudluğunu yoxlayırıq
    await this.findOne(id);

    const updatedExpense = await this.prisma.expense.update({
      where: { id },
      data: {
        ...dto,
      },
      include: {
        user: true,
      },
    });

    return updatedExpense;
  }

  // ID-yə görə xərci silmək
  async remove(id: string) {
    // Əvvəlcə xərcin mövcudluğunu yoxlayırıq
    await this.findOne(id);

    const deletedExpense = await this.prisma.expense.delete({
      where: { id },
    });

    return deletedExpense;
  }
}
