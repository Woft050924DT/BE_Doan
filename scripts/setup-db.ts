import 'dotenv/config';
import pg from 'pg';

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL missing in .env');
  }

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

  await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  console.log('uuid-ossp extension ready.');

  await pool.end();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
