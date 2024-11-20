const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT token
const authenticateJWT = (req, res, next) => {
  // Get token from the Authorization header
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'Access denied. No token provided.' });
  }

  // Use process.env.JWT_SECRET for better security
  const secretKey = process.env.JWT_SECRET;  // Ensure this is set in your environment variables

  if (!secretKey) {
    return res.status(500).json({ message: 'Server error: Missing JWT secret key.' });
  }

  // Verify the token using the secret key
  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token.' });
    }
    req.user = user;  // Store user info in the request object
    next();
  });
};

module.exports = authenticateJWT;
