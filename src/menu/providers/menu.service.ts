import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async getMenuByCafe(cafeId: string, category?: string) {
    const where: any = { cafeId, isAvailable: true };
    if (category) where.category = category;

    const items = await this.prisma.menuItem.findMany({
      where,
      orderBy: [{ isPopular: 'desc' }, { name: 'asc' }],
    });

    // Group by category for the menu tabs on screen
    const grouped = items.reduce((acc: any, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    return { items, grouped };
  }

  async findOne(id: string) {
    const item = await this.prisma.menuItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Menu item not found');
    return item;
  }
}
