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
  const password_hash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.users.upsert({
    where: { email: 'admin@shopai.com' },
    update: {
      password_hash,
      full_name: 'Admin User',
      role: 'admin',
      status: 'active',
      email_verified: true,
    },
    create: {
      email: 'admin@shopai.com',
      password_hash,
      full_name: 'Admin User',
      phone: '0901234567',
      role: 'admin',
      status: 'active',
      email_verified: true,
    },
  });

  const customerPassword = await bcrypt.hash('customer123', 10);
  await prisma.users.upsert({
    where: { email: 'customer@shopai.com' },
    update: {
      password_hash: customerPassword,
      status: 'active',
    },
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

  console.log('✅ Admin:', admin.email, '| mật khẩu: admin123');
  console.log('✅ Customer: customer@shopai.com | mật khẩu: customer123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
