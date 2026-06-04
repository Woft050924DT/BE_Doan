"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertSufficientStock = exports.assertVariantRequired = exports.resolveVariantId = exports.getAvailableStock = void 0;
const database_1 = __importDefault(require("../config/database"));
const getAvailableStock = async (productId, variantId) => {
    if (variantId) {
        const variant = await database_1.default.product_variants.findFirst({
            where: { variant_id: variantId, product_id: productId, is_active: true },
        });
        return variant?.stock_quantity ?? 0;
    }
    const variantCount = await database_1.default.product_variants.count({
        where: { product_id: productId, is_active: true },
    });
    if (variantCount === 0) {
        return Number.MAX_SAFE_INTEGER;
    }
    const variants = await database_1.default.product_variants.findMany({
        where: { product_id: productId, is_active: true },
        select: { stock_quantity: true },
    });
    return variants.reduce((sum, v) => sum + (v.stock_quantity ?? 0), 0);
};
exports.getAvailableStock = getAvailableStock;
/** Chọn biến thể mặc định (biến thể active đầu tiên) khi client không gửi variant_id */
const resolveVariantId = async (productId, variantId) => {
    if (variantId)
        return variantId;
    const first = await database_1.default.product_variants.findFirst({
        where: { product_id: productId, is_active: true },
        orderBy: { created_at: 'asc' },
        select: { variant_id: true },
    });
    return first?.variant_id ?? null;
};
exports.resolveVariantId = resolveVariantId;
const assertVariantRequired = async (productId, variantId) => {
    const variantCount = await database_1.default.product_variants.count({
        where: { product_id: productId, is_active: true },
    });
    if (variantCount > 0 && !variantId) {
        throw new Error('Variant is required for this product');
    }
};
exports.assertVariantRequired = assertVariantRequired;
const assertSufficientStock = async (productId, variantId, quantity) => {
    await (0, exports.assertVariantRequired)(productId, variantId);
    const available = await (0, exports.getAvailableStock)(productId, variantId);
    if (quantity > available) {
        throw new Error('Insufficient stock');
    }
};
exports.assertSufficientStock = assertSufficientStock;
