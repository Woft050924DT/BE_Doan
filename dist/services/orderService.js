"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrder = exports.getOrders = exports.getOrderById = exports.placeOrder = void 0;
const database_1 = __importDefault(require("../config/database"));
const stock_1 = require("../utils/stock");
const orderStock_1 = require("../utils/orderStock");
const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const placeOrder = async (userId, orderData) => {
    const { customer_name, customer_email, customer_phone, shipping_address_line1, shipping_address_line2, shipping_city, shipping_district, shipping_ward, shipping_postal_code, shipping_country, billing_address_line1, billing_address_line2, billing_city, billing_district, billing_ward, billing_postal_code, billing_country, payment_method, shipping_method, coupon_code, notes, } = orderData;
    if (!customer_name || !customer_email || !shipping_address_line1 || !shipping_city) {
        throw new Error('Required fields are missing');
    }
    // Get user's cart
    const cart = await database_1.default.carts.findFirst({
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
    for (const item of cart.cart_items) {
        if (!item.product_id)
            continue;
        await (0, stock_1.assertSufficientStock)(item.product_id, item.variant_id, item.quantity);
    }
    // Calculate totals
    let subtotal = 0;
    const orderItemsData = await Promise.all(cart.cart_items.map(async (item) => {
        const resolvedVariantId = await (0, stock_1.resolveVariantId)(item.product_id, item.variant_id);
        const productPrice = item.product_variants?.price || item.products.price;
        const totalPrice = Number(productPrice) * item.quantity;
        subtotal += totalPrice;
        return {
            product_id: item.product_id,
            variant_id: resolvedVariantId,
            product_name: item.products.name,
            variant_name: item.product_variants?.name,
            sku: item.product_variants?.sku || item.products.sku,
            quantity: item.quantity,
            unit_price: productPrice,
            total_price: totalPrice,
        };
    }));
    // Calculate shipping fee (simplified logic)
    const shipping_fee = 30000; // Fixed shipping fee
    // Calculate discount if coupon provided
    let discount_amount = 0;
    if (coupon_code) {
        const coupon = await database_1.default.coupons.findUnique({
            where: { code: coupon_code },
        });
        if (coupon && coupon.is_active) {
            const now = new Date();
            if (now >= coupon.valid_from && now <= coupon.valid_to) {
                if (coupon.discount_type === 'percentage') {
                    discount_amount = subtotal * (Number(coupon.discount_value) / 100);
                }
                else {
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
    const order = await database_1.default.orders.create({
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
        await database_1.default.coupon_usage.create({
            data: {
                coupon_id: (await database_1.default.coupons.findUnique({ where: { code: coupon_code } }))?.coupon_id,
                user_id: userId,
                order_id: order.order_id,
            },
        });
    }
    // Kho trừ khi admin chuyển trạng thái sang "delivered"
    // Clear cart
    await database_1.default.cart_items.deleteMany({
        where: { cart_id: cart.cart_id },
    });
    return order;
};
exports.placeOrder = placeOrder;
const getOrderById = async (userId, orderId, admin = false) => {
    const order = await database_1.default.orders.findFirst({
        where: admin ? { order_id: orderId } : { order_id: orderId, user_id: userId },
        include: { order_items: true },
    });
    if (!order) {
        throw new Error('Order not found');
    }
    return order;
};
exports.getOrderById = getOrderById;
const getOrders = async (userId, page = 1, limit = 10, admin = false) => {
    const skip = (page - 1) * limit;
    const take = limit;
    const where = admin ? {} : { user_id: userId };
    const [orders, total] = await Promise.all([
        database_1.default.orders.findMany({
            where,
            skip,
            take,
            include: {
                order_items: true,
            },
            orderBy: { created_at: 'desc' },
        }),
        database_1.default.orders.count({ where }),
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
exports.getOrders = getOrders;
const updateOrder = async (userId, orderId, data, admin = false) => {
    if (!admin) {
        throw new Error('Admin access required');
    }
    const order = await database_1.default.orders.findFirst({
        where: { order_id: orderId },
        include: { order_items: true },
    });
    if (!order) {
        throw new Error('Order not found');
    }
    const oldStatus = order.status || 'pending';
    const newStatus = data.status ?? oldStatus;
    if (data.status && !ORDER_STATUSES.includes(data.status)) {
        throw new Error('Invalid order status');
    }
    const updated = await database_1.default.$transaction(async (tx) => {
        const updatedOrder = await tx.orders.update({
            where: { order_id: orderId },
            data: {
                ...(data.status ? { status: data.status, shipping_status: data.status } : {}),
                ...(data.notes !== undefined ? { notes: data.notes } : {}),
                ...(data.internal_notes !== undefined ? { internal_notes: data.internal_notes } : {}),
                ...(data.tracking_number !== undefined ? { tracking_number: data.tracking_number } : {}),
                ...(newStatus === 'shipped' && !order.shipped_at ? { shipped_at: new Date() } : {}),
                ...(newStatus === 'delivered' && !order.delivered_at ? { delivered_at: new Date() } : {}),
                ...(newStatus === 'cancelled'
                    ? {
                        cancelled_at: order.cancelled_at || new Date(),
                        cancellation_reason: data.cancellation_reason || order.cancellation_reason,
                    }
                    : {}),
                updated_at: new Date(),
            },
            include: { order_items: true },
        });
        if (newStatus !== oldStatus) {
            await tx.order_status_history.create({
                data: {
                    order_id: orderId,
                    status: newStatus,
                    notes: data.status_note || `Cập nhật: ${oldStatus} → ${newStatus}`,
                    created_by: userId,
                },
            });
        }
        if (newStatus === 'delivered') {
            await (0, orderStock_1.deductStockForOrder)(tx, orderId, userId, order.order_items);
        }
        if (newStatus === 'cancelled' && oldStatus === 'delivered') {
            await (0, orderStock_1.restoreStockForOrder)(tx, orderId, userId);
        }
        return updatedOrder;
    });
    return updated;
};
exports.updateOrder = updateOrder;
