import React, { useState } from 'react';
import { authAPI } from '../services/api';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import { School, Person, AdminPanelSettings } from '@mui/icons-material';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    userType: '',
    userId: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.userType || !formData.userId || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password.length < 8 || formData.password.length > 12) {
      setError('Password must be between 8 to 12 characters');
      return;
    }

    // Call authentication API
    try {
      const response = await authAPI.login({
        userId: formData.userId,
        password: formData.password,
        userType: formData.userType
      });
      
      if (response.data && response.data.user) {
        const userData = response.data.user;
        localStorage.setItem('authToken', userData.token);
        localStorage.setItem('userData', JSON.stringify(userData));
        onLogin(userData);
      } else {
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Container component="main" maxWidth="xs">
        <Paper 
          elevation={8} 
          sx={{ 
            p: { xs: 3, sm: 4 }, 
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 15px 30px rgba(0,0,0,0.08)',
            maxWidth: { xs: '100%', sm: 400 },
            mx: 'auto'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <School sx={{ fontSize: { xs: 48, sm: 52 }, color: 'primary.main', mb: 1.5 }} />
            <Typography component="h1" variant="h5" gutterBottom color="primary" sx={{ fontWeight: 600 }}>
              Smart Campus Portal
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Unified platform for all campus services
            </Typography>
            
            {error && <Alert severity="error" sx={{ width: '100%', mb: 3 }}>{error}</Alert>}
            
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>User Type</InputLabel>
                <Select
                  value={formData.userType}
                  label="User Type"
                  onChange={handleChange('userType')}
                >
                  <MenuItem value="Admin">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AdminPanelSettings sx={{ mr: 1 }} />
                      Administrator
                    </Box>
                  </MenuItem>
                  <MenuItem value="Student">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Person sx={{ mr: 1 }} />
                      Student
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              <TextField
                margin="normal"
                required
                fullWidth
                id="userId"
                label="User ID"
                name="userId"
                autoComplete="username"
                value={formData.userId}
                onChange={handleChange('userId')}
                placeholder={formData.userType === 'Admin' ? 'admin001' : 'student001'}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password (8-12 characters)"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange('password')}
                inputProps={{ minLength: 8, maxLength: 12 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="medium"
                sx={{ mt: 2.5, mb: 2, py: 1.2, fontSize: '1rem' }}
              >
                Sign In
              </Button>
            </Box>

            <Divider sx={{ width: '100%', my: 2 }} />
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?
              </Typography>
              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500 }}>
                Contact Administrator for account creation
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;