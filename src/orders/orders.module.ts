import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './providers/orders.service';
import { OrdersGateway } from './orders.gateway';
import { CartModule } from '../cart/cart.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [CartModule, NotificationsModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersGateway],
  exports: [OrdersService],
})
export class OrdersModule {}
