import { IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ example: 1200 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ example: 'order_id_here' })
  @IsString()
  orderId: string;
}
