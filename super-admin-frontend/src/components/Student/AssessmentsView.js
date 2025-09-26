import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Quiz as QuizIcon,
  Assignment as AssignmentIcon,
  Visibility as ViewIcon,
  AccessTime as TimeIcon,
  School as SchoolIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import SecureImageViewer from '../SecureImageViewer';
import api from '../../utils/api';

const AssessmentsView = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [cats, setCats] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [agreementOpen, setAgreementOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const [catsResponse, examsResponse] = await Promise.allSettled([
        api.get('/api/student/cats'),
        api.get('/api/student/exams')
      ]);

      // Process CATs
      if (catsResponse.status === 'fulfilled') {
        setCats(catsResponse.value.data.cats || []);
      } else {
        // Mock CATs data for students
        setCats([
          {
            _id: '1',
            title: 'CAT 1 - Data Structures',
            unitId: 'cs101',
            unitName: 'Computer Science Fundamentals',
            unitCode: 'CS101',
            description: 'Arrays, Linked Lists, and Basic Algorithms',
            dueDate: '2024-02-15T23:59:00Z',
            totalMarks: 30,
            duration: 60,
            status: 'active',
            hasViewed: false,
            viewCount: 0,
            maxViews: 3,
            createdBy: 'Dr. Jane Smith',
            instructions: 'Read all questions carefully. Show all working steps.',
            isAvailable: true
          },
          {
            _id: '2',
            title: 'CAT 2 - Database Design',
            unitId: 'cs201',
            unitName: 'Database Management Systems',
            unitCode: 'CS201',
            description: 'ER Diagrams and Normalization',
            dueDate: '2024-02-20T23:59:00Z',
            totalMarks: 25,
            duration: 45,
            status: 'active',
            hasViewed: true,
            viewCount: 2,
            maxViews: 3,
            createdBy: 'Prof. John Doe',
            instructions: 'Draw clear diagrams. Label all entities and relationships.',
            isAvailable: true
          },
          {
            _id: '3',
            title: 'CAT 3 - Software Engineering',
            unitId: 'cs301',
            unitName: 'Software Engineering Principles',
            unitCode: 'CS301',
            description: 'SDLC and Project Management',
            dueDate: '2024-01-10T23:59:00Z',
            totalMarks: 35,
            duration: 75,
            status: 'expired',
            hasViewed: true,
            viewCount: 3,
            maxViews: 3,
            createdBy: 'Dr. Alice Johnson',
            instructions: 'Answer all questions. Time management is crucial.',
            isAvailable: false
          }
        ]);
      }

      // Process Exams
      if (examsResponse.status === 'fulfilled') {
        setExams(examsResponse.value.data.exams || []);
      } else {
        // Mock Exams data for students
        setExams([
          {
            _id: '1',
            title: 'Final Exam - Programming Fundamentals',
            unitId: 'cs101',
            unitName: 'Computer Science Fundamentals',
            unitCode: 'CS101',
            description: 'Comprehensive exam covering all course topics',
            dueDate: '2024-03-15T09:00:00Z',
            totalMarks: 100,
            duration: 180,
            status: 'scheduled',
            hasViewed: false,
            viewCount: 0,
            maxViews: 1,
            createdBy: 'Dr. Jane Smith',
            instructions: 'This is a comprehensive final examination. No external materials allowed.',
            isAvailable: false // Not yet available
          },
          {
            _id: '2',
            title: 'Mid-Term Exam - Database Systems',
            unitId: 'cs201',
            unitName: 'Database Management Systems',
            unitCode: 'CS201',
            description: 'Mid-term examination covering first half of course',
            dueDate: '2024-02-28T14:00:00Z',
            totalMarks: 80,
            duration: 120,
            status: 'active',
            hasViewed: false,
            viewCount: 0,
            maxViews: 1,
            createdBy: 'Prof. John Doe',
            instructions: 'Answer all questions. Calculators are not permitted.',
            isAvailable: true
          }
        ]);
      }

    } catch (error) {
      console.error('Error fetching assessments:', error);
      setError('Failed to load assessments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'scheduled': return 'info';
      case 'completed': return 'default';
      case 'expired': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircleIcon />;
      case 'scheduled': return <ScheduleIcon />;
      case 'expired': return <WarningIcon />;
      default: return <QuizIcon />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const formatted = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    if (diffDays > 0) {
      return `${formatted} (${diffDays} days remaining)`;
    } else if (diffDays === 0) {
      return `${formatted} (Due today!)`;
    } else {
      return `${formatted} (Overdue)`;
    }
  };

  const canViewAssessment = (assessment) => {
    if (!assessment.isAvailable) return false;
    if (assessment.status === 'expired') return false;
    if (assessment.viewCount >= assessment.maxViews) return false;
    return true;
  };

  const handleViewAssessment = (assessment) => {
    if (!canViewAssessment(assessment)) {
      if (assessment.viewCount >= assessment.maxViews) {
        alert('You have reached the maximum number of views for this assessment.');
      } else if (!assessment.isAvailable) {
        alert('This assessment is not yet available for viewing.');
      } else {
        alert('This assessment is no longer available.');
      }
      return;
    }

    setSelectedAssessment(assessment);
    setAgreementOpen(true);
  };

  const handleAgreeToTerms = () => {
    setAgreementOpen(false);
    setViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setViewerOpen(false);
    setSelectedAssessment(null);
    // Refresh data to update view count
    fetchAssessments();
  };

  const renderAssessmentCard = (assessment, type) => {
    const isViewable = canViewAssessment(assessment);
    const dueDate = new Date(assessment.dueDate);
    const isOverdue = dueDate < new Date() && assessment.status !== 'expired';

    return (
      <Grid item xs={12} md={6} lg={4} key={assessment._id}>
        <Card 
          variant="outlined" 
          sx={{ 
            height: '100%',
            border: assessment.hasViewed ? 2 : 1,
            borderColor: assessment.hasViewed ? 'success.main' : 'grey.300',
            opacity: isViewable ? 1 : 0.7
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                {assessment.title}
              </Typography>
              <Chip
                label={assessment.status.toUpperCase()}
                color={getStatusColor(assessment.status)}
                size="small"
                icon={getStatusIcon(assessment.status)}
              />
            </Box>
            
            <Typography variant="body2" color="primary" gutterBottom>
              📚 {assessment.unitCode} - {assessment.unitName}
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 2 }}>
              {assessment.description}
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                📅 Due: {formatDate(assessment.dueDate)}
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                📊 Marks: {assessment.totalMarks} | ⏱️ Duration: {assessment.duration} min
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                👨‍🏫 Created by: {assessment.createdBy}
              </Typography>
            </Box>

            {/* View Status */}
            <Box sx={{ mb: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                👁️ Views: {assessment.viewCount}/{assessment.maxViews}
                {assessment.hasViewed && ' ✅ Previously viewed'}
              </Typography>
            </Box>
            
            {/* Security Notice */}
            <Alert severity="warning" sx={{ mb: 2, fontSize: '0.75rem' }}>
              🔒 Secure viewing - Screenshots disabled
            </Alert>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={isViewable ? 'contained' : 'outlined'}
                color={isViewable ? 'primary' : 'inherit'}
                startIcon={isViewable ? <ViewIcon /> : <SecurityIcon />}
                onClick={() => handleViewAssessment(assessment)}
                disabled={!isViewable}
                fullWidth
                size="small"
              >
                {!assessment.isAvailable ? 'Not Available' :
                 assessment.viewCount >= assessment.maxViews ? 'Max Views Reached' :
                 assessment.status === 'expired' ? 'Expired' :
                 'View Assessment'}
              </Button>
            </Box>

            {isOverdue && assessment.status === 'active' && (
              <Alert severity="error" sx={{ mt: 1, fontSize: '0.75rem' }}>
                ⚠️ This assessment is overdue!
              </Alert>
            )}
          </CardContent>
        </Card>
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading your assessments...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          📝 My Assessments
          <SecurityIcon color="error" />
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View your CATs and Exams securely. All viewing sessions are monitored and screenshots are disabled.
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" color="primary">{cats.filter(c => c.status === 'active').length}</Typography>
            <Typography variant="caption">Active CATs</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" color="secondary">{exams.filter(e => e.status === 'active').length}</Typography>
            <Typography variant="caption">Available Exams</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" color="success.main">{[...cats, ...exams].filter(a => a.hasViewed).length}</Typography>
            <Typography variant="caption">Viewed</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" color="warning.main">{[...cats, ...exams].filter(a => new Date(a.dueDate) < new Date() && a.status === 'active').length}</Typography>
            <Typography variant="caption">Overdue</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label={`CATs (${cats.length})`} icon={<QuizIcon />} />
          <Tab label={`Exams (${exams.length})`} icon={<AssignmentIcon />} />
        </Tabs>

        <CardContent>
          {/* CATs Tab */}
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                📋 Continuous Assessment Tests
              </Typography>
              {cats.length === 0 ? (
                <Card variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                  <QuizIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No CATs Available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your instructors haven't posted any CATs yet. Check back later.
                  </Typography>
                </Card>
              ) : (
                <Grid container spacing={3}>
                  {cats.map((cat) => renderAssessmentCard(cat, 'cat'))}
                </Grid>
              )}
            </Box>
          )}

          {/* Exams Tab */}
          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                📝 Examinations
              </Typography>
              {exams.length === 0 ? (
                <Card variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                  <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Exams Scheduled
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No examinations have been scheduled yet. Check back later.
                  </Typography>
                </Card>
              ) : (
                <Grid container spacing={3}>
                  {exams.map((exam) => renderAssessmentCard(exam, 'exam'))}
                </Grid>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Terms Agreement Dialog */}
      <Dialog open={agreementOpen} onClose={() => setAgreementOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'error.light', color: 'error.dark' }}>
          🔒 Secure Assessment Viewing Agreement
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Important Security Notice
            </Typography>
            <Typography variant="body2">
              You are about to enter a secure assessment viewing session. Please read and agree to the following terms:
            </Typography>
          </Alert>

          <List>
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <SecurityIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="No Screenshots or Recording"
                secondary="Screenshots, screen recording, and printing are strictly prohibited and technically disabled."
              />
            </ListItem>
            
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <TimeIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Time Limit Enforced"
                secondary="The viewing session has a strict time limit. The session will automatically end when time expires."
              />
            </ListItem>
            
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <ViewIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Limited Views"
                secondary={`You have ${selectedAssessment?.maxViews - (selectedAssessment?.viewCount || 0)} view(s) remaining for this assessment.`}
              />
            </ListItem>
            
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <SchoolIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Academic Integrity"
                secondary="You agree to maintain academic integrity and not share assessment content with others."
              />
            </ListItem>
          </List>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>By proceeding, you acknowledge that:</strong><br/>
              • Your viewing session will be logged and monitored<br/>
              • Any attempt to circumvent security measures may result in academic penalties<br/>
              • You understand the time limits and view restrictions<br/>
              • You will not attempt to copy, save, or share the assessment content
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAgreementOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleAgreeToTerms} variant="contained" color="primary">
            I Agree - Start Secure Viewing
          </Button>
        </DialogActions>
      </Dialog>

      {/* Secure Image Viewer */}
      {viewerOpen && selectedAssessment && (
        <SecureImageViewer
          type={selectedAssessment.unitId?.startsWith('cs') ? 'cat' : 'exam'}
          id={selectedAssessment._id}
          onClose={handleCloseViewer}
        />
      )}
    </Box>
  );
};

export default AssessmentsView;
