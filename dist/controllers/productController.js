"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReview = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductDetails = exports.getProductBySlug = exports.getProductList = void 0;
const productService_1 = require("../services/productService");
const reviewService_1 = require("../services/reviewService");
const getProductList = async (req, res) => {
    try {
        const result = await (0, productService_1.getProductList)(req.query);
        res.json(result);
    }
    catch (error) {
        console.error('Get product list error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getProductList = getProductList;
const getProductBySlug = async (req, res) => {
    try {
        const result = await (0, productService_1.getProductBySlug)(req.params.slug);
        res.json(result);
    }
    catch (error) {
        console.error('Get product by slug error:', error);
        if (error.message === 'Product not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getProductBySlug = getProductBySlug;
const getProductDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, productService_1.getProductDetails)(id);
        res.json(result);
    }
    catch (error) {
        console.error('Get product details error:', error);
        if (error.message === 'Product not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getProductDetails = getProductDetails;
const createProduct = async (req, res) => {
    try {
        const result = await (0, productService_1.createProduct)(req.body, req.userId);
        res.status(201).json(result);
    }
    catch (error) {
        console.error('Create product error:', error);
        if (error.message === 'Product name is required' ||
            error.message === 'SKU is required' ||
            error.message === 'Price must be a valid non-negative number' ||
            error.message === 'SKU already exists' ||
            error.message === 'Giá bán không được thấp hơn giá nhập') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const result = await (0, productService_1.updateProduct)(req.params.id, req.body);
        res.json(result);
    }
    catch (error) {
        console.error('Update product error:', error);
        if (error.message === 'Product not found')
            return res.status(404).json({ error: error.message });
        if (error.message === 'SKU already exists')
            return res.status(400).json({ error: error.message });
        if (error.message === 'Giá bán không được thấp hơn giá nhập') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const result = await (0, productService_1.deleteProduct)(req.params.id);
        res.json(result);
    }
    catch (error) {
        console.error('Delete product error:', error);
        if (error.message === 'Product not found')
            return res.status(404).json({ error: error.message });
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteProduct = deleteProduct;
const createReview = async (req, res) => {
    try {
        const result = await (0, reviewService_1.createReview)(req.userId, req.params.id, req.body);
        res.status(201).json(result);
    }
    catch (error) {
        console.error('Create review error:', error);
        if (error.message === 'Rating must be between 1 and 5') {
            return res.status(400).json({ error: error.message });
        }
        if (error.message === 'Product not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createReview = createReview;
