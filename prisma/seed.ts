import 'dotenv/config';
import { PrismaClient } from '../src/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing in .env');
}

const adapter = new PrismaPg(new pg.Pool({ connectionString: process.env.DATABASE_URL }));
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);
  const customerPassword = await bcrypt.hash('customer123', 10);

  const admin = await prisma.users.upsert({
    where: { email: 'admin@shopai.com' },
    update: {},
    create: {
      email: 'admin@shopai.com',
      password_hash: adminPassword,
      full_name: 'Admin User',
      phone: '0901234567',
      role: 'admin',
      status: 'active',
      email_verified: true,
    },
  });

  await prisma.users.upsert({
    where: { email: 'staff@shopai.com' },
    update: {},
    create: {
      email: 'staff@shopai.com',
      password_hash: staffPassword,
      full_name: 'Staff User',
      phone: '0901234568',
      role: 'staff',
      status: 'active',
      email_verified: true,
    },
  });

  const customer = await prisma.users.upsert({
    where: { email: 'customer@shopai.com' },
    update: {},
    create: {
      email: 'customer@shopai.com',
      password_hash: customerPassword,
      full_name: 'Nguyễn Văn An',
      phone: '0901234569',
      role: 'customer',
      status: 'active',
      email_verified: true,
    },
  });

  const categoryNam = await prisma.categories.upsert({
    where: { slug: 'dong-ho-nam' },
    update: {},
    create: {
      name: 'Đồng hồ nam',
      slug: 'dong-ho-nam',
      description: 'Đồng hồ dành cho nam',
      is_active: true,
    },
  });

  const categoryNu = await prisma.categories.upsert({
    where: { slug: 'dong-ho-nu' },
    update: {},
    create: {
      name: 'Đồng hồ nữ',
      slug: 'dong-ho-nu',
      description: 'Đồng hồ dành cho nữ',
      is_active: true,
    },
  });

  const brandCasio = await prisma.brands.upsert({
    where: { slug: 'casio' },
    update: {},
    create: {
      name: 'Casio',
      slug: 'casio',
      logo_url: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=100&q=80',
      is_active: true,
    },
  });

  const brandCitizen = await prisma.brands.upsert({
    where: { slug: 'citizen' },
    update: {},
    create: {
      name: 'Citizen',
      slug: 'citizen',
      is_active: true,
    },
  });

  const products = [
    {
      name: 'Casio G-Shock GA-2100',
      slug: 'casio-g-shock-ga-2100',
      sku: 'CASIO-GA2100',
      price: 3290000,
      compare_price: 3990000,
      category_id: categoryNam.category_id,
      brand_id: brandCasio.brand_id,
      featured: true,
      best_seller: true,
      new_arrival: false,
    },
    {
      name: 'Citizen Eco-Drive BM8180',
      slug: 'citizen-eco-drive-bm8180',
      sku: 'CITIZEN-BM8180',
      price: 4590000,
      compare_price: 5290000,
      category_id: categoryNam.category_id,
      brand_id: brandCitizen.brand_id,
      featured: true,
      best_seller: false,
      new_arrival: true,
    },
    {
      name: 'Casio LTP-V002',
      slug: 'casio-ltp-v002',
      sku: 'CASIO-LTPV002',
      price: 890000,
      compare_price: 1190000,
      category_id: categoryNu.category_id,
      brand_id: brandCasio.brand_id,
      featured: false,
      best_seller: true,
      new_arrival: true,
    },
    {
      name: 'Citizen Classic EM0730',
      slug: 'citizen-classic-em0730',
      sku: 'CITIZEN-EM0730',
      price: 5200000,
      compare_price: 5900000,
      category_id: categoryNu.category_id,
      brand_id: brandCitizen.brand_id,
      featured: false,
      best_seller: false,
      new_arrival: true,
    },
  ];

  for (const p of products) {
    const product = await prisma.products.upsert({
      where: { slug: p.slug },
      update: {
        price: p.price,
        compare_price: p.compare_price,
        status: 'published',
        featured: p.featured,
        best_seller: p.best_seller,
        new_arrival: p.new_arrival,
      },
      create: {
        ...p,
        short_description: `${p.name} chính hãng, bảo hành 2 năm`,
        description: `Mô tả chi tiết cho ${p.name}. Sản phẩm chính hãng, đầy đủ phụ kiện.`,
        status: 'published',
        published_at: new Date(),
      },
    });

    const imageCount = await prisma.product_images.count({
      where: { product_id: product.product_id },
    });
    if (imageCount === 0) {
      await prisma.product_images.create({
        data: {
          product_id: product.product_id,
          image_url: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80',
          alt_text: p.name,
          is_primary: true,
          display_order: 0,
        },
      });
    }

    const variantSku = `${p.sku}-STD`;
    await prisma.product_variants.upsert({
      where: { sku: variantSku },
      update: { stock_quantity: 50, price: p.price },
      create: {
        product_id: product.product_id,
        sku: variantSku,
        name: 'Mặc định',
        price: p.price,
        compare_price: p.compare_price,
        stock_quantity: 50,
        is_active: true,
      },
    });
  }

  await prisma.coupons.upsert({
    where: { code: 'SAVE10' },
    update: { is_active: true },
    create: {
      code: 'SAVE10',
      description: 'Giảm 10% đơn hàng',
      discount_type: 'percentage',
      discount_value: 10,
      min_purchase_amount: 500000,
      max_discount_amount: 500000,
      valid_from: new Date('2024-01-01'),
      valid_to: new Date('2030-12-31'),
      is_active: true,
    },
  });

  const existingAddress = await prisma.user_addresses.findFirst({
    where: { user_id: customer.user_id, is_default: true },
  });

  if (!existingAddress) {
    await prisma.user_addresses.create({
      data: {
        user_id: customer.user_id,
        address_type: 'shipping',
        full_name: customer.full_name,
        phone: customer.phone || '0901234569',
        address_line1: '123 Nguyễn Huệ',
        address_line2: 'Phường Bến Nghé',
        city: 'TP. Hồ Chí Minh',
        district: 'Quận 1',
        ward: 'Phường Bến Nghé',
        postal_code: '700000',
        is_default: true,
      },
    });
  }

  console.log('Seed completed!');
  console.log('Admin:', admin.email, '/ admin123');
  console.log('Customer:', customer.email, '/ customer123');
  console.log('Coupon: SAVE10');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
