import { Module } from '@nestjs/common';
import { LoyaltyController } from './loyalty.controller';
import { LoyaltyService } from './providers/loyalty.service';

@Module({
  controllers: [LoyaltyController],
  providers: [LoyaltyService],
})
export class LoyaltyModule {}
