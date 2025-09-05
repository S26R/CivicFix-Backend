// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

// A function to check if the user is authenticated
export const authenticateUser = (req, res, next) => {
  // Get the token from the header
  const token = req.header('civic-auth-token');
  // Check if token exists
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      role: decoded.role,
    }; // Add the user from the payload to the request object
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// A function to check if the user has the required role
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Check if the user's role is included in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: `User role ${req.user.role} is not authorized to access this route` });
    }
    next();
  };
};