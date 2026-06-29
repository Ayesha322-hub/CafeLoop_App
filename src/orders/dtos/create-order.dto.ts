import { IsString, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  cafeId: string;

  @ApiProperty({ enum: ['pickup', 'dine_in', 'delivery'] })
  @IsEnum(['pickup', 'dine_in', 'delivery'])
  orderType: string;

  @ApiProperty({ enum: ['stripe', 'jazzcash', 'cash'] })
  @IsEnum(['stripe', 'jazzcash', 'cash'])
  paymentMethod: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  useLoyaltyPoints?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stripePaymentIntentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jazzCashTxnRef?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
