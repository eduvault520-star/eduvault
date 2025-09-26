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
  Snackbar,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import {
  VideoLibrary,
  Description,
  Assessment,
  Visibility,
  Edit,
  Delete,
  MoreVert,
  Download,
  PlayArrow,
  PictureAsPdf,
  Warning,
  Star,
  StarBorder
} from '@mui/icons-material';
import api from '../../utils/api';

const ApprovedContentManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approvedContent, setApprovedContent] = useState([]);
  const [stats, setStats] = useState({ approved: 0, premium: 0, total: 0 });
  
  // Dialog states
  const [previewDialog, setPreviewDialog] = useState({ open: false, content: null });
  const [editDialog, setEditDialog] = useState({ open: false, content: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, content: null });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchApprovedContent();
  }, []);

  const fetchApprovedContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch approved content from all courses
      const response = await api.get('/api/content-approval/approved');
      const content = response.data.approvedContent || [];
      
      console.log('📋 Fetched approved content:', content);
      setApprovedContent(content);
      
      // Calculate stats
      const premiumCount = content.filter(c => c.content?.isPremium).length;
      setStats({
        approved: content.length,
        premium: premiumCount,
        total: content.length
      });
      
      if (content.length === 0) {
        setError('No approved content found.');
      }
      
    } catch (error) {
      console.error('Error fetching approved content:', error);
      setError('Failed to fetch approved content. Please check your connection.');
      setApprovedContent([]);
      setStats({ approved: 0, premium: 0, total: 0 });
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

  const handleMenuOpen = (event, content) => {
    setMenuAnchor(event.currentTarget);
    setSelectedContent(content);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedContent(null);
  };

  const handlePreview = (content) => {
    setPreviewDialog({ open: true, content });
    handleMenuClose();
  };

  const handleEdit = (content) => {
    setEditDialog({ open: true, content });
    handleMenuClose();
  };

  const handleDelete = (content) => {
    setDeleteDialog({ open: true, content });
    handleMenuClose();
  };

  const handleViewFile = (content) => {
    const fileUrl = content.content?.filePath || content.content?.url;
    if (fileUrl) {
      window.open(`${process.env.REACT_APP_BACKEND_URL}${fileUrl}`, '_blank');
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

  const togglePremiumStatus = async (content) => {
    try {
      const newPremiumStatus = !content.content?.isPremium;
      
      await api.put(`/api/content-approval/premium`, {
        courseId: content.courseId,
        unitId: content.unitId,
        topicId: content.topicId,
        assessmentId: content.assessmentId,
        contentType: content.type,
        isPremium: newPremiumStatus
      });

      // Update local state
      setApprovedContent(prev => prev.map(c => 
        (c.topicId === content.topicId || c.assessmentId === content.assessmentId) 
          ? { ...c, content: { ...c.content, isPremium: newPremiumStatus } }
          : c
      ));

      // Update stats
      setStats(prev => ({
        ...prev,
        premium: newPremiumStatus ? prev.premium + 1 : prev.premium - 1
      }));

      setSnackbar({
        open: true,
        message: `Content ${newPremiumStatus ? 'marked as premium' : 'removed from premium'}`,
        severity: 'success'
      });

    } catch (error) {
      console.error('Error updating premium status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update premium status',
        severity: 'error'
      });
    }
  };

  const deleteContent = async () => {
    try {
      const content = deleteDialog.content;
      
      await api.delete(`/api/content-approval/delete`, {
        data: {
          courseId: content.courseId,
          unitId: content.unitId,
          topicId: content.topicId,
          assessmentId: content.assessmentId,
          contentType: content.type
        }
      });
      
      // Remove from approved list
      setApprovedContent(prev => prev.filter(c => 
        c.topicId !== content.topicId && c.assessmentId !== content.assessmentId
      ));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        approved: Math.max(0, prev.approved - 1),
        premium: content.content?.isPremium ? Math.max(0, prev.premium - 1) : prev.premium,
        total: Math.max(0, prev.total - 1)
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
        <Typography variant="h6" sx={{ ml: 2 }}>Loading approved content...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" color="primary" sx={{ fontWeight: 600, mb: 2 }}>
          📚 Approved Content Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View, edit, and manage all approved educational content
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'white' }}>
                {stats.approved}
              </Typography>
              <Typography variant="body2" sx={{ color: 'white' }}>✅ Approved Content</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'white' }}>
                {stats.premium}
              </Typography>
              <Typography variant="body2" sx={{ color: 'white' }}>⭐ Premium Content</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'white' }}>
                {stats.total}
              </Typography>
              <Typography variant="body2" sx={{ color: 'white' }}>📊 Total Content</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && (
        <Alert severity={approvedContent.length === 0 ? "info" : "error"} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Approved Content List */}
      <Grid container spacing={3}>
        {approvedContent.map((content, index) => (
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {content.topicTitle || content.content?.title || `${content.type.toUpperCase()} Content`}
                      </Typography>
                      {content.content?.isPremium && (
                        <Star color="warning" sx={{ fontSize: 20 }} />
                      )}
                    </Box>
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
                      📅 Approved: {new Date(content.content?.reviewDate || content.uploadDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip 
                      label={content.type.toUpperCase()} 
                      color={getContentColor(content.type)}
                      size="small"
                    />
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, content)}
                      size="small"
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {approvedContent.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            📭 No approved content found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Content will appear here once it has been approved.
          </Typography>
          <Button 
            variant="outlined" 
            onClick={fetchApprovedContent}
            sx={{ mt: 2 }}
          >
            Refresh
          </Button>
        </Box>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handlePreview(selectedContent)}>
          <Visibility sx={{ mr: 1 }} />
          Preview
        </MenuItem>
        <MenuItem onClick={() => handleViewFile(selectedContent)}>
          {selectedContent?.type === 'video' && <PlayArrow sx={{ mr: 1 }} />}
          {selectedContent?.type === 'notes' && <PictureAsPdf sx={{ mr: 1 }} />}
          {(selectedContent?.type === 'cats' || selectedContent?.type === 'assignments' || selectedContent?.type === 'pastExams') && <Assessment sx={{ mr: 1 }} />}
          View File
        </MenuItem>
        <MenuItem onClick={() => handleDownloadFile(selectedContent)}>
          <Download sx={{ mr: 1 }} />
          Download
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => togglePremiumStatus(selectedContent)}>
          {selectedContent?.content?.isPremium ? <StarBorder sx={{ mr: 1 }} /> : <Star sx={{ mr: 1 }} />}
          {selectedContent?.content?.isPremium ? 'Remove Premium' : 'Mark Premium'}
        </MenuItem>
        <MenuItem onClick={() => handleEdit(selectedContent)}>
          <Edit sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleDelete(selectedContent)} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

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
          <Typography variant="body2" color="text.secondary">
            Status: {previewDialog.content?.content?.isPremium ? '⭐ Premium' : '🆓 Free'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog({ open: false, content: null })}>
            Close
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
          Delete Approved Content
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to permanently delete this approved content from the database?
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

export default ApprovedContentManagement;
