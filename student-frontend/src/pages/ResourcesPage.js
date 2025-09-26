import React, { useState, useEffect } from 'react';
import api from '../utils/api';
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const ResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setError(null);
      const response = await api.get('/api/resources');
      if (response.status >= 200 && response.status < 300) {
        setResources(response.data.resources || []);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      setError('Failed to load resources. Please try again later.');
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = (resources || []).filter(resource => {
    if (!resource) return false;
    const matchesSearch = (resource.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (resource.unitName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || resource.type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h3" component="h1" gutterBottom color="primary">
          Educational Resources
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Access lecture videos, past papers, CATs, and other study materials
        </Typography>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={fetchResources}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Search and Filter */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filter by Type</InputLabel>
                <Select
                  value={filterType}
                  label="Filter by Type"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="lecture_video">Lecture Videos</MenuItem>
                  <MenuItem value="past_paper">Past Papers</MenuItem>
                  <MenuItem value="cat">CATs</MenuItem>
                  <MenuItem value="notes">Notes</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* Resources Grid */}
        <Grid container spacing={3}>
          {filteredResources.map((resource) => (
            <Grid item xs={12} md={6} lg={4} key={resource._id}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {resource.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {resource.unitCode} - {resource.unitName}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Chip 
                        label={resource.type.replace('_', ' ')} 
                        size="small" 
                        sx={{ mr: 1 }}
                      />
                      {resource.isPremium && (
                        <Chip label="Premium" color="warning" size="small" />
                      )}
                    </Box>

                    <Typography variant="body2" sx={{ mb: 2 }}>
                      👁️ {resource.viewCount} views | ⬇️ {resource.downloadCount} downloads
                    </Typography>

                    <Button 
                      variant={resource.isPremium ? "outlined" : "contained"}
                      fullWidth
                      color={resource.isPremium ? "warning" : "primary"}
                    >
                      {resource.isPremium ? '🔒 Premium - Subscribe to Access' : '📖 View Resource'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {filteredResources.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              No resources found matching your criteria.
            </Typography>
          </Box>
        )}
      </motion.div>
    </Container>
  );
};

export default ResourcesPage;
