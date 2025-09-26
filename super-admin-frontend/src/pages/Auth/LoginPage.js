import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  School,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    // Prevent ALL forms of page reload
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('🚀 Login form submitted:', formData.email); // Debug log
    console.log('🔍 Form data:', formData); // Debug log
    
    // Validate form data
    if (!formData.email || !formData.password) {
      console.log('❌ Missing email or password');
      return;
    }
    
    try {
      console.log('📡 Calling login function...'); // Debug log
      const result = await login(formData.email, formData.password);
      console.log('📨 Login result received:', result); // Debug log
      
      if (result && result.success) {
        console.log('✅ Login successful!'); // Debug log
        console.log('🧭 Navigating to:', from); // Debug log
        navigate(from, { replace: true });
      } else {
        console.log('❌ Login failed:', result?.error); // Debug log
      }
    } catch (error) {
      console.error('💥 Login error caught:', error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        display: 'flex',
        alignItems: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Paper
            elevation={24}
            sx={{
              p: 4,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Header */}
            <Box textAlign="center" mb={4}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  mb: 2,
                }}
              >
                <School sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                Welcome Back
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sign in to access your EduVault account
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <Box>
              <TextField
                fullWidth
                name="email"
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    console.log('⌨️ Enter key pressed in password field');
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubmit(e);
                  }
                }}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                onClick={(e) => {
                  console.log('🖱️ Button clicked'); // Debug log
                  e.preventDefault();
                  e.stopPropagation();
                  handleSubmit(e);
                }}
                sx={{
                  mb: 3,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Links */}
              <Box textAlign="center">
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  variant="body2"
                  sx={{ display: 'block', mb: 2 }}
                >
                  Forgot your password?
                </Link>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/register"
                    sx={{ fontWeight: 600 }}
                  >
                    Sign up here
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default LoginPage;
