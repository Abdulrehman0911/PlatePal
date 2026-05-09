const express = require('express');
const router = express.Router();
const db = require('../utils/db');

router.get('/', async (req, res) => {
  try {
    const rows = await db.getAllRows('SELECT * FROM dishes ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/search', async (req, res) => {
  const { calories_min = 0, calories_max = 9999 } = req.query;
  try {
    const rows = await db.getAllRows(`
      SELECT d.*, n.calories, n.protein_g, n.carbs_g, n.fat_g, n.fiber_g,
             rm.price, r.name as restaurant_name, r.restaurant_id
      FROM dishes d
      JOIN nutrition n ON d.dish_id = n.dish_id
      JOIN restaurant_menu rm ON d.dish_id = rm.dish_id
      JOIN restaurants r ON rm.restaurant_id = r.restaurant_id
      WHERE n.calories BETWEEN ? AND ?
      ORDER BY n.calories ASC
    `, [calories_min, calories_max]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const dish = await db.getRow(`
      SELECT d.*, n.calories, n.protein_g, n.carbs_g, n.fat_g, n.fiber_g
      FROM dishes d
      LEFT JOIN nutrition n ON d.dish_id = n.dish_id
      WHERE d.dish_id = ?
    `, [req.params.id]);
    if (!dish) return res.status(404).json({ error: 'Dish not found' });

    const restaurants = await db.getAllRows(`
      SELECT r.restaurant_id, r.name as restaurant_name, r.city, rm.price
      FROM restaurant_menu rm
      JOIN restaurants r ON rm.restaurant_id = r.restaurant_id
      WHERE rm.dish_id = ?
    `, [req.params.id]);

    res.json({ ...dish, restaurants });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
