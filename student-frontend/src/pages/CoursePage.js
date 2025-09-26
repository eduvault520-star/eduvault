import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  Button,
  CircularProgress,
  Tabs,
  Tab,
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
  Avatar,
  Badge,
  useTheme,
  alpha,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  School,
  PlayCircleOutline,
  GetApp,
  Quiz,
  Schedule,
  People,
  Star,
  BookmarkBorder,
  Share,
  ExpandMore,
  VideoLibrary,
  Description,
  Assignment,
  YouTube,
  Lock,
  CheckCircle,
  Security,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import AuthenticatedVideo from '../components/AuthenticatedVideo';
import SubscriptionDialog from '../components/SubscriptionDialog';
import SecureContentViewer from '../components/SecureContentViewer';
import SecureImageViewer from '../components/SecureImageViewer';

const CoursePage = () => {
  const [course, setCourse] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [selectedYear, setSelectedYear] = useState(1);
  const [subscriptions, setSubscriptions] = useState({});
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  
  // Subscription dialog state
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [subscriptionYear, setSubscriptionYear] = useState(1);
  
  // Secure content viewer state
  const [secureViewerOpen, setSecureViewerOpen] = useState(false);
  const [secureContent, setSecureContent] = useState(null);
  
  // Secure image viewer state (for CATs and Exams)
  const [secureImageViewerOpen, setSecureImageViewerOpen] = useState(false);
  const [secureImageContent, setSecureImageContent] = useState(null);
  
  const { id } = useParams();
  const theme = useTheme();

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      // Fetch real course data from API
      const courseResponse = await api.get(`/api/courses/${id}`);
      setCourse(courseResponse.data.course);
      
      // Fetch approved content for students
      try {
        const contentResponse = await api.get(`/api/student/course/${id}/content`);
        setResources(contentResponse.data.content || []);
        setSubscriptions(contentResponse.data.subscriptions || {});
        setSubscriptionInfo(contentResponse.data.subscriptionInfo);
        console.log('📚 Loaded approved content:', contentResponse.data);
      } catch (contentError) {
        console.log('No approved content found for this course');
        setResources([]);
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
      setError('Failed to load course data. Please try again later.');
      setCourse(null);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'video': return <VideoLibrary />;
      case 'notes': return <Description />;
      case 'cats': return <Quiz />;
      case 'assignments': return <Assignment />;
      case 'pastExams': return <School />;
      case 'youtube': return <YouTube />;
      default: return <Description />;
    }
  };

  const getResourceColor = (type) => {
    switch (type) {
      case 'video': return theme.palette.primary.main;
      case 'notes': return theme.palette.secondary.main;
      case 'cats': return theme.palette.warning.main;
      case 'assignments': return theme.palette.success.main;
      case 'pastExams': return theme.palette.info.main;
      case 'youtube': return '#ff0000';
      default: return theme.palette.grey[500];
    }
  };

  const getResourceTypeLabel = (type) => {
    switch (type) {
      case 'video': return 'Lecture Video';
      case 'notes': return 'PDF Notes';
      case 'cats': return 'CAT';
      case 'assignments': return 'Assignment';
      case 'pastExams': return 'Past Exam';
      case 'youtube': return 'YouTube Video';
      default: return type;
    }
  };

  const filteredResources = resources.filter(resource => resource.unit?.year === selectedYear);

  // Helper functions
  const hasSubscription = (year) => {
    return subscriptions[year] || false;
  };

  const handleSubscriptionClick = (year) => {
    setSubscriptionYear(year);
    setShowSubscriptionDialog(true);
  };

  const handleSubscriptionSuccess = (subscription) => {
    // Update subscriptions state
    setSubscriptions(prev => ({
      ...prev,
      [subscription.year]: true
    }));
    
    // Refresh content to get updated access
    fetchCourseData();
  };

  const handleSecureView = (content) => {
    if (content.accessRules?.preventScreenshot || content.accessRules?.viewOnlyOnSite) {
      setSecureContent(content);
      setSecureViewerOpen(true);
    }
  };

  const handleSecureImageView = (content) => {
    // For CATs and Exams, use the new SecureImageViewer
    console.log('🔍 CoursePage - handleSecureImageView called with:', content);
    if (['cats', 'pastExams'].includes(content.type)) {
      // Clean up the ID - remove any malformed parts and use a valid ObjectId
      let cleanId = content._id || content.id || '507f1f77bcf86cd799439011';
      
      // If ID contains hyphens or looks malformed, use fallback
      if (typeof cleanId === 'string' && (cleanId.includes('-') || cleanId.length !== 24)) {
        cleanId = '507f1f77bcf86cd799439011'; // Valid ObjectId for development
      }
      
      const contentWithValidId = {
        ...content,
        _id: cleanId,
        id: cleanId
      };
      
      console.log('🔧 Using cleaned ID:', cleanId);
      setSecureImageContent(contentWithValidId);
      setSecureImageViewerOpen(true);
    }
  };

  const handleDownloadClick = (content) => {
    if (content.accessRules?.downloadRequiresSubscription && !hasSubscription(content.unit.year)) {
      handleSubscriptionClick(content.unit.year);
    } else if (content.accessRules?.canDownload) {
      // Allow download
      const downloadUrl = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001'}/api/upload/file/${content.filename}`;
      window.open(downloadUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Course Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          py: 6,
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
                      width: 70,
                      height: 70,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      mr: 3,
                    }}
                  >
                    <School sx={{ fontSize: 35 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                      {course?.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip 
                        label={course?.code}
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.2)', 
                          color: 'white',
                          fontWeight: 600 
                        }}
                      />
                      <Chip 
                        label={course?.department}
                        sx={{ 
                          bgcolor: theme.palette.secondary.main,
                          color: 'white',
                          fontWeight: 600 
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
                
                <Typography variant="h6" sx={{ mb: 3, opacity: 0.9, lineHeight: 1.6 }}>
                  {course?.description}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule sx={{ fontSize: 20 }} />
                    <Typography variant="body1">
                      {course?.duration.years} Years
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <People sx={{ fontSize: 20 }} />
                    <Typography variant="body1">
                      {course?.totalStudents} Students
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Star sx={{ fontSize: 20, color: '#ffc107' }} />
                    <Typography variant="body1">
                      {course?.rating} Rating
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<PlayCircleOutline />}
                    sx={{
                      bgcolor: theme.palette.secondary.main,
                      '&:hover': { bgcolor: theme.palette.secondary.dark },
                    }}
                  >
                    Start Learning
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
                    Course Progress
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Completion</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {course?.completionRate}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={course?.completionRate || 0} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Resources</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{resources.length}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Institution</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {course?.institution?.shortName || course?.institution?.name || 'N/A'}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Year Navigation */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Course Content
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
            {Array.from({ length: course?.duration?.years || 3 }, (_, i) => i + 1).map((year) => (
              <Button
                key={year}
                variant={selectedYear === year ? "contained" : "outlined"}
                onClick={() => setSelectedYear(year)}
                sx={{
                  minWidth: 120,
                  py: 1.5,
                  fontWeight: 600,
                  borderRadius: 3,
                }}
              >
                Year {year}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Course Units Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Course Units - Year {selectedYear}
          </Typography>
          
          {course?.units && course.units.length > 0 ? (
            <Grid container spacing={2}>
              {[1, 2].map((semester) => {
                const semesterUnits = course.units.filter(
                  unit => unit.year === selectedYear && unit.semester === semester
                );
                
                return (
                  <Grid item xs={12} md={6} key={semester}>
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Semester {semester}
                      </Typography>
                      
                      {semesterUnits.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          No units available for this semester
                        </Typography>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {semesterUnits.map((unit) => (
                            <Card key={unit._id} variant="outlined">
                              <CardContent sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {unit.unitCode}
                                  </Typography>
                                  <Chip 
                                    label={`${unit.creditHours} CH`}
                                    size="small"
                                    color="primary"
                                  />
                                </Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  {unit.unitName}
                                </Typography>
                                {unit.description && (
                                  <Typography variant="body2" sx={{ mt: 1 }}>
                                    {unit.description}
                                  </Typography>
                                )}
                                {unit.prerequisites && unit.prerequisites.length > 0 && (
                                  <Box sx={{ mt: 1 }}>
                                    <Typography variant="caption" color="warning.main">
                                      Prerequisites: {unit.prerequisites.join(', ')}
                                    </Typography>
                                  </Box>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No units available for Year {selectedYear} yet.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Units will appear here once they are added by administrators.
              </Typography>
            </Paper>
          )}
        </Box>

        {/* Resources Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Learning Resources - Year {selectedYear}
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          {filteredResources.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  No resources available for Year {selectedYear} yet.
                </Typography>
              </Paper>
            </Grid>
          ) : (
            filteredResources.map((resource) => (
              <Grid item xs={12} key={resource.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card 
                    sx={{ 
                      mb: 3,
                      overflow: 'hidden',
                      border: resource.isPremium ? '2px solid #ffa726' : '1px solid #e0e0e0'
                    }}
                  >
                    <CardContent sx={{ p: 0 }}>
                      {/* Content Header */}
                      <Box sx={{ p: 3, pb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: alpha(getResourceColor(resource.type), 0.1),
                              color: getResourceColor(resource.type),
                              width: 50,
                              height: 50,
                              mr: 2,
                            }}
                          >
                            {getResourceIcon(resource.type)}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                                {resource.title}
                              </Typography>
                              {resource.isPremium && (
                                <Chip 
                                  label="PREMIUM" 
                                  size="small" 
                                  color="warning"
                                  icon={<Lock />}
                                />
                              )}
                            </Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {resource.unit?.name} • Year {resource.unit?.year} • Semester {resource.unit?.semester}
                            </Typography>
                            {resource.topic && (
                              <Typography variant="caption" color="text.secondary">
                                Topic {resource.topic.number}: {resource.topic.title}
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          <Chip 
                            label={getResourceTypeLabel(resource.type)}
                            size="small"
                            sx={{ 
                              bgcolor: alpha(getResourceColor(resource.type), 0.1),
                              color: getResourceColor(resource.type),
                              fontWeight: 600
                            }}
                          />
                          {resource.duration && (
                            <Chip 
                              label={resource.duration}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {resource.fileSize && (
                            <Chip 
                              label={`${(resource.fileSize / 1024 / 1024).toFixed(1)} MB`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>

                        {resource.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {resource.description}
                          </Typography>
                        )}
                      </Box>

                      {/* Content Viewer */}
                      {resource.type === 'video' && resource.hasAccess && resource.filename && (
                        <Box sx={{ px: 3, pb: 3 }}>
                          <AuthenticatedVideo 
                            filename={resource.filename}
                            backendUrl={process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001'}
                            isPremium={resource.isPremium}
                            hasSubscription={hasSubscription(resource.unit.year)}
                          />
                        </Box>
                      )}

                      {/* Premium Video Placeholder */}
                      {resource.type === 'video' && !resource.hasAccess && (
                        <Box sx={{ px: 3, pb: 3 }}>
                          <Paper 
                            sx={{ 
                              p: 4, 
                              textAlign: 'center',
                              bgcolor: 'grey.100',
                              border: '2px dashed #ffa726'
                            }}
                          >
                            <Lock sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                              Premium Content
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              Subscribe to access this video lecture
                            </Typography>
                            <Button
                              variant="contained"
                              color="warning"
                              onClick={() => handleSubscriptionClick(resource.unit.year)}
                              startIcon={<Star />}
                            >
                              Subscribe for KSH {subscriptionInfo?.price || 100}
                            </Button>
                          </Paper>
                        </Box>
                      )}

                      {/* Action Buttons */}
                      <Box sx={{ p: 3, pt: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          {/* Notes - Download with subscription */}
                          {resource.type === 'notes' && resource.filename && (
                            <>
                              {resource.accessRules?.canDownload ? (
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<GetApp />}
                                  onClick={() => handleDownloadClick(resource)}
                                  sx={{ borderRadius: 2 }}
                                >
                                  Download PDF
                                </Button>
                              ) : (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<Lock />}
                                  onClick={() => handleSubscriptionClick(resource.unit.year)}
                                  sx={{ borderRadius: 2 }}
                                >
                                  Subscribe to Download
                                </Button>
                              )}
                            </>
                          )}

                          {/* YouTube - Always accessible if not premium */}
                          {resource.type === 'youtube' && resource.url && resource.hasAccess && (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<YouTube />}
                              href={resource.url}
                              target="_blank"
                              sx={{ borderRadius: 2 }}
                            >
                              Watch on YouTube
                            </Button>
                          )}

                          {/* Assignments - Always free */}
                          {resource.type === 'assignments' && resource.filename && (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<Assignment />}
                              href={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001'}/api/upload/file/${resource.filename}`}
                              target="_blank"
                              sx={{ borderRadius: 2, bgcolor: 'success.main' }}
                            >
                              Download Assignment (Free)
                            </Button>
                          )}

                          {/* CATs and Past Exams - Secure image view only */}
                          {['cats', 'pastExams'].includes(resource.type) && resource.filename && (
                            <>
                              {resource.hasAccess ? (
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<Security />}
                                  onClick={() => handleSecureImageView(resource)}
                                  sx={{ borderRadius: 2, bgcolor: 'warning.main' }}
                                >
                                  🔒 View {getResourceTypeLabel(resource.type)} (Secure)
                                </Button>
                              ) : (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<Lock />}
                                  onClick={() => handleSubscriptionClick(resource.unit.year)}
                                  sx={{ borderRadius: 2 }}
                                >
                                  Subscribe to Access
                                </Button>
                              )}
                            </>
                          )}

                          {/* Subscription status indicator */}
                          {hasSubscription(resource.unit.year) && (
                            <Chip
                              label="Premium Active"
                              color="success"
                              size="small"
                              icon={<CheckCircle />}
                            />
                          )}

                          <IconButton size="small">
                            <BookmarkBorder />
                          </IconButton>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Uploaded: {new Date(resource.uploadDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))
          )}
        </Grid>

        {/* Course Information Accordions */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Course Information
          </Typography>
          
          {course?.entryRequirements && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Entry Requirements</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">{course.entryRequirements}</Typography>
              </AccordionDetails>
            </Accordion>
          )}

          {course?.careerProspects && course.careerProspects.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Career Prospects</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box component="ul" sx={{ pl: 2 }}>
                  {course.careerProspects.map((prospect, index) => (
                    <Box component="li" key={index} sx={{ mb: 1 }}>
                      <Typography variant="body2">{prospect}</Typography>
                    </Box>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          )}

          {course?.description && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Course Description</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">{course.description}</Typography>
              </AccordionDetails>
            </Accordion>
          )}
        </Box>
      </Container>

      {/* Subscription Dialog */}
      <SubscriptionDialog
        open={showSubscriptionDialog}
        onClose={() => setShowSubscriptionDialog(false)}
        courseId={id}
        courseName={course?.name}
        year={subscriptionYear}
        onSubscriptionSuccess={handleSubscriptionSuccess}
      />

      {/* Secure Content Viewer (for other content types) */}
      <Dialog
        open={secureViewerOpen}
        onClose={() => setSecureViewerOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {secureContent && (
            <SecureContentViewer
              filename={secureContent.filename}
              contentType={secureContent.type === 'cats' || secureContent.type === 'pastExams' ? 'pdf' : 'image'}
              title={secureContent.title}
              backendUrl={process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001'}
              preventScreenshot={true}
              preventRecording={true}
              onClose={() => setSecureViewerOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Secure Image Viewer (for CATs and Exams) */}
      {secureImageContent && (
        <SecureImageViewer
          type={secureImageContent.type}
          id={secureImageContent._id || secureImageContent.id}
          open={secureImageViewerOpen}
          onClose={() => {
            setSecureImageViewerOpen(false);
            setSecureImageContent(null);
          }}
        />
      )}
    </Box>
  );
};

export default CoursePage;
