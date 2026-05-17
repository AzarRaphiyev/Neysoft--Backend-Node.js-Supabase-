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

    // Günlük və Aylıq üçün tarixlər
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Günlük və Aylıq Satışlar
    const dailySalesAgg = await this.prisma.sale.aggregate({
      where: { date: { gte: startOfToday, lte: endOfToday } },
      _sum: { finalAmount: true },
    });
    const monthlySalesAgg = await this.prisma.sale.aggregate({
      where: { date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { finalAmount: true },
    });

    // Günlük və Aylıq Xərclər
    const dailyExpensesAgg = await this.prisma.expense.aggregate({
      where: { date: { gte: startOfToday, lte: endOfToday } },
      _sum: { amount: true },
    });
    const monthlyExpensesAgg = await this.prisma.expense.aggregate({
      where: { date: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { amount: true },
    });

    const dailySales = dailySalesAgg._sum.finalAmount || 0;
    const monthlySales = monthlySalesAgg._sum.finalAmount || 0;
    const dailyExpenses = dailyExpensesAgg._sum.amount || 0;
    const monthlyExpenses = monthlyExpensesAgg._sum.amount || 0;

    return {
      totalSales,
      totalExpenses,
      totalReturns,
      netProfit,
      dailySales,
      monthlySales,
      dailyExpenses,
      monthlyExpenses,
    };
  }
}
