"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const database_1 = __importDefault(require("../config/database"));
const startOfDay = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
};
const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const getDashboardStats = async () => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 6);
    const [todayOrders, yesterdayOrders, weekOrders, totalUsers, publishedProducts, statusGroups, recentOrders,] = await Promise.all([
        database_1.default.orders.findMany({
            where: {
                created_at: { gte: todayStart },
                status: { not: 'cancelled' },
            },
            select: { total_amount: true },
        }),
        database_1.default.orders.findMany({
            where: {
                created_at: { gte: yesterdayStart, lt: todayStart },
                status: { not: 'cancelled' },
            },
            select: { total_amount: true },
        }),
        database_1.default.orders.findMany({
            where: {
                created_at: { gte: weekStart },
                status: { not: 'cancelled' },
            },
            select: { total_amount: true, created_at: true },
        }),
        database_1.default.users.count({ where: { role: 'customer', status: 'active' } }),
        database_1.default.products.count({ where: { status: 'published' } }),
        database_1.default.orders.groupBy({
            by: ['status'],
            _count: { status: true },
        }),
        database_1.default.orders.findMany({
            orderBy: { created_at: 'desc' },
            take: 5,
            include: {
                order_items: { select: { order_item_id: true } },
            },
        }),
    ]);
    const sumAmount = (rows) => rows.reduce((s, o) => s + Number(o.total_amount || 0), 0);
    const todayRevenue = sumAmount(todayOrders);
    const yesterdayRevenue = sumAmount(yesterdayOrders);
    const revenueChange = yesterdayRevenue > 0
        ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
        : todayRevenue > 0
            ? 100
            : 0;
    const todayOrderCount = todayOrders.length;
    const yesterdayOrderCount = yesterdayOrders.length;
    const ordersChange = yesterdayOrderCount > 0
        ? ((todayOrderCount - yesterdayOrderCount) / yesterdayOrderCount) * 100
        : todayOrderCount > 0
            ? 100
            : 0;
    const revenueByDay = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        const next = new Date(d);
        next.setDate(d.getDate() + 1);
        const dayRevenue = weekOrders
            .filter((o) => {
            const t = new Date(o.created_at);
            return t >= d && t < next;
        })
            .reduce((s, o) => s + Number(o.total_amount || 0), 0);
        revenueByDay.push({
            day: DAY_LABELS[d.getDay()],
            revenue: dayRevenue,
            date: d.toISOString().slice(0, 10),
        });
    }
    const STATUS_COLORS = {
        delivered: '#2E7D32',
        shipped: '#5C6BC0',
        processing: '#1565C0',
        pending: '#E65100',
        cancelled: '#E53935',
    };
    const STATUS_LABELS = {
        delivered: 'Đã giao',
        shipped: 'Đang giao',
        processing: 'Đang xử lý',
        pending: 'Chờ xử lý',
        cancelled: 'Đã hủy',
    };
    const orderStatusChart = statusGroups
        .filter((g) => g._count.status > 0)
        .map((g) => ({
        status: g.status,
        name: STATUS_LABELS[g.status] || g.status,
        value: g._count.status,
        color: STATUS_COLORS[g.status] || '#757575',
    }));
    return {
        kpis: {
            todayRevenue,
            revenueChange,
            todayOrders: todayOrderCount,
            ordersChange,
            totalUsers,
            publishedProducts,
        },
        revenueByDay,
        orderStatusChart,
        recentOrders,
    };
};
exports.getDashboardStats = getDashboardStats;
