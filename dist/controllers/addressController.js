"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAddress = exports.updateAddress = exports.createAddress = exports.getAddresses = void 0;
const addressService_1 = require("../services/addressService");
const getAddresses = async (req, res) => {
    try {
        const addresses = await (0, addressService_1.getAddresses)(req.userId);
        res.json({ addresses });
    }
    catch (error) {
        console.error('Get addresses error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAddresses = getAddresses;
const createAddress = async (req, res) => {
    try {
        const address = await (0, addressService_1.createAddress)(req.userId, req.body);
        res.status(201).json(address);
    }
    catch (error) {
        console.error('Create address error:', error);
        if (error.message === 'Required address fields are missing') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createAddress = createAddress;
const updateAddress = async (req, res) => {
    try {
        const address = await (0, addressService_1.updateAddress)(req.userId, req.params.id, req.body);
        res.json(address);
    }
    catch (error) {
        console.error('Update address error:', error);
        if (error.message === 'Address not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateAddress = updateAddress;
const deleteAddress = async (req, res) => {
    try {
        const result = await (0, addressService_1.deleteAddress)(req.userId, req.params.id);
        res.json(result);
    }
    catch (error) {
        console.error('Delete address error:', error);
        if (error.message === 'Address not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteAddress = deleteAddress;
