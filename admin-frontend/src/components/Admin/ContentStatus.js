import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  PendingActions,
  VideoLibrary,
  Description,
  Assignment,
  Quiz,
  School
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../../utils/api';

const ContentStatus = () => {
  const [contentStatus, setContentStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });

  useEffect(() => {
    fetchContentStatus();
  }, []);

  const fetchContentStatus = async () => {
    try {
      setLoading(true);
      // Fetch real content status from API
      const api = (await import('../../utils/api')).default;
      const response = await api.get('/api/admin/content-status');
      setContentStatus(response.data.content || []);
      
      // Calculate stats from real data
      const newStats = (response.data.content || []).reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        acc.total++;
        return acc;
      }, { pending: 0, approved: 0, rejected: 0, total: 0 });
      
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching content status:', error);
      setError('Failed to fetch content status');
    } finally {
      setLoading(false);
    }
  };

  const getContentIcon = (type) => {
    switch (type) {
      case 'video': return <VideoLibrary color="primary" />;
      case 'notes': return <Description color="secondary" />;
      case 'cats': return <Quiz color="warning" />;
      case 'assignments': return <Assignment color="info" />;
      case 'pastExams': return <School color="success" />;
      default: return <PendingActions />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle color="success" />;
      case 'rejected': return <Cancel color="error" />;
      case 'pending': return <PendingActions color="warning" />;
      default: return <PendingActions />;
    }
  };

  const filteredContent = contentStatus.filter(content => {
    if (tabValue === 0) return true; // All
    if (tabValue === 1) return content.status === 'pending'; // Pending
    if (tabValue === 2) return content.status === 'approved'; // Approved
    if (tabValue === 3) return content.status === 'rejected'; // Rejected
    return true;
  });

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
            My Content Status
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track the approval status of your uploaded content
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
                  {stats.total}
                </Typography>
                <Typography variant="body2">Total Uploaded</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label={`All (${contentStatus.length})`} />
            <Tab label={`Pending (${stats.pending})`} />
            <Tab label={`Approved (${stats.approved})`} />
            <Tab label={`Rejected (${stats.rejected})`} />
          </Tabs>
        </Box>

        {/* Content List */}
        <Paper>
          {filteredContent.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <PendingActions sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No content found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload some content to see its approval status here
              </Typography>
            </Box>
          ) : (
            <List>
              {filteredContent.map((content) => (
                <ListItem key={content.id} divider>
                  <ListItemIcon>
                    {getContentIcon(content.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {content.title}
                        </Typography>
                        <Chip 
                          icon={getStatusIcon(content.status)}
                          label={content.status.toUpperCase()}
                          color={getStatusColor(content.status)}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {content.courseName} • {content.unitName}
                          {content.topicTitle && ` • ${content.topicTitle}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Uploaded: {content.uploadDate.toLocaleDateString()}
                          {content.filename && ` • File: ${content.filename}`}
                        </Typography>
                        {content.reviewNotes && (
                          <Alert severity={content.status === 'approved' ? 'success' : 'error'} sx={{ mt: 1 }}>
                            <Typography variant="body2">
                              <strong>Review Notes:</strong> {content.reviewNotes}
                            </Typography>
                          </Alert>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </motion.div>
    </Container>
  );
};

export default ContentStatus;
