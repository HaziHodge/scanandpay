const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const auth = require('../../middleware/auth');
const socketConfig = require('../../config/socket');

// Apply auth to all dashboard endpoints
router.use(auth);

// GET /api/dashboard/orders
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT id, status, table_number, total, created_at, updated_at 
      FROM orders 
      WHERE venue_id = $1 AND DATE(created_at) = CURRENT_DATE 
    `;
    const params = [req.venue.id];

    if (status) {
      query += ` AND status = $2 ORDER BY created_at DESC`;
      params.push(status);
    } else {
      query += ` AND status != 'cancelled' ORDER BY created_at DESC`;
    }

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// GET /api/dashboard/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const orderRes = await db.query(
      'SELECT id, status, table_number, total, created_at, updated_at FROM orders WHERE id = $1 AND venue_id = $2',
      [req.params.id, req.venue.id]
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    const order = orderRes.rows[0];

    const itemsRes = await db.query(
      'SELECT item_name, quantity, unit_price, subtotal, notes FROM order_items WHERE order_id = $1',
      [order.id]
    );

    res.json({ ...order, items: itemsRes.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// PATCH /api/dashboard/orders/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;
    const venueId = req.venue.id;

    // Allowed logic handled via UI and simple text check here
    const validStatuses = ['pending', 'paid', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    const result = await db.query(
      `UPDATE orders SET status = $1, updated_at = NOW() 
       WHERE id = $2 AND venue_id = $3 RETURNING id, status`,
      [status, orderId, venueId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    const order = result.rows[0];

    try {
      // Emit socket update
      const io = socketConfig.getIO();
      io.to(`venue_${venueId}`).emit('order_updated', {
        orderId: order.id,
        status: order.status
      });
    } catch(err) {
      console.log('Socket error, continuing', err);
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
