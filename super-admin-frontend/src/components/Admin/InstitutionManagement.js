import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  School,
  LocationOn,
  ExpandMore,
  Visibility,
  Settings
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import ProgramManagement from './ProgramManagement';

const InstitutionManagement = ({ userRole = 'super_admin' }) => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState(null);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    type: '',
    location: {
      town: '',
      county: '',
      address: ''
    },
    contact: {
      phone: '',
      email: '',
      website: ''
    },
    description: ''
  });

  const institutionTypes = [
    'public_university',
    'private_university',
    'medical_college',
    'polytechnic',
    'teachers_college',
    'technical_institute'
  ];

  const kenyanCounties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi',
    'Kitale', 'Garissa', 'Kakamega', 'Machakos', 'Meru', 'Nyeri', 'Kericho',
    'Embu', 'Migori', 'Bungoma', 'Homa Bay', 'Vihiga', 'Bomet'
  ];

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/institutions');
      setInstitutions(response.data.institutions || []);
    } catch (error) {
      console.error('Error fetching institutions:', error);
      setError('Failed to load institutions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (institution = null) => {
    if (institution) {
      setEditingInstitution(institution);
      setFormData({
        name: institution.name || '',
        shortName: institution.shortName || '',
        type: institution.type || '',
        location: {
          town: institution.location?.town || '',
          county: institution.location?.county || '',
          address: institution.location?.address || ''
        },
        contact: {
          phone: institution.contact?.phone || '',
          email: institution.contact?.email || '',
          website: institution.contact?.website || ''
        },
        description: institution.description || ''
      });
    } else {
      setEditingInstitution(null);
      setFormData({
        name: '',
        shortName: '',
        type: '',
        location: { town: '', county: '', address: '' },
        contact: { phone: '', email: '', website: '' },
        description: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingInstitution(null);
  };

  const handleInputChange = (field, value, nested = null) => {
    if (nested) {
      setFormData(prev => ({
        ...prev,
        [nested]: {
          ...prev[nested],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingInstitution) {
        await api.put(`/api/institutions/${editingInstitution._id}`, formData);
      } else {
        await api.post('/api/institutions', formData);
      }
      
      await fetchInstitutions();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving institution:', error);
      setError('Failed to save institution. Please try again.');
    }
  };

  const handleDelete = async (institutionId) => {
    if (window.confirm('Are you sure you want to delete this institution? This action cannot be undone.')) {
      try {
        await api.delete(`/api/institutions/${institutionId}`);
        await fetchInstitutions();
      } catch (error) {
        console.error('Error deleting institution:', error);
        setError('Failed to delete institution. Please try again.');
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" color="primary" sx={{ fontWeight: 600 }}>
            Institution Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ borderRadius: 2 }}
          >
            Add Institution
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="All Institutions" />
            <Tab label="Program Management" disabled={!selectedInstitution} />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            {institutions.map((institution) => (
              <Grid item xs={12} md={6} lg={4} key={institution._id}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card sx={{ height: '100%', position: 'relative' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <School color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {institution.name}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {institution.shortName}
                      </Typography>
                      
                      <Chip 
                        label={institution.type?.replace('_', ' ').toUpperCase()} 
                        color="primary" 
                        size="small" 
                        sx={{ mb: 2 }}
                      />
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOn fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {institution.location?.town}, {institution.location?.county}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" sx={{ mb: 2, minHeight: 40 }}>
                        {institution.description?.substring(0, 100)}
                        {institution.description?.length > 100 && '...'}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => {
                            setSelectedInstitution(institution);
                            setTabValue(1);
                          }}
                        >
                          Programs
                        </Button>
                        
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(institution)}
                          color="primary"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(institution._id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}

        {tabValue === 1 && selectedInstitution && (
          <ProgramManagement 
            institution={selectedInstitution}
            userRole={userRole}
            onBack={() => setTabValue(0)}
          />
        )}

        {/* Add/Edit Institution Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingInstitution ? 'Edit Institution' : 'Add New Institution'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Institution Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Short Name"
                  value={formData.shortName}
                  onChange={(e) => handleInputChange('shortName', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Institution Type</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    label="Institution Type"
                  >
                    {institutionTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type.replace('_', ' ').toUpperCase()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>County</InputLabel>
                  <Select
                    value={formData.location.county}
                    onChange={(e) => handleInputChange('county', e.target.value, 'location')}
                    label="County"
                  >
                    {kenyanCounties.map((county) => (
                      <MenuItem key={county} value={county}>
                        {county}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Town/City"
                  value={formData.location.town}
                  onChange={(e) => handleInputChange('town', e.target.value, 'location')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Address"
                  value={formData.location.address}
                  onChange={(e) => handleInputChange('address', e.target.value, 'location')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.contact.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value, 'contact')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => handleInputChange('email', e.target.value, 'contact')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Website"
                  value={formData.contact.website}
                  onChange={(e) => handleInputChange('website', e.target.value, 'contact')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingInstitution ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default InstitutionManagement;
