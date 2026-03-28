import express from 'express';
import cors    from 'cors';
import dotenv  from 'dotenv';
import connectDB from './config/db.js';
import productRoutes  from './routes/productRoutes.js';
import authRoutes     from './routes/authRoutes.js';
import userRoutes     from './routes/userRoutes.js';
import uploadRoutes   from './routes/uploadRoutes.js';
import reviewRoutes   from './routes/reviewRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth',       authRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/upload',     uploadRoutes);
app.use('/api/reviews',    reviewRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Boutique API running', env: process.env.NODE_ENV });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🌸 Boutique Server → http://localhost:${PORT}`);
  console.log(`📦 Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`🖼️  ImageKit    : ${process.env.IMAGEKIT_URL_ENDPOINT ? '✅ configured' : '⚠️  not configured'}\n`);
});