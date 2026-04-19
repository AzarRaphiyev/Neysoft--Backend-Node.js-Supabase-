import { Controller, Post, Body, Get, Query, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto'; 
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AdminResetPasswordDto } from './dto/admin-reset-password.dto';
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
  async verify(@Query('token') token: string, @Res() res: any) {
    await this.authService.verifyEmail(token);
    return res.redirect('http://localhost:3001/login?verified=true');
  }

  @Post('login')
  @ApiOperation({ summary: 'Sistemə giriş (Username və ya email və şifrə ilə)' })
  login(@Body() loginDto: LoginAuthDto) {
    return this.authService.login(loginDto);
  }
  @Post('admin/reset-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin tərəfindən istifadəçi şifrəsinin birbaşa dəyişdirilməsi' })
  adminResetPassword(@Body() dto: AdminResetPasswordDto) {
    return this.authService.adminResetPassword(dto);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bütün istifadəçiləri gətir (username filteri ilə)' })
  @ApiQuery({ name: 'username', required: false, description: 'Username ilə axtarış' })
  findAllUsers(@Query('username') username?: string) {
    return this.authService.findAllUsers(username);
  }
}