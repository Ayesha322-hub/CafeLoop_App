import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FilterCafesDto } from '../dtos/filter-cafes.dto';

@Injectable()
export class CafesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filter: FilterCafesDto) {
    const page = Number(filter.page) || 1;
    const limit = Number(filter.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
        { address: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    if (filter.category) {
      where.categories = { has: filter.category };
    }

    if (filter.openNow) {
      where.isOpen = true;
    }

    const orderBy: any =
      filter.sortBy === 'orders'
        ? { totalOrders: 'desc' }
        : { rating: 'desc' };

    const [cafes, total] = await Promise.all([
      this.prisma.cafe.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true, name: true, address: true, city: true,
          imageUrl: true, rating: true, totalReviews: true,
          isOpen: true, categories: true, latitude: true, longitude: true,
        },
      }),
      this.prisma.cafe.count({ where }),
    ]);

    return { cafes, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const cafe = await this.prisma.cafe.findUnique({
      where: { id },
      include: {
        _count: { select: { orders: true } },
      },
    });
    if (!cafe) throw new NotFoundException('Cafe not found');
    return cafe;
  }

  async toggleFavorite(userId: string, cafeId: string) {
    const existing = await this.prisma.cafeFavorite.findUnique({
      where: { userId_cafeId: { userId, cafeId } },
    });

    if (existing) {
      await this.prisma.cafeFavorite.delete({
        where: { userId_cafeId: { userId, cafeId } },
      });
      return { favorited: false };
    }

    await this.prisma.cafeFavorite.create({ data: { userId, cafeId } });
    return { favorited: true };
  }

  async getFavorites(userId: string) {
    return this.prisma.cafeFavorite.findMany({
      where: { userId },
      include: {
        cafe: {
          select: {
            id: true, name: true, address: true,
            imageUrl: true, rating: true, isOpen: true, categories: true,
          },
        },
      },
    });
  }
}
