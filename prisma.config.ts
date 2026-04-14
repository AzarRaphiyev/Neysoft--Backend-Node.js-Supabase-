import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

// .env dosyasının yerini kesin olarak (absolute path) belirtiyoruz
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL as string,
  },
});