"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAddress = exports.updateAddress = exports.createAddress = exports.getAddresses = void 0;
const database_1 = __importDefault(require("../config/database"));
const addressSelect = {
    address_id: true,
    user_id: true,
    address_type: true,
    full_name: true,
    phone: true,
    address_line1: true,
    address_line2: true,
    city: true,
    district: true,
    ward: true,
    postal_code: true,
    country: true,
    is_default: true,
    created_at: true,
    updated_at: true,
};
const getAddresses = async (userId) => {
    return database_1.default.user_addresses.findMany({
        where: { user_id: userId },
        orderBy: [{ is_default: 'desc' }, { created_at: 'desc' }],
        select: addressSelect,
    });
};
exports.getAddresses = getAddresses;
const createAddress = async (userId, data) => {
    const { address_type, full_name, phone, address_line1, address_line2, city, district, ward, postal_code, country, is_default, } = data;
    if (!full_name || !phone || !address_line1 || !city) {
        throw new Error('Required address fields are missing');
    }
    if (is_default) {
        await database_1.default.user_addresses.updateMany({
            where: { user_id: userId },
            data: { is_default: false },
        });
    }
    return database_1.default.user_addresses.create({
        data: {
            user_id: userId,
            address_type: address_type || 'shipping',
            full_name,
            phone,
            address_line1,
            address_line2,
            city,
            district,
            ward,
            postal_code,
            country: country || 'Vietnam',
            is_default: is_default ?? false,
        },
        select: addressSelect,
    });
};
exports.createAddress = createAddress;
const updateAddress = async (userId, addressId, data) => {
    const existing = await database_1.default.user_addresses.findFirst({
        where: { address_id: addressId, user_id: userId },
    });
    if (!existing) {
        throw new Error('Address not found');
    }
    if (data.is_default) {
        await database_1.default.user_addresses.updateMany({
            where: { user_id: userId },
            data: { is_default: false },
        });
    }
    const patch = { updated_at: new Date() };
    const keys = [
        'address_type',
        'full_name',
        'phone',
        'address_line1',
        'address_line2',
        'city',
        'district',
        'ward',
        'postal_code',
        'country',
        'is_default',
    ];
    for (const k of keys) {
        if (data[k] !== undefined)
            patch[k] = data[k];
    }
    return database_1.default.user_addresses.update({
        where: { address_id: addressId },
        data: patch,
        select: addressSelect,
    });
};
exports.updateAddress = updateAddress;
const deleteAddress = async (userId, addressId) => {
    const existing = await database_1.default.user_addresses.findFirst({
        where: { address_id: addressId, user_id: userId },
    });
    if (!existing) {
        throw new Error('Address not found');
    }
    await database_1.default.user_addresses.delete({ where: { address_id: addressId } });
    return { success: true };
};
exports.deleteAddress = deleteAddress;
