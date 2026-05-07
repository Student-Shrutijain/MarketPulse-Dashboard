const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'marketpulse_jwt_secret';

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.warn('Auth failed: No token provided for', req.originalUrl);
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Auth failed: Invalid token for', req.originalUrl, err.message);
    res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = authMiddleware;
