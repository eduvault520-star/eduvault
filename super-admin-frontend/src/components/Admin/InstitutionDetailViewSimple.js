import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Chip,
  CircularProgress,
  Avatar,
  Badge,
  Breadcrumbs,
  Link,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  FormGroup,
  Snackbar
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  VideoLibrary,
  Description,
  Assignment,
  Quiz,
  School,
  ArrowBack,
  LocationOn,
  MenuBook,
  Class,
  Home,
  ExpandMore,
  Star,
  StarBorder,
  Close,
  Download,
  PlayArrow
} from '@mui/icons-material';
import api from '../../utils/api';

const InstitutionDetailViewSimple = ({ institution, onBack }) => {
  const [courses, setCourses] = useState([]);
  const [pendingContent, setPendingContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCourses, setExpandedCourses] = useState(new Set());
  
  // Dialog states
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [reviewAction, setReviewAction] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    if (institution) {
      fetchInstitutionData();
    }
  }, [institution]);

  const fetchInstitutionData = async () => {
    try {
      setLoading(true);
      
      // Mock data for development
      setCourses([
        {
          _id: '1',
          name: 'Bachelor of Computer Science',
          code: 'BCS',
          department: 'Computer Science',
          level: 'Undergraduate',
          duration: { years: 4, semesters: 8 },
          units: [
            {
              _id: 'u1',
              unitCode: 'CS101',
              unitName: 'Introduction to Programming',
              year: 1,
              semester: 1,
              creditHours: 3,
              pendingContent: 2
            },
            {
              _id: 'u2',
              unitCode: 'CS201',
              unitName: 'Data Structures',
              year: 2,
              semester: 1,
              creditHours: 4,
              pendingContent: 3
            }
          ]
        },
        {
          _id: '2',
          name: 'Bachelor of Agricultural Engineering',
          code: 'BAE',
          department: 'Agricultural Engineering',
          level: 'Undergraduate',
          duration: { years: 4, semesters: 8 },
          units: [
            {
              _id: 'u3',
              unitCode: 'AE101',
              unitName: 'Farm Machinery',
              year: 1,
              semester: 1,
              creditHours: 3,
              pendingContent: 1
            }
          ]
        }
      ]);
      
      setPendingContent([
        {
          _id: 'c1',
          courseId: '1',
          unitId: 'u1',
          courseName: 'Bachelor of Computer Science',
          unitName: 'Introduction to Programming',
          type: 'video',
          content: {
            title: 'Python Basics Lecture',
            filename: 'python_basics.mp4'
          },
          uploadDate: new Date().toISOString(),
          status: 'pending'
        },
        {
          _id: 'c2',
          courseId: '1',
          unitId: 'u2',
          courseName: 'Bachelor of Computer Science',
          unitName: 'Data Structures',
          type: 'notes',
          content: {
            title: 'Linked Lists Notes',
            filename: 'linked_lists.pdf'
          },
          uploadDate: new Date().toISOString(),
          status: 'pending'
        }
      ]);
      
    } catch (error) {
      console.error('Error fetching institution data:', error);
      setError('Failed to fetch institution data');
    } finally {
      setLoading(false);
    }
  };

  const toggleCourse = (courseId) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };

  const getContentIcon = (type) => {
    switch (type) {
      case 'video': return <VideoLibrary color="primary" />;
      case 'notes': return <Description color="secondary" />;
      case 'cats': return <Quiz color="warning" />;
      case 'assignments': return <Assignment color="info" />;
      default: return <Description />;
    }
  };

  const getContentTypeLabel = (type) => {
    switch (type) {
      case 'video': return 'Lecture Video';
      case 'notes': return 'PDF Notes';
      case 'cats': return 'CAT';
      case 'assignments': return 'Assignment';
      default: return type;
    }
  };

  const getUnitPendingContent = (unitId) => {
    return pendingContent.filter(content => content.unitId === unitId);
  };

  const getTotalPendingForCourse = (courseId) => {
    return pendingContent.filter(content => content.courseId === courseId).length;
  };

  const handlePreviewContent = (content) => {
    setPreviewContent(content);
    setOpenPreviewDialog(true);
  };

  const handleReviewContent = (content, action) => {
    setSelectedContent(content);
    setReviewAction(action);
    setReviewNotes('');
    setIsPremium(content.content?.isPremium || false);
    setOpenReviewDialog(true);
  };

  const submitReview = async () => {
    try {
      const endpoint = reviewAction === 'approve' ? '/api/content-approval/approve' : '/api/content-approval/reject';
      
      const reviewData = {
        courseId: selectedContent.courseId,
        unitId: selectedContent.unitId,
        topicId: selectedContent.topicId,
        assessmentId: selectedContent.assessmentId,
        contentType: selectedContent.type,
        reviewNotes,
        isPremium: reviewAction === 'approve' ? isPremium : false
      };

      await api.post(endpoint, reviewData);
      
      // Remove the content from pending list
      setPendingContent(prev => prev.filter(c => c._id !== selectedContent._id));
      
      // Show success message
      setSnackbarMessage(`Content ${reviewAction === 'approve' ? 'approved' : 'rejected'} successfully`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Close dialog
      setOpenReviewDialog(false);
      setSelectedContent(null);
      setReviewNotes('');
      
    } catch (error) {
      console.error('Error submitting review:', error);
      setSnackbarMessage(`Failed to ${reviewAction} content`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Header with Breadcrumbs */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link 
            color="inherit" 
            href="#" 
            onClick={onBack}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <Home sx={{ fontSize: 16 }} />
            Institutions
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <School sx={{ fontSize: 16 }} />
            {institution.name}
          </Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
              {institution.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {institution.location?.town}, {institution.location?.county}
                </Typography>
              </Box>
              <Chip 
                label={institution.type?.replace('_', ' ') || 'University'}
                color="primary"
                variant="outlined"
                size="small"
              />
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={onBack}
          >
            Back to Institutions
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Institution Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary.main">
                {courses.length}
              </Typography>
              <Typography variant="body2">Total Courses</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="warning.main">
                {pendingContent.length}
              </Typography>
              <Typography variant="body2">Pending Content</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="info.main">
                {courses.reduce((total, course) => total + (course.units?.length || 0), 0)}
              </Typography>
              <Typography variant="body2">Total Units</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="secondary.main">
                {new Set(courses.map(course => course.department)).size}
              </Typography>
              <Typography variant="body2">Departments</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Courses List */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Courses & Content Approval
      </Typography>

      {courses.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <MenuBook sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No courses found for this institution
          </Typography>
        </Card>
      ) : (
        <Box>
          {courses.map((course) => {
            const isExpanded = expandedCourses.has(course._id);
            const pendingCount = getTotalPendingForCourse(course._id);
            
            return (
              <Card key={course._id} sx={{ mb: 2, border: 1, borderColor: 'divider' }}>
                {/* Course Header */}
                <CardContent 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  onClick={() => toggleCourse(course._id)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        <MenuBook />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {course.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {course.code} • {course.department} • {course.level}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {pendingCount > 0 && (
                        <Badge badgeContent={pendingCount} color="warning">
                          <Chip 
                            label={`${course.units?.length || 0} Units`}
                            color="secondary"
                            variant="outlined"
                          />
                        </Badge>
                      )}
                      {pendingCount === 0 && (
                        <Chip 
                          label={`${course.units?.length || 0} Units`}
                          color="secondary"
                          variant="outlined"
                        />
                      )}
                      <ExpandMore sx={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                    </Box>
                  </Box>
                </CardContent>

                {/* Course Units */}
                {isExpanded && (
                  <Box sx={{ px: 2, pb: 2 }}>
                    {course.units && course.units.length > 0 ? (
                      course.units.map((unit) => {
                        const unitContent = getUnitPendingContent(unit._id);
                        
                        return (
                          <Card key={unit._id} sx={{ mb: 2, ml: 2, border: 1, borderColor: 'divider' }}>
                            <CardContent sx={{ py: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}>
                                  <Class sx={{ fontSize: 18 }} />
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {unit.unitName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {unit.unitCode} • Year {unit.year}, Semester {unit.semester} • {unit.creditHours} Credits
                                  </Typography>
                                </Box>
                                {unitContent.length > 0 && (
                                  <Badge badgeContent={unitContent.length} color="warning">
                                    <Chip 
                                      label="Pending Content"
                                      color="warning"
                                      variant="outlined"
                                      size="small"
                                    />
                                  </Badge>
                                )}
                              </Box>

                              {/* Unit Content List */}
                              {unitContent.length > 0 ? (
                                <List dense>
                                  {unitContent.map((content, index) => (
                                    <ListItem key={index} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                                        {getContentIcon(content.type)}
                                      </Box>
                                      <ListItemText
                                        primary={
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                              {content.content.title}
                                            </Typography>
                                            <Chip 
                                              label={getContentTypeLabel(content.type)}
                                              size="small"
                                              color="primary"
                                              variant="outlined"
                                            />
                                          </Box>
                                        }
                                        secondary={
                                          <Typography variant="caption" color="text.secondary">
                                            Uploaded: {new Date(content.uploadDate).toLocaleDateString()}
                                            {content.content.filename && ` • ${content.content.filename}`}
                                          </Typography>
                                        }
                                      />
                                      <ListItemSecondaryAction>
                                        <Button
                                          size="small"
                                          startIcon={<Visibility />}
                                          color="info"
                                          onClick={() => handlePreviewContent(content)}
                                          sx={{ mr: 1 }}
                                        >
                                          Preview
                                        </Button>
                                        <Button
                                          size="small"
                                          startIcon={<CheckCircle />}
                                          color="success"
                                          onClick={() => handleReviewContent(content, 'approve')}
                                          sx={{ mr: 1 }}
                                        >
                                          Approve
                                        </Button>
                                        <Button
                                          size="small"
                                          startIcon={<Cancel />}
                                          color="error"
                                          onClick={() => handleReviewContent(content, 'reject')}
                                        >
                                          Reject
                                        </Button>
                                      </ListItemSecondaryAction>
                                    </ListItem>
                                  ))}
                                </List>
                              ) : (
                                <Box sx={{ textAlign: 'center', py: 2 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    ✅ No pending content for this unit
                                  </Typography>
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4, ml: 2 }}>
                        <Class sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          No units found for this course
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </Card>
            );
          })}
        </Box>
      )}

      {/* Preview Dialog */}
      <Dialog 
        open={openPreviewDialog} 
        onClose={() => setOpenPreviewDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {previewContent && getContentIcon(previewContent.type)}
            <Typography variant="h6">
              Content Preview: {previewContent?.content?.title}
            </Typography>
          </Box>
          <Button onClick={() => setOpenPreviewDialog(false)} color="inherit">
            <Close />
          </Button>
        </DialogTitle>
        <DialogContent>
          {previewContent && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              {getContentIcon(previewContent.type)}
              <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                {getContentTypeLabel(previewContent.type)}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                {previewContent.content.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Course: {previewContent.courseName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Unit: {previewContent.unitName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                File: {previewContent.content.filename}
              </Typography>
              
              {previewContent.type === 'video' && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    🎥 Video Content Preview
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<PlayArrow />}
                    href={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001'}/api/upload/file/${previewContent.content.filename}`}
                    target="_blank"
                    sx={{ mr: 1 }}
                  >
                    Play Video
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    href={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001'}/api/upload/file/${previewContent.content.filename}`}
                    download
                  >
                    Download (Admin Only)
                  </Button>
                </Box>
              )}
              
              {previewContent.type === 'notes' && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    📄 PDF Document Preview
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Visibility />}
                    href={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001'}/api/upload/file/${previewContent.content.filename}`}
                    target="_blank"
                    sx={{ mr: 1 }}
                  >
                    View PDF
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    href={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001'}/api/upload/file/${previewContent.content.filename}`}
                    download
                  >
                    Download PDF
                  </Button>
                </Box>
              )}
              
              {['cats', 'assignments'].includes(previewContent.type) && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    📝 Assessment Preview
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Visibility />}
                    href={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001'}/api/upload/file/${previewContent.content.filename}`}
                    target="_blank"
                    sx={{ mr: 1 }}
                  >
                    View Assessment
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    href={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001'}/api/upload/file/${previewContent.content.filename}`}
                    download
                  >
                    Download
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreviewDialog(false)}>Close</Button>
          {previewContent && (
            <>
              <Button
                startIcon={<CheckCircle />}
                color="success"
                onClick={() => {
                  setOpenPreviewDialog(false);
                  handleReviewContent(previewContent, 'approve');
                }}
              >
                Approve
              </Button>
              <Button
                startIcon={<Cancel />}
                color="error"
                onClick={() => {
                  setOpenPreviewDialog(false);
                  handleReviewContent(previewContent, 'reject');
                }}
              >
                Reject
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={openReviewDialog} onClose={() => setOpenReviewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {reviewAction === 'approve' ? 'Approve Content' : 'Reject Content'}
        </DialogTitle>
        <DialogContent>
          {selectedContent && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                {selectedContent.content.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedContent.courseName} • {selectedContent.unitName}
              </Typography>
            </Box>
          )}
          
          {reviewAction === 'approve' && (
            <FormGroup sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isPremium}
                    onChange={(e) => setIsPremium(e.target.checked)}
                    color="warning"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isPremium ? <Star color="warning" /> : <StarBorder />}
                    <Typography>
                      Mark as Premium Content
                    </Typography>
                  </Box>
                }
              />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                Premium content requires subscription to access
              </Typography>
            </FormGroup>
          )}
          
          <TextField
            fullWidth
            label="Review Notes"
            multiline
            rows={4}
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder={`Add notes about why you ${reviewAction === 'approve' ? 'approved' : 'rejected'} this content...`}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReviewDialog(false)}>Cancel</Button>
          <Button 
            onClick={submitReview} 
            variant="contained"
            color={reviewAction === 'approve' ? 'success' : 'error'}
          >
            {reviewAction === 'approve' ? 'Approve' : 'Reject'} Content
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <div 
          style={{ 
            padding: '16px', 
            backgroundColor: snackbarSeverity === 'success' ? '#4caf50' : '#f44336',
            color: 'white',
            borderRadius: '4px'
          }}
        >
          {snackbarMessage}
        </div>
      </Snackbar>
    </Container>
  );
};

export default InstitutionDetailViewSimple;
