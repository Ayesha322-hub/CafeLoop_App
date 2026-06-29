import { IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JazzCashPaymentDto {
  @ApiProperty({ example: 1200 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ example: 'order_id_here' })
  @IsString()
  orderId: string;

  @ApiProperty({ example: '03001234567' })
  @IsString()
  mobileNumber: string;

  @ApiProperty()
  @IsString()
  userId: string;
}
