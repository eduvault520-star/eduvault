import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  IconButton,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Add as AddIcon,
  Upload as UploadIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  Image as ImageIcon,
  Security as SecurityIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const CATsExamsManagement = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [cats, setCats] = useState([]);
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [units, setUnits] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('cat'); // 'cat' or 'exam'
  const [formData, setFormData] = useState({
    title: '',
    courseId: '',
    unitId: '',
    unitName: '',
    description: '',
    dueDate: '',
    totalMarks: '',
    duration: '',
    instructions: '',
    image: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [previewDialog, setPreviewDialog] = useState({ open: false, content: null });

  useEffect(() => {
    fetchCourses();
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      console.log('📚 Fetching assessments from server...');
      
      // Fetch all assessments for this admin
      const response = await api.get('/api/admin/assessments');
      const assessments = response.data.assessments || [];
      
      console.log('📋 Fetched assessments:', assessments);
      
      // Separate CATs and Exams
      const catsData = assessments.filter(a => a.type === 'cats');
      const examsData = assessments.filter(a => a.type === 'pastExams');
      
      setCats(catsData);
      setExams(examsData);
      
    } catch (error) {
      console.error('Error fetching assessments:', error);
      setError('Failed to load assessments. Please try again.');
      setCats([]);
      setExams([]);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const [coursesResponse] = await Promise.allSettled([
        api.get('/api/courses')
      ]);

      // Try to fetch user's submitted assessments (pending approval)
      try {
        const userAssessments = await api.get('/api/admin/my-assessments');
        const assessments = userAssessments.data.assessments || [];
        
        // Separate CATs and Exams
        const cats = assessments.filter(a => a.type === 'cats' || a.assessmentType === 'cat');
        const exams = assessments.filter(a => a.type === 'pastExams' || a.assessmentType === 'exam');
        
        setCats(cats);
        setExams(exams);
      } catch (error) {
        console.log('No user assessments endpoint, using empty arrays');
        setCats([]);
        setExams([]);
      }

      // Process Courses
      if (coursesResponse.status === 'fulfilled') {
        setCourses(coursesResponse.value.data.courses || []);
      } else {
        // Mock Courses data
        setCourses([
          {
            _id: 'course1',
            name: 'Computer Science',
            code: 'CS',
            units: [
              {
                _id: 'cs101',
                code: 'CS101',
                unitName: 'Computer Science Fundamentals',
                year: 1,
                semester: 1
              },
              {
                _id: 'cs102',
                code: 'CS102',
                unitName: 'Programming Fundamentals',
                year: 1,
                semester: 2
              }
            ]
          }
        ]);
      }

      // Initialize empty units - will be loaded when course is selected
      setUnits([]);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Using sample data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnitsForCourse = async (courseId) => {
    try {
      const response = await api.get(`/api/courses/${courseId}`);
      const course = response.data.course;
      if (course && course.units) {
        setUnits(course.units);
      } else {
        setUnits([]);
      }
    } catch (error) {
      console.error('Error fetching course units:', error);
      // Try to find course in local state
      const selectedCourse = courses.find(c => c._id === courseId);
      if (selectedCourse && selectedCourse.units) {
        setUnits(selectedCourse.units);
      } else {
        setUnits([]);
      }
    }
  };

  const handleOpenDialog = (type) => {
    setSelectedType(type);
    setFormData({
      title: '',
      courseId: '',
      unitId: '',
      unitName: '',
      description: '',
      dueDate: '',
      totalMarks: '',
      duration: '',
      instructions: '',
      image: null
    });
    setImagePreview('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData({
      title: '',
      courseId: '',
      unitId: '',
      unitName: '',
      description: '',
      dueDate: '',
      totalMarks: '',
      duration: '',
      instructions: '',
      image: null
    });
    setImagePreview('');
    setError('');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Load units when course is selected
    if (field === 'courseId') {
      if (value) {
        fetchUnitsForCourse(value);
      } else {
        setUnits([]);
      }
      // Reset unit selection when course changes
      setFormData(prev => ({
        ...prev,
        unitId: '',
        unitName: ''
      }));
    }

    // Auto-fill unit name when unit is selected
    if (field === 'unitId') {
      const selectedUnit = units.find(unit => unit._id === value);
      if (selectedUnit) {
        setFormData(prev => ({
          ...prev,
          unitId: value,
          unitName: selectedUnit.name
        }));
      }
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.title || !formData.courseId || !formData.unitId || !formData.dueDate || !formData.image) {
        setError('Please fill in all required fields including course, unit, and upload an image');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('courseId', formData.courseId);
      formDataToSend.append('unitId', formData.unitId);
      formDataToSend.append('unitName', formData.unitName);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('dueDate', formData.dueDate);
      formDataToSend.append('totalMarks', formData.totalMarks);
      formDataToSend.append('duration', formData.duration);
      formDataToSend.append('instructions', formData.instructions);
      formDataToSend.append('assessmentType', selectedType); // cats, assignments, or pastExams
      formDataToSend.append('file', formData.image); // The assessment file

      // Use the assessment upload endpoint that requires approval
      const endpoint = '/api/upload/assessment';
      const response = await api.post(endpoint, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Assessment uploaded successfully:', response.data);
      
      setSuccess(`${selectedType.toUpperCase()} submitted for approval! It will appear to students once approved by Super Admin.`);
      handleCloseDialog();
      
      // Refresh the assessments list from server instead of using local state
      await fetchAssessments();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error creating CAT/Exam:', error);
      setError(`Failed to create ${selectedType}. Please try again.`);
    }
  };

  const handlePreview = (content) => {
    setPreviewDialog({ open: true, content });
  };

  const handleDelete = async (id, type) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        const endpoint = type === 'cat' ? `/api/admin/cats/${id}` : `/api/admin/exams/${id}`;
        await api.delete(endpoint);
        
        setSuccess(`${type.toUpperCase()} deleted successfully!`);
        fetchData(); // Refresh data
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error(`Error deleting ${type}:`, error);
        setError(`Failed to delete ${type}. Please try again.`);
      }
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          📝 CATs & Exams Management
          <SecurityIcon color="error" />
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create and manage secure CATs and Exams with image-based questions. All images are protected against screenshots.
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Quick Actions */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom color="primary">
              📋 Create New Assessment
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<QuizIcon />}
                onClick={() => handleOpenDialog('cat')}
                fullWidth
              >
                Create CAT
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<AssignmentIcon />}
                onClick={() => handleOpenDialog('exam')}
                fullWidth
              >
                Create Exam
              </Button>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom color="success.main">
              📊 Quick Stats
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">{cats.length}</Typography>
                  <Typography variant="caption">Active CATs</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="secondary">{exams.length}</Typography>
                  <Typography variant="caption">Scheduled Exams</Typography>
                </Box>
              </Grid>
            </Grid>
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
                📋 Continuous Assessment Tests (CATs)
              </Typography>
              {cats.length === 0 ? (
                <Card variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                  <QuizIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No CATs Created Yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Create your first CAT to get started with assessments.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog('cat')}
                  >
                    Create First CAT
                  </Button>
                </Card>
              ) : (
                <Grid container spacing={3}>
                  {cats.map((cat) => (
                    <Grid item xs={12} md={6} lg={4} key={cat._id}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant="h6" gutterBottom>
                              {cat.title}
                            </Typography>
                            <Chip
                              label={cat.status.toUpperCase()}
                              color={getStatusColor(cat.status)}
                              size="small"
                            />
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            📚 {cat.unitName}
                          </Typography>
                          
                          <Typography variant="body2" sx={{ mb: 2 }}>
                            {cat.description}
                          </Typography>
                          
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              📅 Due: {formatDate(cat.dueDate)}
                            </Typography>
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              📊 Marks: {cat.totalMarks} | ⏱️ Duration: {cat.duration} min
                            </Typography>
                          </Box>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<ViewIcon />}
                              onClick={(e) => {
                                e.preventDefault();
                                handlePreview(cat);
                              }}
                            >
                              Preview
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDelete(cat._id, 'cat')}
                            >
                              Delete
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* Exams Tab */}
          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                📝 Final Examinations
              </Typography>
              {exams.length === 0 ? (
                <Card variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                  <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Exams Scheduled Yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Schedule your first exam to begin final assessments.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog('exam')}
                  >
                    Schedule First Exam
                  </Button>
                </Card>
              ) : (
                <Grid container spacing={3}>
                  {exams.map((exam) => (
                    <Grid item xs={12} md={6} lg={4} key={exam._id}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant="h6" gutterBottom>
                              {exam.title}
                            </Typography>
                            <Chip
                              label={exam.status.toUpperCase()}
                              color={getStatusColor(exam.status)}
                              size="small"
                            />
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            📚 {exam.unitName}
                          </Typography>
                          
                          <Typography variant="body2" sx={{ mb: 2 }}>
                            {exam.description}
                          </Typography>
                          
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              📅 Scheduled: {formatDate(exam.dueDate)}
                            </Typography>
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              📊 Marks: {exam.totalMarks} | ⏱️ Duration: {exam.duration} min
                            </Typography>
                          </Box>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<ViewIcon />}
                              onClick={(e) => {
                                e.preventDefault();
                                handlePreview(exam);
                              }}
                            >
                              Preview
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDelete(exam._id, 'exam')}
                            >
                              Delete
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Create CAT/Exam Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedType === 'cat' ? '📋 Create New CAT' : '📝 Schedule New Exam'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder={`Enter ${selectedType} title`}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Course</InputLabel>
                <Select
                  value={formData.courseId}
                  onChange={(e) => handleInputChange('courseId', e.target.value)}
                  label="Course"
                >
                  {courses.map((course) => (
                    <MenuItem key={course._id} value={course._id}>
                      {course.code} - {course.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required disabled={!formData.courseId}>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={formData.unitId}
                  onChange={(e) => handleInputChange('unitId', e.target.value)}
                  label="Unit"
                >
                  {units.map((unit) => (
                    <MenuItem key={unit._id} value={unit._id}>
                      {unit.code} - {unit.unitName || unit.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Due Date & Time"
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Total Marks"
                type="number"
                value={formData.totalMarks}
                onChange={(e) => handleInputChange('totalMarks', e.target.value)}
                placeholder="100"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="60"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<UploadIcon />}
                sx={{ height: '56px' }}
              >
                Upload Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the assessment"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Instructions"
                multiline
                rows={3}
                value={formData.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                placeholder="Special instructions for students"
              />
            </Grid>
            
            {imagePreview && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Image Preview:
                </Typography>
                <Box sx={{ 
                  border: 1, 
                  borderColor: 'grey.300', 
                  borderRadius: 1, 
                  p: 2, 
                  textAlign: 'center',
                  bgcolor: 'grey.50'
                }}>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '300px',
                      objectFit: 'contain'
                    }} 
                  />
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.title || !formData.unitId || !formData.dueDate || !formData.image}
          >
            Create {selectedType.toUpperCase()}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog 
        open={previewDialog.open} 
        onClose={() => setPreviewDialog({ open: false, content: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {previewDialog.content?.assessmentType?.toUpperCase() || previewDialog.content?.type?.toUpperCase()} Preview: {previewDialog.content?.title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Course: {previewDialog.content?.courseName || 'Unknown Course'}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Unit: {previewDialog.content?.unitName || 'Unknown Unit'}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Total Marks: {previewDialog.content?.totalMarks || 'Not specified'}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Duration: {previewDialog.content?.duration || 'Not specified'} minutes
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Status: {previewDialog.content?.status || 'Pending Approval'}
          </Typography>
          
          {previewDialog.content?.description && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Description:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {previewDialog.content.description}
              </Typography>
            </>
          )}

          {previewDialog.content?.instructions && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Instructions:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {previewDialog.content.instructions}
              </Typography>
            </>
          )}

          {previewDialog.content?.filename && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Assessment File:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                📄 {previewDialog.content.filename}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog({ open: false, content: null })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CATsExamsManagement;
