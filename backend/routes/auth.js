const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../utils/db');
const { verifyToken } = require('../middleware/auth');

const SECRET = process.env.JWT_SECRET || 'platepal-super-secret-jwt-key-2024';

router.post('/signup', async (req, res) => {
  const { name, email, password, city } = req.body;

  if (!name || !email || !password || !city)
    return res.status(400).json({ error: 'All fields are required' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Invalid email format' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });

  try {
    const existing = await db.getRow('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = await db.executeSql('INSERT INTO users (name, email, password, city) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, city]);
    const token = jwt.sign({ userId: result.lastInsertRowid, email }, SECRET, { expiresIn: '7d' });
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { user_id: result.lastInsertRowid, name, email, city }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  try {
    const user = await db.getRow('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ userId: user.user_id, email: user.email }, SECRET, { expiresIn: '7d' });
    res.json({
      message: 'Login successful',
      token,
      user: { user_id: user.user_id, name: user.name, email: user.email, city: user.city }
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await db.getRow('SELECT user_id, name, email, city, created_at FROM users WHERE user_id = ?', [req.userId]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
