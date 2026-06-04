import 'dotenv/config';
import pg from 'pg';

async function main() {
  const baseUrl =
    process.env.DATABASE_URL?.replace(/\/[^/]+$/, '/postgres') ||
    'postgresql://postgres:phong123@localhost:5432/postgres';

  const pool = new pg.Pool({ connectionString: baseUrl });

  try {
    await pool.query('CREATE DATABASE "ShopAI"');
    console.log('Database ShopAI created.');
  } catch (e: any) {
    if (e.code === '42P04') {
      console.log('Database ShopAI already exists.');
    } else {
      throw e;
    }
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
