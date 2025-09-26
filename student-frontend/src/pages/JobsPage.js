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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { usePayment } from '../contexts/PaymentContext';

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');
  const { user } = useAuth();
  const { unlockJob } = usePayment();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/api/jobs');
      setJobs(response.data.jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockJob = async (jobId) => {
    try {
      await unlockJob(jobId);
      // Refresh jobs to show unlocked status
      fetchJobs();
    } catch (error) {
      console.error('Error unlocking job:', error);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = filterLocation === 'all' || 
                           job.company.location.county.toLowerCase() === filterLocation.toLowerCase();
    return matchesSearch && matchesLocation;
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
          Job Opportunities
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Discover career opportunities tailored to your field of study
        </Typography>

        {/* Search and Filter */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filter by Location</InputLabel>
                <Select
                  value={filterLocation}
                  label="Filter by Location"
                  onChange={(e) => setFilterLocation(e.target.value)}
                >
                  <MenuItem value="all">All Locations</MenuItem>
                  <MenuItem value="nairobi">Nairobi</MenuItem>
                  <MenuItem value="mombasa">Mombasa</MenuItem>
                  <MenuItem value="kisumu">Kisumu</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* Jobs Grid */}
        <Grid container spacing={3}>
          {filteredJobs.map((job) => (
            <Grid item xs={12} key={job._id}>
              <motion.div
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={8}>
                        <Typography variant="h5" gutterBottom>
                          {job.title}
                        </Typography>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          {job.company.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          📍 {job.company.location.county}
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Chip 
                            label={job.employmentType.replace('_', ' ')} 
                            size="small" 
                            sx={{ mr: 1 }}
                          />
                          <Chip 
                            label={job.experienceLevel} 
                            size="small" 
                            sx={{ mr: 1 }}
                          />
                          {job.isPremium && (
                            <Chip label="Premium" color="warning" size="small" />
                          )}
                        </Box>

                        <Typography variant="body1" gutterBottom>
                          💰 KSH {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()} per month
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                        {job.isPremium ? (
                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Unlock for KSH {job.unlockPrice}
                            </Typography>
                            <Button 
                              variant="contained"
                              color="warning"
                              onClick={() => handleUnlockJob(job._id)}
                              disabled={!user}
                            >
                              🔓 Unlock Job Details
                            </Button>
                          </Box>
                        ) : (
                          <Button variant="contained" color="primary">
                            View Full Details
                          </Button>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {filteredJobs.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              No jobs found matching your criteria.
            </Typography>
          </Box>
        )}

        {!user && (
          <Box sx={{ mt: 4, p: 3, bgcolor: 'info.light', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Want to unlock premium job listings?
            </Typography>
            <Typography variant="body1">
              Sign up for an account to access detailed job descriptions, application links, and more!
            </Typography>
          </Box>
        )}
      </motion.div>
    </Container>
  );
};

export default JobsPage;
