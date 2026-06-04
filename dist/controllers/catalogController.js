"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMenus = exports.getBanners = exports.deleteBrand = exports.updateBrand = exports.createBrand = exports.getBrands = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategories = void 0;
const categoryService_1 = require("../services/categoryService");
const brandService_1 = require("../services/brandService");
const bannerService_1 = require("../services/bannerService");
const menuService_1 = require("../services/menuService");
const getCategories = async (req, res) => {
    try {
        const admin = req.query.admin === 'true';
        const categories = await (0, categoryService_1.getCategories)(admin);
        res.json({ categories });
    }
    catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getCategories = getCategories;
const createCategory = async (req, res) => {
    try {
        const category = await (0, categoryService_1.createCategory)(req.body);
        res.status(201).json(category);
    }
    catch (error) {
        console.error('Create category error:', error);
        if (error.message?.includes('required') || error.message?.includes('already exists') || error.message?.includes('not found')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
    try {
        const category = await (0, categoryService_1.updateCategory)(req.params.id, req.body);
        res.json(category);
    }
    catch (error) {
        console.error('Update category error:', error);
        if (error.message === 'Category not found')
            return res.status(404).json({ error: error.message });
        if (error.message?.includes('already exists') || error.message?.includes('cannot') || error.message?.includes('not found')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        const result = await (0, categoryService_1.deleteCategory)(req.params.id);
        res.json({ success: true, category: result });
    }
    catch (error) {
        console.error('Delete category error:', error);
        if (error.message === 'Category not found')
            return res.status(404).json({ error: error.message });
        if (error.message?.includes('Cannot delete'))
            return res.status(400).json({ error: error.message });
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteCategory = deleteCategory;
const getBrands = async (req, res) => {
    try {
        const admin = req.query.admin === 'true';
        const brands = await (0, brandService_1.getBrands)(admin);
        res.json({ brands });
    }
    catch (error) {
        console.error('Get brands error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getBrands = getBrands;
const createBrand = async (req, res) => {
    try {
        const brand = await (0, brandService_1.createBrand)(req.body);
        res.status(201).json(brand);
    }
    catch (error) {
        console.error('Create brand error:', error);
        if (error.message?.includes('required') || error.message?.includes('already exists')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createBrand = createBrand;
const updateBrand = async (req, res) => {
    try {
        const brand = await (0, brandService_1.updateBrand)(req.params.id, req.body);
        res.json(brand);
    }
    catch (error) {
        console.error('Update brand error:', error);
        if (error.message === 'Brand not found')
            return res.status(404).json({ error: error.message });
        if (error.message?.includes('already exists'))
            return res.status(400).json({ error: error.message });
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateBrand = updateBrand;
const deleteBrand = async (req, res) => {
    try {
        const result = await (0, brandService_1.deleteBrand)(req.params.id);
        res.json({ success: true, brand: result });
    }
    catch (error) {
        console.error('Delete brand error:', error);
        if (error.message === 'Brand not found')
            return res.status(404).json({ error: error.message });
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteBrand = deleteBrand;
const getBanners = async (req, res) => {
    try {
        const banners = await (0, bannerService_1.getBanners)(req.query.position);
        res.json({ banners });
    }
    catch (error) {
        console.error('Get banners error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getBanners = getBanners;
const getMenus = async (req, res) => {
    try {
        const menus = await (0, menuService_1.getMenus)(req.query.location);
        res.json({ menus });
    }
    catch (error) {
        console.error('Get menus error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getMenus = getMenus;
