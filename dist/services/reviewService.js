"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReview = void 0;
const database_1 = __importDefault(require("../config/database"));
const createReview = async (userId, productId, data) => {
    const { rating, title, comment, order_id } = data;
    if (!rating || rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
    }
    const product = await database_1.default.products.findUnique({
        where: { product_id: productId },
    });
    if (!product || product.status !== 'published') {
        throw new Error('Product not found');
    }
    const review = await database_1.default.product_reviews.create({
        data: {
            product_id: productId,
            user_id: userId,
            order_id: order_id || null,
            rating,
            title,
            comment,
            is_verified_purchase: !!order_id,
            is_approved: false,
        },
        include: {
            users: {
                select: { user_id: true, full_name: true, avatar_url: true },
            },
        },
    });
    return review;
};
exports.createReview = createReview;
