const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const auth = require('../../middleware/auth');

router.use(auth);

// GET /api/dashboard/stats
router.get('/', async (req, res) => {
  try {
    const venueId = req.venue.id;

    // 1. Orders today (not cancelled)
    const ordersRes = await db.query(
      `SELECT COUNT(*) as count, SUM(total) as revenue 
       FROM orders 
       WHERE venue_id = $1 AND DATE(created_at) = CURRENT_DATE AND status != 'cancelled'`,
      [venueId]
    );
    
    const ordersToday = parseInt(ordersRes.rows[0].count, 10) || 0;
    const revenueToday = parseInt(ordersRes.rows[0].revenue, 10) || 0;
    const avgTicket = ordersToday > 0 ? Math.round(revenueToday / ordersToday) : 0;

    // 2. Top items (last 7 days)
    const topItemsRes = await db.query(
      `SELECT oi.item_name as name, SUM(oi.quantity) as quantity
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.venue_id = $1 
         AND o.status != 'cancelled'
         AND o.created_at >= NOW() - INTERVAL '7 days'
       GROUP BY oi.item_name
       ORDER BY quantity DESC
       LIMIT 5`,
      [venueId]
    );

    // 3. Orders by hour today (0-23)
    const hoursRes = await db.query(
      `SELECT EXTRACT(HOUR FROM created_at) as hour, COUNT(*) as count
       FROM orders
       WHERE venue_id = $1 
         AND DATE(created_at) = CURRENT_DATE 
         AND status != 'cancelled'
       GROUP BY hour
       ORDER BY hour ASC`,
      [venueId]
    );

    const ordersByHour = [];
    // Initialize 24 hours
    for (let i = 0; i < 24; i++) {
      ordersByHour.push({ hour: i, count: 0 });
    }
    
    // Populate with data
    hoursRes.rows.forEach(row => {
      const h = parseInt(row.hour, 10);
      const idx = ordersByHour.findIndex(o => o.hour === h);
      if (idx !== -1) {
        ordersByHour[idx].count = parseInt(row.count, 10);
      }
    });

    res.json({
      ordersToday,
      revenueToday,
      avgTicket,
      topItems: topItemsRes.rows.map(t => ({ name: t.name, quantity: parseInt(t.quantity, 10) })),
      ordersByHour
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
