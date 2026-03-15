const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Utility to fetch menu data
const fetchMenuData = async (slug) => {
  // 1. Get venue
  const venueRes = await db.query(
    'SELECT id, name, logo_url, address FROM venues WHERE slug = $1 AND active = true',
    [slug]
  );
  if (venueRes.rows.length === 0) return null;
  const venue = venueRes.rows[0];

  // 2. Get active categories ordered
  const catRes = await db.query(
    'SELECT id, name, display_order FROM menu_categories WHERE venue_id = $1 AND active = true ORDER BY display_order ASC',
    [venue.id]
  );
  const categories = catRes.rows;

  // 3. Get items for these categories
  const catIds = categories.map(c => c.id);
  
  if (catIds.length === 0) {
      return { venue, categories: [] };
  }

  // Parameterized IN clause parsing
  const idxVars = catIds.map((_, i) => `$${i + 2}`).join(',');

  const itemsRes = await db.query(
    `SELECT id, category_id, name, description, price, image_url, available 
     FROM menu_items 
     WHERE venue_id = $1 AND category_id IN (${idxVars})
     ORDER BY display_order ASC`,
    [venue.id, ...catIds]
  );
  
  const items = itemsRes.rows;

  // 4. Assemble
  const assembledCategories = categories.map(cat => ({
    ...cat,
    items: items.filter(item => item.category_id === cat.id).map(({category_id, ...itemProps}) => itemProps)
  }));

  return { venue, categories: assembledCategories };
};

// GET /api/menu/:venueSlug
router.get('/:venueSlug', async (req, res) => {
  try {
    const data = await fetchMenuData(req.params.venueSlug);
    if (!data) return res.status(404).json({ message: 'Local no encontrado o inactivo' });
    
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// GET /api/menu/:venueSlug/table/:tableId
router.get('/:venueSlug/table/:tableId', async (req, res) => {
  try {
    const data = await fetchMenuData(req.params.venueSlug);
    if (!data) return res.status(404).json({ message: 'Local no encontrado o inactivo' });

    // Validate table
    const tableRes = await db.query(
      'SELECT id, table_number FROM tables WHERE id = $1 AND venue_id = $2 AND active = true',
      [req.params.tableId, data.venue.id]
    );

    if (tableRes.rows.length === 0) {
      return res.status(404).json({ message: 'Mesa no válida' });
    }

    res.json({
      ...data,
      tableNumber: tableRes.rows[0].table_number
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
