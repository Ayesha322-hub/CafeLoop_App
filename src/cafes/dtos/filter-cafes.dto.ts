import { IsOptional, IsString, IsBoolean, IsNumberString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterCafesDto {
  @ApiPropertyOptional({ example: 'brew' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'coffee' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: '31.5204' })
  @IsOptional()
  @IsNumberString()
  lat?: string;

  @ApiPropertyOptional({ example: '74.3587' })
  @IsOptional()
  @IsNumberString()
  lng?: string;

  @ApiPropertyOptional({ example: '5' })
  @IsOptional()
  @IsNumberString()
  radius?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  openNow?: boolean;

  @ApiPropertyOptional({ enum: ['rating', 'distance', 'orders'] })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({ example: '10' })
  @IsOptional()
  @IsNumberString()
  limit?: string;
}
