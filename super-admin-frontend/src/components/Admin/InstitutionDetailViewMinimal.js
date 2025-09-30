import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { ArrowBack, ExpandMore } from '@mui/icons-material';
import api from '../../utils/api';

const InstitutionDetailViewMinimal = ({ institution, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [courseDetails, setCourseDetails] = useState({});

  useEffect(() => {
    if (institution) {
      setLoading(false);
      const fetchCourses = async () => {
        try {
          setCoursesError(null);
          setCoursesLoading(true);
          const response = await api.get('/api/courses', {
            params: { institution: institution._id }
          });
          setCourses(response.data.courses || []);
        } catch (error) {
          console.error('Error loading courses:', error);
          setCoursesError('Failed to load courses for this institution.');
        } finally {
          setCoursesLoading(false);
        }
      };

      fetchCourses();
    }
  }, [institution]);

  const fetchCourseDetails = useCallback(async (courseId) => {
    if (courseDetails[courseId]?.data || courseDetails[courseId]?.loading) {
      return;
    }

    setCourseDetails(prev => ({
      ...prev,
      [courseId]: {
        loading: true,
        error: null,
        data: null
      }
    }));

    try {
      const response = await api.get(`/api/courses/${courseId}`);
      const courseData = response.data?.course || {};
      const units = Array.isArray(courseData.units) ? courseData.units : [];

      const unitsByYear = units.reduce((acc, unit) => {
        const yearKey = unit.year ?? 'Unspecified Year';
        const semesterKey = unit.semester ?? 'General';

        if (!acc[yearKey]) {
          acc[yearKey] = {};
        }

        if (!acc[yearKey][semesterKey]) {
          acc[yearKey][semesterKey] = [];
        }

        acc[yearKey][semesterKey].push(unit);
        return acc;
      }, {});

      setCourseDetails(prev => ({
        ...prev,
        [courseId]: {
          loading: false,
          error: null,
          data: {
            ...courseData,
            unitsByYear
          }
        }
      }));
    } catch (error) {
      console.error('Error loading course details:', error);
      setCourseDetails(prev => ({
        ...prev,
        [courseId]: {
          loading: false,
          error: 'Failed to load units for this course.',
          data: null
        }
      }));
    }
  }, [courseDetails]);

  const handleCourseExpand = useCallback((courseId) => async (_event, isExpanded) => {
    setExpandedCourse(isExpanded ? courseId : null);
    if (isExpanded) {
      await fetchCourseDetails(courseId);
    }
  }, [fetchCourseDetails]);

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

      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          Courses Offered
        </Typography>

        {coursesLoading && (
          <Box display="flex" alignItems="center" gap={2} sx={{ py: 3 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary">
              Loading courses...
            </Typography>
          </Box>
        )}

        {!coursesLoading && coursesError && (
          <Alert severity="error">{coursesError}</Alert>
        )}

        {!coursesLoading && !coursesError && courses.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            No courses found for this institution yet.
          </Typography>
        )}

        {!coursesLoading && !coursesError && courses.length > 0 && (
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {courses.map((course) => (
              <Grid item xs={12} md={6} key={course._id || course.code}>
                <Accordion
                  elevation={2}
                  expanded={expandedCourse === (course._id || course.code)}
                  onChange={handleCourseExpand(course._id || course.code)}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {course.name}
                        </Typography>
                        {course.code && (
                          <Chip label={course.code} color="primary" size="small" />
                        )}
                      </Box>

                      {course.department && (
                        <Typography variant="body2" color="text.secondary">
                          Department: {course.department}
                        </Typography>
                      )}

                      {course.duration && (
                        <Typography variant="body2" color="text.secondary">
                          Duration: {course.duration.years} years · {course.duration.semesters} semesters
                        </Typography>
                      )}

                      {course.description && (
                        <Typography variant="body2" color="text.secondary">
                          {course.description.length > 180
                            ? `${course.description.slice(0, 180)}...`
                            : course.description}
                        </Typography>
                      )}
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails>
                    {courseDetails[course._id || course.code]?.loading && (
                      <Box display="flex" alignItems="center" gap={2} sx={{ py: 2 }}>
                        <CircularProgress size={20} />
                        <Typography variant="body2" color="text.secondary">
                          Loading units...
                        </Typography>
                      </Box>
                    )}

                    {courseDetails[course._id || course.code]?.error && (
                      <Alert severity="error">
                        {courseDetails[course._id || course.code].error}
                      </Alert>
                    )}

                    {courseDetails[course._id || course.code]?.data && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {Object.entries(courseDetails[course._id || course.code].data.unitsByYear)
                          .sort(([yearA], [yearB]) => {
                            const numA = parseInt(yearA, 10);
                            const numB = parseInt(yearB, 10);
                            if (Number.isNaN(numA) || Number.isNaN(numB)) {
                              return String(yearA).localeCompare(String(yearB));
                            }
                            return numA - numB;
                          })
                          .map(([year, semesters]) => (
                            <Box key={year}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                Year {year}
                              </Typography>

                              {Object.entries(semesters)
                                .sort(([semA], [semB]) => {
                                  const numA = parseInt(semA, 10);
                                  const numB = parseInt(semB, 10);
                                  if (Number.isNaN(numA) || Number.isNaN(numB)) {
                                    return String(semA).localeCompare(String(semB));
                                  }
                                  return numA - numB;
                                })
                                .map(([semester, units]) => (
                                  <Box key={semester} sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                                      Semester {semester}
                                    </Typography>

                                    <Grid container spacing={2}>
                                      {units.map((unit) => (
                                        <Grid item xs={12} sm={6} key={unit._id || unit.unitCode}>
                                          <Card variant="outlined" sx={{ height: '100%' }}>
                                            <CardContent>
                                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                {unit.unitName || unit.name}
                                              </Typography>
                                              {unit.unitCode && (
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                                  Code: {unit.unitCode}
                                                </Typography>
                                              )}
                                              {unit.creditHours && (
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                                  Credit Hours: {unit.creditHours}
                                                </Typography>
                                              )}
                                              {unit.description && (
                                                <Typography variant="body2" color="text.secondary">
                                                  {unit.description.length > 140
                                                    ? `${unit.description.slice(0, 140)}...`
                                                    : unit.description}
                                                </Typography>
                                              )}
                                            </CardContent>
                                          </Card>
                                        </Grid>
                                      ))}
                                    </Grid>
                                  </Box>
                                ))}
                            </Box>
                          ))}
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default InstitutionDetailViewMinimal;
