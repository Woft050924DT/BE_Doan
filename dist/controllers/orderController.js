"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrder = exports.getOrderById = exports.getOrders = exports.placeOrder = void 0;
const orderService_1 = require("../services/orderService");
const auth_1 = require("../middleware/auth");
const placeOrder = async (req, res) => {
    try {
        const userId = req.userId;
        const result = await (0, orderService_1.placeOrder)(userId, req.body);
        res.status(201).json(result);
    }
    catch (error) {
        console.error('Place order error:', error);
        if (error.message === 'Required fields are missing' ||
            error.message === 'Cart is empty' ||
            error.message === 'Insufficient stock') {
            return res.status(400).json({ error: 'Số lượng vượt quá tồn kho' });
        }
        if (error.message === 'Variant is required for this product') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.placeOrder = placeOrder;
const getOrders = async (req, res) => {
    try {
        const userId = req.userId;
        const { page = 1, limit = 10 } = req.query;
        const admin = (0, auth_1.isAdminRole)(req.userRole);
        const result = await (0, orderService_1.getOrders)(userId, Number(page), Number(limit), admin);
        res.json(result);
    }
    catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getOrders = getOrders;
const getOrderById = async (req, res) => {
    try {
        const userId = req.userId;
        const admin = (0, auth_1.isAdminRole)(req.userRole);
        const result = await (0, orderService_1.getOrderById)(userId, req.params.id, admin);
        res.json(result);
    }
    catch (error) {
        console.error('Get order error:', error);
        if (error.message === 'Order not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getOrderById = getOrderById;
const updateOrder = async (req, res) => {
    try {
        if (!(0, auth_1.isAdminRole)(req.userRole)) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const userId = req.userId;
        const result = await (0, orderService_1.updateOrder)(userId, req.params.id, req.body, true);
        res.json(result);
    }
    catch (error) {
        console.error('Update order error:', error);
        if (error.message === 'Order not found')
            return res.status(404).json({ error: error.message });
        if (error.message === 'Invalid order status')
            return res.status(400).json({ error: 'Trạng thái đơn không hợp lệ' });
        if (error.message?.includes('Insufficient stock')) {
            return res.status(400).json({ error: 'Không đủ tồn kho để giao hàng' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateOrder = updateOrder;
