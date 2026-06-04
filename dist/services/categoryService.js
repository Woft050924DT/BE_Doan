"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategories = void 0;
const database_1 = __importDefault(require("../config/database"));
const slugify_1 = require("../utils/slugify");
const ensureUniqueCategorySlug = async (baseSlug, excludeId) => {
    let slug = baseSlug;
    let counter = 1;
    while (true) {
        const existing = await database_1.default.categories.findFirst({
            where: {
                slug,
                ...(excludeId ? { category_id: { not: excludeId } } : {}),
            },
        });
        if (!existing)
            return slug;
        slug = `${baseSlug}-${counter}`;
        counter += 1;
    }
};
const getCategories = async (admin = false) => {
    return database_1.default.categories.findMany({
        where: admin ? {} : { is_active: true },
        orderBy: [{ display_order: 'asc' }, { name: 'asc' }],
        include: {
            _count: {
                select: {
                    products: admin ? true : { where: { status: 'published' } },
                },
            },
        },
    });
};
exports.getCategories = getCategories;
const createCategory = async (data) => {
    if (!data.name?.trim())
        throw new Error('Category name is required');
    const baseSlug = (0, slugify_1.slugify)(data.slug || data.name);
    const slug = await ensureUniqueCategorySlug(baseSlug || `category-${Date.now()}`);
    const existingName = await database_1.default.categories.findFirst({
        where: { name: { equals: data.name.trim(), mode: 'insensitive' } },
    });
    if (existingName)
        throw new Error('Category name already exists');
    if (data.parent_id) {
        const parent = await database_1.default.categories.findUnique({ where: { category_id: data.parent_id } });
        if (!parent)
            throw new Error('Parent category not found');
    }
    return database_1.default.categories.create({
        data: {
            name: data.name.trim(),
            slug,
            description: data.description?.trim() || null,
            image_url: data.image_url?.trim() || null,
            icon: data.icon?.trim() || null,
            display_order: data.display_order ?? 0,
            parent_id: data.parent_id || null,
            is_active: data.is_active ?? true,
        },
        include: { _count: { select: { products: true } } },
    });
};
exports.createCategory = createCategory;
const updateCategory = async (categoryId, data) => {
    const existing = await database_1.default.categories.findUnique({ where: { category_id: categoryId } });
    if (!existing)
        throw new Error('Category not found');
    if (data.parent_id === categoryId) {
        throw new Error('Category cannot be its own parent');
    }
    if (data.parent_id) {
        const parent = await database_1.default.categories.findUnique({ where: { category_id: data.parent_id } });
        if (!parent)
            throw new Error('Parent category not found');
    }
    let slug = existing.slug;
    if (data.slug?.trim()) {
        slug = await ensureUniqueCategorySlug((0, slugify_1.slugify)(data.slug), categoryId);
    }
    else if (data.name?.trim() && data.name.trim() !== existing.name) {
        slug = await ensureUniqueCategorySlug((0, slugify_1.slugify)(data.name), categoryId);
    }
    if (data.name?.trim()) {
        const duplicate = await database_1.default.categories.findFirst({
            where: {
                name: { equals: data.name.trim(), mode: 'insensitive' },
                category_id: { not: categoryId },
            },
        });
        if (duplicate)
            throw new Error('Category name already exists');
    }
    return database_1.default.categories.update({
        where: { category_id: categoryId },
        data: {
            ...(data.name !== undefined ? { name: data.name.trim() } : {}),
            slug,
            ...(data.description !== undefined ? { description: data.description?.trim() || null } : {}),
            ...(data.image_url !== undefined ? { image_url: data.image_url?.trim() || null } : {}),
            ...(data.icon !== undefined ? { icon: data.icon?.trim() || null } : {}),
            ...(data.display_order !== undefined ? { display_order: data.display_order } : {}),
            ...(data.parent_id !== undefined ? { parent_id: data.parent_id || null } : {}),
            ...(data.is_active !== undefined ? { is_active: data.is_active } : {}),
            updated_at: new Date(),
        },
        include: { _count: { select: { products: true } } },
    });
};
exports.updateCategory = updateCategory;
const deleteCategory = async (categoryId) => {
    const existing = await database_1.default.categories.findUnique({
        where: { category_id: categoryId },
        include: {
            _count: { select: { products: true } },
            other_categories: { select: { category_id: true } },
        },
    });
    if (!existing)
        throw new Error('Category not found');
    if (existing.other_categories.length > 0) {
        throw new Error('Cannot delete category that has subcategories');
    }
    if (existing._count.products > 0) {
        return database_1.default.categories.update({
            where: { category_id: categoryId },
            data: { is_active: false, updated_at: new Date() },
            include: { _count: { select: { products: true } } },
        });
    }
    return database_1.default.categories.delete({
        where: { category_id: categoryId },
    });
};
exports.deleteCategory = deleteCategory;
