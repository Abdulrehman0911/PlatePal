const express = require('express');
const router = express.Router();
const db = require('../utils/db');

router.get('/:restaurantId', async (req, res) => {
  const { price_min, price_max } = req.query;
  try {
    let rows;
    if (price_min !== undefined && price_max !== undefined) {
      rows = await db.getAllRows(`
        SELECT d.*, n.calories, n.protein_g, n.carbs_g, n.fat_g, n.fiber_g, rm.price
        FROM dishes d
        JOIN nutrition n ON d.dish_id = n.dish_id
        JOIN restaurant_menu rm ON d.dish_id = rm.dish_id
        WHERE rm.restaurant_id = ? AND rm.price BETWEEN ? AND ?
        ORDER BY rm.price ASC
      `, [req.params.restaurantId, price_min, price_max]);
    } else {
      rows = await db.getAllRows(`
        SELECT d.*, n.calories, n.protein_g, n.carbs_g, n.fat_g, n.fiber_g, rm.price
        FROM dishes d
        JOIN nutrition n ON d.dish_id = n.dish_id
        JOIN restaurant_menu rm ON d.dish_id = rm.dish_id
        WHERE rm.restaurant_id = ?
        ORDER BY d.category, d.name
      `, [req.params.restaurantId]);
    }

    const grouped = {};
    rows.forEach(row => {
      if (!grouped[row.category]) grouped[row.category] = [];
      grouped[row.category].push(row);
    });

    res.json({ items: rows, grouped });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
