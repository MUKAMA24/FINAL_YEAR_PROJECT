const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create payment intent
const createPaymentIntent = async (amount, currency = 'usd') => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency,
    });
    return paymentIntent;
  } catch (error) {
    throw new Error('Payment intent creation failed: ' + error.message);
  }
};

// Confirm payment
const confirmPayment = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    throw new Error('Payment confirmation failed: ' + error.message);
  }
};

// Create refund
const createRefund = async (paymentIntentId) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });
    return refund;
  } catch (error) {
    throw new Error('Refund creation failed: ' + error.message);
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  createRefund,
};
