import prisma from '../config/database';

const paymentSelect = {
  payment_id: true,
  order_id: true,
  payment_method: true,
  amount: true,
  status: true,
  transaction_id: true,
  gateway_response: true,
  paid_at: true,
  refunded_at: true,
  refund_amount: true,
  created_at: true,
  updated_at: true,
} as const;

export const getAdminPayments = async (filters: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  payment_method?: string;
}) => {
  const { page = 1, limit = 20, search, status, payment_method } = filters;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (status) where.status = status;
  if (payment_method) where.payment_method = payment_method;
  if (search) {
    where.OR = [
      { transaction_id: { contains: search, mode: 'insensitive' } },
      { payment_id: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [payments, total] = await Promise.all([
    prisma.payments.findMany({
      where,
      select: paymentSelect,
      skip,
      take: Number(limit),
      orderBy: { created_at: 'desc' },
    }),
    prisma.payments.count({ where }),
  ]);

  const enriched = await Promise.all(
    payments.map(async (p) => {
      const order = p.order_id
        ? await prisma.orders.findUnique({
            where: { order_id: p.order_id },
            select: { order_number: true, customer_name: true, customer_email: true },
          })
        : null;
      return {
        payment_id: p.payment_id,
        order_id: p.order_id,
        order_number: order?.order_number || '',
        customer_name: order?.customer_name || '',
        customer_email: order?.customer_email || '',
        payment_method: p.payment_method,
        amount: Number(p.amount),
        status: p.status || 'pending',
        transaction_id: p.transaction_id || '',
        paid_at: p.paid_at ? p.paid_at.toISOString() : '',
        refunded_at: p.refunded_at ? p.refunded_at.toISOString() : '',
        refund_amount: p.refund_amount ? Number(p.refund_amount) : 0,
        created_at: p.created_at ? p.created_at.toISOString() : '',
      };
    })
  );

  return {
    data: enriched,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

export const refundPayment = async (paymentId: string, refundAmount?: number) => {
  const payment = await prisma.payments.findUnique({ where: { payment_id: paymentId } });
  if (!payment) throw new Error('Payment not found');
    const refundAmountNum = refundAmount ?? Number(payment.amount);
  return prisma.payments.update({
    where: { payment_id: paymentId },
    data: {
      status: 'refunded',
      refunded_at: new Date(),
      refund_amount: refundAmountNum,
    },
    select: paymentSelect,
  });
};

export const updatePaymentStatus = async (paymentId: string, status: string) => {
  const payment = await prisma.payments.findUnique({ where: { payment_id: paymentId } });
  if (!payment) throw new Error('Payment not found');
  return prisma.payments.update({
    where: { payment_id: paymentId },
    data: {
      status,
      ...(status === 'completed' ? { paid_at: new Date() } : {}),
    },
    select: paymentSelect,
  });
};
