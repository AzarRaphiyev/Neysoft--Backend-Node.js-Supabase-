import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Baza təmizlənir...');
  
  // Tabloları temizle (Sıralama foreign key'lere göre önemlidir)
  await prisma.saleItem.deleteMany({});
  await prisma.sale.deleteMany({});
  await prisma.inventoryItem.deleteMany({});
  await prisma.inventoryReceipt.deleteMany({});
  await prisma.customerReturn.deleteMany({});
  await prisma.supplierReturn.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.color.deleteMany({});
  await prisma.size.deleteMany({});
  await prisma.user.deleteMany({ where: { role: { not: 'ADMIN' } } });

  // Admin hesabı kontrolü ve oluşturulması
  const adminExists = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@neysoft.com',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log('✅ Admin hesabı yaradıldı (Username: admin, Şifrə: admin123)');
  } else {
    console.log('✅ Admin hesabı onsuz da mövcuddur.');
  }

  // 1. KATEQORİYALAR (Sadece 'name' alanı var)
  console.log('Kateqoriyalar əlavə olunur...');
  const categories = ['T-Shirt', 'Köynək (Klassik)', 'Şalvar (Klassik)', 'Cins Şalvar (Jeans)', 'Gödəkcə', 'Sviter', 'Kostyum', 'Şortik', 'Ayaqqabı (Klassik)', 'İdman Ayaqqabısı', 'Çanta', 'Kəmər', 'Papaq / Kepka', 'Eynək', 'Corab'];
  for (const name of categories) {
    const exists = await prisma.category.findFirst({ where: { name } });
    if (!exists) await prisma.category.create({ data: { name } });
  }

  // 2. RƏNGLƏR (Sadece 'name' alanı var, hexCode yok)
  console.log('Rənglər əlavə olunur...');
  const colors = ['Qara', 'Ağ', 'Boz', 'Tünd Göy', 'Mavi', 'Qırmızı', 'Bordo', 'Yaşıl', 'Xaki', 'Sarı', 'Narıncı', 'Qəhvəyi', 'Bej', 'Çəhrayı', 'Bənövşəyi'];
  for (const name of colors) {
    const exists = await prisma.color.findFirst({ where: { name } });
    if (!exists) await prisma.color.create({ data: { name } });
  }

  // 3. ÖLÇÜLƏR
  console.log('Ölçülər əlavə olunur...');
  const sizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Standart', '38', '39', '40', '41', '42', '43', '44'];
  for (const name of sizes) {
    const exists = await prisma.size.findFirst({ where: { name } });
    if (!exists) await prisma.size.create({ data: { name } });
  }

  // 4. TƏCHİZATÇILAR (Sadece 'name' ve 'contact' alanları var, address yok)
  console.log('Təchizatçılar əlavə olunur...');
  const suppliers = [
    { name: 'Trendyol Toptan', contact: '+90 555 111 2233' }, { name: 'İstanbul Tekstil MMC', contact: '+90 500 222 3344' },
    { name: 'Baku Giyim Toptan', contact: '+994 50 123 4567' }, { name: 'Zara Baku Distribyutor', contact: '+994 55 987 6543' },
    { name: 'Defacto Toptan', contact: '+90 532 444 5566' }, { name: 'Lokal İstehsal FABRİK', contact: '+994 70 555 6677' }
  ];
  for (const s of suppliers) {
    const exists = await prisma.supplier.findFirst({ where: { name: s.name } });
    if (!exists) await prisma.supplier.create({ data: { name: s.name, contact: s.contact } });
  }

  console.log('🎉 Verilənlər bazası uğurla sıfırlandı və yeni məlumatlarla dolduruldu!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
