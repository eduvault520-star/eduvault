import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Chip,
  Button,
  CircularProgress,
  Avatar,
  Paper,
  Divider,
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import {
  School,
  LocationOn,
  CalendarToday,
  People,
  Star,
  BookmarkBorder,
  Share,
  Verified
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';

const InstitutionPage = () => {
  const [institution, setInstitution] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    fetchInstitutionData();
  }, [id]);

  const fetchInstitutionData = async () => {
    try {
      // Fetch institutions
      const institutionsResponse = await api.get('/api/institutions');
      const foundInstitution = institutionsResponse.data.institutions.find(inst => inst._id === id);
      setInstitution(foundInstitution);

      // Fetch courses for this institution
      const coursesResponse = await api.get(`/api/courses?institution=${id}`);
      setCourses(coursesResponse.data.courses);
    } catch (error) {
      console.error('Error fetching institution data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!institution) {
    return (
      <Container>
        <Typography variant="h4" align="center" color="error">
          Institution not found
        </Typography>
      </Container>
    );
  }

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          py: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      mr: 3,
                      fontSize: '2rem',
                    }}
                  >
                    <School sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                      {institution.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip 
                        icon={<Verified />}
                        label={institution.shortName}
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.2)', 
                          color: 'white',
                          fontWeight: 600 
                        }}
                      />
                      <Chip 
                        label={institution.type.replace('_', ' ').toUpperCase()}
                        sx={{ 
                          bgcolor: theme.palette.secondary.main,
                          color: 'white',
                          fontWeight: 600 
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn sx={{ fontSize: 20 }} />
                    <Typography variant="body1">
                      {institution.location.town}, {institution.location.county}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday sx={{ fontSize: 20 }} />
                    <Typography variant="body1">
                      Est. {institution.establishedYear}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <People sx={{ fontSize: 20 }} />
                    <Typography variant="body1">
                      {courses.length} Programs
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      bgcolor: theme.palette.secondary.main,
                      '&:hover': { bgcolor: theme.palette.secondary.dark },
                    }}
                  >
                    View Programs
                  </Button>
                  <IconButton sx={{ color: 'white' }}>
                    <BookmarkBorder />
                  </IconButton>
                  <IconButton sx={{ color: 'white' }}>
                    <Share />
                  </IconButton>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper
                  elevation={8}
                  sx={{
                    p: 3,
                    bgcolor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                  }}
                >
                  <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                    Institution Highlights
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Rating</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Star sx={{ color: '#ffc107', fontSize: 16 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>4.8</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Students</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>15,000+</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Accreditation</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>CUE Certified</Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>

        {/* Courses Section */}
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3 }}>
          Available Courses
        </Typography>

        {courses.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              No courses available for this institution yet.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {courses.map((course) => (
              <Grid item xs={12} md={6} key={course._id}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card 
                    sx={{ 
                      height: '100%',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: 6
                      }
                    }}
                    onClick={() => navigate(`/course/${course._id}`)}
                  >
                    <CardContent>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {course.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Course Code: {course.code}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Department: {course.department}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Chip 
                          label={`${course.duration.years} Years`} 
                          size="small" 
                          sx={{ mr: 1 }}
                        />
                        <Chip 
                          label={`${course.duration.semesters} Semesters`} 
                          size="small" 
                        />
                      </Box>
                      <Button 
                        variant="contained" 
                        sx={{ mt: 2 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/course/${course._id}`);
                        }}
                      >
                        View Course Details
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default InstitutionPage;
