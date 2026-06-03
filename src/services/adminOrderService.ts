import prisma from '../config/database';

export const getAdminOrders = async (filters: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  payment_status?: string;
}) => {
  const { page = 1, limit = 20, status, search, date_from, date_to, payment_status } = filters;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (status) where.status = status;
  if (payment_status) where.payment_status = payment_status;
  if (date_from || date_to) {
    where.created_at = {};
    if (date_from) where.created_at.gte = new Date(date_from);
    if (date_to) where.created_at.lte = new Date(date_to);
  }
  if (search) {
    where.OR = [
      { order_number: { contains: search, mode: 'insensitive' } },
      { customer_name: { contains: search, mode: 'insensitive' } },
      { customer_email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.orders.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        order_items: true,
        payments: true,
        users: {
          select: { user_id: true, full_name: true, email: true },
        },
      },
      orderBy: { created_at: 'desc' },
    }),
    prisma.orders.count({ where }),
  ]);

  return {
    orders,
    pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
  };
};

export const updateAdminOrder = async (
  orderId: string,
  data: {
    status?: string;
    payment_status?: string;
    shipping_status?: string;
    tracking_number?: string;
    internal_notes?: string;
    shipped_at?: string;
    delivered_at?: string;
  }
) => {
  const order = await prisma.orders.findUnique({ where: { order_id: orderId } });
  if (!order) throw new Error('Order not found');

  const updateData: any = {};
  if (data.status) updateData.status = data.status;
  if (data.payment_status) updateData.payment_status = data.payment_status;
  if (data.shipping_status) updateData.shipping_status = data.shipping_status;
  if (data.tracking_number !== undefined) updateData.tracking_number = data.tracking_number;
  if (data.internal_notes !== undefined) updateData.internal_notes = data.internal_notes;
  if (data.shipped_at) updateData.shipped_at = new Date(data.shipped_at);
  if (data.delivered_at) updateData.delivered_at = new Date(data.delivered_at);

  const updated = await prisma.orders.update({
    where: { order_id: orderId },
    data: updateData,
    include: { order_items: true, payments: true },
  });

  if (data.status) {
    await prisma.order_status_history.create({
      data: {
        order_id: orderId,
        status: data.status,
        notes: data.internal_notes || `Status updated by admin`,
      },
    });
  }

  return updated;
};

export const exportOrders = async (filters: any) => {
  const result = await getAdminOrders({ ...filters, limit: 10000 });
  return result.orders;
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ xác nhận', color: 'amber' },
  processing: { label: 'Đang xử lý', color: 'blue' },
  shipped: { label: 'Đang giao', color: 'indigo' },
  delivered: { label: 'Đã giao', color: 'green' },
  cancelled: { label: 'Đã hủy', color: 'red' },
};

export const getOrderStatusOptions = () => ({
  statuses: Object.entries(STATUS_LABELS).map(([value, { label, color }]) => ({ value, label, color })),
});

export const trackOrder = async (orderId: string, userId: string) => {
  const order = await prisma.orders.findFirst({
    where: { order_id: orderId, user_id: userId },
    include: { order_status_history: { orderBy: { created_at: 'asc' } } },
  });

  if (!order) throw new Error('Order not found');

  const statusMap: Record<string, { status: string; label: string }> = {
    pending: { status: 'ordered', label: 'Đã đặt hàng' },
    processing: { status: 'confirmed', label: 'Đã xác nhận' },
    shipped: { status: 'shipped', label: 'Đã giao cho đơn vị vận chuyển' },
    delivered: { status: 'delivered', label: 'Đã giao hàng' },
    cancelled: { status: 'cancelled', label: 'Đã hủy' },
  };

  const timeline = order.order_status_history.map((h) => {
    const mapped = statusMap[h.status] || { status: h.status, label: h.status };
    return {
      status: mapped.status,
      label: h.notes || mapped.label,
      timestamp: h.created_at?.toISOString(),
      note: h.notes || null,
      tracking_number: order.tracking_number,
    };
  });

  return {
    order_id: order.order_id,
    order_number: order.order_number,
    status: order.status,
    tracking_number: order.tracking_number,
    timeline,
  };
};
