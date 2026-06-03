import prisma from '../config/database';

const today = new Date();
const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);

export const getDashboardStats = async () => {
  const [
    todayOrders,
    yesterdayOrders,
    todayRevenueResult,
    yesterdayRevenueResult,
    totalUsers,
    openConversations,
    recentOrders,
  ] = await Promise.all([
    prisma.orders.findMany({
      where: { created_at: { gte: startOfDay } },
      select: { total_amount: true },
    }),
    prisma.orders.findMany({
      where: {
        created_at: {
          gte: new Date(startOfDay.getTime() - 86400000),
          lt: startOfDay,
        },
      },
      select: { total_amount: true },
    }),
    prisma.orders.aggregate({
      where: { created_at: { gte: startOfDay }, payment_status: 'paid' },
      _sum: { total_amount: true },
    }),
    prisma.orders.aggregate({
      where: {
        created_at: { gte: new Date(startOfDay.getTime() - 86400000), lt: startOfDay },
        payment_status: 'paid',
      },
      _sum: { total_amount: true },
    }),
    prisma.users.count(),
    prisma.conversations.count({ where: { status: { in: ['active', 'open'] } } }),
    prisma.orders.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        order_items: true,
        payments: true,
        users: { select: { user_id: true, full_name: true, email: true } },
      },
    }),
  ]);

  const todayRevenue = Number(todayRevenueResult._sum.total_amount ?? 0);
  const yesterdayRevenue = Number(yesterdayRevenueResult._sum.total_amount ?? 0);
  const revenueChange =
    yesterdayRevenue > 0
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
      : todayRevenue > 0 ? 100 : 0;

  const revenue7Days: { day: string; revenue: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(startOfDay.getTime() - i * 86400000);
    const dayStr = d.toISOString().split('T')[0];
    const dayRevenue = await prisma.orders.aggregate({
      where: {
        created_at: { gte: d, lt: new Date(d.getTime() + 86400000) },
        payment_status: 'paid',
      },
      _sum: { total_amount: true },
    });
    revenue7Days.push({ day: dayStr, revenue: Number(dayRevenue._sum.total_amount ?? 0) });
  }

  const orderStatusBreakdown = await Promise.all(
    ['delivered', 'shipped', 'processing', 'pending', 'cancelled'].map(async (status) => ({
      status,
      count: await prisma.orders.count({ where: { status } }),
    }))
  );

  const openConversationsList = await prisma.conversations.findMany({
    where: { status: { in: ['active', 'open'] } },
    take: 5,
    orderBy: { last_message_at: 'desc' },
    include: {
      users_conversations_user_idTousers: {
        select: { user_id: true, full_name: true, email: true },
      },
    },
  });

  return {
    kpis: {
      today_revenue: todayRevenue,
      revenue_change_percent: Math.round(revenueChange * 100) / 100,
      new_orders_today: todayOrders.length,
      orders_change_percent:
        yesterdayOrders.length > 0
          ? Math.round(((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length) * 10000) / 100
          : todayOrders.length > 0 ? 100 : 0,
      total_users: totalUsers,
      users_change_percent: 0,
      open_chats: openConversations,
      chats_change_percent: 0,
    },
    revenue_7days: revenue7Days,
    order_status_breakdown: orderStatusBreakdown,
    recent_orders: recentOrders,
    open_conversations: openConversationsList.map((c) => ({
      conversation_id: c.conversation_id,
      customer: c.users_conversations_user_idTousers,
      status: c.status,
      priority: c.priority,
      last_message_at: c.last_message_at,
    })),
  };
};
