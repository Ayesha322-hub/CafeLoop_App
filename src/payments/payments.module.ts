import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { StripeService } from './stripe/stripe.service';
import { StripeWebhookController } from './stripe/stripe-webhook.controller';
import { JazzCashService } from './jazzcash/jazzcash.service';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [OrdersModule],
  controllers: [PaymentsController, StripeWebhookController],
  providers: [StripeService, JazzCashService],
  exports: [StripeService],
})
export class PaymentsModule {}
