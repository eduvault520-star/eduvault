import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  useTheme,
  alpha,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Person,
  Phone,
  School,
  MenuBook,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const RegisterPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { register, loading, error, clearError } = useAuth();

  const [activeStep, setActiveStep] = useState(0);
  const [institutions, setInstitutions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    institution: location.state?.institutionId || '',
    course: '',
    yearOfStudy: '',
  });

  const steps = ['Personal Info', 'Academic Info', 'Account Setup'];

  useEffect(() => {
    fetchInstitutions();
  }, []);

  useEffect(() => {
    if (formData.institution) {
      fetchCourses(formData.institution);
    }
  }, [formData.institution]);

  const fetchInstitutions = async () => {
    try {
      const response = await api.get('/api/institutions');
      setInstitutions(response.data.institutions);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    }
  };

  const fetchCourses = async (institutionId) => {
    try {
      const response = await api.get(`/api/courses?institution=${institutionId}`);
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) clearError();
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        return formData.firstName && formData.lastName && formData.phoneNumber;
      case 1:
        return formData.institution && formData.course && formData.yearOfStudy;
      case 2:
        return formData.email && formData.password && formData.confirmPassword && 
               formData.password === formData.confirmPassword;
      default:
        return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    const { confirmPassword, ...submitData } = formData;
    const result = await register(submitData);
    if (result.success) {
      navigate('/');
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="phoneNumber"
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                placeholder="0700000000"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Institution</InputLabel>
                <Select
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  label="Institution"
                >
                  {institutions.map((institution) => (
                    <MenuItem key={institution._id} value={institution._id}>
                      {institution.name} ({institution.shortName})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required disabled={!formData.institution}>
                <InputLabel>Course</InputLabel>
                <Select
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  label="Course"
                >
                  {courses.map((course) => (
                    <MenuItem key={course._id} value={course._id}>
                      {course.name} ({course.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Year of Study</InputLabel>
                <Select
                  name="yearOfStudy"
                  value={formData.yearOfStudy}
                  onChange={handleChange}
                  label="Year of Study"
                >
                  {[1, 2, 3, 4, 5, 6].map((year) => (
                    <MenuItem key={year} value={year}>
                      Year {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="email"
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
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
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                error={formData.confirmPassword && formData.password !== formData.confirmPassword}
                helperText={
                  formData.confirmPassword && formData.password !== formData.confirmPassword
                    ? 'Passwords do not match'
                    : ''
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        );

      default:
        return null;
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
      <Container maxWidth="md">
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
                Join EduVault
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create your account to access premium educational resources
              </Typography>
            </Box>

            {/* Stepper */}
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit}>
              {renderStepContent(activeStep)}

              {/* Navigation Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  variant="outlined"
                >
                  Back
                </Button>
                
                {activeStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || !validateStep(activeStep)}
                    sx={{ minWidth: 120 }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!validateStep(activeStep)}
                  >
                    Next
                  </Button>
                )}
              </Box>

              {/* Login Link */}
              <Box textAlign="center" mt={3}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/login"
                    sx={{ fontWeight: 600 }}
                  >
                    Sign in here
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

export default RegisterPage;
