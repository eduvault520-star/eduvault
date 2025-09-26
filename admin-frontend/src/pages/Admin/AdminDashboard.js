import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Dashboard,
  School,
  Upload,
  Assessment,
  Quiz as QuizIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import InstitutionManagement from '../../components/Admin/InstitutionManagement';
import ContentStatus from '../../components/Admin/ContentStatus';
import CATsExamsManagement from '../../components/Admin/CATsExamsManagement';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch real data from API
      const api = (await import('../../utils/api')).default;
      const response = await api.get('/api/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchDashboardData}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 4 }, mb: 4, px: { xs: 1, sm: 2 } }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            fontWeight: 600, 
            color: 'primary.main',
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
          }}
        >
          Mini Admin Dashboard
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="text.secondary" 
          gutterBottom
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          Welcome back, {user?.firstName}! Manage your institution's content and resources.
        </Typography>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minWidth: { xs: 'auto', sm: 160 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }
            }}
          >
            <Tab 
              icon={<Dashboard />} 
              label="Overview"
              iconPosition="start"
              sx={{ flexDirection: { xs: 'column', sm: 'row' } }}
            />
            <Tab 
              icon={<School />} 
              label="Institutions"
              iconPosition="start"
              sx={{ flexDirection: { xs: 'column', sm: 'row' } }}
            />
            <Tab 
              icon={<QuizIcon />} 
              label="Assessments"
              iconPosition="start"
              sx={{ flexDirection: { xs: 'column', sm: 'row' } }}
            />
            <Tab 
              icon={<Upload />} 
              label="Content"
              iconPosition="start"
              sx={{ flexDirection: { xs: 'column', sm: 'row' } }}
            />
            <Tab 
              icon={<Assessment />} 
              label="Reports"
              iconPosition="start"
              sx={{ flexDirection: { xs: 'column', sm: 'row' } }}
            />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="primary">
                    {stats?.users?.total || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="primary">
                    {stats?.resources?.total || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Resources
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="primary">
                    {stats?.users?.activeSubscriptions || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Premium Users
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="primary">
                    {(stats?.assessments?.cats || 0) + (stats?.assessments?.exams || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Assessments
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stats?.assessments?.cats || 0} CATs • {stats?.assessments?.exams || 0} Exams
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Institution Management Tab */}
        {tabValue === 1 && (
          <InstitutionManagement userRole={user?.role} />
        )}

        {/* Assessments Management Tab */}
        {tabValue === 2 && (
          <CATsExamsManagement />
        )}

        {/* Content Management Tab */}
        {tabValue === 3 && (
          <ContentStatus />
        )}

        {/* Reports Tab */}
        {tabValue === 4 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Reports & Analytics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      User Analytics
                    </Typography>
                    <Typography variant="body2">
                      Total Users: {stats?.users?.total || 0}
                    </Typography>
                    <Typography variant="body2">
                      Active Students: {stats?.users?.students || 0}
                    </Typography>
                    <Typography variant="body2">
                      Premium Subscribers: {stats?.users?.activeSubscriptions || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </motion.div>
    </Container>
  );
};

export default AdminDashboard;
