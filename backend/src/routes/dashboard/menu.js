const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const auth = require('../../middleware/auth');

router.use(auth);

// GET /api/dashboard/menu
router.get('/', async (req, res) => {
  try {
    const venueId = req.venue.id;

    // Get categories
    const catRes = await db.query(
      'SELECT id, name, display_order, active FROM menu_categories WHERE venue_id = $1 ORDER BY display_order ASC',
      [venueId]
    );
    const categories = catRes.rows;

    const itemsRes = await db.query(
      'SELECT id, category_id, name, description, price, image_url, available, display_order FROM menu_items WHERE venue_id = $1 ORDER BY display_order ASC',
      [venueId]
    );
    const items = itemsRes.rows;

    const data = categories.map(cat => ({
      ...cat,
      items: items.filter(item => item.category_id === cat.id)
    }));

    res.json({ categories: data, unassignedItems: items.filter(item => !item.category_id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// POST /api/dashboard/menu/categories
router.post('/categories', async (req, res) => {
  try {
    const { name, display_order } = req.body;
    const result = await db.query(
      'INSERT INTO menu_categories (venue_id, name, display_order) VALUES ($1, $2, $3) RETURNING *',
      [req.venue.id, name, display_order || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// PUT /api/dashboard/menu/categories/:id
router.put('/categories/:id', async (req, res) => {
  try {
    const { name, display_order, active } = req.body;
    const result = await db.query(
      'UPDATE menu_categories SET name = $1, display_order = $2, active = $3 WHERE id = $4 AND venue_id = $5 RETURNING *',
      [name, display_order, active, req.params.id, req.venue.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// DELETE /api/dashboard/menu/categories/:id
router.delete('/categories/:id', async (req, res) => {
  try {
    // Check for items
    const itemsRes = await db.query(
      'SELECT id FROM menu_items WHERE category_id = $1 AND venue_id = $2',
      [req.params.id, req.venue.id]
    );
    if (itemsRes.rows.length > 0) {
      return res.status(400).json({ message: 'No se puede eliminar: tiene ítems' });
    }

    const result = await db.query(
      'DELETE FROM menu_categories WHERE id = $1 AND venue_id = $2 RETURNING id',
      [req.params.id, req.venue.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    
    res.json({ message: 'Categoría eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// POST /api/dashboard/menu/items
router.post('/items', async (req, res) => {
  try {
    const { categoryId, name, description, price, image_url } = req.body;
    
    // Check if category belongs to venue
    const catCheck = await db.query(
      'SELECT id FROM menu_categories WHERE id = $1 AND venue_id = $2',
      [categoryId, req.venue.id]
    );
    if (catCheck.rows.length === 0) return res.status(400).json({ message: 'Categoría inválida' });

    const result = await db.query(
      `INSERT INTO menu_items (venue_id, category_id, name, description, price, image_url) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.venue.id, categoryId, name, description, price, image_url || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// PUT /api/dashboard/menu/items/:id
router.put('/items/:id', async (req, res) => {
  try {
    const { name, description, price, image_url, available, display_order, categoryId } = req.body;
    const result = await db.query(
      `UPDATE menu_items 
       SET name = $1, description = $2, price = $3, image_url = $4, available = $5, display_order = $6, category_id = $7 
       WHERE id = $8 AND venue_id = $9 RETURNING *`,
      [name, description, price, image_url, available, display_order, categoryId, req.params.id, req.venue.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// PATCH /api/dashboard/menu/items/:id/toggle
router.patch('/items/:id/toggle', async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE menu_items SET available = NOT available WHERE id = $1 AND venue_id = $2 RETURNING *',
      [req.params.id, req.venue.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// DELETE /api/dashboard/menu/items/:id
router.delete('/items/:id', async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM menu_items WHERE id = $1 AND venue_id = $2 RETURNING id',
      [req.params.id, req.venue.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    
    res.json({ message: 'Ítem eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
