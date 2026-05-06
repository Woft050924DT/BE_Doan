import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Set DATABASE_URL if not in environment
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgres://postgres:dt2711@localhost:5432/ShopAI';
}

const adapter = new PrismaPg(new pg.Pool({ connectionString: process.env.DATABASE_URL }));
const prisma = new PrismaClient({ adapter });

export default prisma;
