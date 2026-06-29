import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './providers/orders.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderStatusDto } from './dtos/update-order-status.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Place a new order' })
  createOrder(@CurrentUser('sub') userId: string, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order detail + tracking status' })
  findOne(@Param('id') orderId: string, @CurrentUser('sub') userId: string) {
    return this.ordersService.findOne(orderId, userId);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update order status (cafe staff only)' })
  updateStatus(@Param('id') orderId: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(orderId, dto);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a pending order' })
  cancelOrder(@Param('id') orderId: string, @CurrentUser('sub') userId: string) {
    return this.ordersService.cancelOrder(orderId, userId);
  }
}
