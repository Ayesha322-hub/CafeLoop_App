import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { StripeService } from './stripe/stripe.service';
import { JazzCashService } from './jazzcash/jazzcash.service';
import { CreatePaymentDto } from './dtos/create-payment.dto';
import { JazzCashPaymentDto } from './dtos/jazzcash-payment.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(
    private stripeService: StripeService,
    private jazzCashService: JazzCashService,
  ) {}

  @Post('stripe/intent')
  @ApiOperation({ summary: 'Create Stripe PaymentIntent — call before placing order' })
  createStripeIntent(
    @Body() dto: CreatePaymentDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.stripeService.createPaymentIntent(dto.amount, dto.orderId, userId);
  }

  @Post('jazzcash')
  @ApiOperation({ summary: 'Initiate JazzCash mobile wallet payment' })
  jazzCashPay(@Body() dto: JazzCashPaymentDto) {
    return this.jazzCashService.initiatePayment(dto);
  }

  // JazzCash sends result to this URL after payment
  @Public()
  @Post('jazzcash/callback')
  @ApiOperation({ summary: 'JazzCash async callback (public)' })
  jazzCashCallback(@Body() body: any) {
    // Verify pp_SecureHash then mark order paid
    console.log('JazzCash callback:', body);
    return { received: true };
  }
}
