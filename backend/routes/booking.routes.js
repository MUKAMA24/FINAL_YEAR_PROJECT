const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');
const { sendBookingConfirmation, sendCancellationEmail } = require('../utils/email');
const { createPaymentIntent } = require('../utils/payment');

const router = express.Router();

// POST /api/bookings - Create a booking
router.post('/', authMiddleware, [
  body('business_id').isInt().withMessage('Valid business ID is required'),
  body('service_id').isInt().withMessage('Valid service ID is required'),
  body('timeslot_id').isInt().withMessage('Valid time slot ID is required'),
  body('customer_notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { business_id, service_id, timeslot_id, customer_notes } = req.body;
    const customer_id = req.user.id;

    // Start transaction
    await db.tx(async t => {
      // Check if time slot is available
      const timeSlot = await t.oneOrNone(
        'SELECT * FROM time_slots WHERE id = $1 AND is_booked = false',
        [timeslot_id]
      );

      if (!timeSlot) {
        throw new Error('Time slot is not available');
      }

      // Get service price
      const service = await t.one(
        'SELECT * FROM services WHERE id = $1',
        [service_id]
      );

      // Create booking
      const booking = await t.one(
        `INSERT INTO bookings (customer_id, business_id, service_id, timeslot_id, customer_notes, total_price)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [customer_id, business_id, service_id, timeslot_id, customer_notes, service.price]
      );

      // Mark time slot as booked
      await t.none(
        'UPDATE time_slots SET is_booked = true WHERE id = $1',
        [timeslot_id]
      );

      // Create payment record
      const payment = await t.one(
        `INSERT INTO payments (booking_id, amount, payment_status)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [booking.id, service.price, 'pending']
      );

      // Get full booking details for email
      const bookingDetails = await t.one(
        `SELECT 
           b.id, b.status, b.total_price,
           u.name as customer_name, u.email as customer_email,
           bus.name as business_name,
           s.service_name,
           ts.start_time, ts.end_time
         FROM bookings b
         JOIN users u ON b.customer_id = u.id
         JOIN businesses bus ON b.business_id = bus.id
         JOIN services s ON b.service_id = s.id
         JOIN time_slots ts ON b.timeslot_id = ts.id
         WHERE b.id = $1`,
        [booking.id]
      );

      // Send confirmation email
      sendBookingConfirmation(bookingDetails);

      return { booking, payment, details: bookingDetails };
    }).then(result => {
      res.status(201).json({
        message: 'Booking created successfully',
        booking: result.details,
        payment: result.payment
      });
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: error.message || 'Failed to create booking' });
  }
});

// GET /api/bookings/:id - Get specific booking
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await db.oneOrNone(
      `SELECT 
         b.id, b.status, b.customer_notes, b.total_price, b.created_at,
         u.name as customer_name, u.email as customer_email, u.phone as customer_phone,
         bus.name as business_name, bus.address as business_address, bus.contact_info,
         s.service_name, s.description as service_description, s.duration,
         ts.start_time, ts.end_time,
         p.payment_status, p.payment_method
       FROM bookings b
       JOIN users u ON b.customer_id = u.id
       JOIN businesses bus ON b.business_id = bus.id
       JOIN services s ON b.service_id = s.id
       JOIN time_slots ts ON b.timeslot_id = ts.id
       LEFT JOIN payments p ON b.id = p.booking_id
       WHERE b.id = $1 AND (b.customer_id = $2 OR bus.user_id = $2 OR $3 = 'admin')`,
      [id, req.user.id, req.user.role]
    );

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ booking });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// GET /api/bookings/customer/my - Get customer's bookings
router.get('/customer/my', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT 
        b.id, b.status, b.total_price, b.created_at,
        bus.name as business_name, bus.address as business_address,
        s.service_name, s.duration,
        ts.start_time, ts.end_time
      FROM bookings b
      JOIN businesses bus ON b.business_id = bus.id
      JOIN services s ON b.service_id = s.id
      JOIN time_slots ts ON b.timeslot_id = ts.id
      WHERE b.customer_id = $1
    `;
    const params = [req.user.id];

    if (status) {
      query += ` AND b.status = $2`;
      params.push(status);
    }

    query += ` ORDER BY ts.start_time DESC`;

    const bookings = await db.any(query, params);

    res.json({ bookings });
  } catch (error) {
    console.error('Get customer bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// GET /api/bookings/business/:business_id - Get bookings for a business
router.get('/business/:business_id', authMiddleware, requireRole('business'), async (req, res) => {
  try {
    const { business_id } = req.params;
    const { status, date } = req.query;

    // Verify business belongs to user
    const business = await db.oneOrNone(
      'SELECT id FROM businesses WHERE id = $1 AND user_id = $2',
      [business_id, req.user.id]
    );

    if (!business) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let query = `
      SELECT 
        b.id, b.status, b.customer_notes, b.total_price, b.created_at,
        u.name as customer_name, u.email as customer_email, u.phone as customer_phone,
        s.service_name, s.duration,
        ts.start_time, ts.end_time,
        p.payment_status
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      JOIN services s ON b.service_id = s.id
      JOIN time_slots ts ON b.timeslot_id = ts.id
      LEFT JOIN payments p ON b.id = p.booking_id
      WHERE b.business_id = $1
    `;
    const params = [business_id];
    let paramCount = 2;

    if (status) {
      query += ` AND b.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (date) {
      query += ` AND DATE(ts.start_time) = $${paramCount}`;
      params.push(date);
    }

    query += ` ORDER BY ts.start_time DESC`;

    const bookings = await db.any(query, params);

    res.json({ bookings });
  } catch (error) {
    console.error('Get business bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// PUT /api/bookings/:id/cancel - Cancel a booking
router.put('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Get booking details
    const booking = await db.oneOrNone(
      `SELECT b.*, ts.start_time, u.email as customer_email, u.name as customer_name,
              bus.name as business_name, bus.user_id as business_owner_id, s.service_name
       FROM bookings b
       JOIN time_slots ts ON b.timeslot_id = ts.id
       JOIN users u ON b.customer_id = u.id
       JOIN businesses bus ON b.business_id = bus.id
       JOIN services s ON b.service_id = s.id
       WHERE b.id = $1`,
      [id]
    );

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user has permission to cancel
    if (booking.customer_id !== req.user.id && booking.business_owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking is already cancelled' });
    }

    // Start transaction
    await db.tx(async t => {
      // Update booking status
      await t.none(
        'UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['cancelled', id]
      );

      // Free up the time slot
      await t.none(
        'UPDATE time_slots SET is_booked = false WHERE id = $1',
        [booking.timeslot_id]
      );

      // Update payment status if needed
      await t.none(
        'UPDATE payments SET payment_status = $1 WHERE booking_id = $2',
        ['refunded', id]
      );
    });

    // Send cancellation email
    sendCancellationEmail({
      customerEmail: booking.customer_email,
      customerName: booking.customer_name,
      businessName: booking.business_name,
      serviceName: booking.service_name,
      startTime: booking.start_time
    });

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// PUT /api/bookings/:id/complete - Mark booking as completed (business only)
router.put('/:id/complete', authMiddleware, requireRole('business'), async (req, res) => {
  try {
    const { id } = req.params;

    // Verify booking belongs to user's business
    const booking = await db.oneOrNone(
      `SELECT b.* FROM bookings b
       JOIN businesses bus ON b.business_id = bus.id
       WHERE b.id = $1 AND bus.user_id = $2`,
      [id, req.user.id]
    );

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    await db.none(
      'UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['completed', id]
    );

    res.json({ message: 'Booking marked as completed' });
  } catch (error) {
    console.error('Complete booking error:', error);
    res.status(500).json({ error: 'Failed to complete booking' });
  }
});

module.exports = router;
