const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const db = require('../config/db');
const validate = require('../middleware/validate');
const flowService = require('../services/flow');

// POST /api/orders
router.post('/', [
  body('venueSlug').notEmpty().withMessage('Slug de local requerido'),
  body('tableId').isUUID().withMessage('ID de mesa inválido'),
  body('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un item'),
  body('items.*.menuItemId').isUUID().withMessage('ID de item inválido'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Cantidad debe ser al menos 1')
], validate, async (req, res) => {
  const { venueSlug, tableId, items } = req.body;
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    // 1. Get venue
    const venueRes = await client.query(
      'SELECT id, name, slug FROM venues WHERE slug = $1 AND active = true',
      [venueSlug]
    );
    if (venueRes.rows.length === 0) throw new Error('Local no válido');
    const venue = venueRes.rows[0];

    // 2. Get table
    const tableRes = await client.query(
      'SELECT id, table_number FROM tables WHERE id = $1 AND venue_id = $2 AND active = true',
      [tableId, venue.id]
    );
    if (tableRes.rows.length === 0) throw new Error('Mesa no válida');
    const table = tableRes.rows[0];

    // 3. Process items and calculate total securely
    let total = 0;
    const orderItemsData = [];

    for (const item of items) {
      const dbItemRes = await client.query(
        'SELECT id, name, price, available FROM menu_items WHERE id = $1 AND venue_id = $2',
        [item.menuItemId, venue.id]
      );
      
      if (dbItemRes.rows.length === 0 || !dbItemRes.rows[0].available) {
        throw new Error('Un item seleccionado no está disponible');
      }

      const dbItem = dbItemRes.rows[0];
      const subtotal = dbItem.price * item.quantity;
      total += subtotal;

      orderItemsData.push({
        id: dbItem.id,
        name: dbItem.name,
        qty: item.quantity,
        price: dbItem.price,
        subtotal,
        notes: item.notes || ''
      });
    }

    // 4. Create Order record
    const orderRes = await client.query(
      `INSERT INTO orders (venue_id, table_id, table_number, total)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [venue.id, table.id, table.table_number, total]
    );
    const order = orderRes.rows[0];

    // 5. Create Order Items
    for (const oi of orderItemsData) {
      await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, unit_price, subtotal, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [order.id, oi.id, oi.name, oi.qty, oi.price, oi.subtotal, oi.notes]
      );
    }

    // 6. Integrate with Flow.cl
    const flowPayment = await flowService.createPayment({ id: order.id, total }, venue);

    // Save flow token to DB
    await client.query(
      'UPDATE orders SET flow_token = $1 WHERE id = $2',
      [flowPayment.token, order.id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      orderId: order.id,
      total,
      paymentUrl: flowPayment.paymentUrl
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(400).json({ message: err.message || 'Error al procesar el pedido' });
  } finally {
    client.release();
  }
});

// GET /api/orders/:orderId/status
router.get('/:orderId/status', async (req, res) => {
  try {
    const orderRes = await db.query(
      'SELECT id, status, table_number, total FROM orders WHERE id = $1',
      [req.params.orderId]
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    const order = orderRes.rows[0];

    const itemsRes = await db.query(
      'SELECT item_name, quantity, subtotal, notes FROM order_items WHERE order_id = $1',
      [order.id]
    );

    res.json({
      orderId: order.id,
      status: order.status,
      tableNumber: order.table_number,
      total: order.total,
      items: itemsRes.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
