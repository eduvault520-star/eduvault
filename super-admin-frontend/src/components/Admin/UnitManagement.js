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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  ArrowBack,
  ExpandMore,
  MenuBook,
  Schedule,
  School,
  PlayCircleOutline,
  Description,
  Assignment,
  Quiz,
  VideoLibrary,
  AttachFile
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import TopicManagement from './TopicManagement';

const UnitManagement = ({ program, institution, userRole = 'super_admin', onBack }) => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [managementView, setManagementView] = useState('units'); // 'units', 'topics', 'assessments'
  
  // Topic management state
  const [openTopicDialog, setOpenTopicDialog] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [topicFormData, setTopicFormData] = useState({
    topicNumber: 1,
    title: '',
    description: '',
    learningOutcomes: [],
    content: {
      lectureVideo: { title: '', url: '', duration: '', isPremium: false },
      notes: { title: '', url: '', fileType: 'pdf', isPremium: false },
      additionalResources: []
    }
  });

  // Assessment management state
  const [openAssessmentDialog, setOpenAssessmentDialog] = useState(false);
  const [assessmentType, setAssessmentType] = useState('cats'); // 'cats', 'assignments', 'pastExams'
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [assessmentFormData, setAssessmentFormData] = useState({
    title: '',
    description: '',
    url: '',
    dueDate: '',
    totalMarks: 100,
    isPremium: true
  });
  const [formData, setFormData] = useState({
    year: 1,
    semester: 1,
    unitCode: '',
    unitName: '',
    creditHours: 3,
    description: '',
    prerequisites: []
  });

  useEffect(() => {
    if (program) {
      fetchUnits();
    }
  }, [program]);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch the full course data to get updated units
      const response = await api.get(`/api/courses/${program._id}`);
      setUnits(response.data.course.units || []);
    } catch (error) {
      console.error('Error fetching units:', error);
      setError('Failed to load units. Please try again.');
      // Fallback to program units if API fails
      setUnits(program.units || []);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (unit = null) => {
    if (unit) {
      setEditingUnit(unit);
      setFormData({
        year: unit.year || 1,
        semester: unit.semester || 1,
        unitCode: unit.unitCode || '',
        unitName: unit.unitName || '',
        creditHours: unit.creditHours || 3,
        description: unit.description || '',
        prerequisites: unit.prerequisites || []
      });
    } else {
      setEditingUnit(null);
      setFormData({
        year: 1,
        semester: 1,
        unitCode: '',
        unitName: '',
        creditHours: 3,
        description: '',
        prerequisites: []
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUnit(null);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePrerequisitesChange = (value) => {
    const prerequisites = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      prerequisites: prerequisites
    }));
  };

  const handleSubmit = async () => {
    try {
      const unitData = {
        ...formData,
        unitCode: formData.unitCode.toUpperCase()
      };

      if (editingUnit) {
        // Update existing unit
        await api.put(`/api/courses/${program._id}/units/${editingUnit._id}`, unitData);
      } else {
        // Add new unit
        await api.post(`/api/courses/${program._id}/units`, unitData);
      }
      
      await fetchUnits();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving unit:', error);
      setError('Failed to save unit. Please try again.');
    }
  };

  const handleDelete = async (unitId) => {
    if (window.confirm('Are you sure you want to delete this unit? This action cannot be undone.')) {
      try {
        await api.delete(`/api/courses/${program._id}/units/${unitId}`);
        await fetchUnits();
      } catch (error) {
        console.error('Error deleting unit:', error);
        setError('Failed to delete unit. Please try again.');
      }
    }
  };

  // Group units by year and semester
  const groupedUnits = units.reduce((acc, unit) => {
    const year = unit.year || 1;
    const semester = unit.semester || 1;
    
    if (!acc[year]) {
      acc[year] = {};
    }
    if (!acc[year][semester]) {
      acc[year][semester] = [];
    }
    
    acc[year][semester].push(unit);
    return acc;
  }, {});

  const getYearArray = () => {
    return Array.from({ length: program.duration?.years || 4 }, (_, i) => i + 1);
  };

  const getSemesterArray = () => {
    return Array.from({ length: program.duration?.semesters || 8 }, (_, i) => i + 1);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Show topic management if a unit is selected
  if (managementView === 'topics' && selectedUnit) {
    return (
      <TopicManagement 
        unit={selectedUnit}
        program={program}
        institution={institution}
        userRole={userRole}
        onBack={() => {
          setManagementView('units');
          setSelectedUnit(null);
        }}
      />
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
              Unit Management - {program.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {program.code} • {institution.shortName} • {units.length} units
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ borderRadius: 2 }}
          >
            Add Unit
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Program Overview */}
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <School sx={{ fontSize: 40 }} />
            </Grid>
            <Grid item xs>
              <Typography variant="h6">{program.name}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {program.level} • {program.duration?.years} Years • {program.duration?.semesters} Semesters
              </Typography>
            </Grid>
            <Grid item>
              <Box textAlign="center">
                <Typography variant="h4">{units.length}</Typography>
                <Typography variant="body2">Total Units</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Units by Year */}
        {getYearArray().map((year) => (
          <Accordion key={year} defaultExpanded={year === 1}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6" color="primary">
                Year {year}
              </Typography>
              <Chip 
                label={`${Object.keys(groupedUnits[year] || {}).reduce((total, sem) => 
                  total + (groupedUnits[year][sem]?.length || 0), 0)} units`}
                size="small" 
                sx={{ ml: 2 }}
              />
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {[1, 2].map((semester) => (
                  <Grid item xs={12} md={6} key={semester}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" color="secondary" sx={{ fontWeight: 600 }}>
                          Semester {semester}
                        </Typography>
                        <Chip 
                          label={`${groupedUnits[year]?.[semester]?.length || 0} units`}
                          size="small"
                          color="secondary"
                        />
                      </Box>
                      
                      {groupedUnits[year]?.[semester]?.length > 0 ? (
                        <List dense>
                          {groupedUnits[year][semester].map((unit, index) => (
                            <React.Fragment key={unit._id || index}>
                              <ListItem>
                                <ListItemText
                                  primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                        {unit.unitCode}
                                      </Typography>
                                      <Chip 
                                        label={`${unit.creditHours} CH`}
                                        size="small"
                                        color="info"
                                      />
                                    </Box>
                                  }
                                  secondary={
                                    <Box>
                                      <Typography variant="body2">
                                        {unit.unitName}
                                      </Typography>
                                      {unit.description && (
                                        <Typography variant="caption" color="text.secondary">
                                          {unit.description.substring(0, 100)}
                                          {unit.description.length > 100 && '...'}
                                        </Typography>
                                      )}
                                      {unit.prerequisites && unit.prerequisites.length > 0 && (
                                        <Typography variant="caption" color="warning.main" display="block">
                                          Prerequisites: {unit.prerequisites.join(', ')}
                                        </Typography>
                                      )}
                                    </Box>
                                  }
                                />
                                <ListItemSecondaryAction>
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setSelectedUnit(unit);
                                      setManagementView('topics');
                                    }}
                                    color="secondary"
                                    title="Manage Topics & Content"
                                  >
                                    <VideoLibrary />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenDialog(unit)}
                                    color="primary"
                                  >
                                    <Edit />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDelete(unit._id)}
                                    color="error"
                                  >
                                    <Delete />
                                  </IconButton>
                                </ListItemSecondaryAction>
                              </ListItem>
                              {index < groupedUnits[year][semester].length - 1 && <Divider />}
                            </React.Fragment>
                          ))}
                        </List>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 3 }}>
                          <MenuBook sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            No units added for this semester
                          </Typography>
                          <Button
                            size="small"
                            startIcon={<Add />}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, year, semester }));
                              handleOpenDialog();
                            }}
                            sx={{ mt: 1 }}
                          >
                            Add Unit
                          </Button>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}

        {units.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <MenuBook sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No units found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Start by adding units for this program. Units are organized by year and semester.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Add First Unit
            </Button>
          </Paper>
        )}

        {/* Add/Edit Unit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingUnit ? 'Edit Unit' : 'Add New Unit'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', e.target.value)}
                    label="Year"
                  >
                    {getYearArray().map((year) => (
                      <MenuItem key={year} value={year}>
                        Year {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel>Semester</InputLabel>
                  <Select
                    value={formData.semester}
                    onChange={(e) => handleInputChange('semester', e.target.value)}
                    label="Semester"
                  >
                    <MenuItem value={1}>Semester 1</MenuItem>
                    <MenuItem value={2}>Semester 2</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Unit Code"
                  value={formData.unitCode}
                  onChange={(e) => handleInputChange('unitCode', e.target.value.toUpperCase())}
                  required
                  helperText="e.g., MATH101, ENG201"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Credit Hours"
                  type="number"
                  value={formData.creditHours}
                  onChange={(e) => handleInputChange('creditHours', parseInt(e.target.value))}
                  inputProps={{ min: 1, max: 6 }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Unit Name"
                  value={formData.unitName}
                  onChange={(e) => handleInputChange('unitName', e.target.value)}
                  required
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
                  label="Prerequisites (comma-separated unit codes)"
                  value={formData.prerequisites.join(', ')}
                  onChange={(e) => handlePrerequisitesChange(e.target.value)}
                  helperText="e.g., MATH101, PHYS102"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingUnit ? 'Update' : 'Add Unit'}
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Box>
  );
};

export default UnitManagement;
