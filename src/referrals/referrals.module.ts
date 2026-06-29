import { Module } from '@nestjs/common';
import { ReferralsController } from './referrals.controller';
import { ReferralsService } from './providers/referrals.service';

@Module({
  controllers: [ReferralsController],
  providers: [ReferralsService],
})
export class ReferralsModule {}
