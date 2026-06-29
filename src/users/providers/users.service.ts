import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from '../dtos/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        loyaltyPoints: true,
        totalOrders: true,
        referralCode: true,
        darkMode: true,
        pushEnabled: true,
        role: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true, name: true, email: true, phone: true,
        avatar: true, darkMode: true, pushEnabled: true,
      },
    });
  }

  async updateFcmToken(id: string, fcmToken: string) {
    return this.prisma.user.update({
      where: { id },
      data: { fcmToken },
      select: { id: true },
    });
  }

  async getOrderHistory(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        include: { cafe: { select: { name: true } }, items: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);
    return { orders, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
