"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCart = exports.removeCartItem = exports.updateCartItem = exports.addToCart = void 0;
const database_1 = __importDefault(require("../config/database"));
const stock_1 = require("../utils/stock");
const cartInclude = {
    cart_items: {
        include: {
            products: {
                include: {
                    product_images: {
                        where: { is_primary: true },
                        take: 1,
                    },
                },
            },
            product_variants: true,
        },
    },
};
const addToCart = async (userId, product_id, variant_id, quantity) => {
    if (!product_id || !quantity) {
        throw new Error('Product ID and quantity are required');
    }
    // Get product details
    const product = await database_1.default.products.findUnique({
        where: { product_id },
        include: { product_variants: true },
    });
    if (!product || product.status !== 'published') {
        throw new Error('Product not found');
    }
    const resolvedVariantId = await (0, stock_1.resolveVariantId)(product_id, variant_id);
    await (0, stock_1.assertSufficientStock)(product_id, resolvedVariantId, quantity);
    // Determine price
    let price = product.price;
    if (resolvedVariantId) {
        const variant = product.product_variants.find((v) => v.variant_id === resolvedVariantId);
        if (!variant) {
            throw new Error('Variant not found');
        }
        price = variant.price || product.price;
    }
    // Get or create cart
    let cart = await database_1.default.carts.findFirst({
        where: { user_id: userId },
    });
    if (!cart) {
        cart = await database_1.default.carts.create({
            data: { user_id: userId },
        });
    }
    // Check if item already exists in cart
    const existingItem = await database_1.default.cart_items.findFirst({
        where: {
            cart_id: cart.cart_id,
            product_id,
            variant_id: resolvedVariantId || null,
        },
    });
    if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        await (0, stock_1.assertSufficientStock)(product_id, resolvedVariantId, newQuantity);
        await database_1.default.cart_items.update({
            where: { cart_item_id: existingItem.cart_item_id },
            data: { quantity: newQuantity, price, updated_at: new Date() },
        });
    }
    else {
        // Add new item
        await database_1.default.cart_items.create({
            data: {
                cart_id: cart.cart_id,
                product_id,
                variant_id: resolvedVariantId,
                quantity,
                price,
            },
        });
    }
    // Update cart timestamp
    await database_1.default.carts.update({
        where: { cart_id: cart.cart_id },
        data: { updated_at: new Date() },
    });
    // Get updated cart
    return database_1.default.carts.findUnique({
        where: { cart_id: cart.cart_id },
        include: cartInclude,
    });
};
exports.addToCart = addToCart;
const updateCartItem = async (userId, cartItemId, quantity) => {
    if (!quantity || quantity < 1) {
        throw new Error('Quantity must be at least 1');
    }
    const cart = await database_1.default.carts.findFirst({ where: { user_id: userId } });
    if (!cart) {
        throw new Error('Cart item not found');
    }
    const item = await database_1.default.cart_items.findFirst({
        where: { cart_item_id: cartItemId, cart_id: cart.cart_id },
        include: { products: true, product_variants: true },
    });
    if (!item || !item.product_id) {
        throw new Error('Cart item not found');
    }
    await (0, stock_1.assertSufficientStock)(item.product_id, item.variant_id, quantity);
    const price = item.product_variants?.price || item.products?.price || item.price;
    await database_1.default.cart_items.update({
        where: { cart_item_id: cartItemId },
        data: { quantity, price, updated_at: new Date() },
    });
    await database_1.default.carts.update({
        where: { cart_id: cart.cart_id },
        data: { updated_at: new Date() },
    });
    return database_1.default.carts.findUnique({
        where: { cart_id: cart.cart_id },
        include: cartInclude,
    });
};
exports.updateCartItem = updateCartItem;
const removeCartItem = async (userId, cartItemId) => {
    const cart = await database_1.default.carts.findFirst({ where: { user_id: userId } });
    if (!cart) {
        throw new Error('Cart item not found');
    }
    const item = await database_1.default.cart_items.findFirst({
        where: { cart_item_id: cartItemId, cart_id: cart.cart_id },
    });
    if (!item) {
        throw new Error('Cart item not found');
    }
    await database_1.default.cart_items.delete({ where: { cart_item_id: cartItemId } });
    await database_1.default.carts.update({
        where: { cart_id: cart.cart_id },
        data: { updated_at: new Date() },
    });
    return database_1.default.carts.findUnique({
        where: { cart_id: cart.cart_id },
        include: cartInclude,
    });
};
exports.removeCartItem = removeCartItem;
const getCart = async (userId) => {
    const cart = await database_1.default.carts.findFirst({
        where: { user_id: userId },
        include: cartInclude,
    });
    if (!cart) {
        return { cart_id: null, cart_items: [] };
    }
    return cart;
};
exports.getCart = getCart;
