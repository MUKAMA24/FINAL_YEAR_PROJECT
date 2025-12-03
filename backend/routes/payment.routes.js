const express = require('express');
const router = express.Router();
const { createPaymentIntent, confirmPayment } = require('../utils/payment');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth.middleware');
const { sendBookingConfirmation } = require('../utils/email');

// Initialize payment for a booking (Create Payment Intent)
router.post('/initialize', authMiddleware, async (req, res) => {
  try {
    const { booking_id } = req.body;

    // Get booking details
    const booking = await db.one(
      `SELECT b.*, s.name as service_name, s.price, u.email, u.name as customer_name,
              bus.name as business_name
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN users u ON b.customer_id = u.id
       JOIN businesses bus ON b.business_id = bus.id
       WHERE b.id = $1 AND b.customer_id = $2`,
      [booking_id, req.user.id]
    );

    // Create Stripe Payment Intent
    const paymentIntent = await createPaymentIntent(
      booking.price,
      'usd' // Default currency, could be dynamic
    );

    // Update booking with payment intent ID (temporarily store in payment_reference)
    await db.none(
      'UPDATE bookings SET payment_reference = $1 WHERE id = $2',
      [paymentIntent.id, booking_id]
    );

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook to handle Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;

    try {
      // Find booking by payment intent ID
      const booking = await db.oneOrNone(
        'SELECT * FROM bookings WHERE payment_reference = $1',
        [paymentIntent.id]
      );

      if (booking) {
        // Update payment record
        await db.none(
          `INSERT INTO payments (booking_id, amount, currency, status, payment_method, transaction_id, paid_at)
                 VALUES ($1, $2, $3, 'completed', 'stripe', $4, NOW())
                 ON CONFLICT (booking_id) DO UPDATE
                 SET status = 'completed', transaction_id = $4, paid_at = NOW()`,
          [booking.id, paymentIntent.amount / 100, paymentIntent.currency, paymentIntent.id]
        );

        // Update booking status
        await db.none(
          'UPDATE bookings SET status = $1 WHERE id = $2',
          ['confirmed', booking.id]
        );

        // Send confirmation email
        // Fetch full booking details for email
        const fullBooking = await db.one(
          `SELECT b.*, s.name as service_name, s.price, u.email, u.name as customer_name,
                        bus.name as business_name
                 FROM bookings b
                 JOIN services s ON b.service_id = s.id
                 JOIN users u ON b.customer_id = u.id
                 JOIN businesses bus ON b.business_id = bus.id
                 WHERE b.id = $1`,
          [booking.id]
        );

        try {
          await sendBookingConfirmation(fullBooking);
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
        }
      }
    } catch (err) {
      console.error('Error processing webhook:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  res.json({ received: true });
});

module.exports = router;
