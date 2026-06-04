"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBanners = void 0;
const database_1 = __importDefault(require("../config/database"));
const getBanners = async (position) => {
    const now = new Date();
    const where = {
        is_active: true,
        AND: [
            { OR: [{ start_date: null }, { start_date: { lte: now } }] },
            { OR: [{ end_date: null }, { end_date: { gte: now } }] },
        ],
    };
    if (position) {
        where.position = position;
    }
    return database_1.default.banners.findMany({
        where,
        orderBy: { display_order: 'asc' },
    });
};
exports.getBanners = getBanners;
