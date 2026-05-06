import prisma from '../config/database';

export const placeOrder = async (userId: string, orderData: any) => {
  const {
    customer_name,
    customer_email,
    customer_phone,
    shipping_address_line1,
    shipping_address_line2,
    shipping_city,
    shipping_district,
    shipping_ward,
    shipping_postal_code,
    shipping_country,
    billing_address_line1,
    billing_address_line2,
    billing_city,
    billing_district,
    billing_ward,
    billing_postal_code,
    billing_country,
    payment_method,
    shipping_method,
    coupon_code,
    notes,
  } = orderData;

  if (!customer_name || !customer_email || !shipping_address_line1 || !shipping_city) {
    throw new Error('Required fields are missing');
  }

  // Get user's cart
  const cart = await prisma.carts.findFirst({
    where: { user_id: userId },
    include: {
      cart_items: {
        include: {
          products: true,
          product_variants: true,
        },
      },
    },
  });

  if (!cart || cart.cart_items.length === 0) {
    throw new Error('Cart is empty');
  }

  // Calculate totals
  let subtotal = 0;
  const orderItemsData = cart.cart_items.map((item: any) => {
    const productPrice = item.product_variants?.price || item.products.price;
    const totalPrice = Number(productPrice) * item.quantity;
    subtotal += totalPrice;

    return {
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_name: item.products.name,
      variant_name: item.product_variants?.name,
      sku: item.product_variants?.sku || item.products.sku,
      quantity: item.quantity,
      unit_price: productPrice,
      total_price: totalPrice,
    };
  });

  // Calculate shipping fee (simplified logic)
  const shipping_fee = 30000; // Fixed shipping fee

  // Calculate discount if coupon provided
  let discount_amount = 0;
  if (coupon_code) {
    const coupon = await prisma.coupons.findUnique({
      where: { code: coupon_code },
    });

    if (coupon && coupon.is_active) {
      const now = new Date();
      if (now >= coupon.valid_from && now <= coupon.valid_to) {
        if (coupon.discount_type === 'percentage') {
          discount_amount = subtotal * (Number(coupon.discount_value) / 100);
        } else {
          discount_amount = Number(coupon.discount_value);
        }

        // Apply max discount limit
        if (coupon.max_discount_amount && discount_amount > Number(coupon.max_discount_amount)) {
          discount_amount = Number(coupon.max_discount_amount);
        }
      }
    }
  }

  const total_amount = subtotal + shipping_fee - discount_amount;

  // Generate order number
  const order_number = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Create order
  const order = await prisma.orders.create({
    data: {
      order_number,
      user_id: userId,
      customer_name,
      customer_email,
      customer_phone,
      shipping_address_line1,
      shipping_address_line2,
      shipping_city,
      shipping_district,
      shipping_ward,
      shipping_postal_code,
      shipping_country: shipping_country || 'Vietnam',
      billing_address_line1: billing_address_line1 || shipping_address_line1,
      billing_address_line2: billing_address_line2 || shipping_address_line2,
      billing_city: billing_city || shipping_city,
      billing_district: billing_district || shipping_district,
      billing_ward: billing_ward || shipping_ward,
      billing_postal_code: billing_postal_code || shipping_postal_code,
      billing_country: billing_country || shipping_country || 'Vietnam',
      subtotal,
      shipping_fee,
      discount_amount,
      total_amount,
      coupon_code,
      payment_method,
      shipping_method,
      notes,
      order_items: {
        create: orderItemsData,
      },
      order_status_history: {
        create: {
          status: 'pending',
          notes: 'Order placed',
        },
      },
    },
    include: {
      order_items: true,
    },
  });

  // Record coupon usage if applicable
  if (coupon_code && discount_amount > 0) {
    await prisma.coupon_usage.create({
      data: {
        coupon_id: (await prisma.coupons.findUnique({ where: { code: coupon_code } }))?.coupon_id,
        user_id: userId,
        order_id: order.order_id,
      },
    });
  }

  // Update inventory
  for (const item of cart.cart_items) {
    const quantityChange = -item.quantity;
    
    if (item.variant_id) {
      await prisma.product_variants.update({
        where: { variant_id: item.variant_id },
        data: { stock_quantity: { increment: quantityChange } },
      });
    }

    await prisma.inventory_transactions.create({
      data: {
        product_id: item.product_id,
        variant_id: item.variant_id,
        transaction_type: 'sale',
        quantity: item.quantity,
        reference_id: order.order_id,
        notes: `Order ${order.order_number}`,
        created_by: userId,
      },
    });
  }

  // Clear cart
  await prisma.cart_items.deleteMany({
    where: { cart_id: cart.cart_id },
  });

  return order;
};

export const getOrders = async (userId: string, page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  const take = limit;

  const [orders, total] = await Promise.all([
    prisma.orders.findMany({
      where: { user_id: userId },
      skip,
      take,
      include: {
        order_items: true,
      },
      orderBy: { created_at: 'desc' },
    }),
    prisma.orders.count({ where: { user_id: userId } }),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
