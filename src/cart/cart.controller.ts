import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CartService } from './providers/cart.service';
import { AddToCartDto } from './dtos/add-to-cart.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get cart with totals' })
  getCart(@CurrentUser('sub') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  addItem(@CurrentUser('sub') userId: string, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(userId, dto);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update item quantity' })
  updateItem(
    @CurrentUser('sub') userId: string,
    @Param('id') itemId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.cartService.updateItem(userId, itemId, quantity);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove item from cart' })
  removeItem(@CurrentUser('sub') userId: string, @Param('id') itemId: string) {
    return this.cartService.removeItem(userId, itemId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear entire cart' })
  clearCart(@CurrentUser('sub') userId: string) {
    return this.cartService.clearCart(userId);
  }

  @Post('coupon')
  @ApiOperation({ summary: 'Validate coupon and preview discount' })
  validateCoupon(@Body('code') code: string, @Body('subtotal') subtotal: number) {
    return this.cartService.validateCoupon(code, subtotal);
  }
}
