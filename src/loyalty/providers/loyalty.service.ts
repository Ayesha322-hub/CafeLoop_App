import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const FREE_COFFEE_THRESHOLD = 100; // 100 pts = 1 free coffee

@Injectable()
export class LoyaltyService {
  constructor(private prisma: PrismaService) {}

  async getStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { loyaltyPoints: true, totalOrders: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const freeCoffees = Math.floor(user.loyaltyPoints / FREE_COFFEE_THRESHOLD);
    const remainder = user.loyaltyPoints % FREE_COFFEE_THRESHOLD;
    const pointsToNext = FREE_COFFEE_THRESHOLD - remainder;
    const progressPercent = Math.round((remainder / FREE_COFFEE_THRESHOLD) * 100);

    return {
      points: user.loyaltyPoints,
      totalOrders: user.totalOrders,
      freeCoffees,
      pointsToNextFreeCoffee: pointsToNext,
      progressPercent,
      threshold: FREE_COFFEE_THRESHOLD,
    };
  }

  async getHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      this.prisma.loyaltyTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.loyaltyTransaction.count({ where: { userId } }),
    ]);

    return { transactions, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
