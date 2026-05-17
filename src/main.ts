import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. CORS İcazəsi (Frontend-in qoşulması üçün)
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // 🟢 Global ValidationPipe: DTO validasiyası və tip çevirmə (transform) aktiv edilir
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,             // @Type() dekoratorlarını işə salır (string -> number, string -> Date və s.)
      whitelist: true,             // DTO-da olmayan əlavə sahələri avtomatik silir
      forbidNonWhitelisted: false, // Əlavə sahələr göndərilsə, xəta vermədən sadəcə onları silir
    }),
  );

  // 🟢 2. BURA ƏLAVƏ EDİLDİ: Bütün API linklərinin əvvəlinə '/api' artırır
  app.setGlobalPrefix('api');

  // 3. Swagger Konfiqurasiyası
  const config = new DocumentBuilder()
    .setTitle('Neysoft API')
    .setDescription('Neysoft Mağaza İdarəetmə Sistemi API Sənədləri')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('products')
    .addBearerAuth() 
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // 🟢 4. BURA DEYİŞDİRİLDİ: Swagger (Sənədlər) artıq localhost:3000/docs ünvanında olacaq
  SwaggerModule.setup('docs', app, document); 

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();