import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Button,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import CATsExamsManagement from '../../components/Admin/CATsExamsManagement';
import InstitutionManagement from '../../components/Admin/InstitutionManagement';
import api from '../../utils/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard statistics
      const [statsResponse, activityResponse] = await Promise.allSettled([
        api.get('/api/admin/dashboard-stats'),
        api.get('/api/admin/recent-activity')
      ]);

      // Process stats
      if (statsResponse.status === 'fulfilled') {
        setStats(statsResponse.value.data);
      } else {
        // Mock stats for mini admin
        setStats({
          totalStudents: 156,
          activeCats: 8,
          scheduledExams: 3,
          pendingApprovals: 5,
          totalUnits: 12,
          completedAssessments: 45,
          averageScore: 78.5,
          systemHealth: 95.2,
          dataSource: {
            stats: 'mock',
            activity: 'mock'
          }
        });
      }

      // Process recent activity
      if (activityResponse.status === 'fulfilled') {
        setRecentActivity(activityResponse.value.data.activities || []);
      } else {
        // Mock recent activity
        setRecentActivity([
          {
            id: 1,
            action: 'CAT created',
            details: 'Data Structures CAT 1',
            time: '2 hours ago',
            type: 'cat',
            status: 'success'
          },
          {
            id: 2,
            action: 'Student submitted',
            details: 'John Doe - Database Design CAT',
            time: '3 hours ago',
            type: 'submission',
            status: 'info'
          },
          {
            id: 3,
            action: 'Exam scheduled',
            details: 'Programming Fundamentals Final',
            time: '1 day ago',
            type: 'exam',
            status: 'warning'
          },
          {
            id: 4,
            action: 'Unit approved',
            details: 'Software Engineering Unit',
            time: '2 days ago',
            type: 'approval',
            status: 'success'
          }
        ]);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Using sample data.');
      
      // Fallback data
      setStats({
        totalStudents: 156,
        activeCats: 8,
        scheduledExams: 3,
        pendingApprovals: 5,
        totalUnits: 12,
        completedAssessments: 45,
        averageScore: 78.5,
        systemHealth: 85.0,
        dataSource: {
          stats: 'fallback',
          activity: 'fallback'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'cat': return <QuizIcon />;
      case 'exam': return <AssignmentIcon />;
      case 'submission': return <SchoolIcon />;
      case 'approval': return <SecurityIcon />;
      default: return <NotificationsIcon />;
    }
  };

  const getActivityColor = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          👨‍🏫 Mini Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.firstName}! Manage your assessments and monitor student progress.
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Overview" icon={<DashboardIcon />} />
          <Tab label="CATs & Exams" icon={<AssessmentIcon />} />
          <Tab label="Institutions" icon={<SchoolIcon />} />
          <Tab label="Analytics" icon={<AnalyticsIcon />} />
        </Tabs>

        <CardContent>
          {/* Overview Tab */}
          {tabValue === 0 && (
            <Box>
              {/* Quick Stats */}
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                📊 Quick Statistics
              </Typography>
              
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                  <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
                      <PeopleIcon />
                    </Avatar>
                    <Typography variant="h4" color="primary">
                      {stats?.totalStudents || '---'}
                    </Typography>
                    <Typography variant="body2">Total Students</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stats?.dataSource?.stats === 'database' ? '🟢 Live' : '🟡 Sample'}
                    </Typography>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                    <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
                      <QuizIcon />
                    </Avatar>
                    <Typography variant="h4" color="success.main">
                      {stats?.activeCats || '---'}
                    </Typography>
                    <Typography variant="body2">Active CATs</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stats?.dataSource?.stats === 'database' ? '🟢 Live' : '🟡 Sample'}
                    </Typography>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                    <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1 }}>
                      <AssignmentIcon />
                    </Avatar>
                    <Typography variant="h4" color="warning.main">
                      {stats?.scheduledExams || '---'}
                    </Typography>
                    <Typography variant="body2">Scheduled Exams</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stats?.dataSource?.stats === 'database' ? '🟢 Live' : '🟡 Sample'}
                    </Typography>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                    <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 1 }}>
                      <TrendingUpIcon />
                    </Avatar>
                    <Typography variant="h4" color="info.main">
                      {stats?.averageScore || '---'}%
                    </Typography>
                    <Typography variant="body2">Average Score</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stats?.dataSource?.stats === 'database' ? '🟢 Live' : '🟡 Sample'}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>

              {/* Recent Activity */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        📋 Recent Activity
                      </Typography>
                      <List>
                        {recentActivity.map((activity) => (
                          <ListItem key={activity.id}>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: `${getActivityColor(activity.status)}.main` }}>
                                {getActivityIcon(activity.type)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={activity.action}
                              secondary={activity.details}
                            />
                            <ListItemSecondaryAction>
                              <Typography variant="caption" color="text.secondary">
                                {activity.time}
                              </Typography>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                      <Divider sx={{ my: 2 }} />
                      <Button variant="outlined" fullWidth>
                        View All Activity
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        🎯 Quick Actions
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Button
                          variant="contained"
                          startIcon={<QuizIcon />}
                          onClick={() => setTabValue(1)}
                          fullWidth
                        >
                          Create New CAT
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<AssignmentIcon />}
                          onClick={() => setTabValue(1)}
                          fullWidth
                        >
                          Schedule Exam
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<SchoolIcon />}
                          onClick={() => setTabValue(2)}
                          fullWidth
                        >
                          Manage Institutions
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<AnalyticsIcon />}
                          onClick={() => setTabValue(3)}
                          fullWidth
                        >
                          View Analytics
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>

                  <Card variant="outlined" sx={{ mt: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        🔧 System Status
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" gutterBottom>
                          System Health
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: '100%',
                              height: 8,
                              bgcolor: 'grey.200',
                              borderRadius: 1,
                              overflow: 'hidden'
                            }}
                          >
                            <Box
                              sx={{
                                width: `${stats?.systemHealth || 0}%`,
                                height: '100%',
                                bgcolor: stats?.systemHealth > 90 ? 'success.main' : 
                                        stats?.systemHealth > 70 ? 'warning.main' : 'error.main'
                              }}
                            />
                          </Box>
                          <Typography variant="caption">
                            {stats?.systemHealth || 0}%
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label="Database"
                          color="success"
                          size="small"
                        />
                        <Chip
                          label="File Storage"
                          color="success"
                          size="small"
                        />
                        <Chip
                          label="Security"
                          color="success"
                          size="small"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* CATs & Exams Tab */}
          {tabValue === 1 && (
            <CATsExamsManagement />
          )}

          {/* Institutions Tab */}
          {tabValue === 2 && (
            <InstitutionManagement />
          )}

          {/* Analytics Tab */}
          {tabValue === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                📈 Assessment Analytics
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        📊 Assessment Performance
                      </Typography>
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h3" color="primary">
                          {stats?.averageScore || 78.5}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Average Student Score
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Completed Assessments
                          </Typography>
                          <Typography variant="h6">
                            {stats?.completedAssessments || 45}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Total Units
                          </Typography>
                          <Typography variant="h6">
                            {stats?.totalUnits || 12}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        🎯 Assessment Distribution
                      </Typography>
                      <Box sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">CATs</Typography>
                          <Typography variant="body2">{stats?.activeCats || 8}</Typography>
                        </Box>
                        <Box sx={{ width: '100%', height: 8, bgcolor: 'grey.200', borderRadius: 1, mb: 2 }}>
                          <Box sx={{ width: '70%', height: '100%', bgcolor: 'success.main', borderRadius: 1 }} />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Exams</Typography>
                          <Typography variant="body2">{stats?.scheduledExams || 3}</Typography>
                        </Box>
                        <Box sx={{ width: '100%', height: 8, bgcolor: 'grey.200', borderRadius: 1, mb: 2 }}>
                          <Box sx={{ width: '30%', height: '100%', bgcolor: 'warning.main', borderRadius: 1 }} />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Pending</Typography>
                          <Typography variant="body2">{stats?.pendingApprovals || 5}</Typography>
                        </Box>
                        <Box sx={{ width: '100%', height: 8, bgcolor: 'grey.200', borderRadius: 1 }}>
                          <Box sx={{ width: '20%', height: '100%', bgcolor: 'info.main', borderRadius: 1 }} />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  📊 Detailed analytics and reporting features are coming soon. 
                  Current data shows basic assessment statistics and performance metrics.
                </Typography>
              </Alert>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminDashboard;
