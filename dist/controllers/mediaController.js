"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMediaFiles = void 0;
const mediaService_1 = require("../services/mediaService");
const getMediaFiles = async (_req, res) => {
    try {
        const files = (0, mediaService_1.listMediaFiles)();
        res.json({ files });
    }
    catch (error) {
        console.error('List media error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getMediaFiles = getMediaFiles;
