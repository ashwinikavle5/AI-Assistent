const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'speakwise_ai_super_secret_jwt_key_2025';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please log in to continue.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired session. Please log in again.'
      });
    }
    req.userId = user.id;
    req.userEmail = user.email;
    next();
  });
};

module.exports = {
  authenticateToken,
  JWT_SECRET
};
