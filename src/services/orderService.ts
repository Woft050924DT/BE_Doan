import prisma from '../config/database';

const SHIPPING_METHODS = [
  { id: 'standard', name: 'Standard', fee: 30000, estimated_days: '3-5' },
  { id: 'express', name: 'Express', fee: 50000, estimated_days: '1-2' },
];

const PAYMENT_METHODS = [
  { id: 'cod', name: 'Cash on Delivery' },
  { id: 'bank_transfer', name: 'Bank Transfer' },
  { id: 'momo', name: 'MoMo' },
  { id: 'vnpay', name: 'VNPay' },
];

const getValue = (source: any, ...keys: string[]) => {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null && source?.[key] !== '') {
      return source[key];
    }
  }

  return undefined;
};

const toPositiveInteger = (value: any, fallback?: number) => {
  const parsed = Number(value ?? fallback);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const normalizeOrderData = (orderData: any) => {
  const shipping = orderData.shipping || orderData.shipping_address || orderData.shippingAddress || {};
  const billing = orderData.billing || orderData.billing_address || orderData.billingAddress || {};
  const address = orderData.address || {};

  const shipping_address_line1 = getValue(
    orderData,
    'shipping_address_line1',
    'shippingAddressLine1',
    'address_line1',
    'addressLine1',
  ) || getValue(shipping, 'address_line1', 'addressLine1', 'line1', 'address') || getValue(address, 'address_line1', 'addressLine1', 'line1', 'address');

  const shipping_city = getValue(orderData, 'shipping_city', 'shippingCity', 'city') || getValue(shipping, 'city') || getValue(address, 'city');

  return {
    customer_name: getValue(orderData, 'customer_name', 'customerName', 'full_name', 'fullName', 'name') || getValue(shipping, 'full_name', 'fullName', 'name') || getValue(address, 'full_name', 'fullName', 'name'),
    customer_email: getValue(orderData, 'customer_email', 'customerEmail', 'email'),
    customer_phone: getValue(orderData, 'customer_phone', 'customerPhone', 'phone') || getValue(shipping, 'phone') || getValue(address, 'phone'),
    shipping_address_line1,
    shipping_address_line2: getValue(orderData, 'shipping_address_line2', 'shippingAddressLine2', 'address_line2', 'addressLine2') || getValue(shipping, 'address_line2', 'addressLine2', 'line2') || getValue(address, 'address_line2', 'addressLine2', 'line2'),
    shipping_city,
    shipping_district: getValue(orderData, 'shipping_district', 'shippingDistrict', 'district') || getValue(shipping, 'district') || getValue(address, 'district'),
    shipping_ward: getValue(orderData, 'shipping_ward', 'shippingWard', 'ward') || getValue(shipping, 'ward') || getValue(address, 'ward'),
    shipping_postal_code: getValue(orderData, 'shipping_postal_code', 'shippingPostalCode', 'postal_code', 'postalCode') || getValue(shipping, 'postal_code', 'postalCode') || getValue(address, 'postal_code', 'postalCode'),
    shipping_country: getValue(orderData, 'shipping_country', 'shippingCountry', 'country') || getValue(shipping, 'country') || getValue(address, 'country') || 'Vietnam',
    billing_address_line1: getValue(orderData, 'billing_address_line1', 'billingAddressLine1') || getValue(billing, 'address_line1', 'addressLine1', 'line1', 'address'),
    billing_address_line2: getValue(orderData, 'billing_address_line2', 'billingAddressLine2') || getValue(billing, 'address_line2', 'addressLine2', 'line2'),
    billing_city: getValue(orderData, 'billing_city', 'billingCity') || getValue(billing, 'city'),
    billing_district: getValue(orderData, 'billing_district', 'billingDistrict') || getValue(billing, 'district'),
    billing_ward: getValue(orderData, 'billing_ward', 'billingWard') || getValue(billing, 'ward'),
    billing_postal_code: getValue(orderData, 'billing_postal_code', 'billingPostalCode') || getValue(billing, 'postal_code', 'postalCode'),
    billing_country: getValue(orderData, 'billing_country', 'billingCountry') || getValue(billing, 'country'),
    payment_method: getValue(orderData, 'payment_method', 'paymentMethod') || 'cod',
    shipping_method: getValue(orderData, 'shipping_method', 'shippingMethod') || 'standard',
    coupon_code: getValue(orderData, 'coupon_code', 'couponCode'),
    notes: getValue(orderData, 'notes', 'note'),
  };
};

const getShippingFee = (shippingMethod: string) => {
  return SHIPPING_METHODS.find((method) => method.id === shippingMethod)?.fee ?? SHIPPING_METHODS[0].fee;
};

const buildOrderItemsFromCart = async (userId: string) => {
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

  return { cart, sourceItems: cart.cart_items };
};

const buildOrderItemsFromRequest = async (orderData: any) => {
  const rawItems = orderData.items || orderData.order_items || orderData.orderItems;
  const directItem = getValue(orderData, 'product_id', 'productId')
    ? [{
      product_id: getValue(orderData, 'product_id', 'productId'),
      variant_id: getValue(orderData, 'variant_id', 'variantId'),
      quantity: orderData.quantity ?? 1,
    }]
    : [];
  const items = Array.isArray(rawItems) && rawItems.length > 0 ? rawItems : directItem;

  if (items.length === 0) {
    throw new Error('Order items are required');
  }

  const sourceItems = [];

  for (const item of items) {
    const product_id = getValue(item, 'product_id', 'productId');
    const variant_id = getValue(item, 'variant_id', 'variantId') || null;
    const quantity = toPositiveInteger(item.quantity, 1);

    if (!product_id || quantity === null) {
      throw new Error('Product ID and quantity are required');
    }

    const product = await prisma.products.findUnique({
      where: { product_id },
      include: { product_variants: true },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const variant = variant_id ? product.product_variants.find((current: any) => current.variant_id === variant_id) : null;
    if (variant_id && !variant) {
      throw new Error('Variant not found');
    }

    sourceItems.push({
      product_id,
      variant_id,
      quantity,
      products: product,
      product_variants: variant,
    });
  }

  return { cart: null, sourceItems };
};

const placeOrderFromItems = async (userId: string, orderData: any, sourceItems: any[], cart?: any) => {
  const normalized = normalizeOrderData(orderData);

  if (!normalized.customer_name || !normalized.customer_email || !normalized.shipping_address_line1 || !normalized.shipping_city) {
    throw new Error('Required fields are missing');
  }

  let subtotal = 0;
  const orderItemsData = sourceItems.map((item: any) => {
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

  const shipping_fee = getShippingFee(normalized.shipping_method);
  let discount_amount = 0;
  let coupon: any = null;

  if (normalized.coupon_code) {
    coupon = await prisma.coupons.findUnique({
      where: { code: normalized.coupon_code },
    });

    if (coupon && coupon.is_active) {
      const now = new Date();
      const meetsMinimum = !coupon.min_purchase_amount || subtotal >= Number(coupon.min_purchase_amount);

      if (meetsMinimum && now >= coupon.valid_from && now <= coupon.valid_to) {
        if (coupon.discount_type === 'percentage') {
          discount_amount = subtotal * (Number(coupon.discount_value) / 100);
        } else {
          discount_amount = Number(coupon.discount_value);
        }

        if (coupon.max_discount_amount && discount_amount > Number(coupon.max_discount_amount)) {
          discount_amount = Number(coupon.max_discount_amount);
        }
      }
    }
  }

  const total_amount = subtotal + shipping_fee - discount_amount;
  const order_number = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  return prisma.$transaction(async (tx: any) => {
    const order = await tx.orders.create({
      data: {
        order_number,
        user_id: userId,
        customer_name: normalized.customer_name,
        customer_email: normalized.customer_email,
        customer_phone: normalized.customer_phone,
        shipping_address_line1: normalized.shipping_address_line1,
        shipping_address_line2: normalized.shipping_address_line2,
        shipping_city: normalized.shipping_city,
        shipping_district: normalized.shipping_district,
        shipping_ward: normalized.shipping_ward,
        shipping_postal_code: normalized.shipping_postal_code,
        shipping_country: normalized.shipping_country,
        billing_address_line1: normalized.billing_address_line1 || normalized.shipping_address_line1,
        billing_address_line2: normalized.billing_address_line2 || normalized.shipping_address_line2,
        billing_city: normalized.billing_city || normalized.shipping_city,
        billing_district: normalized.billing_district || normalized.shipping_district,
        billing_ward: normalized.billing_ward || normalized.shipping_ward,
        billing_postal_code: normalized.billing_postal_code || normalized.shipping_postal_code,
        billing_country: normalized.billing_country || normalized.shipping_country,
        subtotal,
        shipping_fee,
        discount_amount,
        total_amount,
        coupon_code: normalized.coupon_code,
        payment_method: normalized.payment_method,
        shipping_method: normalized.shipping_method,
        notes: normalized.notes,
        order_items: {
          create: orderItemsData,
        },
        order_status_history: {
          create: {
            status: 'pending',
            notes: 'Order placed',
            created_by: userId,
          },
        },
        payments: {
          create: {
            payment_method: normalized.payment_method,
            amount: total_amount,
            status: 'pending',
          },
        },
      },
      include: {
        order_items: true,
        payments: true,
      },
    });

    if (coupon && discount_amount > 0) {
      await tx.coupon_usage.create({
        data: {
          coupon_id: coupon.coupon_id,
          user_id: userId,
          order_id: order.order_id,
        },
      });

      await tx.coupons.update({
        where: { coupon_id: coupon.coupon_id },
        data: { usage_count: { increment: 1 } },
      });
    }

    for (const item of sourceItems) {
      if (item.variant_id) {
        await tx.product_variants.update({
          where: { variant_id: item.variant_id },
          data: { stock_quantity: { decrement: item.quantity } },
        });
      }

      await tx.inventory_transactions.create({
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

    if (cart) {
      await tx.cart_items.deleteMany({
        where: { cart_id: cart.cart_id },
      });
    }

    return order;
  });
};

export const getCheckoutOptions = () => ({
  shipping_methods: SHIPPING_METHODS,
  payment_methods: PAYMENT_METHODS,
});

export const getShippingMethods = () => SHIPPING_METHODS;

export const getPaymentMethods = () => PAYMENT_METHODS;

export const placeOrder = async (userId: string, orderData: any) => {
  const { cart, sourceItems } = await buildOrderItemsFromCart(userId);
  return placeOrderFromItems(userId, orderData, sourceItems, cart);
};

export const buyNow = async (userId: string, orderData: any) => {
  const { sourceItems } = await buildOrderItemsFromRequest(orderData);
  return placeOrderFromItems(userId, orderData, sourceItems);
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
        payments: true,
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

export const getOrderById = async (userId: string, orderId: string) => {
  const order = await prisma.orders.findFirst({
    where: { order_id: orderId, user_id: userId },
    include: {
      order_items: true,
      payments: true,
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  return order;
};

export const cancelOrder = async (userId: string, orderId: string, reason: string) => {
  const order = await prisma.orders.findFirst({
    where: { order_id: orderId, user_id: userId },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.status !== 'pending' && order.status !== 'processing') {
    throw new Error('Order cannot be cancelled');
  }

  const updatedOrder = await prisma.orders.update({
    where: { order_id: orderId },
    data: {
      status: 'cancelled',
      cancellation_reason: reason || 'Cancelled by user',
      cancelled_at: new Date(),
    },
    include: {
      order_items: true,
      payments: true,
    },
  });

  await prisma.order_status_history.create({
    data: {
      order_id: orderId,
      status: 'cancelled',
      notes: reason || 'Cancelled by user',
      created_by: userId,
    }
  });

  return updatedOrder;
};
