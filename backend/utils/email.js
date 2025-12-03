const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send booking confirmation email
const sendBookingConfirmation = async (bookingDetails) => {
  const { customerEmail, customerName, businessName, serviceName, startTime, endTime } = bookingDetails;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: 'Booking Confirmation',
    html: `
      <h2>Booking Confirmed!</h2>
      <p>Dear ${customerName},</p>
      <p>Your appointment has been successfully booked.</p>
      <h3>Booking Details:</h3>
      <ul>
        <li><strong>Business:</strong> ${businessName}</li>
        <li><strong>Service:</strong> ${serviceName}</li>
        <li><strong>Date & Time:</strong> ${new Date(startTime).toLocaleString()} - ${new Date(endTime).toLocaleString()}</li>
      </ul>
      <p>If you need to cancel or reschedule, please log in to your account.</p>
      <p>Thank you for choosing our service!</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent to:', customerEmail);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Send booking reminder email
const sendBookingReminder = async (bookingDetails) => {
  const { customerEmail, customerName, businessName, serviceName, startTime } = bookingDetails;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: 'Appointment Reminder',
    html: `
      <h2>Appointment Reminder</h2>
      <p>Dear ${customerName},</p>
      <p>This is a reminder about your upcoming appointment.</p>
      <h3>Appointment Details:</h3>
      <ul>
        <li><strong>Business:</strong> ${businessName}</li>
        <li><strong>Service:</strong> ${serviceName}</li>
        <li><strong>Date & Time:</strong> ${new Date(startTime).toLocaleString()}</li>
      </ul>
      <p>We look forward to seeing you!</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Reminder email sent to:', customerEmail);
  } catch (error) {
    console.error('Error sending reminder email:', error);
  }
};

// Send cancellation email
const sendCancellationEmail = async (bookingDetails) => {
  const { customerEmail, customerName, businessName, serviceName, startTime } = bookingDetails;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: 'Booking Cancelled',
    html: `
      <h2>Booking Cancelled</h2>
      <p>Dear ${customerName},</p>
      <p>Your appointment has been cancelled as requested.</p>
      <h3>Cancelled Booking:</h3>
      <ul>
        <li><strong>Business:</strong> ${businessName}</li>
        <li><strong>Service:</strong> ${serviceName}</li>
        <li><strong>Was scheduled for:</strong> ${new Date(startTime).toLocaleString()}</li>
      </ul>
      <p>You can book a new appointment anytime through our platform.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Cancellation email sent to:', customerEmail);
  } catch (error) {
    console.error('Error sending cancellation email:', error);
  }
};

module.exports = {
  sendBookingConfirmation,
  sendBookingReminder,
  sendCancellationEmail
};
