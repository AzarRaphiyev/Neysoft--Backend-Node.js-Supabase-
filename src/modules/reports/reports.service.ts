import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // Dashboard üçün ümumi hesabatları gətirmək (Satış, Xərc, İadə və Xalis Qazanc)
  async getDashboardStats(startDate?: string, endDate?: string) {
    // Tarix aralığı filtri qururuq (göndərilməsə bütün zamanları əhatə edir)
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) {
        dateFilter.date.gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.date.lte = new Date(endDate);
      }
    }

    // 1. Ümumi satış məbləğini hesablayırıq (Sale -> finalAmount)
    const salesAggregate = await this.prisma.sale.aggregate({
      where: dateFilter,
      _sum: {
        finalAmount: true,
      },
    });

    // 2. Ümumi xərc məbləğini hesablayırıq (Expense -> amount)
    const expensesAggregate = await this.prisma.expense.aggregate({
      where: dateFilter,
      _sum: {
        amount: true,
      },
    });

    // 3. Ümumi müştəri iadəsi məbləğini hesablayırıq (CustomerReturn -> totalAmount)
    const returnsAggregate = await this.prisma.customerReturn.aggregate({
      where: dateFilter,
      _sum: {
        totalAmount: true,
      },
    });

    // Nəticələri çıxarırıq (null olarsa 0 qəbul edirik)
    const totalSales = salesAggregate._sum.finalAmount || 0;
    const totalExpenses = expensesAggregate._sum.amount || 0;
    const totalReturns = returnsAggregate._sum.totalAmount || 0;

    // Xalis Qazanc = Ümumi Satış - (Ümumi Xərc + Ümumi İadə)
    const netProfit = totalSales - (totalExpenses + totalReturns);

    return {
      totalSales,
      totalExpenses,
      totalReturns,
      netProfit,
    };
  }
}
