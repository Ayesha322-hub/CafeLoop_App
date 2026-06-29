import { IsString, IsInt, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty()
  @IsString()
  cafeId: string;

  @ApiProperty()
  @IsString()
  menuItemId: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 480 })
  @IsNumber()
  unitPrice: number;

  @ApiPropertyOptional({ example: { size: 'Large', milk: 'Oat', sugar: 'Normal' } })
  @IsOptional()
  customizations?: Record<string, string>;
}
