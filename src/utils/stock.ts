import prisma from '../config/database';

export const getAvailableStock = async (
  productId: string,
  variantId: string | null
): Promise<number> => {
  if (variantId) {
    const variant = await prisma.product_variants.findFirst({
      where: { variant_id: variantId, product_id: productId, is_active: true },
    });
    return variant?.stock_quantity ?? 0;
  }

  const variantCount = await prisma.product_variants.count({
    where: { product_id: productId, is_active: true },
  });

  if (variantCount === 0) {
    return Number.MAX_SAFE_INTEGER;
  }

  const variants = await prisma.product_variants.findMany({
    where: { product_id: productId, is_active: true },
    select: { stock_quantity: true },
  });

  return variants.reduce((sum, v) => sum + (v.stock_quantity ?? 0), 0);
};

/** Chọn biến thể mặc định (biến thể active đầu tiên) khi client không gửi variant_id */
export const resolveVariantId = async (
  productId: string,
  variantId?: string | null
): Promise<string | null> => {
  if (variantId) return variantId;

  const first = await prisma.product_variants.findFirst({
    where: { product_id: productId, is_active: true },
    orderBy: { created_at: 'asc' },
    select: { variant_id: true },
  });

  return first?.variant_id ?? null;
};

export const assertVariantRequired = async (productId: string, variantId: string | null) => {
  const variantCount = await prisma.product_variants.count({
    where: { product_id: productId, is_active: true },
  });

  if (variantCount > 0 && !variantId) {
    throw new Error('Variant is required for this product');
  }
};

export const assertSufficientStock = async (
  productId: string,
  variantId: string | null,
  quantity: number
) => {
  await assertVariantRequired(productId, variantId);
  const available = await getAvailableStock(productId, variantId);

  if (quantity > available) {
    throw new Error('Insufficient stock');
  }
};
