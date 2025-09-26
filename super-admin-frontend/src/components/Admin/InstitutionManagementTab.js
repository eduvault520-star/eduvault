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
  InputAdornment
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import api from '../../utils/api';
import InstitutionDetailViewMinimal from './InstitutionDetailViewMinimal';

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
    setDialogOpen(true);
  };

  const handleEditInstitution = (institution) => {
    setSelectedInstitution(institution);
    setDialogOpen(true);
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
    </Container>
  );
};

export default InstitutionManagementTab;
