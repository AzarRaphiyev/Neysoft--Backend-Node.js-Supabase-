import { Controller, Post, Body, Get, Query, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto'; 
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yeni istifadəçi qeydiyyatı və email göndərilməsi' })
  register(@Body() createAuthDto: CreateAuthDto, @Req() req: any) {
    return this.authService.register(createAuthDto, req.user);
  }

  @Get('verify')
  @ApiOperation({ summary: 'Email təsdiqləmə linki' })
  @ApiQuery({ name: 'token', description: 'Emailə göndərilən unikal token' })
  verify(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('login')
  @ApiOperation({ summary: 'Sistemə giriş (Yalnız username və password ilə)' })
  login(@Body() loginDto: LoginAuthDto) { // Burada CreateAuthDto əvəzinə LoginAuthDto istifadə etdik
    return this.authService.login(loginDto);
  }
  @Post('forgot-password')
  @ApiOperation({ summary: 'Şifremi Unuttum (Email gönderir)' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Yeni şifre belirleme (Token ve yeni şifre ile)' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}