import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'orders',
})
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Mobile app subscribes to a specific order room
  @SubscribeMessage('subscribe_order')
  handleSubscribe(client: Socket, orderId: string) {
    client.join(`order:${orderId}`);
    client.emit('subscribed', { orderId });
  }

  // Called internally by OrdersService when status changes
  emitStatusUpdate(orderId: string, status: string) {
    this.server
      .to(`order:${orderId}`)
      .emit('status_update', { orderId, status, timestamp: new Date().toISOString() });
  }
}
