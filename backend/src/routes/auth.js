const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const db = require('../config/db');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', [
  body('name').notEmpty().withMessage('El nombre es requerido'),
  body('slug').matches(/^[a-z0-9-]+$/).withMessage('Slug inválido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 8 }).withMessage('Mínimo 8 caracteres para la contraseña'),
  body('address').notEmpty().withMessage('La dirección es requerida')
], validate, async (req, res) => {
  const { name, slug, email, password, address } = req.body;

  try {
    // Check if email or slug exists
    const existing = await db.query(
      'SELECT id FROM venues WHERE email = $1 OR slug = $2',
      [email, slug]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Email o slug ya están en uso' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert
    const result = await db.query(
      `INSERT INTO venues (name, slug, owner_email, password_hash, address) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, slug, logo_url, address, plan, active`,
      [name, slug, email, passwordHash, address]
    );

    const venue = result.rows[0];

    // Generate token
    const token = jwt.sign({ id: venue.id, slug: venue.slug }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, venue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Contraseña es requerida')
], validate, async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query(
      'SELECT id, name, slug, owner_email, password_hash, logo_url, address, plan, active FROM venues WHERE owner_email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    const venue = result.rows[0];
    const { password_hash, ...venueData } = venue;

    const isMatch = await bcrypt.compare(password, password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    if (!venue.active) {
      return res.status(403).json({ message: 'Cuenta inactiva' });
    }

    const token = jwt.sign({ id: venue.id, slug: venue.slug }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, venue: venueData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, slug, owner_email as email, logo_url, address, plan, active FROM venues WHERE id = $1',
      [req.venue.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Local no encontrado' });
    }

    res.json({ venue: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
