import prisma from '../config/database';

export const addToCart = async (userId: string, product_id: string, variant_id: string | null, quantity: number) => {
  if (!product_id || !quantity) {
    throw new Error('Product ID and quantity are required');
  }

  // Get product details
  const product = await prisma.products.findUnique({
    where: { product_id },
    include: { product_variants: true },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // Determine price
  let price = product.price;
  if (variant_id) {
    const variant = product.product_variants.find((v: any) => v.variant_id === variant_id);
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
      variant_id: variant_id || null,
    },
  });

  if (existingItem) {
    // Update quantity
    await prisma.cart_items.update({
      where: { cart_item_id: existingItem.cart_item_id },
      data: { quantity: existingItem.quantity + quantity },
    });
  } else {
    // Add new item
    await prisma.cart_items.create({
      data: {
        cart_id: cart.cart_id,
        product_id,
        variant_id,
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
  const updatedCart = await prisma.carts.findUnique({
    where: { cart_id: cart.cart_id },
    include: {
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
    },
  });

  return updatedCart;
};

export const getCart = async (userId: string) => {
  const cart = await prisma.carts.findFirst({
    where: { user_id: userId },
    include: {
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
    },
  });

  if (!cart) {
    return { cart_id: null, cart_items: [] };
  }

  return cart;
};
