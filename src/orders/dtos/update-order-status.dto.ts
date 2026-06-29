import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: ['accepted', 'preparing', 'ready', 'completed', 'cancelled'] })
  @IsEnum(['accepted', 'preparing', 'ready', 'completed', 'cancelled'])
  status: string;
}
