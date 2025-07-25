// food-delivery-app/backend/index.js

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';

// ✅ Load environment variables from .env
dotenv.config();

// ✅ Create Express app
const app = express();

// ✅ Set the port from .env or fallback to 5000
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://book-store-six-indol.vercel.app',
  ],
  credentials: true, // Allow cookies and authorization headers
}));
app.use(cookieParser()); // Parse cookies

// ✅ Health check route
app.get('/', (req, res) => {
  res.send('🍔 Food Delivery API is running!');
});

// ✅ API Routes
app.use('/api/v1/auth', authRoutes); // All auth-related endpoints

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
});
