import prisma from '../config/database';

const wishlistItemSelect = {
  wishlist_item_id: true,
  product_id: true,
  variant_id: true,
  created_at: true,
  products: {
    select: {
      product_id: true,
      name: true,
      slug: true,
      price: true,
      compare_price: true,
      status: true,
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
          stock_quantity: true,
        },
      },
    },
  },
  product_variants: {
    select: {
      variant_id: true,
      name: true,
      price: true,
      stock_quantity: true,
    },
  },
} as const;

const getOrCreateWishlist = async (userId: string) => {
  let wishlist = await prisma.wishlists.findUnique({ where: { user_id: userId } });
  if (!wishlist) {
    wishlist = await prisma.wishlists.create({ data: { user_id: userId } });
  }
  return wishlist;
};

export const getWishlist = async (userId: string) => {
  const wishlist = await getOrCreateWishlist(userId);
  const items = await prisma.wishlist_items.findMany({
    where: { wishlist_id: wishlist.wishlist_id },
    select: wishlistItemSelect,
    orderBy: { created_at: 'desc' },
  });

  return {
    wishlist_id: wishlist.wishlist_id,
    user_id: wishlist.user_id,
    items,
  };
};

export const addToWishlist = async (
  userId: string,
  productId: string,
  variantId?: string
) => {
  const product = await prisma.products.findUnique({ where: { product_id: productId } });
  if (!product) throw new Error('Product not found');

  const wishlist = await getOrCreateWishlist(userId);

  const existing = await prisma.wishlist_items.findFirst({
    where: {
      wishlist_id: wishlist.wishlist_id,
      product_id: productId,
      variant_id: variantId || null,
    },
  });
  if (existing) {
    return { message: 'Item already in wishlist' };
  }

  await prisma.wishlist_items.create({
    data: {
      wishlist_id: wishlist.wishlist_id,
      product_id: productId,
      variant_id: variantId || null,
    },
  });

  return getWishlist(userId);
};

export const removeFromWishlist = async (userId: string, productId: string) => {
  const wishlist = await prisma.wishlists.findUnique({ where: { user_id: userId } });
  if (!wishlist) throw new Error('Wishlist not found');

  await prisma.wishlist_items.deleteMany({
    where: { wishlist_id: wishlist.wishlist_id, product_id: productId },
  });

  return getWishlist(userId);
};
