const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Security / Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL
}));

// We need raw body parsing for Flow webhooks depending on how they send it, 
// but standard urlencoded is often what they send.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routing (placeholders for now until we write them)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/webhooks', require('./routes/webhooks'));
app.use('/api/dashboard/orders', require('./routes/dashboard/orders'));
app.use('/api/dashboard/menu', require('./routes/dashboard/menu'));
app.use('/api/dashboard/tables', require('./routes/dashboard/tables'));
app.use('/api/dashboard/stats', require('./routes/dashboard/stats'));

module.exports = app;
