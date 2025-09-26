import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Avatar,
  useTheme,
  alpha,
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import {
  School,
  Work,
  Quiz,
  VideoLibrary,
  Description,
  TrendingUp,
  Security,
  Speed,
  Star,
  PlayArrow,
  GetApp,
  People,
  AutoStories,
  EmojiEvents,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const HomePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const response = await api.get('/api/institutions');
      setInstitutions(response.data.institutions);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    }
  };

  const handleInstitutionSelect = () => {
    if (selectedInstitution) {
      if (isAuthenticated) {
        navigate(`/institution/${selectedInstitution}`);
      } else {
        navigate('/register', { state: { institutionId: selectedInstitution } });
      }
    }
  };

  const features = [
    {
      icon: <VideoLibrary sx={{ fontSize: 40 }} />,
      title: 'HD Lecture Recordings',
      description: 'Access premium video lectures from Kenya\'s top institutions with crystal clear quality',
      color: theme.palette.primary.main,
      stats: '5,000+ Videos',
    },
    {
      icon: <AutoStories sx={{ fontSize: 40 }} />,
      title: 'Past Papers & CATs',
      description: 'Comprehensive collection of past papers, CATs, and assignments with model answers',
      color: theme.palette.secondary.main,
      stats: '10,000+ Papers',
    },
    {
      icon: <Quiz sx={{ fontSize: 40 }} />,
      title: 'AI Study Assistant',
      description: 'Get instant help, generate custom quizzes, and receive personalized study recommendations',
      color: theme.palette.success.main,
      stats: '24/7 Available',
    },
    {
      icon: <EmojiEvents sx={{ fontSize: 40 }} />,
      title: 'Career Opportunities',
      description: 'Discover exclusive job postings and internships tailored to your field of study',
      color: theme.palette.warning.main,
      stats: '500+ Jobs',
    },
  ];

  const stats = [
    { label: 'Students Served', value: '10,000+', icon: <School /> },
    { label: 'Resources Available', value: '50,000+', icon: <Description /> },
    { label: 'Institutions', value: '100+', icon: <TrendingUp /> },
    { label: 'Success Rate', value: '95%', icon: <Security /> },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Chip 
                    label="🎓 #1 Educational Platform" 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      fontWeight: 600,
                      mb: 2
                    }} 
                  />
                </Box>
                <Typography
                  variant="h1"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '2.5rem', md: '4rem' },
                    lineHeight: 1.1,
                    background: 'linear-gradient(45deg, #ffffff 30%, #ff9800 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Learn. Excel. Succeed.
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    mb: 1,
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: 600,
                  }}
                >
                  Your Gateway to Educational Excellence
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    opacity: 0.9,
                    fontWeight: 300,
                    fontSize: { xs: '1.1rem', md: '1.3rem' },
                  }}
                >
                  Access premium educational resources, past papers, lecture recordings, 
                  and career opportunities from Kenya's top institutions.
                </Typography>

                {/* Institution Selector */}
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.background.paper, 0.95),
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
                    Choose Your Institution
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <FormControl fullWidth>
                      <InputLabel>Select Institution</InputLabel>
                      <Select
                        value={selectedInstitution}
                        onChange={(e) => setSelectedInstitution(e.target.value)}
                        label="Select Institution"
                      >
                        {institutions.map((institution) => (
                          <MenuItem key={institution._id} value={institution._id}>
                            {institution.name} ({institution.shortName})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleInstitutionSelect}
                      disabled={!selectedInstitution}
                      sx={{
                        minWidth: { xs: '100%', sm: 150 },
                        bgcolor: theme.palette.secondary.main,
                        '&:hover': { bgcolor: theme.palette.secondary.dark },
                      }}
                    >
                      {isAuthenticated ? 'Explore' : 'Get Started'}
                    </Button>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 400,
                  }}
                >
                  <Box
                    sx={{
                      width: 300,
                      height: 300,
                      borderRadius: '50%',
                      background: `linear-gradient(45deg, ${alpha(theme.palette.secondary.main, 0.3)}, ${alpha(theme.palette.primary.light, 0.3)})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <School sx={{ fontSize: 120, opacity: 0.8 }} />
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          gutterBottom
          sx={{ fontWeight: 600, mb: 6 }}
        >
          Why Choose EduVault?
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <CardContent sx={{ p: 4, position: 'relative' }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        bgcolor: alpha(feature.color, 0.1),
                        color: feature.color,
                        px: 2,
                        py: 0.5,
                        borderRadius: 2,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {feature.stats}
                    </Box>
                    <Avatar
                      sx={{
                        bgcolor: `linear-gradient(45deg, ${feature.color}, ${alpha(feature.color, 0.7)})`,
                        color: 'white',
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 3,
                        boxShadow: `0 8px 25px ${alpha(feature.color, 0.3)}`,
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                      <IconButton 
                        size="small" 
                        sx={{ 
                          color: feature.color,
                          '&:hover': { bgcolor: alpha(feature.color, 0.1) }
                        }}
                      >
                        <PlayArrow />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Stats Section */}
      <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Box textAlign="center">
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        width: 60,
                        height: 60,
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, color: theme.palette.primary.main }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Card
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
            color: 'white',
            textAlign: 'center',
            p: 6,
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Ready to Excel in Your Studies?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of Kenyan students who trust EduVault for their academic success.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {!isAuthenticated && (
              <>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    bgcolor: 'white',
                    color: theme.palette.secondary.main,
                    '&:hover': { bgcolor: alpha('#ffffff', 0.9) },
                  }}
                >
                  Get Started Free
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': { borderColor: 'white', bgcolor: alpha('#ffffff', 0.1) },
                  }}
                >
                  Sign In
                </Button>
              </>
            )}
            {isAuthenticated && (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/resources')}
                sx={{
                  bgcolor: 'white',
                  color: theme.palette.secondary.main,
                  '&:hover': { bgcolor: alpha('#ffffff', 0.9) },
                }}
              >
                Explore Resources
              </Button>
            )}
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default HomePage;
