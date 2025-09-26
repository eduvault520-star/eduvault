import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  CircularProgress,
  Chip,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Visibility as ViewIcon,
  VisibilityOff,
  Search as SearchIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  SupervisorAccount as SuperAdminIcon,
  CheckCircle as CheckCircleIcon,
  VpnKey as VpnKeyIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Payment as PaymentIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import api from '../../utils/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [resetPasswordDialog, setResetPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchSubscriptions();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/users');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users from database');
      // Use mock data as fallback
      setUsers([
        {
          _id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@student.com',
          password: '$2a$10$hashedPassword123',
          role: 'student',
          isActive: true,
          institution: 'University of Nairobi',
          createdAt: '2024-01-15T10:30:00Z',
          lastLogin: '2024-09-24T08:15:00Z'
        },
        {
          _id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@admin.com',
          password: '$2a$10$hashedPassword456',
          role: 'mini_admin',
          isActive: true,
          institution: 'KMTC Nairobi',
          createdAt: '2024-02-10T14:20:00Z',
          lastLogin: '2024-09-23T16:45:00Z'
        },
        {
          _id: '3',
          firstName: 'Mike',
          lastName: 'Johnson',
          email: 'mike.johnson@student.com',
          password: '$2a$10$hashedPassword789',
          role: 'student',
          isActive: false,
          institution: 'Kenyatta University',
          createdAt: '2024-03-05T09:10:00Z',
          lastLogin: '2024-09-20T12:30:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/api/admin/subscriptions');
      setSubscriptions(response.data.subscriptions || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      // Mock subscription data
      setSubscriptions([
        {
          _id: 'sub1',
          userId: '1',
          courseId: 'course1',
          courseName: 'Computer Science',
          amount: 100,
          currency: 'KSH',
          status: 'completed',
          isActive: true,
          startDate: '2024-09-01T00:00:00Z',
          expiryDate: '2024-10-01T00:00:00Z',
          mpesaTransactionId: 'ws_CO_24092024123456',
          mpesaReceiptNumber: 'QGH7X8Y9Z0',
          paymentDate: '2024-09-01T10:15:30Z'
        }
      ]);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/api/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
      setSuccess(`User role updated to ${newRole}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating role:', error);
      setError('Failed to update user role');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await api.put(`/api/admin/users/${userId}/status`, { isActive: newStatus });
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isActive: newStatus } : user
      ));
      setSuccess(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update user status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      await api.put(`/api/admin/users/${selectedUser._id}/password`, { newPassword });
      setUsers(users.map(user => 
        user._id === selectedUser._id ? { ...user, password: `$2a$10$${newPassword}Hashed` } : user
      ));
      setSuccess(`Password reset successfully for ${selectedUser.firstName} ${selectedUser.lastName}`);
      setResetPasswordDialog(false);
      setNewPassword('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error resetting password:', error);
      setError('Failed to reset password');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await api.delete(`/api/admin/users/${userToDelete._id}`);
      setUsers(users.filter(user => user._id !== userToDelete._id));
      setSuccess(`User ${userToDelete.firstName} ${userToDelete.lastName} deleted successfully`);
      setDeleteConfirmDialog(false);
      setUserToDelete(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleGrantPremium = async (userId) => {
    try {
      await api.post('/api/admin/grant-premium', { userId, courseId: 'default' });
      setSuccess(`Premium access granted to user`);
      fetchSubscriptions(); // Refresh subscriptions
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error granting premium:', error);
      setError('Failed to grant premium access');
      setTimeout(() => setError(''), 3000);
    }
  };

  const togglePasswordVisibility = (userId) => {
    setPasswordVisible(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleRefreshData = () => {
    fetchUsers();
    fetchSubscriptions();
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'super_admin': return <SuperAdminIcon color="error" />;
      case 'mini_admin': return <AdminIcon color="warning" />;
      default: return <PersonIcon color="primary" />;
    }
  };

  const getUserSubscriptions = (userId) => {
    return subscriptions.filter(sub => sub.userId === userId);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <Card>
      <CardContent>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Typography variant="h5" style={{ fontWeight: 'bold' }}>
            User Management
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefreshData}
            disabled={loading}
          >
            Refresh Data
          </Button>
        </div>

        {error && <Alert severity="error" style={{ marginBottom: '16px' }}>{error}</Alert>}
        {success && <Alert severity="success" style={{ marginBottom: '16px' }}>{success}</Alert>}

        {/* Search and Filters */}
        <Grid container spacing={2} style={{ marginBottom: '24px' }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon style={{ marginRight: '8px', color: '#666' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Role Filter</InputLabel>
              <Select
                value={roleFilter}
                label="Role Filter"
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="student">Students</MenuItem>
                <MenuItem value="mini_admin">Mini Admins</MenuItem>
                <MenuItem value="super_admin">Super Admins</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                label="Status Filter"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Users Table */}
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Password</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Institution</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Premium</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => {
                const userSubs = getUserSubscriptions(user._id);
                const activeSubs = userSubs.filter(sub => sub.isActive);
                
                return (
                  <TableRow key={user._id} hover>
                    <TableCell>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Avatar style={{ backgroundColor: '#1976d2' }}>
                          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </Avatar>
                        <div>
                          <Typography variant="subtitle2">
                            {user.firstName} {user.lastName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                          </Typography>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>{user.email}</TableCell>
                    
                    <TableCell>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Typography variant="body2" style={{ fontFamily: 'monospace' }}>
                          {passwordVisible[user._id] ? user.password : '••••••••••••'}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => togglePasswordVisibility(user._id)}
                        >
                          {passwordVisible[user._id] ? <VisibilityOff /> : <ViewIcon />}
                        </IconButton>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getRoleIcon(user.role)}
                        <FormControl size="small" style={{ minWidth: 120 }}>
                          <Select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          >
                            <MenuItem value="student">Student</MenuItem>
                            <MenuItem value="mini_admin">Mini Admin</MenuItem>
                            <MenuItem value="super_admin">Super Admin</MenuItem>
                          </Select>
                        </FormControl>
                      </div>
                    </TableCell>
                    
                    <TableCell>{user.institution}</TableCell>
                    
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={user.isActive}
                            onChange={() => handleStatusToggle(user._id, user.isActive)}
                            color="success"
                          />
                        }
                        label={user.isActive ? 'Active' : 'Inactive'}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        icon={<PaymentIcon />}
                        label={activeSubs.length > 0 ? `Premium (${activeSubs.length})` : 'Basic'}
                        color={activeSubs.length > 0 ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedUser(user);
                              setDialogOpen(true);
                            }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Grant Premium Access">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleGrantPremium(user._id)}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reset Password">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => {
                              setSelectedUser(user);
                              setResetPasswordDialog(true);
                            }}
                          >
                            <VpnKeyIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setUserToDelete(user);
                              setDeleteConfirmDialog(true);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredUsers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <Typography variant="h6" color="textSecondary">
              No users found matching your criteria
            </Typography>
          </div>
        )}
      </CardContent>

      {/* User Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          User Details & Subscription History
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <div>
              <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} style={{ marginBottom: '24px' }}>
                <Tab icon={<PersonIcon />} label="Profile" />
                <Tab icon={<PaymentIcon />} label="Subscriptions" />
              </Tabs>

              {/* Profile Tab */}
              {tabValue === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={selectedUser.firstName}
                      margin="normal"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={selectedUser.lastName}
                      margin="normal"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={selectedUser.email}
                      margin="normal"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Institution"
                      value={selectedUser.institution}
                      margin="normal"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Role"
                      value={selectedUser.role}
                      margin="normal"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Status"
                      value={selectedUser.isActive ? 'Active' : 'Inactive'}
                      margin="normal"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </Grid>
              )}

              {/* Subscriptions Tab */}
              {tabValue === 1 && (
                <div>
                  <Typography variant="h6" gutterBottom>
                    Subscription History
                  </Typography>
                  <List>
                    {getUserSubscriptions(selectedUser._id).map((sub) => (
                      <div key={sub._id}>
                        <ListItem>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
                            <SchoolIcon color={sub.isActive ? 'success' : 'disabled'} />
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                                <Typography variant="subtitle1">
                                  {sub.courseName}
                                </Typography>
                                <Chip
                                  label={sub.status}
                                  color={sub.status === 'completed' ? 'success' : 'warning'}
                                  size="small"
                                />
                              </div>
                              <Typography variant="body2" color="textSecondary">
                                Amount: {sub.currency} {sub.amount}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                M-Pesa ID: {sub.mpesaTransactionId}
                              </Typography>
                              {sub.mpesaReceiptNumber && (
                                <Typography variant="body2" color="textSecondary">
                                  Receipt: {sub.mpesaReceiptNumber}
                                </Typography>
                              )}
                              <Typography variant="body2" color="textSecondary">
                                Subscribed: {new Date(sub.startDate).toLocaleDateString()}
                              </Typography>
                              {sub.paymentDate && (
                                <Typography variant="body2" color="textSecondary">
                                  Paid: {new Date(sub.paymentDate).toLocaleString()}
                                </Typography>
                              )}
                              <Typography variant="body2" color="textSecondary">
                                Expires: {new Date(sub.expiryDate).toLocaleDateString()}
                              </Typography>
                            </div>
                          </div>
                        </ListItem>
                        <Divider />
                      </div>
                    ))}
                    {getUserSubscriptions(selectedUser._id).length === 0 && (
                      <Typography variant="body2" color="textSecondary" style={{ textAlign: 'center', padding: '16px' }}>
                        No subscriptions found
                      </Typography>
                    )}
                  </List>
                </div>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog
        open={resetPasswordDialog}
        onClose={() => setResetPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Reset Password
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <div style={{ paddingTop: '16px' }}>
              <Typography variant="body1" gutterBottom>
                Reset password for: <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>
              </Typography>
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                margin="normal"
                placeholder="Enter new password (min 6 characters)"
              />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setResetPasswordDialog(false);
            setNewPassword('');
          }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="warning"
            onClick={handleResetPassword}
            disabled={!newPassword || newPassword.length < 6}
          >
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmDialog}
        onClose={() => setDeleteConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirm Delete User
        </DialogTitle>
        <DialogContent>
          {userToDelete && (
            <div style={{ paddingTop: '16px' }}>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to delete this user? This action cannot be undone.
              </Typography>
              <Typography variant="h6" color="error" style={{ marginTop: '16px' }}>
                {userToDelete.firstName} {userToDelete.lastName}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {userToDelete.email}
              </Typography>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDeleteConfirmDialog(false);
            setUserToDelete(null);
          }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={handleDeleteUser}
          >
            Delete User
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default UserManagement;
