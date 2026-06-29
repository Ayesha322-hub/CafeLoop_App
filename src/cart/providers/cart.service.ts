import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddToCartDto } from '../dtos/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: {
        cafe: { select: { id: true, name: true, address: true } },
        items: { include: { menuItem: { select: { name: true, imageUrl: true } } } },
      },
    });

    if (!cart) return { items: [], subtotal: 0, cafe: null };

    const subtotal = cart.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    return { ...cart, subtotal };
  }

  async addItem(userId: string, dto: AddToCartDto) {
    // If cart exists for a different cafe, clear it first
    const existingCart = await this.prisma.cart.findFirst({ where: { userId } });
    if (existingCart && existingCart.cafeId !== dto.cafeId) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: existingCart.id } });
      await this.prisma.cart.update({
        where: { id: existingCart.id },
        data: { cafeId: dto.cafeId },
      });
    }

    const cart = await this.prisma.cart.upsert({
      where: { userId },
      create: { userId, cafeId: dto.cafeId },
      update: {},
    });

    // Check if same item with same customizations already in cart
    const existing = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        menuItemId: dto.menuItemId,
        customizations: { equals: dto.customizations ?? {} },
      },
    });

    if (existing) {
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: { increment: dto.quantity } },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        menuItemId: dto.menuItemId,
        quantity: dto.quantity,
        unitPrice: dto.unitPrice,
        customizations: dto.customizations ?? {},
      },
    });
  }

  async updateItem(userId: string, itemId: string, quantity: number) {
    if (quantity < 1) return this.removeItem(userId, itemId);

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  async removeItem(userId: string, itemId: string) {
    return this.prisma.cartItem.delete({ where: { id: itemId } });
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findFirst({ where: { userId } });
    if (cart) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return { cleared: true };
  }

  async validateCoupon(code: string, subtotal: number) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code, isActive: true } });
    if (!coupon) throw new BadRequestException('Invalid coupon code');
    if (coupon.expiresAt && coupon.expiresAt < new Date())
      throw new BadRequestException('Coupon expired');
    if (subtotal < coupon.minOrder)
      throw new BadRequestException(`Minimum order PKR ${coupon.minOrder} required`);

    const discount =
      coupon.type === 'percent'
        ? Math.floor((subtotal * coupon.value) / 100)
        : coupon.value;

    return { coupon: coupon.code, discount, newTotal: subtotal - discount };
  }
}
