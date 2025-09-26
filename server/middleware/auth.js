const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get full user details from database to ensure we have current role
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          message: `Access denied. Required role: ${roles.join(' or ')}, your role: ${req.user.role}` 
        });
      }

      next();
    } catch (error) {
      console.error('Authorization middleware error:', error);
      res.status(500).json({ message: 'Server error in authorization' });
    }
  };
};

// Check subscription middleware
const checkSubscription = async (req, res, next) => {
  try {
    // For now, just pass through - we'll implement proper subscription checking later
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error checking subscription' });
  }
};

module.exports = { auth, authorize, checkSubscription };
