import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';

const connectionString = 'postgres://postgres:dt2711@localhost:5432/ShopAI';
const adapter = new PrismaPg(new pg.Pool({ connectionString }));
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);
  const customerPassword = await bcrypt.hash('customer123', 10);

  // Create admin user
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
  console.log('Created admin user:', admin.email);

  // Create staff user
  const staff = await prisma.users.upsert({
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
  console.log('Created staff user:', staff.email);

  // Create customer user
  const customer = await prisma.users.upsert({
    where: { email: 'customer@shopai.com' },
    update: {},
    create: {
      email: 'customer@shopai.com',
      password_hash: customerPassword,
      full_name: 'Customer User',
      phone: '0901234569',
      role: 'customer',
      status: 'active',
      email_verified: true,
    },
  });
  console.log('Created customer user:', customer.email);

  console.log('Seed completed successfully!');
  console.log('\nLogin credentials:');
  console.log('==================');
  console.log('Admin: admin@shopai.com / admin123');
  console.log('Staff: staff@shopai.com / staff123');
  console.log('Customer: customer@shopai.com / customer123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
