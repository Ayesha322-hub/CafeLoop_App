import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReferralsService } from './providers/referrals.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Referrals')
@ApiBearerAuth()
@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get('my-code')
  @ApiOperation({ summary: 'Get my referral code, share link and stats' })
  getMyCode(@CurrentUser('sub') userId: string) {
    return this.referralsService.getMyCode(userId);
  }
}
