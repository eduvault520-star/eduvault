import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  School,
  Work,
  Dashboard,
  Logout,
  Home,
  Person,
  Analytics,
  Security,
  SupervisorAccount,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationCenter from '../Notifications/NotificationCenter';

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, hasAnyRole } = useAuth();

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navigationItems = [
    { label: 'Dashboard', path: '/super-admin', icon: <Dashboard />, auth: true, roles: ['super_admin'] },
    { label: 'Institutions', path: '/super-admin#institutions', icon: <School />, auth: true, roles: ['super_admin'] },
    { label: 'User Management', path: '/super-admin#user-management', icon: <SupervisorAccount />, auth: true, roles: ['super_admin'] },
    { label: 'Financial Analytics', path: '/super-admin#financial', icon: <Analytics />, auth: true, roles: ['super_admin'] },
    { label: 'System Health', path: '/super-admin#system-health', icon: <Security />, auth: true, roles: ['super_admin'] },
  ];

  const handleTabNavigation = (path) => {
    if (path.includes('#')) {
      // Handle tab navigation within super admin dashboard
      const [basePath, tabId] = path.split('#');
      navigate(basePath);
      
      // Dispatch custom event to switch tabs
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('superAdminTabChange', { 
          detail: { tabId } 
        }));
      }, 100);
    } else {
      navigate(path);
    }
  };

  const renderDesktopMenu = () => (
    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
      {navigationItems.map((item) => {
        if (item.auth && !isAuthenticated) return null;
        if (item.roles && !hasAnyRole(item.roles)) return null;
        
        const isActive = item.path.includes('#') 
          ? location.pathname === '/super-admin' && location.hash === item.path.split('#')[1]
          : location.pathname === item.path;
        
        return (
          <Button
            key={item.path}
            color="inherit"
            onClick={() => handleTabNavigation(item.path)}
            sx={{
              backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            {item.label}
          </Button>
        );
      })}

      {isAuthenticated ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationCenter />
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.secondary.main }}>
              {user?.firstName?.charAt(0) || user?.name?.charAt(0) || <AccountCircle />}
            </Avatar>
          </IconButton>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            color="inherit"
            onClick={() => navigate('/login')}
            variant="outlined"
            sx={{ borderColor: 'white', color: 'white' }}
          >
            Login
          </Button>
        </Box>
      )}
    </Box>
  );

  const renderMobileMenu = () => (
    <Drawer
      anchor="right"
      open={mobileMenuOpen}
      onClose={handleMobileMenuToggle}
      sx={{
        '& .MuiDrawer-paper': {
          width: 250,
          bgcolor: theme.palette.primary.main,
          color: 'white',
        },
      }}
    >
      <List>
        {navigationItems.map((item) => {
          if (item.auth && !isAuthenticated) return null;
          if (item.roles && !hasAnyRole(item.roles)) return null;
          
          const isActive = item.path.includes('#') 
            ? location.pathname === '/super-admin' && location.hash === item.path.split('#')[1]
            : location.pathname === item.path;
          
          return (
            <ListItem
              button
              key={item.path}
              onClick={() => {
                handleTabNavigation(item.path);
                handleMobileMenuToggle();
              }}
              sx={{
                backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
              }}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          );
        })}

        {isAuthenticated ? (
          <>
            <ListItem
              button
              onClick={() => {
                handleLogout();
                handleMobileMenuToggle();
              }}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                <Logout />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem
              button
              onClick={() => {
                navigate('/login');
                handleMobileMenuToggle();
              }}
            >
              <ListItemText primary="Login" />
            </ListItem>
          </>
        )}
      </List>
    </Drawer>
  );

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: theme.palette.primary.main }}>
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
            onClick={() => navigate('/')}
          >
            <School sx={{ fontSize: 28 }} />
            EduVault
          </Typography>

          {isMobile ? (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileMenuToggle}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            renderDesktopMenu()
          )}
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleLogout}>
          <Logout sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Mobile Menu */}
      {renderMobileMenu()}
    </>
  );
};

export default Navbar;
