const logger = require('../utils/logger');

// Global error handling middleware
module.exports = (err, req, res, next) => {
  // Log the error details
  logger.error('Error: %s', err.message, { stack: err.stack, path: req.path, method: req.method });

  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({ error: message, code: status });
};
