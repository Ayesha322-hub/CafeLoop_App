import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  onModuleInit() {
  const hasFirebaseConfig =
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY;

  if (hasFirebaseConfig && !admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
      console.log('Firebase initialized');
    } catch (err) {
      console.warn('Firebase init failed:', (err as Error).message);

    }
  } else {
    console.warn('Firebase not configured — push notifications disabled');
  }
}

  // ── Send push to a single device ────────────────────────────
  async sendPush(
    fcmToken: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    if (!admin.apps.length) return;
    try {
      await admin.messaging().send({
        token: fcmToken,
        notification: { title, body },
        data,
        android: { priority: 'high' },
        apns: { payload: { aps: { sound: 'default' } } },
      });
    } catch (err) {
      console.error('FCM send error:', err);
    }
  }

  // ── Notify all cafe staff about new order ───────────────────
  async notifyCafe(cafeId: string, orderId: string) {
    if (!admin.apps.length) return;
    const staff = await this.prisma.cafeStaff.findMany({
      where: { cafeId },
      include: { user: { select: { fcmToken: true } } },
    });

    const tokens = staff
      .map((s) => s.user.fcmToken)
      .filter((t): t is string => !!t);

    if (tokens.length === 0) return;

    try {
      await admin.messaging().sendEachForMulticast({
        tokens,
        notification: {
          title: '🔔 New Order!',
          body: `Order #${orderId.slice(-6).toUpperCase()} received`,
        },
        data: { orderId, type: 'new_order' },
        android: { priority: 'high' },
      });
    } catch (err) {
      console.error('FCM multicast error:', err);
    }
  }
}
