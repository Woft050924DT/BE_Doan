import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import mediaRoutes from './routes/mediaRoutes';
import { getUploadDir } from './services/mediaService';
import productRoutes from './routes/productRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';
import catalogRoutes from './routes/catalogRoutes';
import addressRoutes from './routes/addressRoutes';
import couponRoutes from './routes/couponRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import statsRoutes from './routes/statsRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : true;

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(getUploadDir()));

app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api', catalogRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/stats', statsRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
