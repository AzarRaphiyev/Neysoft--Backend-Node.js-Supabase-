import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth') // Swagger-də bölmənin adı
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Yeni istifadəçi qeydiyyatı' })
  @ApiResponse({ status: 201, description: 'İstifadəçi uğurla yaradıldı.' })
  @ApiResponse({ status: 400, description: 'İstifadəçi artıq mövcuddur.' })
  register(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.register(createAuthDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Sistemə giriş (Token almaq)' })
  @ApiResponse({ status: 200, description: 'Giriş uğurludur.' })
  @ApiResponse({ status: 401, description: 'Məlumatlar yanlışdır.' })
  login(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.login(createAuthDto);
  }
}