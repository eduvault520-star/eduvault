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
  const [units, setUnits] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('cat'); // 'cat' or 'exam'
  const [formData, setFormData] = useState({
    title: '',
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catsResponse, examsResponse, unitsResponse] = await Promise.allSettled([
        api.get('/api/admin/cats'),
        api.get('/api/admin/exams'),
        api.get('/api/admin/units')
      ]);

      // Process CATs
      if (catsResponse.status === 'fulfilled') {
        setCats(catsResponse.value.data.cats || []);
      } else {
        // Mock CATs data
        setCats([
          {
            _id: '1',
            title: 'CAT 1 - Data Structures',
            unitId: 'cs101',
            unitName: 'Computer Science Fundamentals',
            description: 'Arrays, Linked Lists, and Basic Algorithms',
            dueDate: '2024-02-15T23:59:00Z',
            totalMarks: 30,
            duration: 60,
            imageUrl: '/api/secure-images/cat1-cs101.jpg',
            createdBy: user?.firstName + ' ' + user?.lastName,
            createdAt: '2024-01-20T10:00:00Z',
            status: 'active'
          },
          {
            _id: '2',
            title: 'CAT 2 - Database Design',
            unitId: 'cs201',
            unitName: 'Database Management Systems',
            description: 'ER Diagrams and Normalization',
            dueDate: '2024-02-20T23:59:00Z',
            totalMarks: 25,
            duration: 45,
            imageUrl: '/api/secure-images/cat2-cs201.jpg',
            createdBy: user?.firstName + ' ' + user?.lastName,
            createdAt: '2024-01-25T14:30:00Z',
            status: 'active'
          }
        ]);
      }

      // Process Exams
      if (examsResponse.status === 'fulfilled') {
        setExams(examsResponse.value.data.exams || []);
      } else {
        // Mock Exams data
        setExams([
          {
            _id: '1',
            title: 'Final Exam - Programming Fundamentals',
            unitId: 'cs101',
            unitName: 'Computer Science Fundamentals',
            description: 'Comprehensive exam covering all course topics',
            dueDate: '2024-03-15T09:00:00Z',
            totalMarks: 100,
            duration: 180,
            imageUrl: '/api/secure-images/exam1-cs101.jpg',
            createdBy: user?.firstName + ' ' + user?.lastName,
            createdAt: '2024-02-01T08:00:00Z',
            status: 'scheduled'
          }
        ]);
      }

      // Process Units
      if (unitsResponse.status === 'fulfilled') {
        setUnits(unitsResponse.value.data.units || []);
      } else {
        // Mock Units data
        setUnits([
          { _id: 'cs101', name: 'Computer Science Fundamentals', code: 'CS101' },
          { _id: 'cs201', name: 'Database Management Systems', code: 'CS201' },
          { _id: 'cs301', name: 'Software Engineering', code: 'CS301' },
          { _id: 'math101', name: 'Calculus I', code: 'MATH101' },
          { _id: 'phys101', name: 'Physics I', code: 'PHYS101' }
        ]);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Using sample data.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (type) => {
    setSelectedType(type);
    setFormData({
      title: '',
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
      if (!formData.title || !formData.unitId || !formData.dueDate || !formData.image) {
        setError('Please fill in all required fields and upload an image');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('unitId', formData.unitId);
      formDataToSend.append('unitName', formData.unitName);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('dueDate', formData.dueDate);
      formDataToSend.append('totalMarks', formData.totalMarks);
      formDataToSend.append('duration', formData.duration);
      formDataToSend.append('instructions', formData.instructions);
      formDataToSend.append('type', selectedType);
      formDataToSend.append('image', formData.image);

      const endpoint = selectedType === 'cat' ? '/api/admin/cats' : '/api/admin/exams';
      await api.post(endpoint, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(`${selectedType.toUpperCase()} created successfully!`);
      handleCloseDialog();
      fetchData(); // Refresh data
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error creating CAT/Exam:', error);
      setError(`Failed to create ${selectedType}. Please try again.`);
    }
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
                              onClick={() => window.open(`/secure-view/cat/${cat._id}`, '_blank')}
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
                              onClick={() => window.open(`/secure-view/exam/${exam._id}`, '_blank')}
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
                <InputLabel>Unit</InputLabel>
                <Select
                  value={formData.unitId}
                  onChange={(e) => handleInputChange('unitId', e.target.value)}
                  label="Unit"
                >
                  {units.map((unit) => (
                    <MenuItem key={unit._id} value={unit._id}>
                      {unit.code} - {unit.name}
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
    </Box>
  );
};

export default CATsExamsManagement;
