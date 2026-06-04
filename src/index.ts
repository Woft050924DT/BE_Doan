import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';
import profileRoutes from './routes/profileRoutes';
import categoryRoutes from './routes/categoryRoutes';
import notificationRoutes from './routes/notificationRoutes';
import wishlistRoutes from './routes/wishlistRoutes';
import couponRoutes from './routes/couponRoutes';
import chatRoutes from './routes/chatRoutes';
import adminDashboardRoutes from './routes/adminDashboardRoutes';
import adminOrderRoutes from './routes/adminOrderRoutes';
import adminProductRoutes from './routes/adminProductRoutes';
import adminAIRoutes from './routes/adminAIRoutes';
import adminChatRoutes from './routes/adminChatRoutes';
import adminReviewRoutes from './routes/adminReviewRoutes';
import adminCouponRoutes from './routes/adminCouponRoutes';
import adminCustomerRoutes from './routes/adminCustomerRoutes';
import adminBannerRoutes from './routes/adminBannerRoutes';
import adminBrandRoutes from './routes/adminBrandRoutes';
import adminCategoryRoutes from './routes/adminCategoryRoutes';
import adminPostRoutes from './routes/adminPostRoutes';
import adminLibraryRoutes from './routes/adminLibraryRoutes';
import adminTrainingDataRoutes from './routes/adminTrainingDataRoutes';
import adminQuickReplyRoutes from './routes/adminQuickReplyRoutes';
import adminStaffRoutes from './routes/adminStaffRoutes';
import adminSettingsRoutes from './routes/adminSettingsRoutes';
import adminPaymentRoutes from './routes/adminPaymentRoutes';
import adminPaymentMethodRoutes from './routes/adminPaymentMethodRoutes';
import adminShippingMethodRoutes from './routes/adminShippingMethodRoutes';
import adminAILogRoutes from './routes/adminAILogRoutes';
import supportRoutes from './routes/supportRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminDashboardRoutes, adminOrderRoutes, adminProductRoutes, adminAIRoutes, adminChatRoutes, adminCategoryRoutes, adminPostRoutes, adminBannerRoutes, adminBrandRoutes, adminLibraryRoutes, adminPaymentMethodRoutes, adminShippingMethodRoutes, adminAILogRoutes, adminReviewRoutes, adminCouponRoutes, adminCustomerRoutes, adminTrainingDataRoutes, adminQuickReplyRoutes, adminStaffRoutes, adminSettingsRoutes, adminPaymentRoutes);
app.use('/api', supportRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
