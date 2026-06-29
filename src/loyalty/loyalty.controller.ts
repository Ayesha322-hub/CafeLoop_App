import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LoyaltyService } from './providers/loyalty.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Loyalty')
@ApiBearerAuth()
@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get()
  @ApiOperation({ summary: 'Get loyalty points balance and free coffee progress' })
  getStatus(@CurrentUser('sub') userId: string) {
    return this.loyaltyService.getStatus(userId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get points transaction history' })
  getHistory(
    @CurrentUser('sub') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.loyaltyService.getHistory(userId, Number(page) || 1, Number(limit) || 20);
  }
}
