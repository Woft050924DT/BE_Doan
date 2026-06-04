"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMenus = void 0;
const database_1 = __importDefault(require("../config/database"));
const getMenus = async (location) => {
    const where = {};
    if (location) {
        where.location = location;
    }
    return database_1.default.menus.findMany({
        where,
        include: {
            menu_items: {
                where: { is_active: true, parent_id: null },
                orderBy: { display_order: 'asc' },
                include: {
                    other_menu_items: {
                        where: { is_active: true },
                        orderBy: { display_order: 'asc' },
                    },
                },
            },
        },
        orderBy: { name: 'asc' },
    });
};
exports.getMenus = getMenus;
