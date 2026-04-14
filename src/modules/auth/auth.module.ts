import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'neysoft-super-gizli-acar-2026', // Real layihədə bunu .env-də saxlayacağıq
      signOptions: { expiresIn: '365d' }, // Token 1 gün ərzində etibarlıdır
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}