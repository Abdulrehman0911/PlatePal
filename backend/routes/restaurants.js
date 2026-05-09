const express = require('express');
const router = express.Router();
const db = require('../utils/db');

router.get('/', async (req, res) => {
  try {
    const rows = await db.getAllRows(`
      SELECT r.*, ROUND(AVG(rv.rating), 1) as avg_rating, COUNT(rv.review_id) as review_count
      FROM restaurants r
      LEFT JOIN reviews rv ON r.restaurant_id = rv.restaurant_id
      GROUP BY r.restaurant_id
      ORDER BY avg_rating DESC, r.name ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/search', async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'Search query required' });
  try {
    const term = `%${query}%`;
    const rows = await db.getAllRows(`
      SELECT r.*, ROUND(AVG(rv.rating), 1) as avg_rating, COUNT(rv.review_id) as review_count
      FROM restaurants r
      LEFT JOIN reviews rv ON r.restaurant_id = rv.restaurant_id
      WHERE r.name LIKE ? OR r.cuisine_type LIKE ?
      GROUP BY r.restaurant_id
      ORDER BY avg_rating DESC
    `, [term, term]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/cuisine/:type', async (req, res) => {
  try {
    const rows = await db.getAllRows(`
      SELECT r.*, ROUND(AVG(rv.rating), 1) as avg_rating, COUNT(rv.review_id) as review_count
      FROM restaurants r
      LEFT JOIN reviews rv ON r.restaurant_id = rv.restaurant_id
      WHERE r.cuisine_type = ?
      GROUP BY r.restaurant_id
      ORDER BY avg_rating DESC
    `, [req.params.type]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await db.getRow(`
      SELECT r.*, ROUND(AVG(rv.rating), 1) as avg_rating, COUNT(rv.review_id) as review_count
      FROM restaurants r
      LEFT JOIN reviews rv ON r.restaurant_id = rv.restaurant_id
      WHERE r.restaurant_id = ?
      GROUP BY r.restaurant_id
    `, [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Restaurant not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
