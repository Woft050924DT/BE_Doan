"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBrand = exports.updateBrand = exports.createBrand = exports.getBrands = void 0;
const database_1 = __importDefault(require("../config/database"));
const slugify_1 = require("../utils/slugify");
const ensureUniqueBrandSlug = async (baseSlug, excludeId) => {
    let slug = baseSlug;
    let counter = 1;
    while (true) {
        const existing = await database_1.default.brands.findFirst({
            where: {
                slug,
                ...(excludeId ? { brand_id: { not: excludeId } } : {}),
            },
        });
        if (!existing)
            return slug;
        slug = `${baseSlug}-${counter}`;
        counter += 1;
    }
};
const getBrands = async (admin = false) => {
    return database_1.default.brands.findMany({
        where: admin ? {} : { is_active: true },
        orderBy: { name: 'asc' },
        include: {
            _count: { select: { products: true } },
        },
    });
};
exports.getBrands = getBrands;
const createBrand = async (data) => {
    if (!data.name?.trim())
        throw new Error('Brand name is required');
    const baseSlug = (0, slugify_1.slugify)(data.slug || data.name);
    const slug = await ensureUniqueBrandSlug(baseSlug || `brand-${Date.now()}`);
    const existingName = await database_1.default.brands.findFirst({
        where: { name: { equals: data.name.trim(), mode: 'insensitive' } },
    });
    if (existingName)
        throw new Error('Brand name already exists');
    return database_1.default.brands.create({
        data: {
            name: data.name.trim(),
            slug,
            logo_url: data.logo_url?.trim() || null,
            description: data.description?.trim() || null,
            website: data.website?.trim() || null,
            is_active: data.is_active ?? true,
        },
        include: { _count: { select: { products: true } } },
    });
};
exports.createBrand = createBrand;
const updateBrand = async (brandId, data) => {
    const existing = await database_1.default.brands.findUnique({ where: { brand_id: brandId } });
    if (!existing)
        throw new Error('Brand not found');
    let slug = existing.slug;
    if (data.slug?.trim()) {
        slug = await ensureUniqueBrandSlug((0, slugify_1.slugify)(data.slug), brandId);
    }
    else if (data.name?.trim() && data.name.trim() !== existing.name) {
        slug = await ensureUniqueBrandSlug((0, slugify_1.slugify)(data.name), brandId);
    }
    if (data.name?.trim()) {
        const duplicate = await database_1.default.brands.findFirst({
            where: {
                name: { equals: data.name.trim(), mode: 'insensitive' },
                brand_id: { not: brandId },
            },
        });
        if (duplicate)
            throw new Error('Brand name already exists');
    }
    return database_1.default.brands.update({
        where: { brand_id: brandId },
        data: {
            ...(data.name !== undefined ? { name: data.name.trim() } : {}),
            slug,
            ...(data.logo_url !== undefined ? { logo_url: data.logo_url?.trim() || null } : {}),
            ...(data.description !== undefined ? { description: data.description?.trim() || null } : {}),
            ...(data.website !== undefined ? { website: data.website?.trim() || null } : {}),
            ...(data.is_active !== undefined ? { is_active: data.is_active } : {}),
            updated_at: new Date(),
        },
        include: { _count: { select: { products: true } } },
    });
};
exports.updateBrand = updateBrand;
const deleteBrand = async (brandId) => {
    const existing = await database_1.default.brands.findUnique({
        where: { brand_id: brandId },
        include: { _count: { select: { products: true } } },
    });
    if (!existing)
        throw new Error('Brand not found');
    if (existing._count.products > 0) {
        return database_1.default.brands.update({
            where: { brand_id: brandId },
            data: { is_active: false, updated_at: new Date() },
            include: { _count: { select: { products: true } } },
        });
    }
    return database_1.default.brands.delete({
        where: { brand_id: brandId },
    });
};
exports.deleteBrand = deleteBrand;
