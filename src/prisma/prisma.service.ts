import 'dotenv/config'; // .env dosyasını güvenli bir şekilde okumak için
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // 1. Veritabanı URL'imizi alıyoruz
    const connectionString = process.env.DATABASE_URL;
    
    // 2. pg paketi ile bir bağlantı havuzu oluşturuyoruz
    const pool = new Pool({ connectionString });
    
    // 3. Prisma 7 için PostgreSQL adaptörünü ayarlıyoruz
    const adapter = new PrismaPg(pool);
    
    // 4. Adaptörü PrismaClient'a iletiyoruz
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}