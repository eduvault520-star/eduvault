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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Paper,
  Switch,
  FormControlLabel,
  FormGroup,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Avatar,
  Collapse
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
  PendingActions,
  Star,
  StarBorder,
  Download,
  PlayArrow,
  Close,
  ExpandMore,
  ExpandLess,
  LocationOn,
  MenuBook,
  Class,
  Folder,
  FolderOpen
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

const HierarchicalContentApproval = () => {
  const [institutions, setInstitutions] = useState([]);
  const [pendingContent, setPendingContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [expandedInstitutions, setExpandedInstitutions] = useState(new Set());
  const [expandedCourses, setExpandedCourses] = useState(new Set());
  
  // Get backend URL from environment or default
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
  
  // Review dialog state
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewAction, setReviewAction] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  
  // Content preview state
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch institutions
      const institutionsResponse = await api.get('/api/institutions');
      setInstitutions(institutionsResponse.data.institutions || []);
      
      // Fetch pending content
      const contentResponse = await api.get('/api/content-approval/pending');
      setPendingContent(contentResponse.data.pendingContent || []);
      
      // Fetch stats
      const statsResponse = await api.get('/api/content-approval/stats');
      setStats(statsResponse.data);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Group content by institution, course, and unit
  const groupedContent = React.useMemo(() => {
    const grouped = {};
    
    pendingContent.forEach(content => {
      const institutionId = content.institutionId || 'unknown';
      const courseId = content.courseId || 'unknown';
      const unitId = content.unitId || 'unknown';
      
      if (!grouped[institutionId]) {
        grouped[institutionId] = {
          institution: institutions.find(inst => inst._id === institutionId) || { name: 'Unknown Institution', _id: institutionId },
          courses: {}
        };
      }
      
      if (!grouped[institutionId].courses[courseId]) {
        grouped[institutionId].courses[courseId] = {
          courseName: content.courseName || 'Unknown Course',
          courseId: courseId,
          units: {}
        };
      }
      
      if (!grouped[institutionId].courses[courseId].units[unitId]) {
        grouped[institutionId].courses[courseId].units[unitId] = {
          unitName: content.unitName || 'Unknown Unit',
          unitId: unitId,
          content: []
        };
      }
      
      grouped[institutionId].courses[courseId].units[unitId].content.push(content);
    });
    
    return grouped;
  }, [pendingContent, institutions]);

  const toggleInstitution = (institutionId) => {
    const newExpanded = new Set(expandedInstitutions);
    if (newExpanded.has(institutionId)) {
      newExpanded.delete(institutionId);
    } else {
      newExpanded.add(institutionId);
    }
    setExpandedInstitutions(newExpanded);
  };

  const toggleCourse = (courseKey) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseKey)) {
      newExpanded.delete(courseKey);
    } else {
      newExpanded.add(courseKey);
    }
    setExpandedCourses(newExpanded);
  };

  const getContentIcon = (type, sx = {}) => {
    const iconProps = { sx };
    switch (type) {
      case 'video': return <VideoLibrary color="primary" {...iconProps} />;
      case 'notes': return <Description color="secondary" {...iconProps} />;
      case 'cats': return <Quiz color="warning" {...iconProps} />;
      case 'assignments': return <Assignment color="info" {...iconProps} />;
      case 'pastExams': return <School color="success" {...iconProps} />;
      default: return <PendingActions {...iconProps} />;
    }
  };

  const getContentTypeLabel = (type) => {
    switch (type) {
      case 'video': return 'Lecture Video';
      case 'notes': return 'PDF Notes';
      case 'cats': return 'CAT';
      case 'assignments': return 'Assignment';
      case 'pastExams': return 'Past Exam';
      default: return type;
    }
  };

  const handlePreview = (content) => {
    setPreviewContent(content);
    setOpenPreviewDialog(true);
  };

  const handleReview = (content, action) => {
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
      
      // Refresh data
      fetchData();
      
      setOpenReviewDialog(false);
      setSelectedContent(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Error submitting review:', error);
      setError(`Failed to ${reviewAction} content`);
    }
  };

  const getInstitutionContentCount = (institutionData) => {
    let count = 0;
    Object.values(institutionData.courses).forEach(course => {
      Object.values(course.units).forEach(unit => {
        count += unit.content.length;
      });
    });
    return count;
  };

  const getCourseContentCount = (courseData) => {
    let count = 0;
    Object.values(courseData.units).forEach(unit => {
      count += unit.content.length;
    });
    return count;
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" color="primary" sx={{ fontWeight: 600, mb: 2 }}>
            Hierarchical Content Approval
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review content organized by University → Course → Unit structure
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {stats.pending}
                </Typography>
                <Typography variant="body2">Pending Review</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {stats.approved}
                </Typography>
                <Typography variant="body2">Approved</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {stats.rejected}
                </Typography>
                <Typography variant="body2">Rejected</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {Object.keys(groupedContent).length}
                </Typography>
                <Typography variant="body2">Institutions</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Hierarchical Content Display */}
        <Paper sx={{ p: 2 }}>
          {Object.keys(groupedContent).length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <PendingActions sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No pending content to review
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All content has been reviewed and approved!
              </Typography>
            </Box>
          ) : (
            <Box>
              {Object.entries(groupedContent).map(([institutionId, institutionData]) => {
                const isInstitutionExpanded = expandedInstitutions.has(institutionId);
                const institutionContentCount = getInstitutionContentCount(institutionData);
                
                return (
                  <Card key={institutionId} sx={{ mb: 2, border: 1, borderColor: 'divider' }}>
                    {/* Institution Header */}
                    <CardContent 
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                        transition: 'background-color 0.2s'
                      }}
                      onClick={() => toggleInstitution(institutionId)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <School />
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {institutionData.institution.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {institutionData.institution.location?.town}, {institutionData.institution.location?.county}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Badge badgeContent={institutionContentCount} color="warning">
                            <Chip 
                              label={`${Object.keys(institutionData.courses).length} Courses`}
                              color="primary"
                              variant="outlined"
                            />
                          </Badge>
                          {isInstitutionExpanded ? <ExpandLess /> : <ExpandMore />}
                        </Box>
                      </Box>
                    </CardContent>

                    {/* Institution Content */}
                    <Collapse in={isInstitutionExpanded}>
                      <Box sx={{ px: 2, pb: 2 }}>
                        {Object.entries(institutionData.courses).map(([courseId, courseData]) => {
                          const courseKey = `${institutionId}-${courseId}`;
                          const isCourseExpanded = expandedCourses.has(courseKey);
                          const courseContentCount = getCourseContentCount(courseData);
                          
                          return (
                            <Card key={courseKey} sx={{ mb: 2, ml: 2, border: 1, borderColor: 'divider' }}>
                              {/* Course Header */}
                              <CardContent 
                                sx={{ 
                                  cursor: 'pointer',
                                  '&:hover': { bgcolor: 'action.hover' },
                                  transition: 'background-color 0.2s',
                                  py: 2
                                }}
                                onClick={() => toggleCourse(courseKey)}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                                      <MenuBook sx={{ fontSize: 18 }} />
                                    </Avatar>
                                    <Box>
                                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        {courseData.courseName}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        Course ID: {courseId}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Badge badgeContent={courseContentCount} color="warning">
                                      <Chip 
                                        label={`${Object.keys(courseData.units).length} Units`}
                                        color="secondary"
                                        variant="outlined"
                                        size="small"
                                      />
                                    </Badge>
                                    {isCourseExpanded ? <ExpandLess /> : <ExpandMore />}
                                  </Box>
                                </Box>
                              </CardContent>

                              {/* Course Content */}
                              <Collapse in={isCourseExpanded}>
                                <Box sx={{ px: 2, pb: 2 }}>
                                  {Object.entries(courseData.units).map(([unitId, unitData]) => (
                                    <Card key={unitId} sx={{ mb: 2, ml: 2, border: 1, borderColor: 'divider' }}>
                                      {/* Unit Header */}
                                      <CardContent sx={{ py: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                          <Avatar sx={{ bgcolor: 'info.main', width: 28, height: 28 }}>
                                            <Class sx={{ fontSize: 16 }} />
                                          </Avatar>
                                          <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                              {unitData.unitName}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                              Unit ID: {unitId}
                                            </Typography>
                                          </Box>
                                          <Badge badgeContent={unitData.content.length} color="warning" sx={{ ml: 'auto' }}>
                                            <Chip 
                                              label="Pending Content"
                                              color="warning"
                                              variant="outlined"
                                              size="small"
                                            />
                                          </Badge>
                                        </Box>

                                        {/* Unit Content List */}
                                        <List dense>
                                          {unitData.content.map((content, index) => (
                                            <ListItem key={index} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                                              <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                                                {getContentIcon(content.type, { fontSize: 20 })}
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
                                                  onClick={() => handlePreview(content)}
                                                  sx={{ mr: 1 }}
                                                >
                                                  Preview
                                                </Button>
                                                <Button
                                                  size="small"
                                                  startIcon={<CheckCircle />}
                                                  color="success"
                                                  onClick={() => handleReview(content, 'approve')}
                                                  sx={{ mr: 1 }}
                                                >
                                                  Approve
                                                </Button>
                                                <Button
                                                  size="small"
                                                  startIcon={<Cancel />}
                                                  color="error"
                                                  onClick={() => handleReview(content, 'reject')}
                                                >
                                                  Reject
                                                </Button>
                                              </ListItemSecondaryAction>
                                            </ListItem>
                                          ))}
                                        </List>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </Box>
                              </Collapse>
                            </Card>
                          );
                        })}
                      </Box>
                    </Collapse>
                  </Card>
                );
              })}
            </Box>
          )}
        </Paper>

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
                  {selectedContent.topicTitle && ` • ${selectedContent.topicTitle}`}
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

        {/* Content Preview Dialog - Simplified for now */}
        <Dialog 
          open={openPreviewDialog} 
          onClose={() => setOpenPreviewDialog(false)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            Content Preview: {previewContent?.content?.title}
          </DialogTitle>
          <DialogContent>
            {previewContent && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                {getContentIcon(previewContent.type, { fontSize: 64, color: 'text.secondary', mb: 2 })}
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {getContentTypeLabel(previewContent.type)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {previewContent.content.filename}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Visibility />}
                  href={`${backendUrl}/api/upload/file/${previewContent.content.filename}`}
                  target="_blank"
                >
                  View Content
                </Button>
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
                    handleReview(previewContent, 'approve');
                  }}
                >
                  Approve
                </Button>
                <Button
                  startIcon={<Cancel />}
                  color="error"
                  onClick={() => {
                    setOpenPreviewDialog(false);
                    handleReview(previewContent, 'reject');
                  }}
                >
                  Reject
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default HierarchicalContentApproval;
