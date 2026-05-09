const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const initDB = require('./db/schema');

// Initialize database and start server
initDB().then(() => {
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/restaurants', require('./routes/restaurants'));
  app.use('/api/dishes', require('./routes/dishes'));
  app.use('/api/menu', require('./routes/menu'));
  app.use('/api/reviews', require('./routes/reviews'));
  app.use('/api/favorites', require('./routes/favorites'));
  app.use('/api/health', require('./routes/health'));

  app.get('/api/health-check', (req, res) => {
    res.json({ status: 'Server running', timestamp: new Date() });
  });

  app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  });

  app.listen(PORT, () => {
    console.log(`🚀 PlatePal Backend running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
