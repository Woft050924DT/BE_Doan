"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.isAdminRole = exports.optionalAuthenticate = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const decodeToken = (token) => {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
};
const loadUserRole = async (userId) => {
    const user = await database_1.default.users.findUnique({
        where: { user_id: userId },
        select: { role: true, status: true },
    });
    if (!user || user.status !== 'active')
        return null;
    return user.role;
};
const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    try {
        const decoded = decodeToken(token);
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        if (!req.userRole) {
            const role = await loadUserRole(decoded.userId);
            if (!role) {
                return res.status(401).json({ error: 'Invalid or inactive user' });
            }
            req.userRole = role;
        }
        next();
    }
    catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
exports.authenticate = authenticate;
const optionalAuthenticate = async (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return next();
    }
    try {
        const decoded = decodeToken(token);
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        if (!req.userRole) {
            req.userRole = (await loadUserRole(decoded.userId)) ?? undefined;
        }
        next();
    }
    catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
exports.optionalAuthenticate = optionalAuthenticate;
const isAdminRole = (role) => role === 'admin' || role === 'staff';
exports.isAdminRole = isAdminRole;
const requireAdmin = async (req, res, next) => {
    if (!req.userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    if (!(0, exports.isAdminRole)(req.userRole)) {
        const role = await loadUserRole(req.userId);
        req.userRole = role ?? undefined;
    }
    if (!(0, exports.isAdminRole)(req.userRole)) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};
exports.requireAdmin = requireAdmin;
