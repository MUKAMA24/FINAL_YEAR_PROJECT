require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth.routes');
const businessRoutes = require('./routes/business.routes');
const serviceRoutes = require('./routes/service.routes');
const timeslotRoutes = require('./routes/timeslot.routes');
const bookingRoutes = require('./routes/booking.routes');
const adminRoutes = require('./routes/admin.routes');
const reviewRoutes = require('./routes/review.routes');
const paymentRoutes = require('./routes/payment.routes');

const app = express();

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(require('helmet')());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require('hpp')());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiting
const limiter = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/timeslots', timeslotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Appointment Booking API',
    version: '1.0.0',
    status: 'running'
  });
});

// Health check with database connectivity
app.get('/api/health', async (req, res) => {
  try {
    await db.one('SELECT 1');
    res.json({ 
      status: 'OK', 
      message: 'Server is running',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'ERROR', 
      message: 'Database connection failed',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: { message: 'Route not found', status: 404 } });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
