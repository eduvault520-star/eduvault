import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Notifications,
  NotificationsNone,
  School,
  Work,
  Payment,
  CheckCircle,
  Info,
  Warning,
  Error,
  Clear,
  MarkEmailRead,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useSocket } from '../../contexts/SocketContext';

const NotificationCenter = () => {
  const theme = useTheme();
  const { notifications, unreadCount, markAsRead, removeNotification, clearAllNotifications } = useSocket();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'subscription':
        return <CheckCircle color="success" />;
      case 'job_unlock':
        return <Work color="primary" />;
      case 'new_resource':
        return <School color="info" />;
      case 'payment_status':
        return <Payment color="warning" />;
      case 'resource_status':
        return <Info color="info" />;
      case 'admin_resource_pending':
        return <Warning color="warning" />;
      default:
        return <Info color="info" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'subscription':
        return theme.palette.success.main;
      case 'job_unlock':
        return theme.palette.primary.main;
      case 'new_resource':
        return theme.palette.info.main;
      case 'payment_status':
        return theme.palette.warning.main;
      case 'resource_status':
        return theme.palette.info.main;
      case 'admin_resource_pending':
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Handle navigation based on notification type
    switch (notification.type) {
      case 'job_unlock':
        // Navigate to jobs page
        window.location.href = '/jobs';
        break;
      case 'new_resource':
        // Navigate to resources page
        window.location.href = '/resources';
        break;
      case 'subscription':
        // Navigate to profile page
        window.location.href = '/profile';
        break;
      case 'admin_resource_pending':
        // Navigate to admin dashboard
        window.location.href = '/admin';
        break;
      default:
        break;
    }
    
    handleClose();
  };

  const formatTimestamp = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'Just now';
    }
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{
          position: 'relative',
          '&:hover': {
            backgroundColor: alpha(theme.palette.common.white, 0.1),
          },
        }}
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          {unreadCount > 0 ? <Notifications /> : <NotificationsNone />}
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
            mt: 1,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Notifications
              {unreadCount > 0 && (
                <Chip
                  label={unreadCount}
                  size="small"
                  color="error"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
            {notifications.length > 0 && (
              <Box>
                <IconButton
                  size="small"
                  onClick={() => {
                    notifications.forEach(n => {
                      if (!n.read) markAsRead(n.id);
                    });
                  }}
                  title="Mark all as read"
                >
                  <MarkEmailRead fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={clearAllNotifications}
                  title="Clear all"
                >
                  <Clear fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>
        </Box>

        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <NotificationsNone sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, maxHeight: 350, overflow: 'auto' }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  button
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    backgroundColor: notification.read 
                      ? 'transparent' 
                      : alpha(getNotificationColor(notification.type), 0.1),
                    borderLeft: `4px solid ${getNotificationColor(notification.type)}`,
                    '&:hover': {
                      backgroundColor: alpha(getNotificationColor(notification.type), 0.15),
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: notification.read ? 400 : 600,
                            flex: 1,
                          }}
                        >
                          {notification.title}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          sx={{ ml: 1 }}
                        >
                          <Clear fontSize="small" />
                        </IconButton>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontWeight: notification.read ? 400 : 500,
                            mb: 0.5,
                          }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimestamp(notification.timestamp)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}

        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1 }}>
              <Button
                fullWidth
                size="small"
                onClick={() => {
                  // Navigate to a full notifications page if implemented
                  handleClose();
                }}
              >
                View All Notifications
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationCenter;
