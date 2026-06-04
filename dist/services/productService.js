"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductDetails = exports.getProductBySlug = exports.getProductList = void 0;
const database_1 = __importDefault(require("../config/database"));
const slugify_1 = require("../utils/slugify");
const pricing_1 = require("../utils/pricing");
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80';
const syncProductImages = async (tx, productId, urls, altText) => {
    const cleaned = urls.map((u) => u.trim()).filter(Boolean);
    await tx.product_images.deleteMany({ where: { product_id: productId } });
    if (cleaned.length === 0)
        return;
    for (let i = 0; i < cleaned.length; i++) {
        await tx.product_images.create({
            data: {
                product_id: productId,
                image_url: cleaned[i],
                alt_text: altText,
                is_primary: i === 0,
                display_order: i,
            },
        });
    }
};
const resolveCategoryId = async (category_id, category_slug) => {
    if (category_id)
        return category_id;
    if (!category_slug)
        return undefined;
    const cat = await database_1.default.categories.findFirst({
        where: { slug: String(category_slug).trim(), is_active: true },
        select: { category_id: true },
    });
    return cat?.category_id;
};
const getProductList = async (filters) => {
    const { category_id, category_slug, brand_id, featured, best_seller, new_arrival, search, page = 1, limit = 20, admin, status, } = filters;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const where = {};
    if (admin === 'true') {
        if (status)
            where.status = status;
    }
    else {
        where.status = 'published';
    }
    const resolvedCategoryId = await resolveCategoryId(category_id, category_slug);
    if (resolvedCategoryId) {
        where.category_id = resolvedCategoryId;
    }
    else if (category_slug && !category_id) {
        return {
            products: [],
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: 0,
                totalPages: 0,
            },
        };
    }
    if (brand_id)
        where.brand_id = brand_id;
    if (featured === 'true')
        where.featured = true;
    if (best_seller === 'true')
        where.best_seller = true;
    if (new_arrival === 'true')
        where.new_arrival = true;
    if (search && String(search).trim()) {
        const term = String(search).trim();
        where.OR = [
            { name: { contains: term, mode: 'insensitive' } },
            { slug: { contains: term, mode: 'insensitive' } },
            { sku: { contains: term, mode: 'insensitive' } },
        ];
    }
    const [products, total] = await Promise.all([
        database_1.default.products.findMany({
            where,
            skip,
            take,
            include: {
                categories: {
                    select: {
                        category_id: true,
                        name: true,
                        slug: true,
                    },
                },
                brands: {
                    select: {
                        brand_id: true,
                        name: true,
                        slug: true,
                    },
                },
                product_images: {
                    where: { is_primary: true },
                    take: 1,
                },
                product_variants: {
                    where: { is_active: true },
                    select: {
                        variant_id: true,
                        name: true,
                        price: true,
                        compare_price: true,
                        stock_quantity: true,
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        }),
        database_1.default.products.count({ where }),
    ]);
    return {
        products,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)),
        },
    };
};
exports.getProductList = getProductList;
const getProductBySlug = async (slug) => {
    const product = await database_1.default.products.findUnique({
        where: { slug },
        select: { product_id: true },
    });
    if (!product) {
        throw new Error('Product not found');
    }
    return (0, exports.getProductDetails)(product.product_id);
};
exports.getProductBySlug = getProductBySlug;
const getProductDetails = async (id) => {
    const product = await database_1.default.products.findUnique({
        where: { product_id: id },
        include: {
            categories: {
                select: {
                    category_id: true,
                    name: true,
                    slug: true,
                },
            },
            brands: {
                select: {
                    brand_id: true,
                    name: true,
                    slug: true,
                    logo_url: true,
                },
            },
            product_images: {
                orderBy: { display_order: 'asc' },
            },
            product_variants: {
                where: { is_active: true },
            },
            product_reviews: {
                where: { is_approved: true },
                include: {
                    users: {
                        select: {
                            user_id: true,
                            full_name: true,
                            avatar_url: true,
                        },
                    },
                },
                orderBy: { created_at: 'desc' },
                take: 10,
            },
        },
    });
    if (!product) {
        throw new Error('Product not found');
    }
    // Increment view count
    await database_1.default.products.update({
        where: { product_id: id },
        data: { view_count: { increment: 1 } },
    });
    return product;
};
exports.getProductDetails = getProductDetails;
const ensureUniqueSlug = async (baseSlug) => {
    let slug = baseSlug;
    let counter = 1;
    while (await database_1.default.products.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter += 1;
    }
    return slug;
};
const createProduct = async (data, userId) => {
    const { name, sku, price } = data;
    if (!name?.trim())
        throw new Error('Product name is required');
    if (!sku?.trim())
        throw new Error('SKU is required');
    if (!Number.isFinite(Number(price)) || Number(price) < 0) {
        throw new Error('Price must be a valid non-negative number');
    }
    (0, pricing_1.assertValidSellingPrice)(Number(price), data.cost_price);
    const existingSku = await database_1.default.products.findUnique({ where: { sku: sku.trim() } });
    if (existingSku)
        throw new Error('SKU already exists');
    const baseSlug = (0, slugify_1.slugify)(name);
    const slug = await ensureUniqueSlug(baseSlug || `product-${Date.now()}`);
    const status = data.status || 'draft';
    const isPublished = status === 'published';
    const product = await database_1.default.$transaction(async (tx) => {
        const created = await tx.products.create({
            data: {
                name: name.trim(),
                slug,
                sku: sku.trim(),
                short_description: data.short_description?.trim() || null,
                description: data.description?.trim() || null,
                price,
                compare_price: data.compare_price ?? null,
                cost_price: data.cost_price ?? null,
                category_id: data.category_id || null,
                brand_id: data.brand_id || null,
                status,
                featured: data.featured ?? false,
                best_seller: data.best_seller ?? false,
                new_arrival: data.new_arrival ?? false,
                published_at: isPublished ? new Date() : null,
            },
        });
        const imageUrls = data.image_urls?.map((u) => u.trim()).filter(Boolean) ||
            (data.image_url?.trim() ? [data.image_url.trim()] : [DEFAULT_IMAGE]);
        await syncProductImages(tx, created.product_id, imageUrls, name.trim());
        const variantSku = `${sku.trim()}-STD`;
        await tx.product_variants.create({
            data: {
                product_id: created.product_id,
                sku: variantSku,
                name: 'Mặc định',
                price,
                compare_price: data.compare_price ?? null,
                cost_price: data.cost_price ?? null,
                stock_quantity: data.stock_quantity ?? 0,
                is_active: true,
            },
        });
        if ((data.stock_quantity ?? 0) > 0) {
            await tx.inventory_transactions.create({
                data: {
                    product_id: created.product_id,
                    transaction_type: 'stock_in',
                    quantity: data.stock_quantity,
                    notes: 'Tồn kho ban đầu khi tạo sản phẩm',
                    created_by: userId || null,
                },
            });
        }
        return created;
    });
    return (0, exports.getProductDetails)(product.product_id);
};
exports.createProduct = createProduct;
const updateProduct = async (productId, data) => {
    const existing = await database_1.default.products.findUnique({
        where: { product_id: productId },
        include: {
            product_variants: { where: { is_active: true }, orderBy: { created_at: 'asc' }, take: 1 },
            product_images: { orderBy: { display_order: 'asc' } },
        },
    });
    if (!existing)
        throw new Error('Product not found');
    if (data.sku?.trim() && data.sku.trim() !== existing.sku) {
        const duplicate = await database_1.default.products.findFirst({
            where: { sku: data.sku.trim(), product_id: { not: productId } },
        });
        if (duplicate)
            throw new Error('SKU already exists');
    }
    let slug = existing.slug;
    if (data.name?.trim() && data.name.trim() !== existing.name) {
        const baseSlug = (0, slugify_1.slugify)(data.name);
        let candidate = baseSlug;
        let counter = 1;
        while (await database_1.default.products.findFirst({
            where: { slug: candidate, product_id: { not: productId } },
        })) {
            candidate = `${baseSlug}-${counter}`;
            counter += 1;
        }
        slug = candidate;
    }
    const status = data.status ?? existing.status ?? 'draft';
    const isPublished = status === 'published';
    const nextPrice = data.price !== undefined ? Number(data.price) : Number(existing.price);
    const nextCost = data.cost_price !== undefined
        ? data.cost_price != null
            ? Number(data.cost_price)
            : 0
        : existing.cost_price != null
            ? Number(existing.cost_price)
            : 0;
    (0, pricing_1.assertValidSellingPrice)(nextPrice, nextCost);
    await database_1.default.$transaction(async (tx) => {
        await tx.products.update({
            where: { product_id: productId },
            data: {
                ...(data.name !== undefined ? { name: data.name.trim() } : {}),
                slug,
                ...(data.sku !== undefined ? { sku: data.sku.trim() } : {}),
                ...(data.short_description !== undefined
                    ? { short_description: data.short_description?.trim() || null }
                    : {}),
                ...(data.description !== undefined ? { description: data.description?.trim() || null } : {}),
                ...(data.price !== undefined ? { price: data.price } : {}),
                ...(data.compare_price !== undefined ? { compare_price: data.compare_price } : {}),
                ...(data.cost_price !== undefined ? { cost_price: data.cost_price } : {}),
                ...(data.category_id !== undefined ? { category_id: data.category_id || null } : {}),
                ...(data.brand_id !== undefined ? { brand_id: data.brand_id || null } : {}),
                ...(data.status !== undefined ? { status: data.status } : {}),
                ...(data.featured !== undefined ? { featured: data.featured } : {}),
                ...(data.best_seller !== undefined ? { best_seller: data.best_seller } : {}),
                ...(data.new_arrival !== undefined ? { new_arrival: data.new_arrival } : {}),
                ...(data.status !== undefined && isPublished && !existing.published_at
                    ? { published_at: new Date() }
                    : {}),
                updated_at: new Date(),
            },
        });
        const defaultVariant = existing.product_variants[0];
        if (defaultVariant) {
            await tx.product_variants.update({
                where: { variant_id: defaultVariant.variant_id },
                data: {
                    ...(data.price !== undefined ? { price: data.price } : {}),
                    ...(data.compare_price !== undefined ? { compare_price: data.compare_price } : {}),
                    ...(data.cost_price !== undefined ? { cost_price: data.cost_price } : {}),
                    ...(data.stock_quantity !== undefined ? { stock_quantity: data.stock_quantity } : {}),
                    ...(data.sku !== undefined ? { sku: `${data.sku.trim()}-STD` } : {}),
                },
            });
        }
        if (data.image_urls !== undefined) {
            const urls = data.image_urls.map((u) => u.trim()).filter(Boolean);
            if (urls.length > 0) {
                await syncProductImages(tx, productId, urls, data.name?.trim() || existing.name);
            }
        }
        else if (data.image_url?.trim()) {
            const existingUrls = existing.product_images.map((img) => img.image_url);
            const urls = existingUrls.length > 0 ? [...existingUrls] : [];
            if (urls.length > 0)
                urls[0] = data.image_url.trim();
            else
                urls.push(data.image_url.trim());
            await syncProductImages(tx, productId, urls, data.name?.trim() || existing.name);
        }
    });
    return (0, exports.getProductDetails)(productId);
};
exports.updateProduct = updateProduct;
const deleteProduct = async (productId) => {
    const existing = await database_1.default.products.findUnique({
        where: { product_id: productId },
        include: { _count: { select: { order_items: true } } },
    });
    if (!existing)
        throw new Error('Product not found');
    if (existing._count.order_items > 0) {
        await database_1.default.products.update({
            where: { product_id: productId },
            data: { status: 'archived', updated_at: new Date() },
        });
        return { success: true, deleted: false, archived: true };
    }
    await database_1.default.$transaction(async (tx) => {
        await tx.cart_items.deleteMany({ where: { product_id: productId } });
        await tx.product_images.deleteMany({ where: { product_id: productId } });
        await tx.product_variants.deleteMany({ where: { product_id: productId } });
        await tx.inventory_transactions.deleteMany({ where: { product_id: productId } });
        await tx.products.delete({ where: { product_id: productId } });
    });
    return { success: true, deleted: true, archived: false };
};
exports.deleteProduct = deleteProduct;
