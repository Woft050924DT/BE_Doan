"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const mediaRoutes_1 = __importDefault(require("./routes/mediaRoutes"));
const mediaService_1 = require("./services/mediaService");
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const cartRoutes_1 = __importDefault(require("./routes/cartRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const catalogRoutes_1 = __importDefault(require("./routes/catalogRoutes"));
const addressRoutes_1 = __importDefault(require("./routes/addressRoutes"));
const couponRoutes_1 = __importDefault(require("./routes/couponRoutes"));
const inventoryRoutes_1 = __importDefault(require("./routes/inventoryRoutes"));
const statsRoutes_1 = __importDefault(require("./routes/statsRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : true;
app.use((0, cors_1.default)({
    origin: corsOrigins,
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/uploads', express_1.default.static((0, mediaService_1.getUploadDir)()));
app.use('/api/auth', authRoutes_1.default);
app.use('/api/media', mediaRoutes_1.default);
app.use('/api/products', productRoutes_1.default);
app.use('/api/cart', cartRoutes_1.default);
app.use('/api/orders', orderRoutes_1.default);
app.use('/api', catalogRoutes_1.default);
app.use('/api/addresses', addressRoutes_1.default);
app.use('/api/coupons', couponRoutes_1.default);
app.use('/api/inventory', inventoryRoutes_1.default);
app.use('/api/stats', statsRoutes_1.default);
app.get('/health', (_req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
