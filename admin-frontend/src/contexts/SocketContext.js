import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    if (isAuthenticated && token) {
      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_BACKEND_URL, {
        auth: {
          token: token
        },
        autoConnect: true
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      // Listen for various notification types
      newSocket.on('subscription_update', (data) => {
        addNotification({
          id: Date.now(),
          type: 'subscription',
          title: 'Subscription Update',
          message: data.data.message,
          timestamp: data.timestamp,
          data: data.data
        });
      });

      newSocket.on('job_unlock', (data) => {
        addNotification({
          id: Date.now(),
          type: 'job_unlock',
          title: 'Job Unlocked',
          message: `You've successfully unlocked a new job opportunity!`,
          timestamp: data.timestamp,
          data: data.data
        });
      });

      newSocket.on('resource_status_update', (data) => {
        addNotification({
          id: Date.now(),
          type: 'resource_status',
          title: 'Resource Update',
          message: `Your resource has been ${data.data.status}`,
          timestamp: data.timestamp,
          data: data.data
        });
      });

      newSocket.on('new_resource_available', (data) => {
        addNotification({
          id: Date.now(),
          type: 'new_resource',
          title: 'New Resource Available',
          message: `New ${data.data.type} available for ${data.data.unitName}`,
          timestamp: data.timestamp,
          data: data.data
        });
      });

      newSocket.on('payment_status_update', (data) => {
        addNotification({
          id: Date.now(),
          type: 'payment_status',
          title: 'Payment Update',
          message: data.data.message,
          timestamp: data.timestamp,
          data: data.data
        });
      });

      newSocket.on('notification', (data) => {
        addNotification({
          id: Date.now(),
          ...data
        });
      });

      // Admin-specific notifications
      newSocket.on('new_resource_pending', (data) => {
        addNotification({
          id: Date.now(),
          type: 'admin_resource_pending',
          title: 'New Resource Pending Approval',
          message: `${data.data.title} requires approval`,
          timestamp: data.timestamp,
          data: data.data
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      // Disconnect socket if not authenticated
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, token]);

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50 notifications
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico', // Use favicon instead of logo192.png
        tag: notification.type
      });
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const joinCourseRoom = (courseId) => {
    if (socket) {
      socket.emit('join_course', courseId);
    }
  };

  const leaveCourseRoom = (courseId) => {
    if (socket) {
      socket.emit('leave_course', courseId);
    }
  };

  const sendChatMessage = (courseId, message) => {
    if (socket) {
      socket.emit('chat_message', { courseId, message });
    }
  };

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const value = {
    socket,
    isConnected,
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    addNotification,
    removeNotification,
    clearAllNotifications,
    markAsRead,
    joinCourseRoom,
    leaveCourseRoom,
    sendChatMessage
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
