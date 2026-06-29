import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFcmTokenDto {
  @ApiProperty({ example: 'fcm_token_here' })
  @IsString()
  fcmToken: string;
}
