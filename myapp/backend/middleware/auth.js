const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Middleware to verify JWT token
module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    logger.warn('No token provided');
    return res.status(401).json({ error: 'Access token missing' });
  }

  const secret = process.env.JWT_SECRET || 'mysecretkey';

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      logger.warn('Invalid token: ' + err.message);
      return res.status(403).json({ error: 'Invalid token' });
    }
    // Attach user info to request for downstream handlers
    req.user = decoded;
    next();
  });
};
