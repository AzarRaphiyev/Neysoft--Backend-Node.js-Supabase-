import { Injectable, BadRequestException, UnauthorizedException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import * as nodemailer from 'nodemailer';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { AdminResetPasswordDto } from './dto/admin-reset-password.dto';
import { Role } from '@prisma/client';
@Injectable()
export class AuthService {
  private transporter;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    // Email göndərmək üçün tənzimləmə (Gmail üçün)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'raphiyev@gmail.com', // Öz emailiniz
        pass: 'cyph udpl fxds nsdi', // Gmail-dən aldığınız "App Password"
      },
    });
  }

  async register(dto: CreateAuthDto, currentUser: any) {
    if (dto.role === Role.ADMIN) {
      throw new ForbiddenException('Yeni Admin hesabı yaratmaq qadağandır!');
    }

    if (currentUser.role === Role.MANAGER && dto.role === Role.MANAGER) {
      throw new ForbiddenException('Müdür (Manager) yalnız Kassir (Cashier) hesabı yarada bilər!');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const vToken = uuidv4(); // Təsdiq üçün unikal ID

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
        verificationToken: vToken,
        role: dto.role,
      },
    });

    // Təsdiq linkini göndər
    const url = `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/auth/verify?token=${vToken}`;
    await this.transporter.sendMail({
      to: user.email,
      subject: 'Neysoft - Hesabınızı Təsdiqləyin',
      html: `Hesabınızı təsdiqləmək üçün <a href="${url}">bura klikləyin</a>.`,
    });

    return { message: 'Qeydiyyat uğurludur. Zəhmət olmasa emailinizi yoxlayın.' };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) throw new NotFoundException('Keçərsiz və ya istifadə edilmiş token!');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        isVerified: true, 
        verificationToken: null 
      },
    });

    return { message: 'Hesabınız uğurla təsdiqləndi!' };
  }

  // 3. GİRİŞ (LOGIN) METODU
  async login(dto: LoginAuthDto) {
    if (!dto.username && !dto.email) {
      throw new BadRequestException('İstifadəçi adı və ya email daxil edilməlidir!');
    }

    // Kullanıcıyı veritabanından bul (username veya email ile)
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          dto.username ? { username: { equals: dto.username, mode: 'insensitive' } } : undefined,
          dto.email ? { email: { equals: dto.email, mode: 'insensitive' } } : undefined,
        ].filter(Boolean) as any,
      },
    });

    // Kullanıcı var mı ve şifre doğru mu kontrol et
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('İstifadəçi adı/email və ya şifrə yanlışdır!');
    }

    // Email doğrulanmış mı kontrol et
    if (!user.isVerified) {
      throw new UnauthorizedException('Lütfen önce email adresinize gönderilen linkten hesabınızı doğrulayın.');
    }

    // Her şey doğruysa JWT Token oluştur
    const payload = { id: user.id, username: user.username, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      message: 'Giriş başarılı!',
      access_token: accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  async adminResetPassword(dto: AdminResetPasswordDto) {
    // Kullanıcıyı bul
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('İstifadəçi tapılmadı!');

    // Yeni şifreyi hash'le
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    // Veritabanında güncelle
    await this.prisma.user.update({
      where: { id: dto.userId },
      data: { password: hashedPassword }
    });

    return { message: 'Şifrə uğurla dəyişdirildi!', status: 'success' };
  }

  // 6. KULLANICILARI LİSTELE (GET USERS)
  async findAllUsers(username?: string) {
    const whereCondition: any = {};
    if (username) {
      whereCondition.username = { contains: username, mode: 'insensitive' };
    }
    return this.prisma.user.findMany({
      where: whereCondition,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        // DİKKAT: password alanı kesinlikle seçilmemelidir!
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}