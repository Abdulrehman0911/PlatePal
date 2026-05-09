const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'platepal-super-secret-jwt-key-2024';

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { verifyToken };
