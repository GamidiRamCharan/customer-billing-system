const Joi = require('joi');

/**
 * Validation middleware generator.
 * @param {Joi.ObjectSchema} schema - Joi schema to validate request body.
 * @returns {function(req, res, next)} Express middleware.
 */
module.exports = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((d) => d.message).join(', ');
    return res.status(400).json({ error: messages });
  }
  // Replace req.body with the validated (and possibly coerced) value
  req.body = value;
  next();
};
