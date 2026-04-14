import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. CORS İcazəsi (Frontend-in qoşulması üçün)
  app.enableCors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

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