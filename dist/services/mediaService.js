"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUploadDir = exports.listMediaFiles = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const UPLOAD_DIR = path_1.default.join(process.cwd(), 'uploads');
const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);
const ensureUploadDir = () => {
    if (!fs_1.default.existsSync(UPLOAD_DIR)) {
        fs_1.default.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
};
const listMediaFiles = () => {
    ensureUploadDir();
    const files = fs_1.default
        .readdirSync(UPLOAD_DIR, { withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
        .filter((name) => ALLOWED_EXT.has(path_1.default.extname(name).toLowerCase()))
        .sort((a, b) => a.localeCompare(b));
    return files.map((filename) => ({
        filename,
        url: `/uploads/${filename}`,
    }));
};
exports.listMediaFiles = listMediaFiles;
const getUploadDir = () => {
    ensureUploadDir();
    return UPLOAD_DIR;
};
exports.getUploadDir = getUploadDir;
