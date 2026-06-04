import 'dotenv/config';
import { PrismaClient } from '../generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is missing. Copy .env.example to .env and set your PostgreSQL connection string.'
  );
}

const adapter = new PrismaPg(
  new pg.Pool({ connectionString: process.env.DATABASE_URL })
);
const prisma = new PrismaClient({ adapter });

export default prisma;
