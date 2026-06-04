"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const authService_1 = require("../services/authService");
const register = async (req, res) => {
    try {
        const { email, password, full_name, phone } = req.body;
        const result = await (0, authService_1.register)(email, password, full_name, phone);
        res.status(201).json(result);
    }
    catch (error) {
        console.error('Register error:', error);
        if (error.message === 'Email, password and full name are required' ||
            error.message === 'Password must be at least 6 characters') {
            return res.status(400).json({ error: error.message });
        }
        if (error.message === 'Email already registered') {
            return res.status(409).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await (0, authService_1.login)(email, password);
        res.json(result);
    }
    catch (error) {
        console.error('Login error:', error);
        if (error.message === 'Email and password are required') {
            return res.status(400).json({ error: error.message });
        }
        if (error.message === 'Invalid credentials') {
            return res.status(401).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const result = await (0, authService_1.getMe)(req.userId);
        res.json({ user: result });
    }
    catch (error) {
        console.error('Get me error:', error);
        if (error.message === 'User not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getMe = getMe;
