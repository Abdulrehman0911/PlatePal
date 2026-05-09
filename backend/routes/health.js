const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, async (req, res) => {
  const { weight_kg, blood_pressure, blood_sugar, notes } = req.body;
  if (!weight_kg && !blood_pressure && !blood_sugar)
    return res.status(400).json({ error: 'At least one health metric is required' });
  if (weight_kg && weight_kg <= 0) return res.status(400).json({ error: 'Weight must be greater than 0' });
  if (blood_sugar && blood_sugar <= 0) return res.status(400).json({ error: 'Blood sugar must be greater than 0' });

  try {
    const result = await db.executeSql(
      'INSERT INTO health_logs (user_id, weight_kg, blood_pressure, blood_sugar, notes) VALUES (?, ?, ?, ?, ?)',
      [req.userId, weight_kg || null, blood_pressure || null, blood_sugar || null, notes || null]
    );
    res.status(201).json(await db.getRow('SELECT * FROM health_logs WHERE log_id = ?', [result.lastInsertRowid]));
  } catch (err) {
    res.status(500).json({ error: 'Failed to log health data' });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const logs = await db.getAllRows('SELECT * FROM health_logs WHERE user_id = ? ORDER BY logged_at DESC', [req.userId]);
    const weightLogs = logs.filter(l => l.weight_kg);
    const sugarLogs = logs.filter(l => l.blood_sugar);

    const stats = {
      latest: logs[0] || null,
      min_weight: weightLogs.length ? Math.min(...weightLogs.map(l => l.weight_kg)) : null,
      max_weight: weightLogs.length ? Math.max(...weightLogs.map(l => l.weight_kg)) : null,
      avg_weight: weightLogs.length
        ? Math.round(weightLogs.reduce((s, l) => s + l.weight_kg, 0) / weightLogs.length * 10) / 10 : null,
      avg_blood_sugar: sugarLogs.length
        ? Math.round(sugarLogs.reduce((s, l) => s + l.blood_sugar, 0) / sugarLogs.length) : null,
      trends: (() => {
        if (weightLogs.length < 2) return 'Not enough data';
        const diff = weightLogs[0].weight_kg - weightLogs[weightLogs.length - 1].weight_kg;
        return diff > 0 ? 'Weight trending down' : diff < 0 ? 'Weight trending up' : 'Weight stable';
      })()
    };

    res.json({ logs, stats });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  const { weight_kg, blood_pressure, blood_sugar, notes } = req.body;
  try {
    const log = await db.getRow('SELECT * FROM health_logs WHERE log_id = ?', [req.params.id]);
    if (!log) return res.status(404).json({ error: 'Log not found' });
    if (log.user_id !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    await db.executeSql(
      'UPDATE health_logs SET weight_kg = ?, blood_pressure = ?, blood_sugar = ?, notes = ? WHERE log_id = ?',
      [weight_kg ?? log.weight_kg, blood_pressure ?? log.blood_pressure, blood_sugar ?? log.blood_sugar, notes ?? log.notes, req.params.id]
    );
    res.json(await db.getRow('SELECT * FROM health_logs WHERE log_id = ?', [req.params.id]));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update log' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const log = await db.getRow('SELECT * FROM health_logs WHERE log_id = ?', [req.params.id]);
    if (!log) return res.status(404).json({ error: 'Log not found' });
    if (log.user_id !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    await db.executeSql('DELETE FROM health_logs WHERE log_id = ?', [req.params.id]);
    res.json({ message: 'Health log deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete log' });
  }
});

module.exports = router;
