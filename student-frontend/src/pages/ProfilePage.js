import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  TextField,
  Button,
  Avatar,
  Chip,
  Divider,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setEditing(false);
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Error updating profile');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage('Password changed successfully!');
    } catch (error) {
      setMessage('Error changing password');
    }
  };

  if (!user) {
    return (
      <Container>
        <Typography variant="h4" align="center">
          Please log in to view your profile
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h3" component="h1" gutterBottom color="primary">
          My Profile
        </Typography>

        {message && (
          <Alert severity="info" sx={{ mb: 3 }}>
            {message}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Profile Info Card */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main' }}>
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="h5">
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {user.email}
                    </Typography>
                    <Chip 
                      label={user.role?.replace('_', ' ').toUpperCase()} 
                      color="primary" 
                      size="small" 
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {!editing ? (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Profile Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          First Name
                        </Typography>
                        <Typography variant="body1">
                          {user.firstName || 'Not provided'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Last Name
                        </Typography>
                        <Typography variant="body1">
                          {user.lastName || 'Not provided'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1">
                          {user.email}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Phone
                        </Typography>
                        <Typography variant="body1">
                          {user.phone || 'Not provided'}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Button 
                      variant="outlined" 
                      sx={{ mt: 3 }}
                      onClick={() => setEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  </Box>
                ) : (
                  <Box component="form" onSubmit={handleProfileUpdate}>
                    <Typography variant="h6" gutterBottom>
                      Edit Profile Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="First Name"
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 3 }}>
                      <Button type="submit" variant="contained" sx={{ mr: 2 }}>
                        Save Changes
                      </Button>
                      <Button variant="outlined" onClick={() => setEditing(false)}>
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Change Password Card */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Change Password
                </Typography>
                <Box component="form" onSubmit={handlePasswordChange}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Current Password"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      />
                    </Grid>
                  </Grid>
                  <Button type="submit" variant="contained" sx={{ mt: 3 }}>
                    Change Password
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Subscription Info */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Subscription Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Chip 
                    label={user.hasActiveSubscription ? "Premium Active" : "Free Plan"} 
                    color={user.hasActiveSubscription ? "success" : "default"}
                    sx={{ mr: 2 }}
                  />
                </Box>
                {!user.hasActiveSubscription && (
                  <Button variant="contained" color="warning">
                    Upgrade to Premium - KSH 70
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default ProfilePage;
