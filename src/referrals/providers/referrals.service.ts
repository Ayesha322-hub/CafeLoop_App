import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReferralsService {
  constructor(private prisma: PrismaService) {}

  async getMyCode(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true, name: true },
    });
    if (!user) throw new NotFoundException('User not found');

    // Count how many users signed up with this code
    const referredCount = await this.prisma.user.count({
      where: { referredBy: user.referralCode },
    });

    // Count how many of those have placed at least 1 order (earned referrer points)
    const successfulReferrals = await this.prisma.user.count({
      where: { referredBy: user.referralCode, totalOrders: { gte: 1 } },
    });

    return {
      referralCode: user.referralCode,
      shareLink: `https://cafeloop.app/join?ref=${user.referralCode}`,
      referredCount,
      successfulReferrals,
      pointsEarned: successfulReferrals * 100, // 100 pts per successful referral
    };
  }
}
