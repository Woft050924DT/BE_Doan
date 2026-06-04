import prisma from '../config/database';
import { assertValidSellingPrice } from '../utils/pricing';
import { slugify } from '../utils/slugify';

export const LOW_STOCK_THRESHOLD = 10;

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80';

const ensureUniqueSlug = async (
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  baseSlug: string
): Promise<string> => {
  let slug = baseSlug;
  let counter = 1;
  while (await tx.products.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
  return slug;
};

export type ReceiveNewProductInput = {
  name: string;
  sku: string;
  /** Không gửi thì mặc định = giá nhập; cập nhật giá bán sau tại Sản phẩm */
  price?: number;
  compare_price?: number;
  category_id?: string;
  brand_id?: string;
  short_description?: string;
  image_urls?: string[];
  status?: string;
};

export const getInventorySummary = async () => {
  const variants = await prisma.product_variants.findMany({
    where: { is_active: true },
    select: { stock_quantity: true },
  });

  const totalSkus = variants.length;
  const totalStock = variants.reduce((sum, v) => sum + (v.stock_quantity ?? 0), 0);
  const outOfStock = variants.filter((v) => (v.stock_quantity ?? 0) <= 0).length;
  const lowStock = variants.filter((v) => {
    const q = v.stock_quantity ?? 0;
    return q > 0 && q <= LOW_STOCK_THRESHOLD;
  }).length;

  return {
    totalSkus,
    totalStock,
    outOfStock,
    lowStock,
    lowStockThreshold: LOW_STOCK_THRESHOLD,
  };
};

const buildVariantWhere = (filters: Record<string, unknown>) => {
  const { search, status } = filters;
  const where: Record<string, unknown> = { is_active: true };

  if (search && String(search).trim()) {
    const term = String(search).trim();
    where.OR = [
      { sku: { contains: term, mode: 'insensitive' } },
      { name: { contains: term, mode: 'insensitive' } },
      { products: { name: { contains: term, mode: 'insensitive' } } },
      { products: { sku: { contains: term, mode: 'insensitive' } } },
    ];
  }

  if (status === 'out') {
    where.stock_quantity = { lte: 0 };
  } else if (status === 'low') {
    where.stock_quantity = { gt: 0, lte: LOW_STOCK_THRESHOLD };
  } else if (status === 'in_stock') {
    where.stock_quantity = { gt: LOW_STOCK_THRESHOLD };
  }

  return where;
};

export const getInventoryList = async (filters: Record<string, unknown>) => {
  const { page = 1, limit = 20 } = filters;
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);
  const where = buildVariantWhere(filters);

  const [items, total] = await Promise.all([
    prisma.product_variants.findMany({
      where,
      skip,
      take,
      include: {
        products: {
          select: {
            product_id: true,
            name: true,
            sku: true,
            status: true,
            price: true,
            cost_price: true,
            product_images: {
              where: { is_primary: true },
              take: 1,
              select: { image_url: true },
            },
            brands: { select: { name: true } },
            categories: { select: { name: true } },
          },
        },
      },
      orderBy: [{ stock_quantity: 'asc' }, { updated_at: 'desc' }],
    }),
    prisma.product_variants.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)) || 1,
    },
  };
};

export const getInventoryTransactions = async (filters: Record<string, unknown>) => {
  const { page = 1, limit = 20, variant_id } = filters;
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: Record<string, unknown> = {};
  if (variant_id) where.variant_id = variant_id;

  const [transactions, total] = await Promise.all([
    prisma.inventory_transactions.findMany({
      where,
      skip,
      take,
      include: {
        product_variants: {
          select: {
            variant_id: true,
            name: true,
            sku: true,
            stock_quantity: true,
          },
        },
        products: {
          select: {
            product_id: true,
            name: true,
            sku: true,
          },
        },
        users: {
          select: {
            user_id: true,
            full_name: true,
            email: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    }),
    prisma.inventory_transactions.count({ where }),
  ]);

  return {
    transactions,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)) || 1,
    },
  };
};

type AdjustType = 'in' | 'out' | 'set';

export const adjustStock = async (
  userId: string,
  data: { variant_id: string; type: AdjustType; quantity: number; notes?: string }
) => {
  const { variant_id, type, quantity, notes } = data;

  if (!variant_id || !type) {
    throw new Error('variant_id and type are required');
  }

  if (type !== 'set' && (!Number.isFinite(quantity) || quantity <= 0)) {
    throw new Error('Quantity must be a positive number');
  }

  if (type === 'set' && (!Number.isFinite(quantity) || quantity < 0)) {
    throw new Error('Stock quantity cannot be negative');
  }

  return prisma.$transaction(async (tx) => {
    const variant = await tx.product_variants.findUnique({
      where: { variant_id },
      include: {
        products: { select: { product_id: true, name: true } },
      },
    });

    if (!variant) {
      throw new Error('Variant not found');
    }

    const current = variant.stock_quantity ?? 0;
    let newStock: number;
    let transactionType: string;
    let txnQuantity: number;

    if (type === 'in') {
      newStock = current + quantity;
      transactionType = 'stock_in';
      txnQuantity = quantity;
    } else if (type === 'out') {
      if (quantity > current) {
        throw new Error('Insufficient stock');
      }
      newStock = current - quantity;
      transactionType = 'stock_out';
      txnQuantity = quantity;
    } else {
      newStock = quantity;
      transactionType = 'adjustment';
      txnQuantity = Math.abs(newStock - current);
    }

    const updatedVariant = await tx.product_variants.update({
      where: { variant_id },
      data: {
        stock_quantity: newStock,
        updated_at: new Date(),
      },
    });

    const transaction =
      txnQuantity > 0
        ? await tx.inventory_transactions.create({
            data: {
              product_id: variant.product_id,
              variant_id,
              transaction_type: transactionType,
              quantity: txnQuantity,
              notes: notes?.trim() || null,
              created_by: userId,
            },
          })
        : null;

    return {
      variant: updatedVariant,
      previousStock: current,
      newStock,
      transaction,
    };
  });
};

/** Nhập hàng: tăng tồn + cập nhật giá nhập (cost), hoặc tạo sản phẩm mới */
export const receiveStock = async (
  userId: string,
  data: {
    variant_id?: string;
    quantity: number;
    unit_cost: number;
    notes?: string;
    product?: ReceiveNewProductInput;
  }
) => {
  const { variant_id, quantity, unit_cost, notes, product } = data;

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error('Quantity must be a positive number');
  }
  if (!Number.isFinite(unit_cost) || unit_cost <= 0) {
    throw new Error('Giá nhập phải lớn hơn 0');
  }

  if (product) {
    return receiveNewProductStock(userId, { product, quantity, unit_cost, notes });
  }

  if (!variant_id) {
    throw new Error('Chọn sản phẩm có sẵn hoặc nhập thông tin hàng mới');
  }

  return prisma.$transaction(async (tx) => {
    const variant = await tx.product_variants.findUnique({
      where: { variant_id },
      include: {
        products: {
      select: {
        product_id: true,
        name: true,
        price: true,
        cost_price: true,
        status: true,
        published_at: true,
      },
    },
      },
    });

    if (!variant?.products) {
      throw new Error('Variant not found');
    }

    const product = variant.products;
    const sellPrice = Number(product.price);
    if (sellPrice > 0) {
      assertValidSellingPrice(sellPrice, unit_cost);
    }

    const current = variant.stock_quantity ?? 0;
    const newStock = current + quantity;

    await tx.product_variants.update({
      where: { variant_id },
      data: {
        stock_quantity: newStock,
        cost_price: unit_cost,
        updated_at: new Date(),
      },
    });

    await tx.products.update({
      where: { product_id: product.product_id },
      data: {
        cost_price: unit_cost,

    // tự động mở bán khi nhập kho
    ...(product.status === 'draft'
      ? {
          status: 'published',
          published_at: product.published_at || new Date(),
        }
      : {}),

    updated_at: new Date(),
      },
    });

    const noteText = [
      `Nhập hàng: +${quantity} | Giá nhập: ${unit_cost.toLocaleString('vi-VN')}đ`,
      notes?.trim(),
    ]
      .filter(Boolean)
      .join(' — ');

    const transaction = await tx.inventory_transactions.create({
      data: {
        product_id: variant.product_id,
        variant_id,
        transaction_type: 'stock_in',
        quantity,
        notes: noteText,
        created_by: userId,
      },
    });

    return {
      variant_id,
      previousStock: current,
      newStock,
      unit_cost,
      transaction,
    };
  });
};

const receiveNewProductStock = async (
  userId: string,
  data: {
    product: ReceiveNewProductInput;
    quantity: number;
    unit_cost: number;
    notes?: string;
  }
) => {
  const { product, quantity, unit_cost, notes } = data;
  const { name, sku } = product;

  if (!name?.trim()) throw new Error('Product name is required');
  if (!sku?.trim()) throw new Error('SKU is required');

  const sellPrice =
    product.price != null && Number.isFinite(Number(product.price)) && Number(product.price) > 0
      ? Number(product.price)
      : unit_cost;

  assertValidSellingPrice(sellPrice, unit_cost);

  const existingSku = await prisma.products.findUnique({ where: { sku: sku.trim() } });
  if (existingSku) throw new Error('SKU already exists');

  const variantSku = `${sku.trim()}-STD`;
  const existingVariantSku = await prisma.product_variants.findUnique({
    where: { sku: variantSku },
  });
  if (existingVariantSku) throw new Error('SKU already exists');

  const status = product.status || 'published';
  const isPublished = status === 'published';

  return prisma.$transaction(async (tx) => {
    const baseSlug = slugify(name);
    const slug = await ensureUniqueSlug(tx, baseSlug || `product-${Date.now()}`);

    const created = await tx.products.create({
      data: {
        name: name.trim(),
        slug,
        sku: sku.trim(),
        short_description: product.short_description?.trim() || null,
        price: sellPrice,
        compare_price: product.compare_price ?? null,
        cost_price: unit_cost,
        category_id: product.category_id || null,
        brand_id: product.brand_id || null,
        status,
        published_at: isPublished ? new Date() : null,
      },
    });

    const imageUrls =
      product.image_urls?.map((u) => u.trim()).filter(Boolean) || [DEFAULT_IMAGE];
    for (let i = 0; i < imageUrls.length; i++) {
      await tx.product_images.create({
        data: {
          product_id: created.product_id,
          image_url: imageUrls[i],
          alt_text: name.trim(),
          is_primary: i === 0,
          display_order: i,
        },
      });
    }

    const variant = await tx.product_variants.create({
      data: {
        product_id: created.product_id,
        sku: variantSku,
        name: 'Mặc định',
        price: sellPrice,
        compare_price: product.compare_price ?? null,
        cost_price: unit_cost,
        stock_quantity: quantity,
        is_active: true,
      },
    });

    const noteText = [
      `Nhập hàng mới: +${quantity} | Giá nhập: ${unit_cost.toLocaleString('vi-VN')}đ`,
      notes?.trim(),
    ]
      .filter(Boolean)
      .join(' — ');

    const transaction = await tx.inventory_transactions.create({
      data: {
        product_id: created.product_id,
        variant_id: variant.variant_id,
        transaction_type: 'stock_in',
        quantity,
        notes: noteText,
        created_by: userId,
      },
    });

    return {
      product_id: created.product_id,
      variant_id: variant.variant_id,
      product_name: created.name,
      sku: created.sku,
      previousStock: 0,
      newStock: quantity,
      unit_cost,
      transaction,
      isNewProduct: true,
    };
  });
};
