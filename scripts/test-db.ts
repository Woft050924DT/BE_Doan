import prisma from '../src/config/database';

async function main() {
  const result = await prisma.$queryRaw<{ ok: number }[]>`SELECT 1 as ok`;
  console.log('DB OK', result);
}

main()
  .catch((e) => {
    console.error('DB FAILED:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
