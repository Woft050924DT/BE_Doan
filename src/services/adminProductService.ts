import prisma from '../config/database';

const productSelect = {
  product_id: true,
  name: true,
  slug: true,
  sku: true,
  price: true,
  status: true,
  featured: true,
  best_seller: true,
  new_arrival: true,
  stock_quantity: true,
  view_count: true,
  created_at: true,
  updated_at: true,
  categories: { select: { category_id: true, name: true } },
  brands: { select: { brand_id: true, name: true } },
  product_images: { where: { is_primary: true }, take: 1 },
} as const;

export const createProduct = async (data: any, userId: string) => {
  return prisma.products.create({
    data: {
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      sku: data.sku,
      short_description: data.short_description,
      description: data.description,
      price: data.price,
      compare_price: data.compare_price,
      cost_price: data.cost_price,
      category_id: data.category_id,
      brand_id: data.brand_id,
      status: data.status || 'draft',
      featured: data.featured || false,
      best_seller: data.best_seller || false,
      new_arrival: data.new_arrival || false,
      weight: data.weight,
      dimensions: data.dimensions,
      meta_title: data.meta_title,
      meta_description: data.meta_description,
      meta_keywords: data.meta_keywords,
      published_at: data.published_at ? new Date(data.published_at) : null,
    },
    select: productSelect,
  });
};

export const updateProduct = async (productId: string, data: any) => {
  const product = await prisma.products.findUnique({ where: { product_id: productId } });
  if (!product) throw new Error('Product not found');

  return prisma.products.update({
    where: { product_id: productId },
    data: {
      name: data.name,
      slug: data.slug,
      sku: data.sku,
      short_description: data.short_description,
      description: data.description,
      price: data.price,
      compare_price: data.compare_price,
      cost_price: data.cost_price,
      category_id: data.category_id,
      brand_id: data.brand_id,
      status: data.status,
      featured: data.featured,
      best_seller: data.best_seller,
      new_arrival: data.new_arrival,
      weight: data.weight,
      dimensions: data.dimensions,
      meta_title: data.meta_title,
      meta_description: data.meta_description,
      meta_keywords: data.meta_keywords,
      published_at: data.published_at ? new Date(data.published_at) : undefined,
    },
    select: productSelect,
  });
};

export const deleteProduct = async (productId: string) => {
  const product = await prisma.products.findUnique({ where: { product_id: productId } });
  if (!product) throw new Error('Product not found');

  await prisma.products.delete({ where: { product_id: productId } });
  return { message: 'Product deleted successfully' };
};

export const uploadProductImage = async (productId: string, imageUrl: string, altText?: string, displayOrder?: number) => {
  const product = await prisma.products.findUnique({ where: { product_id: productId } });
  if (!product) throw new Error('Product not found');

  return prisma.product_images.create({
    data: {
      product_id: productId,
      image_url: imageUrl,
      alt_text: altText,
      display_order: displayOrder,
    },
  });
};

export const deleteProductImage = async (productId: string, imageId: string) => {
  await prisma.product_images.deleteMany({
    where: { image_id: imageId, product_id: productId },
  });
  return { message: 'Image deleted successfully' };
};

export const createVariant = async (productId: string, data: any) => {
  const product = await prisma.products.findUnique({ where: { product_id: productId } });
  if (!product) throw new Error('Product not found');

  return prisma.product_variants.create({
    data: {
      product_id: productId,
      sku: data.sku,
      name: data.name,
      option1_name: data.option1_name,
      option1_value: data.option1_value,
      option2_name: data.option2_name,
      option2_value: data.option2_value,
      option3_name: data.option3_name,
      option3_value: data.option3_value,
      price: data.price,
      compare_price: data.compare_price,
      cost_price: data.cost_price,
      stock_quantity: data.stock_quantity || 0,
      image_url: data.image_url,
    },
  });
};

export const updateVariant = async (productId: string, variantId: string, data: any) => {
  return prisma.product_variants.update({
    where: { variant_id: variantId },
    data: {
      sku: data.sku,
      name: data.name,
      option1_name: data.option1_name,
      option1_value: data.option1_value,
      option2_name: data.option2_name,
      option2_value: data.option2_value,
      option3_name: data.option3_name,
      option3_value: data.option3_value,
      price: data.price,
      compare_price: data.compare_price,
      cost_price: data.cost_price,
      stock_quantity: data.stock_quantity,
      image_url: data.image_url,
      is_active: data.is_active,
    },
  });
};
