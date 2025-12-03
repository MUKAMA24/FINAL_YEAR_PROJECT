const express = require('express');
const db = require('../config/database');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// All admin routes require admin role
router.use(authMiddleware, requireRole('admin'));

// GET /api/admin/businesses - List all businesses
router.get('/businesses', async (req, res) => {
  try {
    const { is_approved, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT b.*, u.name as owner_name, u.email as owner_email, u.phone as owner_phone
      FROM businesses b
      JOIN users u ON b.user_id = u.id
    `;
    const params = [];

    if (is_approved !== undefined) {
      query += ` WHERE b.is_approved = $1`;
      params.push(is_approved === 'true');
    }

    query += ` ORDER BY b.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const businesses = await db.any(query, params);

    res.json({ businesses });
  } catch (error) {
    console.error('Admin get businesses error:', error);
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
});

// PUT /api/admin/businesses/:id - Approve or reject business
router.put('/businesses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_approved } = req.body;

    if (typeof is_approved !== 'boolean') {
      return res.status(400).json({ error: 'is_approved must be a boolean' });
    }

    const business = await db.oneOrNone(
      'SELECT id FROM businesses WHERE id = $1',
      [id]
    );

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    await db.none(
      'UPDATE businesses SET is_approved = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [is_approved, id]
    );

    res.json({
      message: is_approved ? 'Business approved successfully' : 'Business rejected'
    });
  } catch (error) {
    console.error('Admin update business error:', error);
    res.status(500).json({ error: 'Failed to update business' });
  }
});

// DELETE /api/admin/businesses/:id - Remove a business (does not delete owner account)
router.delete('/businesses/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const business = await db.oneOrNone('SELECT id FROM businesses WHERE id = $1', [id]);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    await db.none('DELETE FROM businesses WHERE id = $1', [id]);

    res.json({ message: 'Business removed successfully' });
  } catch (error) {
    console.error('Admin delete business error:', error);
    res.status(500).json({ error: 'Failed to remove business' });
  }
});

// GET /api/admin/stats - Get platform statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await db.one(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers,
        (SELECT COUNT(*) FROM users WHERE role = 'business') as total_businesses,
        (SELECT COUNT(*) FROM businesses WHERE is_approved = true) as approved_businesses,
        (SELECT COUNT(*) FROM bookings) as total_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status = 'completed') as completed_bookings,
        (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE status = 'completed') as total_revenue
    `);

    res.json({ stats });
  } catch (error) {
    console.error('Admin get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/admin/revenue-by-business - Revenue breakdown per business (completed bookings only)
router.get('/revenue-by-business', async (req, res) => {
  try {
    const rows = await db.any(
      `
      SELECT 
        bus.id AS business_id,
        bus.name AS business_name,
        COALESCE(SUM(b.total_price), 0) AS revenue,
        COUNT(b.id) AS completed_bookings
      FROM businesses bus
      LEFT JOIN bookings b 
        ON b.business_id = bus.id 
       AND b.status = 'completed'
      GROUP BY bus.id, bus.name
      ORDER BY revenue DESC, business_name ASC
      `
    );

    res.json({ revenue: rows });
  } catch (error) {
    console.error('Admin get revenue by business error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue breakdown' });
  }
});

// GET /api/admin/users - List all users
router.get('/users', async (req, res) => {
  try {
    const { role, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT id, name, email, role, phone, created_at FROM users';
    const params = [];

    if (role) {
      query += ' WHERE role = $1';
      params.push(role);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const users = await db.any(query, params);

    res.json({ users });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// DELETE /api/admin/users/:id - Remove a non-admin user (e.g. customer)
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting admin accounts
    const user = await db.oneOrNone('SELECT id, role FROM users WHERE id = $1', [id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ error: 'Cannot delete admin users' });
    }

    await db.none('DELETE FROM users WHERE id = $1', [id]);

    res.json({ message: 'User removed successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ error: 'Failed to remove user' });
  }
});

// GET /api/admin/bookings - List all bookings
router.get('/bookings', async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        b.id, b.status, b.total_price, b.created_at,
        u.name as customer_name, u.email as customer_email,
        bus.name as business_name,
        s.service_name,
        ts.start_time, ts.end_time
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      JOIN businesses bus ON b.business_id = bus.id
      JOIN services s ON b.service_id = s.id
      JOIN time_slots ts ON b.timeslot_id = ts.id
    `;
    const params = [];

    if (status) {
      query += ' WHERE b.status = $1';
      params.push(status);
    }

    query += ` ORDER BY b.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const bookings = await db.any(query, params);

    res.json({ bookings });
  } catch (error) {
    console.error('Admin get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

module.exports = router;
