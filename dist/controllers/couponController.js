"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCoupon = void 0;
const couponService_1 = require("../services/couponService");
const validateCoupon = async (req, res) => {
    try {
        const { code, subtotal } = req.body;
        const result = await (0, couponService_1.validateCoupon)(code, Number(subtotal) || 0, req.userId);
        res.json(result);
    }
    catch (error) {
        console.error('Validate coupon error:', error);
        if (error.message === 'Coupon code is required' ||
            error.message === 'Invalid coupon code' ||
            error.message === 'Coupon is expired or not yet valid' ||
            error.message === 'Coupon usage limit reached' ||
            error.message === 'Order does not meet minimum purchase for this coupon' ||
            error.message === 'Coupon usage limit per user reached') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.validateCoupon = validateCoupon;
