"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminDashboard = void 0;
const statsService_1 = require("../services/statsService");
const auth_1 = require("../middleware/auth");
const getAdminDashboard = async (req, res) => {
    try {
        if (!(0, auth_1.isAdminRole)(req.userRole)) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const stats = await (0, statsService_1.getDashboardStats)();
        res.json(stats);
    }
    catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAdminDashboard = getAdminDashboard;
