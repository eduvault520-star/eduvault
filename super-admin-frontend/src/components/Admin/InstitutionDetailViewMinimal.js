import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack
} from '@mui/icons-material';

const InstitutionDetailViewMinimal = ({ institution, onBack }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (institution) {
      setLoading(false);
    }
  }, [institution]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
              {institution.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {institution.location?.town}, {institution.location?.county}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={onBack}
          >
            Back to Institutions
          </Button>
        </Box>
      </Box>

      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Institution Details - Minimal View
      </Typography>

      <Box sx={{ p: 4, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: 2 }}>
        <Typography variant="h6" color="text.secondary">
          This is a minimal version to test component loading
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          If this loads successfully, we can identify which component was causing the issue
        </Typography>
      </Box>
    </Container>
  );
};

export default InstitutionDetailViewMinimal;
