const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const auth = require('../../middleware/auth');
const qrService = require('../../services/qr');

router.use(auth);

// GET /api/dashboard/tables
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, table_number, qr_code_url, active FROM tables WHERE venue_id = $1 ORDER BY table_number ASC',
      [req.venue.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// POST /api/dashboard/tables
router.post('/', async (req, res) => {
  try {
    const { tableNumber } = req.body;
    
    // Create record first to get UUID
    const insertRes = await db.query(
      'INSERT INTO tables (venue_id, table_number) VALUES ($1, $2) RETURNING id, table_number',
      [req.venue.id, tableNumber]
    );
    
    const tableId = insertRes.rows[0].id;
    const qrDataUrl = await qrService.generateTableQR(req.venue.slug, tableId);
    
    // Update record with QR
    const updateRes = await db.query(
      'UPDATE tables SET qr_code_url = $1 WHERE id = $2 RETURNING *',
      [qrDataUrl, tableId]
    );

    res.status(201).json(updateRes.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // Unique violation
      return res.status(400).json({ message: 'El número de mesa ya existe' });
    }
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// POST /api/dashboard/tables/bulk
router.post('/bulk', async (req, res) => {
  try {
    const count = parseInt(req.body.count, 10);
    if (!count || count < 1 || count > 50) {
      return res.status(400).json({ message: 'Cantidad debe ser entre 1 y 50' });
    }

    // Determine starting table number
    const maxRes = await db.query(
      'SELECT MAX(table_number) as max_num FROM tables WHERE venue_id = $1',
      [req.venue.id]
    );
    let startNum = (maxRes.rows[0].max_num || 0) + 1;
    
    const createdTables = [];

    for (let i = 0; i < count; i++) {
        const tableNumber = startNum + i;
        
        const insertRes = await db.query(
          'INSERT INTO tables (venue_id, table_number) VALUES ($1, $2) RETURNING id',
          [req.venue.id, tableNumber]
        );
        const tableId = insertRes.rows[0].id;
        
        const qrDataUrl = await qrService.generateTableQR(req.venue.slug, tableId);
        
        const updateRes = await db.query(
          'UPDATE tables SET qr_code_url = $1 WHERE id = $2 RETURNING *',
          [qrDataUrl, tableId]
        );
        
        createdTables.push(updateRes.rows[0]);
    }

    res.status(201).json(createdTables);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// DELETE /api/dashboard/tables/:id
router.delete('/:id', async (req, res) => {
  try {
    // Prevent deletion if there are active non-cancelled/delivered orders? 
    // Opting for simple delete right now via cascade for MVP unless specified.
    const result = await db.query(
      'DELETE FROM tables WHERE id = $1 AND venue_id = $2 RETURNING id',
      [req.params.id, req.venue.id]
    );
    
    if (result.rows.length === 0) return res.status(404).json({ message: 'Mesa no encontrada' });
    
    res.json({ message: 'Mesa eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
