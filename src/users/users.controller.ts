import { Controller, Get, Patch, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './providers/users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UpdateFcmTokenDto } from './dtos/update-fcm-token.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@CurrentUser('sub') userId: string) {
    return this.usersService.findById(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update profile' })
  updateMe(@CurrentUser('sub') userId: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(userId, dto);
  }

  @Patch('me/fcm-token')
  @ApiOperation({ summary: 'Update Firebase push token' })
  updateFcmToken(@CurrentUser('sub') userId: string, @Body() dto: UpdateFcmTokenDto) {
    return this.usersService.updateFcmToken(userId, dto.fcmToken);
  }

  @Get('me/orders')
  @ApiOperation({ summary: 'Get order history' })
  getOrders(
    @CurrentUser('sub') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.usersService.getOrderHistory(userId, Number(page) || 1, Number(limit) || 10);
  }
}
