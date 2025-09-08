import React, { useState, useEffect } from 'react';
import { userManagementAPI } from '../services/api';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Alert
} from '@mui/material';
import { Add, Delete, AdminPanelSettings, Person, Search } from '@mui/icons-material';

const UserManagement = ({ user }) => {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('Fetching users from API...');
      const response = await userManagementAPI.getAll();
      console.log('Users fetched:', response.data);
      setUsers(response.data || []);
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      // Fallback to mock data when API fails
      const mockUsers = [
        {
          id: 1,
          user_id: 'admin001',
          name: 'System Administrator',
          email: 'admin@smartcampus.edu',
          user_type: 'Admin',
          status: 'Active',
          created_at: '2024-01-15'
        },
        {
          id: 2,
          user_id: 'student001',
          name: 'John Smith',
          email: 'john.smith@student.edu',
          user_type: 'Student',
          status: 'Active',
          created_at: '2024-01-20'
        },
        {
          id: 3,
          user_id: 'student002',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@student.edu',
          user_type: 'Student',
          status: 'Active',
          created_at: '2024-01-22'
        }
      ];
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    email: '',
    userType: 'Student',
    status: 'Active',
    password: ''
  });

  // Redirect if not admin
  if (user?.userType !== 'Admin') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Access Denied. This page is only available for administrators.
        </Alert>
      </Container>
    );
  }

  const handleAdd = () => {
    setEditMode(false);
    setFormData({ userId: '', name: '', email: '', userType: 'Student', status: 'Active', password: '' });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!formData.userId || !formData.name || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (!formData.password || formData.password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    
    try {
      console.log('Creating user:', formData);
      
      try {
        const response = await userManagementAPI.create(formData);
        console.log('User created via API:', response.data);
        
        // Refresh users list from API after successful creation
        await fetchUsers();
        
        alert('User created successfully in Cognito!');
      } catch (apiError) {
        console.log('API failed, adding user locally:', apiError.message);
        
        // Add user to local state when API fails
        const newUser = {
          id: Date.now(),
          user_id: formData.userId,
          name: formData.name,
          email: formData.email,
          user_type: formData.userType,
          status: 'Active',
          created_at: new Date().toLocaleDateString()
        };
        setUsers(prevUsers => [...prevUsers, newUser]);
        alert('User added locally (API unavailable)');
      }
      
      setFormData({ userId: '', name: '', email: '', userType: 'Student', status: 'Active', password: '' });
      setOpen(false);
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      // Find the user to get the user_id for Cognito deletion
      const userToDelete = users.find(user => user.id === id);
      if (!userToDelete) {
        alert('User not found');
        return;
      }
      
      console.log('Deleting user:', userToDelete.user_id);
      
      // Remove user from local state immediately
      setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
      
      try {
        // Delete from Cognito using user_id
        await userManagementAPI.delete(userToDelete.user_id);
        console.log('User deleted from Cognito via API');
        alert('User deleted successfully from Cognito!');
      } catch (apiError) {
        console.log('API failed:', apiError.message);
        alert('User removed from UI (API unavailable)');
      }
      
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user: ' + error.message);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(userItem => 
    userItem.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    userItem.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            <AdminPanelSettings sx={{ mr: 2, verticalAlign: 'middle' }} />
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Add new users and manage user accounts and permissions
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
          Add New User
        </Button>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search users by name or user ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', color: 'white' }}>
            <Typography variant="h4">
              {users.length}
            </Typography>
            <Typography variant="body2">Total Users</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', color: 'white' }}>
            <Typography variant="h4">
              {users.filter(u => u.status === 'Active').length}
            </Typography>
            <Typography variant="body2">Active Users</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'secondary.light', color: 'white' }}>
            <Typography variant="h4">
              {users.filter(u => u.user_type === 'Admin').length}
            </Typography>
            <Typography variant="body2">Administrators</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'info.light', color: 'white' }}>
            <Typography variant="h4">
              {users.filter(u => u.user_type === 'Student').length}
            </Typography>
            <Typography variant="body2">Students</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Users Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography>Loading users...</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>User Type</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((userItem) => (
              <TableRow key={userItem.id}>
                <TableCell>{userItem.user_id}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {userItem.user_type === 'Admin' ? 
                      <AdminPanelSettings sx={{ mr: 1, color: 'secondary.main' }} /> :
                      <Person sx={{ mr: 1, color: 'primary.main' }} />
                    }
                    {userItem.name}
                  </Box>
                </TableCell>
                <TableCell>{userItem.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={userItem.user_type} 
                    color={userItem.user_type === 'Admin' ? 'secondary' : 'primary'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{userItem.created_at}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDelete(userItem.id)} size="small">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="User ID"
            value={formData.userId}
            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            select
            label="User Type"
            value={formData.userType}
            onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
            margin="normal"
            SelectProps={{ native: true }}
          >
            <option value="Student">Student</option>
            <option value="Admin">Administrator</option>
          </TextField>
          <TextField
            fullWidth
            select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            margin="normal"
            SelectProps={{ native: true }}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </TextField>
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            margin="normal"
            helperText="Minimum 8 characters"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Add User
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagement;