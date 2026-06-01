const jwt = require('jsonwebtoken');

const signToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'mysecretkey';
  const options = { expiresIn: '1d' };
  return jwt.sign(payload, secret, options);
};

const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'mysecretkey';
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
};

module.exports = { signToken, verifyToken };
