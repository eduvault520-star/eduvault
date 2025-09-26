const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Socket.IO authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.userId = user._id.toString();
    socket.userRole = user.role;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};

// Initialize Socket.IO
const initializeSocket = (io) => {
  // Authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);
    
    // Join user to their personal room
    socket.join(`user_${socket.userId}`);
    
    // Join admin users to admin room
    if (['mini_admin', 'super_admin'].includes(socket.userRole)) {
      socket.join('admin_room');
    }

    // Handle user disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });

    // Handle joining course rooms
    socket.on('join_course', (courseId) => {
      socket.join(`course_${courseId}`);
      console.log(`User ${socket.userId} joined course ${courseId}`);
    });

    // Handle leaving course rooms
    socket.on('leave_course', (courseId) => {
      socket.leave(`course_${courseId}`);
      console.log(`User ${socket.userId} left course ${courseId}`);
    });

    // Handle real-time chat messages (for future implementation)
    socket.on('chat_message', (data) => {
      // Broadcast to course room
      socket.to(`course_${data.courseId}`).emit('new_message', {
        userId: socket.userId,
        message: data.message,
        timestamp: new Date().toISOString()
      });
    });
  });

  return io;
};

// Notification helper functions
const notificationService = {
  // Notify user about subscription status
  notifySubscriptionUpdate: (io, userId, subscriptionData) => {
    io.to(`user_${userId}`).emit('subscription_update', {
      type: 'subscription',
      data: subscriptionData,
      timestamp: new Date().toISOString()
    });
  },

  // Notify user about job unlock
  notifyJobUnlock: (io, userId, jobData) => {
    io.to(`user_${userId}`).emit('job_unlock', {
      type: 'job_unlock',
      data: jobData,
      timestamp: new Date().toISOString()
    });
  },

  // Notify admins about new resource uploads
  notifyAdminsNewResource: (io, resourceData) => {
    io.to('admin_room').emit('new_resource_pending', {
      type: 'resource_pending',
      data: resourceData,
      timestamp: new Date().toISOString()
    });
  },

  // Notify user about resource approval/rejection
  notifyResourceStatus: (io, userId, resourceData) => {
    io.to(`user_${userId}`).emit('resource_status_update', {
      type: 'resource_status',
      data: resourceData,
      timestamp: new Date().toISOString()
    });
  },

  // Notify course students about new resources
  notifyNewResourceAvailable: (io, courseId, resourceData) => {
    io.to(`course_${courseId}`).emit('new_resource_available', {
      type: 'new_resource',
      data: resourceData,
      timestamp: new Date().toISOString()
    });
  },

  // Notify about payment status updates
  notifyPaymentStatus: (io, userId, paymentData) => {
    io.to(`user_${userId}`).emit('payment_status_update', {
      type: 'payment_status',
      data: paymentData,
      timestamp: new Date().toISOString()
    });
  },

  // General notification
  sendNotification: (io, userId, notification) => {
    io.to(`user_${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  initializeSocket,
  notificationService
};
