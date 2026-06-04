import prisma from '../config/database';

export const getAdminCustomers = async (filters: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  is_active?: boolean;
  role?: string;
}) => {
  const { page = 1, limit = 20, search, status, is_active, role } = filters;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};

  if (role) {
    where.role = role;
  }

  if (is_active !== undefined) {
    where.status = is_active ? 'active' : 'banned';
  } else if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { full_name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [customers, total] = await Promise.all([
    prisma.users.findMany({
      where,
      select: {
        user_id: true,
        email: true,
        full_name: true,
        phone: true,
        avatar_url: true,
        role: true,
        status: true,
        email_verified: true,
        last_login: true,
        created_at: true,
        orders: {
          select: {
            order_id: true,
            total_amount: true,
            status: true,
            created_at: true,
          },
        },
        product_reviews: {
          select: { review_id: true, is_approved: true },
        },
      },
      skip,
      take: Number(limit),
      orderBy: { created_at: 'desc' },
    }),
    prisma.users.count({ where }),
  ]);

  const data = customers.map((u) => {
    const totalOrders = u.orders.length;
    const totalSpent = u.orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const lastOrder = u.orders.sort(
      (a, b) => new Date(b.order_id).getTime() - new Date(a.order_id).getTime()
    )[0];
    const totalReviews = u.product_reviews.filter((r) => r.is_approved).length;

    return {
      user_id: u.user_id,
      full_name: u.full_name,
      email: u.email,
      phone: u.phone || '',
      avatar_url: u.avatar_url || '',
      role: u.role,
      total_orders: totalOrders,
      total_spent: totalSpent,
      last_order_at: lastOrder?.created_at?.toISOString() || '',
      total_reviews: totalReviews,
      email_verified: u.email_verified,
      last_login: u.last_login?.toISOString() || '',
      joined_at: u.created_at?.toISOString() || '',
      status: u.status as 'active' | 'banned',
    };
  });

  return {
    data,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getAdminCustomerById = async (userId: string) => {
  const user = await prisma.users.findUnique({
    where: { user_id: userId },
    select: {
      user_id: true,
      email: true,
      full_name: true,
      phone: true,
      avatar_url: true,
      role: true,
      status: true,
      email_verified: true,
      last_login: true,
      created_at: true,
      orders: {
        select: {
          order_id: true,
          order_number: true,
          total_amount: true,
          status: true,
          created_at: true,
        },
        orderBy: { created_at: 'desc' },
        take: 5,
      },
      product_reviews: {
        where: { is_approved: true },
        select: {
          review_id: true,
          rating: true,
          comment: true,
          created_at: true,
          products: { select: { name: true } },
        },
        orderBy: { created_at: 'desc' },
        take: 10,
      },
      user_addresses: {
        select: {
          address_id: true,
          full_name: true,
          phone: true,
          address_line1: true,
          city: true,
          district: true,
          is_default: true,
        },
      },
    },
  });

  if (!user) throw new Error('User not found');

  return {
    user_id: user.user_id,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone || '',
    avatar_url: user.avatar_url || '',
    role: user.role,
    email_verified: user.email_verified,
    last_login: user.last_login?.toISOString() || '',
    joined_at: user.created_at?.toISOString() || '',
    status: user.status as 'active' | 'banned',
    orders: user.orders.map((o) => ({
      order_id: o.order_id,
      order_number: o.order_number,
      total_amount: Number(o.total_amount),
      status: o.status,
      created_at: o.created_at?.toISOString() || '',
    })),
    reviews: user.product_reviews.map((r) => ({
      review_id: r.review_id,
      product_name: r.products?.name || '',
      rating: r.rating,
      comment: r.comment || '',
      created_at: r.created_at?.toISOString() || '',
    })),
    addresses: user.user_addresses,
  };
};

export const updateCustomerStatus = async (userId: string, status: 'active' | 'banned') => {
  const user = await prisma.users.findUnique({ where: { user_id: userId } });
  if (!user) throw new Error('User not found');

  return prisma.users.update({
    where: { user_id: userId },
    data: { status },
    select: {
      user_id: true,
      full_name: true,
      email: true,
      status: true,
    },
  });
};
