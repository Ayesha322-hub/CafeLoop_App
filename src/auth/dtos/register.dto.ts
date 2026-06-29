import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Ahmed Raza' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'ahmed@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: '03001234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'AHMED50', description: 'Referral code of the person who invited you' })
  @IsOptional()
  @IsString()
  referredBy?: string;
}
