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
  TextField,
  Alert,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import api from '../../utils/api';
import InstitutionDetailViewMinimal from './InstitutionDetailViewMinimal';

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

const createDefaultFormData = () => ({
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

const InstitutionManagementTab = ({ userRole }) => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showDetailView, setShowDetailView] = useState(false);
  const [detailInstitution, setDetailInstitution] = useState(null);
  const [formData, setFormData] = useState(() => createDefaultFormData());

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/institutions');
      setInstitutions(response.data.institutions || []);
    } catch (error) {
      console.error('Error fetching institutions:', error);
      setError('Failed to fetch institutions. Displaying mock data.');
      setInstitutions([
        {
          _id: '1',
          name: 'University of Nairobi',
          shortName: 'UoN',
          type: 'University',
          location: { town: 'Nairobi', county: 'Nairobi' },
          description: 'Premier university in Kenya.',
          established: '1970',
          programs: 45,
          students: 84000
        },
        {
          _id: '2',
          name: 'Kenyatta University',
          shortName: 'KU',
          type: 'University',
          location: { town: 'Kahawa', county: 'Kiambu' },
          description: 'Public university known for education.',
          established: '1985',
          programs: 38,
          students: 70000
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInstitution = () => {
    setSelectedInstitution(null);
    setFormData(createDefaultFormData());
    setDialogOpen(true);
    setError('');
  };

  const handleEditInstitution = (institution) => {
    setSelectedInstitution(institution);
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
    setDialogOpen(true);
    setError('');
  };

  const handleDeleteInstitution = async (institutionId) => {
    if (window.confirm('Are you sure you want to delete this institution?')) {
      try {
        await api.delete(`/api/institutions/${institutionId}`);
        setInstitutions(institutions.filter(inst => inst._id !== institutionId));
        setSuccess('Institution deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Failed to delete institution');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleViewInstitutionDetails = (institution) => {
    setDetailInstitution(institution);
    setShowDetailView(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedInstitution(null);
    setFormData(createDefaultFormData());
    setError('');
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

  const handleSubmitInstitution = async () => {
    try {
      const payload = {
        ...formData,
        location: { ...formData.location },
        contact: { ...formData.contact }
      };

      if (selectedInstitution) {
        await api.put(`/api/institutions/${selectedInstitution._id}`, payload);
        setSuccess('Institution updated successfully.');
      } else {
        await api.post('/api/institutions', payload);
        setSuccess('Institution created successfully.');
      }

      setDialogOpen(false);
      setFormData(createDefaultFormData());
      setSelectedInstitution(null);
      setError('');
      await fetchInstitutions();

      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error('Error saving institution:', err);
      setError('Failed to save institution. Please try again.');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleBackToInstitutions = () => {
    setShowDetailView(false);
    setDetailInstitution(null);
  };

  const filteredInstitutions = institutions.filter(institution =>
    (institution.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (institution.type?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (institution.location?.county?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (showDetailView && detailInstitution) {
    return (
      <InstitutionDetailViewMinimal 
        institution={detailInstitution}
        onBack={handleBackToInstitutions}
      />
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Institution Management
        </Typography>
        {userRole === 'super_admin' && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddInstitution}
          >
            Add Institution
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <TextField
        fullWidth
        placeholder="Search institutions by name, type, or county..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          )
        }}
      />

      <Grid container spacing={3}>
        {filteredInstitutions.map((institution) => (
          <Grid item xs={12} md={6} lg={4} key={institution._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  {institution.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {institution.type}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  📍 {institution.location?.town}, {institution.location?.county}
                </Typography>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={() => handleViewInstitutionDetails(institution)}
                  sx={{ mr: 1 }}
                >
                  View Details
                </Button>
                {userRole === 'super_admin' && (
                  <>
                    <Button
                      size="small"
                      onClick={() => handleEditInstitution(institution)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDeleteInstitution(institution._id)}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredInstitutions.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No institutions found matching your search criteria
          </Typography>
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>{selectedInstitution ? 'Edit Institution' : 'Add Institution'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
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
                  label="Institution Type"
                  onChange={(e) => handleInputChange('type', e.target.value)}
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
                  label="County"
                  onChange={(e) => handleInputChange('county', e.target.value, 'location')}
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
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitInstitution}>
            {selectedInstitution ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InstitutionManagementTab;
