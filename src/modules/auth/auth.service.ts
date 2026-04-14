import { Injectable, BadRequestException, UnauthorizedException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import * as nodemailer from 'nodemailer';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
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
    const url = `http://localhost:3000/auth/verify?token=${vToken}`;
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

    if (!user) throw new BadRequestException('Keçərsiz və ya müddəti bitmiş token.');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        isVerified: true, 
        verificationToken: null 
      },
    });

    return { message: 'Email uğurla təsdiqləndi! İndi giriş edə bilərsiniz.' };
  }

  // 3. GİRİŞ (LOGIN) METODU
  async login(dto: LoginAuthDto) { // <-- Bura dəyişdi
    // Kullanıcıyı veritabanından bul
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    // Kullanıcı var mı ve şifre doğru mu kontrol et
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Kullanıcı adı veya şifre hatalı!');
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
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  // 4. ŞİFREMİ UNUTTUM (FORGOT PASSWORD)
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    
    if (!user) {
      throw new NotFoundException('Bu email adresi ile kayıtlı bir kullanıcı bulunamadı.');
    }

    // Sıfırlama için benzersiz bir token oluştur
    const resetToken = uuidv4();
    // Token için 1 saat geçerlilik süresi ayarla
    const resetTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000);

    // Kullanıcının veritabanına tokeni ve süresini kaydet
    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpires }
    });

    // Email gönder (Frontend tarafında bu linkin karşılanması gerekir, şimdilik backend linki koyduk)
    const url = `http://localhost:3000/auth/reset-password?token=${resetToken}`;
    await this.transporter.sendMail({
      to: user.email,
      subject: 'Neysoft - Şifre Sıfırlama Talebi',
      html: `Şifrenizi sıfırlamak için <a href="${url}">buraya tıklayın</a>.<br><br><b>Not:</b> Bu link 1 saat boyunca geçerlidir.`,
    });

    return { message: 'Şifre sıfırlama linki email adresinize gönderildi.' };
  }

  // 5. ŞİFREYİ SIFIRLA (RESET PASSWORD)
  async resetPassword(dto: ResetPasswordDto) {
    // Tokeni eşleşen ve süresi (resetTokenExpires) şu anki zamandan büyük olan kullanıcıyı bul
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: dto.token,
        resetTokenExpires: { gt: new Date() } // "gt" = greater than (şu andan büyük olmalı)
      }
    });

    if (!user) {
      throw new BadRequestException('Geçersiz veya süresi dolmuş sıfırlama tokeni.');
    }

    // Yeni şifreyi hash'le
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    // Kullanıcının şifresini güncelle ve tokenleri temizle
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null
      }
    });

    return { message: 'Şifreniz başarıyla güncellendi. Artık yeni şifrenizle giriş yapabilirsiniz.' };
  }
}