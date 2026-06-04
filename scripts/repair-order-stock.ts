/**
 * Sửa đơn đã "delivered" nhưng chưa trừ kho (sale cũ không có [stock_applied]).
 * Chạy: npx tsx scripts/repair-order-stock.ts
 */
import prisma from '../src/config/database';
import { deductStockForOrder } from '../src/utils/orderStock';

async function main() {
  const orders = await prisma.orders.findMany({
    where: { status: 'delivered' },
    include: { order_items: true },
    orderBy: { created_at: 'desc' },
  });

  let repaired = 0;
  for (const order of orders) {
    await prisma.$transaction(async (tx) => {
      await deductStockForOrder(tx, order.order_id, null, order.order_items);
    });
    repaired += 1;
    console.log('Processed', order.order_number);
  }

  console.log(`Done. Ran stock sync for ${repaired} delivered order(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
