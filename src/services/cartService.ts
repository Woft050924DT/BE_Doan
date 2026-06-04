import prisma from '../config/database';
import { assertSufficientStock, resolveVariantId } from '../utils/stock';

const cartInclude = {
  cart_items: {
    include: {
      products: {
        include: {
          product_images: {
            where: { is_primary: true as any },
            take: 1,
          },
        },
      },
      product_variants: true,
    },
  },
};

export const addToCart = async (userId: string, product_id: string, variant_id: string | null, quantity: number) => {
  if (!product_id || !quantity) {
    throw new Error('Product ID and quantity are required');
  }

  // Get product details
  const product = await prisma.products.findUnique({
    where: { product_id },
    include: { product_variants: true },
  });

  if (!product || product.status !== 'published') {
    throw new Error('Product not found');
  }

  const resolvedVariantId = await resolveVariantId(product_id, variant_id);
  await assertSufficientStock(product_id, resolvedVariantId, quantity);

  // Determine price
  let price = product.price;
  if (resolvedVariantId) {
    const variant = product.product_variants.find((v: any) => v.variant_id === resolvedVariantId);
    if (!variant) {
      throw new Error('Variant not found');
    }
    price = variant.price || product.price;
  }

  // Get or create cart
  let cart = await prisma.carts.findFirst({
    where: { user_id: userId },
  });

  if (!cart) {
    cart = await prisma.carts.create({
      data: { user_id: userId },
    });
  }

  // Check if item already exists in cart
  const existingItem = await prisma.cart_items.findFirst({
    where: {
      cart_id: cart.cart_id,
      product_id,
      variant_id: resolvedVariantId || null,
    },
  });

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    await assertSufficientStock(product_id, resolvedVariantId, newQuantity);

    await prisma.cart_items.update({
      where: { cart_item_id: existingItem.cart_item_id },
      data: { quantity: newQuantity, price, updated_at: new Date() },
    });
  } else {
    // Add new item
    await prisma.cart_items.create({
      data: {
        cart_id: cart.cart_id,
        product_id,
        variant_id: resolvedVariantId,
        quantity,
        price,
      },
    });
  }

  // Update cart timestamp
  await prisma.carts.update({
    where: { cart_id: cart.cart_id },
    data: { updated_at: new Date() },
  });

  // Get updated cart
  return prisma.cart_items.findUnique({
  where: { cart_item_id: cart.cart_id },
  include: {
    products: {
      include: {
        product_images: {
          where: { is_primary: true as any },
          take: 1,
        },
      },
    },
    product_variants: true,
  },
});
};

export const updateCartItem = async (userId: string, cartItemId: string, quantity: number) => {
  if (!quantity || quantity < 1) {
    throw new Error('Quantity must be at least 1');
  }

  const cart = await prisma.carts.findFirst({ where: { user_id: userId } });
  if (!cart) {
    throw new Error('Cart item not found');
  }

  const item = await prisma.cart_items.findFirst({
    where: { cart_item_id: cartItemId, cart_id: cart.cart_id },
    include: { products: true, product_variants: true },
  });

  if (!item || !item.product_id) {
    throw new Error('Cart item not found');
  }

  await assertSufficientStock(item.product_id, item.variant_id, quantity);

  const price =
    item.product_variants?.price || item.products?.price || item.price;

  await prisma.cart_items.update({
    where: { cart_item_id: cartItemId },
    data: { quantity, price, updated_at: new Date() },
  });

  await prisma.carts.update({
    where: { cart_id: cart.cart_id },
    data: { updated_at: new Date() },
  });

  return prisma.carts.findUnique({
    where: { cart_id: cart.cart_id },
    include: cartInclude,
  });
};

export const removeCartItem = async (userId: string, cartItemId: string) => {
  const cart = await prisma.carts.findFirst({ where: { user_id: userId } });
  if (!cart) {
    throw new Error('Cart item not found');
  }

  const item = await prisma.cart_items.findFirst({
    where: { cart_item_id: cartItemId, cart_id: cart.cart_id },
  });

  if (!item) {
    throw new Error('Cart item not found');
  }

  await prisma.cart_items.delete({ where: { cart_item_id: cartItemId } });
  await prisma.carts.update({
    where: { cart_id: cart.cart_id },
    data: { updated_at: new Date() },
  });

  return prisma.carts.findUnique({
    where: { cart_id: cart.cart_id },
    include: cartInclude,
  });
};

export const getCart = async (userId: string) => {
  const cart = await prisma.carts.findFirst({
    where: { user_id: userId },
    include: cartInclude,
  });

  if (!cart) {
    return { cart_id: null, cart_items: [] };
  }

  return cart;
};
