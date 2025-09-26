import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Snackbar,
  Avatar,
  Chip
} from '@mui/material';
import {
  VideoLibrary,
  Description,
  Assessment,
  Visibility,
  Check,
  Close,
  Star,
  Download,
  PlayArrow,
  PictureAsPdf,
  Delete,
  Warning
} from '@mui/icons-material';
import api from '../../utils/api';

const RealContentApproval = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingContent, setPendingContent] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  
  // Dialog states
  const [previewDialog, setPreviewDialog] = useState({ open: false, content: null });
  const [reviewDialog, setReviewDialog] = useState({ open: false, content: null, action: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, content: null });
  const [reviewNotes, setReviewNotes] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchPendingContent();
  }, []);

  const fetchPendingContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/content-approval/pending');
      const content = response.data.pendingContent || [];
      
      console.log('📋 Fetched pending content:', content);
      setPendingContent(content);
      setStats({
        pending: content.length,
        approved: 0,
        rejected: 0
      });
      
      if (content.length === 0) {
        setError('No pending content found. All content has been reviewed!');
      }
      
    } catch (error) {
      console.error('Error fetching pending content:', error);
      setError('Failed to fetch pending content. Please check your connection.');
      setPendingContent([]);
      setStats({ pending: 0, approved: 0, rejected: 0 });
    } finally {
      setLoading(false);
    }
  };

  const getContentIcon = (type) => {
    switch (type) {
      case 'video': return <VideoLibrary />;
      case 'notes': return <Description />;
      case 'cats':
      case 'assignments':
      case 'pastExams': return <Assessment />;
      default: return <Description />;
    }
  };

  const getContentColor = (type) => {
    switch (type) {
      case 'video': return 'error';
      case 'notes': return 'primary';
      case 'cats':
      case 'assignments':
      case 'pastExams': return 'warning';
      default: return 'info';
    }
  };

  const handlePreview = (content) => {
    setPreviewDialog({ open: true, content });
  };

  const handleReview = (content, action) => {
    setReviewDialog({ open: true, content, action });
    setReviewNotes('');
    setIsPremium(false);
  };

  const handleDelete = (content) => {
    setDeleteDialog({ open: true, content });
  };

  const handleViewFile = (content) => {
    const fileUrl = content.content?.filePath || content.content?.url;
    if (fileUrl) {
      // Open file in new tab for viewing
      window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${fileUrl}`, '_blank');
    } else {
      setSnackbar({
        open: true,
        message: 'File URL not available',
        severity: 'error'
      });
    }
  };

  const handleDownloadFile = async (content) => {
    try {
      const fileUrl = content.content?.filePath || content.content?.url;
      if (!fileUrl) {
        throw new Error('File URL not available');
      }

      const response = await api.get(`${fileUrl}`, { responseType: 'blob' });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = content.content?.filename || content.content?.originalName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSnackbar({
        open: true,
        message: 'File downloaded successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Download error:', error);
      setSnackbar({
        open: true,
        message: 'Failed to download file',
        severity: 'error'
      });
    }
  };

  const submitReview = async () => {
    try {
      const { content, action } = reviewDialog;
      
      const payload = {
        courseId: content.courseId,
        unitId: content.unitId,
        topicId: content.topicId,
        assessmentId: content.assessmentId,
        contentType: content.type,
        reviewNotes,
        ...(action === 'approve' && { isPremium })
      };

      const endpoint = action === 'approve' ? '/api/content-approval/approve' : '/api/content-approval/reject';
      await api.post(endpoint, payload);
      
      // Remove from pending list
      setPendingContent(prev => prev.filter(c => 
        c.topicId !== content.topicId && c.assessmentId !== content.assessmentId
      ));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        [action === 'approve' ? 'approved' : 'rejected']: prev[action === 'approve' ? 'approved' : 'rejected'] + 1
      }));
      
      setSnackbar({
        open: true,
        message: `Content ${action}d successfully! ${isPremium && action === 'approve' ? '⭐ Marked as Premium' : ''}`,
        severity: 'success'
      });
      
      setReviewDialog({ open: false, content: null, action: null });
      
    } catch (error) {
      console.error('Error submitting review:', error);
      setSnackbar({
        open: true,
        message: `Failed to ${reviewDialog.action} content: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    }
  };

  const deleteContent = async () => {
    try {
      const content = deleteDialog.content;
      
      // Call delete API endpoint
      await api.delete(`/api/content-approval/delete`, {
        data: {
          courseId: content.courseId,
          unitId: content.unitId,
          topicId: content.topicId,
          assessmentId: content.assessmentId,
          contentType: content.type
        }
      });
      
      // Remove from pending list
      setPendingContent(prev => prev.filter(c => 
        c.topicId !== content.topicId && c.assessmentId !== content.assessmentId
      ));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1)
      }));
      
      setSnackbar({
        open: true,
        message: 'Content deleted successfully from database',
        severity: 'success'
      });
      
      setDeleteDialog({ open: false, content: null });
      
    } catch (error) {
      console.error('Error deleting content:', error);
      setSnackbar({
        open: true,
        message: `Failed to delete content: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading pending content...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" color="primary" sx={{ fontWeight: 600, mb: 2 }}>
          📋 Content Approval
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and approve content uploaded by mini admins
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'white' }}>
                {stats.pending}
              </Typography>
              <Typography variant="body2" sx={{ color: 'white' }}>⏳ Pending Review</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'white' }}>
                {stats.approved}
              </Typography>
              <Typography variant="body2" sx={{ color: 'white' }}>✅ Approved</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'error.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'white' }}>
                {stats.rejected}
              </Typography>
              <Typography variant="body2" sx={{ color: 'white' }}>❌ Rejected</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && (
        <Alert severity={pendingContent.length === 0 ? "info" : "error"} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Pending Content List */}
      <Grid container spacing={3}>
        {pendingContent.map((content, index) => (
          <Grid item xs={12} key={`${content.courseId}_${content.unitId}_${content.topicId || content.assessmentId}_${index}`}>
            <Card sx={{ border: 1, borderColor: 'divider' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ 
                    bgcolor: `${getContentColor(content.type)}.main`,
                    color: 'white'
                  }}>
                    {getContentIcon(content.type)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {content.topicTitle || content.content?.title || `${content.type.toUpperCase()} Content`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      📚 Course: {content.courseName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      📖 Unit: {content.unitName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      📁 File: {content.content?.filename || content.content?.originalName || 'Unknown file'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      👤 Uploaded by: {content.content?.uploadedBy || 'Unknown'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      📅 Upload date: {new Date(content.uploadDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip 
                      label={content.type.toUpperCase()} 
                      color={getContentColor(content.type)}
                      size="small"
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => handlePreview(content)}
                    >
                      Preview
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<Check />}
                      onClick={() => handleReview(content, 'approve')}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      startIcon={<Close />}
                      onClick={() => handleReview(content, 'reject')}
                    >
                      Reject
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => handleDelete(content)}
                      sx={{ ml: 1 }}
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {pendingContent.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            🎉 All caught up!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            No pending content to review at the moment.
          </Typography>
          <Button 
            variant="outlined" 
            onClick={fetchPendingContent}
            sx={{ mt: 2 }}
          >
            Refresh
          </Button>
        </Box>
      )}

      {/* Preview Dialog */}
      <Dialog 
        open={previewDialog.open} 
        onClose={() => setPreviewDialog({ open: false, content: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Content Preview: {previewDialog.content?.topicTitle || previewDialog.content?.content?.title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Type: {previewDialog.content?.type?.toUpperCase()}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            File: {previewDialog.content?.content?.filename || previewDialog.content?.content?.originalName}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Course: {previewDialog.content?.courseName}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Unit: {previewDialog.content?.unitName}
          </Typography>
          
          {/* Image Preview for Assessments */}
          {(previewDialog.content?.type === 'cats' || 
            previewDialog.content?.type === 'assignments' || 
            previewDialog.content?.type === 'pastExams') && 
            previewDialog.content?.content?.filePath && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                📸 Assessment Image Preview:
              </Typography>
              <Box sx={{ 
                border: 1, 
                borderColor: 'divider', 
                borderRadius: 1, 
                p: 2,
                textAlign: 'center',
                bgcolor: 'grey.50',
                maxHeight: '400px',
                overflow: 'auto'
              }}>
                <img 
                  src={`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${previewDialog.content.content.filePath}`}
                  alt="Assessment Preview" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '350px',
                    objectFit: 'contain',
                    borderRadius: '4px'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ display: 'none', mt: 2 }}
                >
                  ❌ Image preview not available
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                💡 Check image quality to determine if content should be marked as premium
              </Typography>
            </Box>
          )}

          {/* File Action Buttons */}
          <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {previewDialog.content?.type === 'video' && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayArrow />}
                onClick={() => handleViewFile(previewDialog.content)}
              >
                Play Video
              </Button>
            )}
            {previewDialog.content?.type === 'notes' && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<PictureAsPdf />}
                onClick={() => handleViewFile(previewDialog.content)}
              >
                View PDF
              </Button>
            )}
            {(previewDialog.content?.type === 'cats' || 
              previewDialog.content?.type === 'assignments' || 
              previewDialog.content?.type === 'pastExams') && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Assessment />}
                onClick={() => handleViewFile(previewDialog.content)}
              >
                View Assessment
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() => handleDownloadFile(previewDialog.content)}
            >
              Download File
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            variant="contained"
            color="success"
            startIcon={<Check />}
            onClick={() => {
              setPreviewDialog({ open: false, content: null });
              handleReview(previewDialog.content, 'approve');
            }}
          >
            Approve
          </Button>
          <Button 
            variant="contained"
            color="error"
            startIcon={<Close />}
            onClick={() => {
              setPreviewDialog({ open: false, content: null });
              handleReview(previewDialog.content, 'reject');
            }}
          >
            Reject
          </Button>
          <Button onClick={() => setPreviewDialog({ open: false, content: null })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog 
        open={reviewDialog.open} 
        onClose={() => setReviewDialog({ open: false, content: null, action: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {reviewDialog.action === 'approve' ? 'Approve' : 'Reject'} Content
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" gutterBottom>
            Content: {reviewDialog.content?.topicTitle || reviewDialog.content?.content?.title}
          </Typography>
          
          {reviewDialog.action === 'approve' && (
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
                  <Star color={isPremium ? 'warning' : 'disabled'} />
                  <Typography>Mark as Premium Content</Typography>
                </Box>
              }
              sx={{ mb: 2 }}
            />
          )}
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Review Notes"
            placeholder={`Add notes for ${reviewDialog.action}ing this content...`}
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialog({ open: false, content: null, action: null })}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            color={reviewDialog.action === 'approve' ? 'success' : 'error'}
            onClick={submitReview}
            startIcon={reviewDialog.action === 'approve' ? <Check /> : <Close />}
          >
            {reviewDialog.action === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialog.open} 
        onClose={() => setDeleteDialog({ open: false, content: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="error" />
          Delete Content Permanently
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to permanently delete this content from the database?
          </Typography>
          <Typography variant="subtitle2" color="error" gutterBottom>
            Content: {deleteDialog.content?.topicTitle || deleteDialog.content?.content?.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Course: {deleteDialog.content?.courseName}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Unit: {deleteDialog.content?.unitName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            File: {deleteDialog.content?.content?.filename || deleteDialog.content?.content?.originalName}
          </Typography>
          
          <Alert severity="error" sx={{ mt: 2 }}>
            ⚠️ This action cannot be undone! The content will be permanently removed from the database.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, content: null })}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            color="error"
            onClick={deleteContent}
            startIcon={<Delete />}
          >
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RealContentApproval;
