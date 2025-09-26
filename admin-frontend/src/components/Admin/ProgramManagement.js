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
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  ArrowBack,
  School,
  AccessTime,
  ExpandMore,
  MenuBook,
  Settings
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import UnitManagement from './UnitManagement';

const ProgramManagement = ({ institution, userRole = 'mini_admin', onBack }) => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department: '',
    level: '',
    duration: {
      years: 1,
      semesters: 2
    },
    description: '',
    entryRequirements: '',
    careerProspects: [],
    fees: {
      local: '',
      international: '',
      currency: 'KSH'
    }
  });

  const programLevels = [
    'Certificate',
    'Diploma',
    'Undergraduate',
    'Postgraduate',
    'Masters',
    'PhD'
  ];

  const commonDepartments = [
    'School of Medicine',
    'School of Engineering',
    'School of Business',
    'School of Education',
    'School of Sciences',
    'School of Arts',
    'School of Nursing',
    'School of Agriculture',
    'School of Law',
    'School of Computing'
  ];

  useEffect(() => {
    if (institution) {
      fetchPrograms();
    }
  }, [institution]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/courses?institution=${institution._id}`);
      setPrograms(response.data.courses || []);
    } catch (error) {
      console.error('Error fetching programs:', error);
      setError('Failed to load programs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (program = null) => {
    if (program) {
      setEditingProgram(program);
      setFormData({
        name: program.name || '',
        code: program.code || '',
        department: program.department || '',
        level: program.level || '',
        duration: {
          years: program.duration?.years || 1,
          semesters: program.duration?.semesters || 2
        },
        description: program.description || '',
        entryRequirements: program.entryRequirements || '',
        careerProspects: program.careerProspects || [],
        fees: {
          local: program.fees?.local || '',
          international: program.fees?.international || '',
          currency: program.fees?.currency || 'KSH'
        }
      });
    } else {
      setEditingProgram(null);
      setFormData({
        name: '',
        code: '',
        department: '',
        level: '',
        duration: { years: 1, semesters: 2 },
        description: '',
        entryRequirements: '',
        careerProspects: [],
        fees: { local: '', international: '', currency: 'KSH' }
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProgram(null);
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

  const handleCareerProspectsChange = (value) => {
    const prospects = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      careerProspects: prospects
    }));
  };

  const handleSubmit = async () => {
    try {
      const programData = {
        ...formData,
        institution: institution._id
      };

      if (editingProgram) {
        await api.put(`/api/courses/${editingProgram._id}`, programData);
      } else {
        await api.post('/api/courses', programData);
      }
      
      await fetchPrograms();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving program:', error);
      setError('Failed to save program. Please try again.');
    }
  };

  const handleDelete = async (programId) => {
    if (window.confirm('Are you sure you want to delete this program? This action cannot be undone.')) {
      try {
        await api.delete(`/api/courses/${programId}`);
        await fetchPrograms();
      } catch (error) {
        console.error('Error deleting program:', error);
        setError('Failed to delete program. Please try again.');
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
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={onBack} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" component="h2" color="primary" sx={{ fontWeight: 600 }}>
              Programs - {institution.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {institution.shortName} • {programs.length} programs
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ borderRadius: 2 }}
          >
            Add Program
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
            <Tab label="All Programs" />
            <Tab label="Unit Management" disabled={!selectedProgram} />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            {programs.length === 0 ? (
              <Grid item xs={12}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <School sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No programs found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Start by adding the first program for this institution.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                  >
                    Add First Program
                  </Button>
                </Paper>
              </Grid>
            ) : (
              programs.map((program) => (
                <Grid item xs={12} md={6} lg={4} key={program._id}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {program.name}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {program.code} • {program.department}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                          <Chip 
                            label={program.level} 
                            color="primary" 
                            size="small"
                          />
                          <Chip 
                            icon={<AccessTime />}
                            label={`${program.duration?.years} Years`} 
                            color="secondary" 
                            size="small"
                          />
                          <Chip 
                            icon={<MenuBook />}
                            label={`${program.duration?.semesters} Semesters`} 
                            color="info" 
                            size="small"
                          />
                        </Box>
                        
                        <Typography variant="body2" sx={{ mb: 2, minHeight: 60 }}>
                          {program.description?.substring(0, 120)}
                          {program.description?.length > 120 && '...'}
                        </Typography>
                        
                        {program.careerProspects && program.careerProspects.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              Career Prospects:
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                              {program.careerProspects.slice(0, 2).join(', ')}
                              {program.careerProspects.length > 2 && '...'}
                            </Typography>
                          </Box>
                        )}
                        
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Settings />}
                            onClick={() => {
                              setSelectedProgram(program);
                              setTabValue(1);
                            }}
                          >
                            Units
                          </Button>
                          
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(program)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                          
                          {userRole === 'super_admin' && (
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(program._id)}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))
            )}
          </Grid>
        )}

        {tabValue === 1 && selectedProgram && (
          <UnitManagement 
            program={selectedProgram}
            institution={institution}
            userRole={userRole}
            onBack={() => setTabValue(0)}
          />
        )}

        {/* Add/Edit Program Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingProgram ? 'Edit Program' : 'Add New Program'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Program Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Program Code"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    label="Department"
                  >
                    {commonDepartments.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Level</InputLabel>
                  <Select
                    value={formData.level}
                    onChange={(e) => handleInputChange('level', e.target.value)}
                    label="Level"
                  >
                    {programLevels.map((level) => (
                      <MenuItem key={level} value={level}>
                        {level}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Duration (Years)"
                  type="number"
                  value={formData.duration.years}
                  onChange={(e) => handleInputChange('years', parseInt(e.target.value), 'duration')}
                  inputProps={{ min: 1, max: 6 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Duration (Semesters)"
                  type="number"
                  value={formData.duration.semesters}
                  onChange={(e) => handleInputChange('semesters', parseInt(e.target.value), 'duration')}
                  inputProps={{ min: 2, max: 12 }}
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Entry Requirements"
                  multiline
                  rows={2}
                  value={formData.entryRequirements}
                  onChange={(e) => handleInputChange('entryRequirements', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Career Prospects (comma-separated)"
                  value={formData.careerProspects.join(', ')}
                  onChange={(e) => handleCareerProspectsChange(e.target.value)}
                  helperText="Enter career prospects separated by commas"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Local Student Fees"
                  type="number"
                  value={formData.fees.local}
                  onChange={(e) => handleInputChange('local', e.target.value, 'fees')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="International Student Fees"
                  type="number"
                  value={formData.fees.international}
                  onChange={(e) => handleInputChange('international', e.target.value, 'fees')}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingProgram ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Box>
  );
};

export default ProgramManagement;
