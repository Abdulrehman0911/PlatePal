const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  try {
    const rows = await db.getAllRows(`
      SELECT r.*, ROUND(AVG(rv.rating), 1) as avg_rating, COUNT(rv.review_id) as review_count, f.saved_at
      FROM restaurants r
      JOIN favorites f ON r.restaurant_id = f.restaurant_id
      LEFT JOIN reviews rv ON r.restaurant_id = rv.restaurant_id
      WHERE f.user_id = ?
      GROUP BY r.restaurant_id
      ORDER BY f.saved_at DESC
    `, [req.userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/:restaurantId', verifyToken, async (req, res) => {
  try {
    const result = await db.executeSql('INSERT OR IGNORE INTO favorites (user_id, restaurant_id) VALUES (?, ?)', [req.userId, req.params.restaurantId]);
    if (result.changes === 0) return res.status(400).json({ error: 'Already in favorites' });
    res.status(201).json({ message: 'Added to favorites' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

router.delete('/:restaurantId', verifyToken, async (req, res) => {
  try {
    const result = await db.executeSql('DELETE FROM favorites WHERE user_id = ? AND restaurant_id = ?', [req.userId, req.params.restaurantId]);
    if (result.changes === 0) return res.status(404).json({ error: 'Not in favorites' });
    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

router.get('/check/:restaurantId', verifyToken, async (req, res) => {
  try {
    const row = await db.getRow('SELECT * FROM favorites WHERE user_id = ? AND restaurant_id = ?', [req.userId, req.params.restaurantId]);
    res.json({ is_favorited: !!row });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
