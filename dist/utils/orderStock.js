"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreStockForOrder = exports.deductStockForOrder = void 0;
const stock_1 = require("./stock");
const STOCK_APPLIED_MARKER = '[stock_applied]';
const saleNotes = (applied) => applied
    ? `Xuất kho khi giao hàng thành công ${STOCK_APPLIED_MARKER}`
    : 'Xuất kho khi giao hàng thành công';
const isStockApplied = (notes) => Boolean(notes?.includes(STOCK_APPLIED_MARKER));
/** Trừ tồn kho theo từng dòng đơn; idempotent theo giao dịch sale + marker [stock_applied]. */
const deductStockForOrder = async (tx, orderId, userId, items) => {
    for (const item of items) {
        if (!item.product_id)
            continue;
        const variantId = await (0, stock_1.resolveVariantId)(item.product_id, item.variant_id);
        if (!variantId)
            continue;
        const existingSale = await tx.inventory_transactions.findFirst({
            where: {
                reference_id: orderId,
                transaction_type: 'sale',
                product_id: item.product_id,
                variant_id: variantId,
            },
        });
        if (existingSale && isStockApplied(existingSale.notes)) {
            continue;
        }
        const variant = await tx.product_variants.findUnique({
            where: { variant_id: variantId },
        });
        if (!variant)
            continue;
        const available = variant.stock_quantity ?? 0;
        if (available < item.quantity) {
            throw new Error(`Insufficient stock for variant ${variant.sku}`);
        }
        await tx.product_variants.update({
            where: { variant_id: variantId },
            data: { stock_quantity: { decrement: item.quantity } },
        });
        if (existingSale) {
            await tx.inventory_transactions.update({
                where: { transaction_id: existingSale.transaction_id },
                data: { notes: saleNotes(true) },
            });
        }
        else {
            await tx.inventory_transactions.create({
                data: {
                    product_id: item.product_id,
                    variant_id: variantId,
                    transaction_type: 'sale',
                    quantity: item.quantity,
                    reference_id: orderId,
                    notes: saleNotes(true),
                    created_by: userId,
                },
            });
        }
    }
};
exports.deductStockForOrder = deductStockForOrder;
const restoreStockForOrder = async (tx, orderId, userId) => {
    const sales = await tx.inventory_transactions.findMany({
        where: { reference_id: orderId, transaction_type: 'sale' },
    });
    if (sales.length === 0)
        return;
    for (const sale of sales) {
        if (sale.variant_id && isStockApplied(sale.notes)) {
            await tx.product_variants.update({
                where: { variant_id: sale.variant_id },
                data: { stock_quantity: { increment: sale.quantity } },
            });
        }
        await tx.inventory_transactions.create({
            data: {
                product_id: sale.product_id,
                variant_id: sale.variant_id,
                transaction_type: 'stock_in',
                quantity: sale.quantity,
                reference_id: orderId,
                notes: 'Hoàn kho do hủy đơn đã giao',
                created_by: userId,
            },
        });
    }
};
exports.restoreStockForOrder = restoreStockForOrder;
