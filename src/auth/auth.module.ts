import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './providers/auth.service';
import { JwtStrategy } from './providers/jwt.strategy';
import { GoogleStrategy } from './providers/google.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}), // secrets passed per-call in service
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  exports: [AuthService],
})
export class AuthModule {}
