const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { verifyToken } = require('../middleware/auth');

router.get('/restaurant/:id', async (req, res) => {
  try {
    const reviews = await db.getAllRows(`
      SELECT rv.*, u.name as user_name
      FROM reviews rv
      JOIN users u ON rv.user_id = u.user_id
      WHERE rv.restaurant_id = ?
      ORDER BY rv.created_at DESC
    `, [req.params.id]);

    const avgRating = reviews.length
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => dist[r.rating]++);

    res.json({
      reviews,
      avgRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length,
      ratingDistribution: dist
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  const { restaurant_id, rating, comment } = req.body;
  if (!restaurant_id || !rating) return res.status(400).json({ error: 'restaurant_id and rating are required' });
  if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  if (comment && (comment.length < 10 || comment.length > 500))
    return res.status(400).json({ error: 'Comment must be between 10 and 500 characters' });

  try {
    const result = await db.executeSql(
      'INSERT INTO reviews (user_id, restaurant_id, rating, comment) VALUES (?, ?, ?, ?)',
      [req.userId, restaurant_id, rating, comment || '']
    );
    const review = await db.getRow(
      'SELECT rv.*, u.name as user_name FROM reviews rv JOIN users u ON rv.user_id = u.user_id WHERE rv.review_id = ?',
      [result.lastInsertRowid]
    );
    res.status(201).json(review);
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'You have already reviewed this restaurant' });
    res.status(500).json({ error: 'Failed to create review' });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  const { rating, comment } = req.body;
  try {
    const review = await db.getRow('SELECT * FROM reviews WHERE review_id = ?', [req.params.id]);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (review.user_id !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    await db.executeSql(
      'UPDATE reviews SET rating = ?, comment = ? WHERE review_id = ?',
      [rating ?? review.rating, comment ?? review.comment, req.params.id]
    );
    res.json(await db.getRow('SELECT * FROM reviews WHERE review_id = ?', [req.params.id]));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update review' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const review = await db.getRow('SELECT * FROM reviews WHERE review_id = ?', [req.params.id]);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (review.user_id !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    await db.executeSql('DELETE FROM reviews WHERE review_id = ?', [req.params.id]);
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

module.exports = router;
