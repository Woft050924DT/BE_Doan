"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.getMe = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const userResponse_1 = require("../utils/userResponse");
const signToken = (user) => jsonwebtoken_1.default.sign({ userId: user.user_id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
const register = async (email, password, full_name, phone) => {
    if (!email || !password || !full_name) {
        throw new Error('Email, password and full name are required');
    }
    if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
    }
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await database_1.default.users.findFirst({
        where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
    });
    if (existing) {
        throw new Error('Email already registered');
    }
    const password_hash = await bcrypt_1.default.hash(password, 10);
    const user = await database_1.default.users.create({
        data: {
            email: normalizedEmail,
            password_hash,
            full_name,
            phone: phone || null,
            role: 'customer',
            status: 'active',
        },
    });
    const token = signToken(user);
    return {
        token,
        user: (0, userResponse_1.toPublicUser)(user),
    };
};
exports.register = register;
const getMe = async (userId) => {
    const user = await database_1.default.users.findUnique({ where: { user_id: userId } });
    if (!user || user.status === 'inactive') {
        throw new Error('User not found');
    }
    return (0, userResponse_1.toPublicUser)(user);
};
exports.getMe = getMe;
const login = async (email, password) => {
    if (!email || !password) {
        throw new Error('Email and password are required');
    }
    const normalizedEmail = email.trim().toLowerCase();
    const user = await database_1.default.users.findFirst({
        where: {
            email: { equals: normalizedEmail, mode: 'insensitive' },
        },
    });
    if (!user || !user.password_hash) {
        throw new Error('Invalid credentials');
    }
    if (user.status && user.status !== 'active') {
        throw new Error('Account is inactive');
    }
    const isValidPassword = await bcrypt_1.default.compare(password, user.password_hash);
    if (!isValidPassword) {
        throw new Error('Invalid credentials');
    }
    // Update last login
    await database_1.default.users.update({
        where: { user_id: user.user_id },
        data: { last_login: new Date() },
    });
    const token = signToken(user);
    return {
        token,
        user: (0, userResponse_1.toPublicUser)(user),
    };
};
exports.login = login;
