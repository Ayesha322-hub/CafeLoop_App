import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // ── Register ────────────────────────────────────────────────
  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const hash = await bcrypt.hash(dto.password, 10);
    const referralCode = this.generateReferralCode(dto.name);

    // Credit referrer if code provided
    if (dto.referredBy) {
      const referrer = await this.prisma.user.findUnique({
        where: { referralCode: dto.referredBy },
      });
      if (referrer) {
        await this.prisma.user.update({
          where: { id: referrer.id },
          data: { loyaltyPoints: { increment: 100 } },
        });
      }
    }

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        passwordHash: hash,
        referralCode,
        loyaltyPoints: dto.referredBy ? 50 : 0,
      },
    });

    return this.generateTokens(user.id, user.email, user.role);
  }

  // ── Login ────────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return this.generateTokens(user.id, user.email, user.role);
  }

  // ── Refresh Token ────────────────────────────────────────────
  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException();
      return this.generateTokens(user.id, user.email, user.role);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  // ── Google OAuth ─────────────────────────────────────────────
  async googleLogin(googleUser: { email: string; name: string; googleId: string }) {
    let user = await this.prisma.user.findUnique({ where: { email: googleUser.email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.googleId,
          referralCode: this.generateReferralCode(googleUser.name),
        },
      });
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  // ── Helpers ──────────────────────────────────────────────────
  async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private generateReferralCode(name: string): string {
    const prefix = name.replace(/\s+/g, '').slice(0, 5).toUpperCase();
    const suffix = Math.floor(10 + Math.random() * 90);
    return `${prefix}${suffix}`;
  }
}
