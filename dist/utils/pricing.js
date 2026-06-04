"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertValidSellingPrice = void 0;
/** Giá bán (price) phải >= giá nhập/vốn (cost_price) */
const assertValidSellingPrice = (sellingPrice, costPrice) => {
    if (!Number.isFinite(sellingPrice) || sellingPrice < 0) {
        throw new Error('Price must be a valid non-negative number');
    }
    const cost = costPrice != null ? Number(costPrice) : 0;
    if (cost > 0 && sellingPrice < cost) {
        throw new Error('Giá bán không được thấp hơn giá nhập');
    }
};
exports.assertValidSellingPrice = assertValidSellingPrice;
