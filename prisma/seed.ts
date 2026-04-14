import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data started...');

  // 1. StoreSettings (ID məlum olmadığı üçün təkrar run edəndə xəta verməməsi üçün UUID veririk)
  const settingsId = '00000000-0000-0000-0000-000000000001';
  await prisma.storeSettings.upsert({
    where: { id: settingsId },
    update: {},
    create: {
      id: settingsId,
      name: 'Neysoft POS',
      currency: 'AZN',
    },
  });

  // 2. Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@neysoft.az',
      password: hashedPassword,
      role: Role.ADMIN,
      isVerified: true,
    },
  });

  // 3. Categories
  const catMens = await prisma.category.upsert({
    where: { name: 'Kişi Geyimləri' },
    update: {},
    create: { name: 'Kişi Geyimləri' },
  });
  
  const catWomens = await prisma.category.upsert({
    where: { name: 'Qadın Geyimləri' },
    update: {},
    create: { name: 'Qadın Geyimləri' },
  });

  // 4. Colors
  const colorBlack = await prisma.color.upsert({
    where: { name: 'Qara' },
    update: {},
    create: { name: 'Qara' },
  });

  const colorWhite = await prisma.color.upsert({
    where: { name: 'Ağ' },
    update: {},
    create: { name: 'Ağ' },
  });

  // 5. Sizes
  const sizeM = await prisma.size.upsert({
    where: { name: 'M' },
    update: {},
    create: { name: 'M' },
  });

  const sizeL = await prisma.size.upsert({
    where: { name: 'L' },
    update: {},
    create: { name: 'L' },
  });

  // 6. Supplier (name üzrə unikal olmadığı üçün findFirst + create istifadə edirik)
  let supplier = await prisma.supplier.findFirst({
    where: { name: 'Neysoft Təchizat' },
  });
  
  if (!supplier) {
    supplier = await prisma.supplier.create({
      data: { name: 'Neysoft Təchizat', contact: '+994 50 123 45 67' },
    });
  }

  // 7. Product
  const productBarcode = '1234567890123';
  await prisma.product.upsert({
    where: { barcode: productBarcode },
    update: {},
    create: {
      barcode: productBarcode,
      name: 'Test Məhsulu (Kişi Köynəyi)',
      stockQuantity: 100,
      purchasePrice: 20,
      salePrice: 40,
      categoryId: catMens.id,
      colorId: colorBlack.id,
      sizeId: sizeM.id,
      supplierId: supplier.id,
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
