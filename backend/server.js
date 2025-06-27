// SEGSYNC/backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
// const db = require('./config/db'); // <<<< REMOVE THIS LINE

const authRoutes = require('./routes/auth.routes');
const sequenceRoutes = require('./routes/sequence.routes');
const userRoutes = require('./routes/user.routes');
const { errorHandler } = require('./middleware/errorMiddleware');
const ApiError = require('./utils/ApiError');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.get('/api/health', (req, res) => res.json({ status: 'UP', timestamp: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/sequences', sequenceRoutes);
app.use('/api/users', userRoutes);

// 404 Handler for API routes
app.all('/api/*', (req, res, next) => {
  next(new ApiError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Backend server is blasting off on port ${PORT}`);
  try {
    const supabaseAdminClient = require('./config/supabaseAdmin'); // This is fine for a startup check
    if (supabaseAdminClient) {
      // supabaseAdmin.js already logs its initialization.
    }
  } catch (e) {
    console.error("🔴 CRITICAL: Failed to load Supabase Admin configuration on server start:", e.message);
    process.exit(1); // Exit if essential Supabase config fails
  }
});
