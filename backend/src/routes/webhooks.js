const express = require('express');
const router = express.Router();
const db = require('../config/db');
const flowService = require('../services/flow');
const socketConfig = require('../config/socket');

// POST /api/webhooks/flow
router.post('/flow', async (req, res) => {
  try {
    // Flow sends standard form-urlencoded x-www-form body parameters
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).send('No token provided');
    }

    // Call Flow to check status securely
    const paymentStatus = await flowService.getPaymentStatus(token);
    
    // Status 1 means paid
    if (paymentStatus.status === 1) {
      const orderId = paymentStatus.commerceOrder;
      
      // Update order
      const updateRes = await db.query(
        `UPDATE orders SET status = 'paid', flow_order_id = $1, updated_at = NOW() 
         WHERE id = $2 AND status = 'pending' RETURNING *`,
        [paymentStatus.flowOrder.toString(), orderId]
      );

      if (updateRes.rows.length > 0) {
        const order = updateRes.rows[0];
        
        // Fetch items for Socket emission
        const itemsRes = await db.query(
          'SELECT item_name, quantity, subtotal, notes FROM order_items WHERE order_id = $1',
          [order.id]
        );

        const io = socketConfig.getIO();
        
        io.to(`venue_${order.venue_id}`).emit('new_order', {
          id: order.id,
          table_number: order.table_number,
          status: order.status,
          total: order.total,
          created_at: order.created_at,
          items: itemsRes.rows
        });
      }
    }

    // Always respond 200 OK so Flow.cl considers webhook received
    res.status(200).send('OK');
  } catch (err) {
    console.error('Flow Webhook Error:', err);
    // Best practice is to return 200 anyway so Flow stops retrying unless we want them to. Let's return 200 to prevent retry loop.
    res.status(200).send('OK');
  }
});

module.exports = router;
