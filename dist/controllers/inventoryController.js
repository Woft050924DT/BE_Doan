"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postReceive = exports.postAdjust = exports.getTransactions = exports.getList = exports.getSummary = void 0;
const inventoryService_1 = require("../services/inventoryService");
const getSummary = async (_req, res) => {
    try {
        const summary = await (0, inventoryService_1.getInventorySummary)();
        res.json(summary);
    }
    catch (error) {
        console.error('Get inventory summary error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getSummary = getSummary;
const getList = async (req, res) => {
    try {
        const result = await (0, inventoryService_1.getInventoryList)(req.query);
        res.json(result);
    }
    catch (error) {
        console.error('Get inventory list error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getList = getList;
const getTransactions = async (req, res) => {
    try {
        const result = await (0, inventoryService_1.getInventoryTransactions)(req.query);
        res.json(result);
    }
    catch (error) {
        console.error('Get inventory transactions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getTransactions = getTransactions;
const postAdjust = async (req, res) => {
    try {
        const result = await (0, inventoryService_1.adjustStock)(req.userId, req.body);
        res.json(result);
    }
    catch (error) {
        console.error('Adjust stock error:', error);
        if (error.message === 'Variant not found' ||
            error.message === 'Insufficient stock' ||
            error.message.includes('required') ||
            error.message.includes('Quantity') ||
            error.message.includes('negative')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.postAdjust = postAdjust;
const postReceive = async (req, res) => {
    try {
        const result = await (0, inventoryService_1.receiveStock)(req.userId, req.body);
        res.status(201).json(result);
    }
    catch (error) {
        console.error('Receive stock error:', error);
        if (error.message === 'Variant not found' ||
            error.message === 'SKU already exists' ||
            error.message === 'Product name is required' ||
            error.message.includes('required') ||
            error.message.includes('Quantity') ||
            error.message.includes('Giá nhập') ||
            error.message.includes('Giá bán') ||
            error.message.includes('Chọn sản phẩm') ||
            error.message.includes('Giá bán phải')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.postReceive = postReceive;
