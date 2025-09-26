import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tabs,
  Tab,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  ArrowBack,
  PlayCircleOutline,
  Description,
  Assignment,
  Quiz,
  VideoLibrary,
  AttachFile
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../../utils/api';

const TopicManagement = ({ unit, program, institution, userRole, onBack }) => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Topic management
  const [openTopicDialog, setOpenTopicDialog] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [topicFormData, setTopicFormData] = useState({
    topicNumber: 1,
    title: '',
    description: '',
    learningOutcomes: [],
    content: {
      lectureVideo: { title: '', filename: '', filePath: '', duration: '', isPremium: false },
      notes: { title: '', filename: '', filePath: '', isPremium: false },
      youtubeResources: []
    }
  });

  // File upload states
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingNotes, setUploadingNotes] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [notesFile, setNotesFile] = useState(null);

  // Assessment management
  const [openAssessmentDialog, setOpenAssessmentDialog] = useState(false);
  const [assessmentType, setAssessmentType] = useState('cats');
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [assessmentFormData, setAssessmentFormData] = useState({
    title: '',
    description: '',
    url: '',
    totalMarks: 100,
    isPremium: true
  });

  useEffect(() => {
    if (unit) {
      setTopics(unit.topics || []);
    }
  }, [unit]);

  const handleVideoUpload = async (file) => {
    if (!file) return null;
    
    setUploadingVideo(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post('/api/upload/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.file;
    } catch (error) {
      console.error('Video upload error:', error);
      setError('Failed to upload video. Please try again.');
      return null;
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleNotesUpload = async (file) => {
    if (!file) return null;
    
    setUploadingNotes(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post('/api/upload/notes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.file;
    } catch (error) {
      console.error('Notes upload error:', error);
      setError('Failed to upload notes. Please try again.');
      return null;
    } finally {
      setUploadingNotes(false);
    }
  };

  const handleTopicSubmit = async () => {
    try {
      let updatedTopicData = { ...topicFormData };
      
      // Upload video file if selected
      if (videoFile) {
        const videoUploadResult = await handleVideoUpload(videoFile);
        if (videoUploadResult) {
          updatedTopicData.content.lectureVideo = {
            ...updatedTopicData.content.lectureVideo,
            filename: videoUploadResult.filename,
            filePath: videoUploadResult.filePath,
            fileSize: videoUploadResult.fileSize,
            status: userRole === 'super_admin' ? 'approved' : 'pending'
          };
        }
      }
      
      // Upload notes file if selected
      if (notesFile) {
        const notesUploadResult = await handleNotesUpload(notesFile);
        if (notesUploadResult) {
          updatedTopicData.content.notes = {
            ...updatedTopicData.content.notes,
            filename: notesUploadResult.filename,
            filePath: notesUploadResult.filePath,
            fileSize: notesUploadResult.fileSize,
            status: userRole === 'super_admin' ? 'approved' : 'pending'
          };
        }
      }
      
      if (editingTopic) {
        await api.put(`/api/courses/${program._id}/units/${unit._id}/topics/${editingTopic._id}`, updatedTopicData);
      } else {
        await api.post(`/api/courses/${program._id}/units/${unit._id}/topics`, updatedTopicData);
      }
      
      // Refresh unit data
      const response = await api.get(`/api/courses/${program._id}`);
      const updatedUnit = response.data.course.units.find(u => u._id === unit._id);
      setTopics(updatedUnit.topics || []);
      
      // Reset form
      setOpenTopicDialog(false);
      setEditingTopic(null);
      setVideoFile(null);
      setNotesFile(null);
    } catch (error) {
      console.error('Error saving topic:', error);
      setError('Failed to save topic. Please try again.');
    }
  };

  const handleAssessmentSubmit = async () => {
    try {
      if (editingAssessment) {
        await api.put(`/api/courses/${program._id}/units/${unit._id}/assessments/${assessmentType}/${editingAssessment._id}`, assessmentFormData);
      } else {
        await api.post(`/api/courses/${program._id}/units/${unit._id}/assessments/${assessmentType}`, assessmentFormData);
      }
      
      setOpenAssessmentDialog(false);
      setEditingAssessment(null);
    } catch (error) {
      console.error('Error saving assessment:', error);
      setError('Failed to save assessment. Please try again.');
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={onBack} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" color="primary" sx={{ fontWeight: 600 }}>
            {unit.unitCode} - {unit.unitName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {program.name} • {institution.shortName}
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab icon={<VideoLibrary />} label="Topics & Content" />
          <Tab icon={<Assignment />} label="Assessments" />
        </Tabs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Topics Tab */}
      {tabValue === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6">Topics & Learning Content</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setTopicFormData({
                  topicNumber: topics.length + 1,
                  title: '',
                  description: '',
                  learningOutcomes: [],
                  content: {
                    lectureVideo: { title: '', url: '', duration: '', isPremium: false },
                    notes: { title: '', url: '', fileType: 'pdf', isPremium: false }
                  }
                });
                setOpenTopicDialog(true);
              }}
            >
              Add Topic
            </Button>
          </Box>

          <Grid container spacing={3}>
            {topics.map((topic) => (
              <Grid item xs={12} md={6} key={topic._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">
                        Topic {topic.topicNumber}: {topic.title}
                      </Typography>
                      <Box>
                        <IconButton size="small" onClick={() => {
                          setEditingTopic(topic);
                          setTopicFormData(topic);
                          setOpenTopicDialog(true);
                        }}>
                          <Edit />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {topic.description}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {topic.content?.lectureVideo?.filename && (
                        <Chip 
                          icon={<PlayCircleOutline />} 
                          label={`Video: ${topic.content.lectureVideo.filename}`}
                          color="primary" 
                          size="small"
                        />
                      )}
                      {topic.content?.notes?.filename && (
                        <Chip 
                          icon={<Description />} 
                          label={`Notes: ${topic.content.notes.filename}`}
                          color="secondary" 
                          size="small"
                        />
                      )}
                      {topic.content?.youtubeResources?.length > 0 && (
                        <Chip 
                          icon={<VideoLibrary />} 
                          label={`${topic.content.youtubeResources.length} YouTube Links`}
                          color="info" 
                          size="small"
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Assessments Tab */}
      {tabValue === 1 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 3 }}>Unit Assessments</Typography>
          {/* Assessment content will go here */}
        </Box>
      )}

      {/* Topic Dialog */}
      <Dialog open={openTopicDialog} onClose={() => setOpenTopicDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingTopic ? 'Edit Topic' : 'Add New Topic'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Topic Number"
                type="number"
                value={topicFormData.topicNumber}
                onChange={(e) => setTopicFormData(prev => ({
                  ...prev,
                  topicNumber: parseInt(e.target.value)
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Topic Title"
                value={topicFormData.title}
                onChange={(e) => setTopicFormData(prev => ({
                  ...prev,
                  title: e.target.value
                }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={topicFormData.description}
                onChange={(e) => setTopicFormData(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
              />
            </Grid>
            
            {/* Lecture Video Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Lecture Video Upload
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Video Title"
                value={topicFormData.content.lectureVideo.title}
                onChange={(e) => setTopicFormData(prev => ({
                  ...prev,
                  content: {
                    ...prev.content,
                    lectureVideo: {
                      ...prev.content.lectureVideo,
                      title: e.target.value
                    }
                  }
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duration (e.g., 45 min)"
                value={topicFormData.content.lectureVideo.duration}
                onChange={(e) => setTopicFormData(prev => ({
                  ...prev,
                  content: {
                    ...prev.content,
                    lectureVideo: {
                      ...prev.content.lectureVideo,
                      duration: e.target.value
                    }
                  }
                }))}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ border: '2px dashed #ccc', borderRadius: 2, p: 3, textAlign: 'center' }}>
                <input
                  accept="video/*"
                  style={{ display: 'none' }}
                  id="video-upload"
                  type="file"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                />
                <label htmlFor="video-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<VideoLibrary />}
                    disabled={uploadingVideo}
                    sx={{ mb: 1 }}
                  >
                    {uploadingVideo ? 'Uploading...' : 'Choose Video File'}
                  </Button>
                </label>
                {videoFile && (
                  <Typography variant="body2" color="text.secondary">
                    Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                  </Typography>
                )}
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                  Supported formats: MP4, AVI, MOV, WMV (Max: 500MB)
                </Typography>
              </Box>
            </Grid>
            
            {/* Notes Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                PDF Notes Upload
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Notes Title"
                value={topicFormData.content.notes.title}
                onChange={(e) => setTopicFormData(prev => ({
                  ...prev,
                  content: {
                    ...prev.content,
                    notes: {
                      ...prev.content.notes,
                      title: e.target.value
                    }
                  }
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={topicFormData.content.notes.isPremium}
                    onChange={(e) => setTopicFormData(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        notes: {
                          ...prev.content.notes,
                          isPremium: e.target.checked
                        }
                      }
                    }))}
                  />
                }
                label="Premium Content"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ border: '2px dashed #ccc', borderRadius: 2, p: 3, textAlign: 'center' }}>
                <input
                  accept=".pdf"
                  style={{ display: 'none' }}
                  id="notes-upload"
                  type="file"
                  onChange={(e) => setNotesFile(e.target.files[0])}
                />
                <label htmlFor="notes-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<Description />}
                    disabled={uploadingNotes}
                    sx={{ mb: 1 }}
                  >
                    {uploadingNotes ? 'Uploading...' : 'Choose PDF File'}
                  </Button>
                </label>
                {notesFile && (
                  <Typography variant="body2" color="text.secondary">
                    Selected: {notesFile.name} ({(notesFile.size / 1024 / 1024).toFixed(2)} MB)
                  </Typography>
                )}
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                  PDF files only (Max: 10MB)
                </Typography>
              </Box>
            </Grid>

            {/* YouTube Resources Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                YouTube Resources (Optional)
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="YouTube Title"
                placeholder="Additional Research Video"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="YouTube URL"
                placeholder="https://youtube.com/watch?v=..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTopicDialog(false)}>Cancel</Button>
          <Button onClick={handleTopicSubmit} variant="contained">
            {editingTopic ? 'Update' : 'Add'} Topic
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TopicManagement;
