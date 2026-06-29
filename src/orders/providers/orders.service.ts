import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CartService } from '../../cart/providers/cart.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { UpdateOrderStatusDto } from '../dtos/update-order-status.dto';
import { OrdersGateway } from '../orders.gateway';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
    private notificationsService: NotificationsService,
    private ordersGateway: OrdersGateway,
  ) {}

  // ── Place Order ──────────────────────────────────────────────
  async createOrder(userId: string, dto: CreateOrderDto) {
    // 1. Get cart
    const cart = await this.cartService.getCart(userId);
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    let subtotal = cart.subtotal as number;
    let discount = 0;
    let loyaltyDiscount = 0;

    // 2. Apply coupon
    if (dto.couponCode) {
      const couponResult = await this.cartService.validateCoupon(dto.couponCode, subtotal);
      discount = couponResult.discount;
    }

    // 3. Apply loyalty points (100 pts = PKR 100)
    if (dto.useLoyaltyPoints) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { loyaltyPoints: true },
      });
      const maxDiscount = subtotal - discount;
      loyaltyDiscount = Math.min(user!.loyaltyPoints, maxDiscount);
    }

    const total = subtotal - discount - loyaltyDiscount;

    // 4. Create order with all items
    const order = await this.prisma.order.create({
      data: {
        userId,
        cafeId: dto.cafeId,
        orderType: dto.orderType,
        status: 'pending',
        paymentMethod: dto.paymentMethod,
        paymentStatus: dto.paymentMethod === 'cash' ? 'pending' : 'paid',
        stripePaymentId: dto.stripePaymentIntentId,
        jazzCashTxnRef: dto.jazzCashTxnRef,
        subtotal,
        discount,
        loyaltyDiscount,
        total,
        couponCode: dto.couponCode,
        notes: dto.notes,
        items: {
          create: cart.items.map((item: any) => ({
            menuItemId: item.menuItemId,
            name: item.menuItem.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            customizations: item.customizations ?? {},
          })),
        },
      },
      include: { items: true, cafe: { select: { name: true } } },
    });

    // 5. Award loyalty points (10 pts per PKR 100 spent)
    const pointsEarned = Math.floor(total / 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        loyaltyPoints: {
          increment: pointsEarned - loyaltyDiscount,
        },
        totalOrders: { increment: 1 },
      },
    });

    // 6. Log loyalty transaction
    await this.prisma.loyaltyTransaction.create({
      data: {
        userId,
        points: pointsEarned,
        type: 'order_earn',
        orderId: order.id,
      },
    });

    if (loyaltyDiscount > 0) {
      await this.prisma.loyaltyTransaction.create({
        data: {
          userId,
          points: -loyaltyDiscount,
          type: 'redeem',
          orderId: order.id,
        },
      });
    }

    // 7. Clear cart
    await this.cartService.clearCart(userId);

    // 8. Notify cafe staff via FCM
    await this.notificationsService.notifyCafe(dto.cafeId, order.id);

    return order;
  }

  // ── Get Single Order ─────────────────────────────────────────
  async findOne(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        cafe: { select: { id: true, name: true, address: true, phone: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException();
    return order;
  }

  // ── Update Order Status (Cafe Staff) ─────────────────────────
  async updateStatus(orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: dto.status },
      include: {
        user: { select: { fcmToken: true, id: true } },
      },
    });

    // Push notification messages per status
    const messages: Record<string, string> = {
      accepted: '✅ Your order has been accepted!',
      preparing: '☕ The cafe is preparing your order...',
      ready: '🔔 Your order is ready for pickup!',
      completed: '🎉 Order complete! Enjoy your coffee.',
      cancelled: '❌ Your order was cancelled.',
    };

    if (order.user.fcmToken) {
      await this.notificationsService.sendPush(
        order.user.fcmToken,
        'CaféLoop Order Update',
        messages[dto.status] ?? 'Your order status changed.',
        { orderId, status: dto.status },
      );
    }

    // Emit real-time WebSocket event
    this.ordersGateway.emitStatusUpdate(orderId, dto.status);

    return order;
  }

  // ── Cancel Order ─────────────────────────────────────────────
  async cancelOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException();
    if (order.status !== 'pending') {
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'cancelled' },
    });
  }

  // ── Mark Paid (called by Stripe webhook) ─────────────────────
  async markPaid(orderId: string, paymentId: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'paid', stripePaymentId: paymentId },
    });
  }
}
