"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCartItem = exports.updateCartItem = exports.getCart = exports.addToCart = void 0;
const cartService_1 = require("../services/cartService");
const addToCart = async (req, res) => {
    try {
        const userId = req.userId;
        const { product_id, variant_id, quantity } = req.body;
        const result = await (0, cartService_1.addToCart)(userId, product_id, variant_id || null, quantity);
        res.json(result);
    }
    catch (error) {
        console.error('Add to cart error:', error);
        if (error.message === 'Product ID and quantity are required' ||
            error.message === 'Variant is required for this product' ||
            error.message === 'Insufficient stock') {
            return res.status(400).json({ error: 'Số lượng vượt quá tồn kho' });
        }
        if (error.message === 'Product not found' || error.message === 'Variant not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.addToCart = addToCart;
const getCart = async (req, res) => {
    try {
        const userId = req.userId;
        const result = await (0, cartService_1.getCart)(userId);
        res.json(result);
    }
    catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getCart = getCart;
const updateCartItem = async (req, res) => {
    try {
        const userId = req.userId;
        const { itemId } = req.params;
        const { quantity } = req.body;
        const result = await (0, cartService_1.updateCartItem)(userId, itemId, quantity);
        res.json(result);
    }
    catch (error) {
        console.error('Update cart item error:', error);
        if (error.message === 'Quantity must be at least 1') {
            return res.status(400).json({ error: 'Số lượng phải ít nhất là 1' });
        }
        if (error.message === 'Insufficient stock') {
            return res.status(400).json({ error: 'Số lượng vượt quá tồn kho' });
        }
        if (error.message === 'Cart item not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateCartItem = updateCartItem;
const removeCartItem = async (req, res) => {
    try {
        const userId = req.userId;
        const { itemId } = req.params;
        const result = await (0, cartService_1.removeCartItem)(userId, itemId);
        res.json(result);
    }
    catch (error) {
        console.error('Remove cart item error:', error);
        if (error.message === 'Cart item not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.removeCartItem = removeCartItem;
