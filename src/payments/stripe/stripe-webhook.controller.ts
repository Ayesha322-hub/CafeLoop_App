import { Controller, Post, Req, Headers, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { OrdersService } from '../../orders/providers/orders.service';
import { Public } from '../../common/decorators/public.decorator';
import Stripe from 'stripe';

@ApiTags('Payments')
@Controller('payments/stripe')
export class StripeWebhookController {
  constructor(
    private stripeService: StripeService,
    private ordersService: OrdersService,
  ) {}

  // This endpoint must receive raw body — configured in main.ts
  @Public()
  @Post('webhook')
  async handleWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) throw new BadRequestException('Missing stripe-signature header');

    let event: Stripe.Event;
    try {
      event = this.stripeService.constructWebhookEvent(req.body as Buffer, signature);
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object as Stripe.PaymentIntent;
      const orderId = pi.metadata?.orderId;
      if (orderId) {
        await this.ordersService.markPaid(orderId, pi.id);
      }
    }

    return { received: true };
  }
}
