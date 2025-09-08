import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Avatar,
  Chip
} from '@mui/material';
import {
  Schedule,
  Restaurant,
  Event,
  FindInPage,
  Help,
  Dashboard as DashboardIcon,
  Logout,
  AdminPanelSettings,
  Person
} from '@mui/icons-material';

const Navbar = ({ user, onLogout, showServices = true }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getMenuItems = () => {
    const baseItems = [
      { label: 'Dashboard', path: '/', icon: <DashboardIcon /> }
    ];

    if (!showServices) {
      return baseItems;
    }

    const serviceItems = [
      { label: 'Timetable', path: '/timetable', icon: <Schedule /> },
      { label: 'Cafeteria', path: '/cafeteria', icon: <Restaurant /> },
      { label: 'Events', path: '/events', icon: <Event /> },
      { label: 'Lost & Found', path: '/lost-found', icon: <FindInPage /> },
      { label: 'Academic Query', path: '/academic-query', icon: <Help /> },
    ];

    if (user?.userType === 'Admin') {
      serviceItems.push({ label: 'User Management', path: '/user-management', icon: <AdminPanelSettings /> });
    }

    return [...baseItems, ...serviceItems];
  };

  return (
    <AppBar position="static" elevation={2} sx={{ minHeight: 'auto' }}>
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, py: 0.5 }}>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            fontWeight: 600,
            fontSize: { xs: '1rem', sm: '1.25rem' },
            display: { xs: 'none', sm: 'block' }
          }}
        >
          Smart Campus Portal
        </Typography>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            fontWeight: 600,
            fontSize: '1rem',
            display: { xs: 'block', sm: 'none' }
          }}
        >
          SCP
        </Typography>
        
        <Box 
          sx={{ 
            display: 'flex', 
            gap: { xs: 0.5, sm: 1 }, 
            mr: { xs: 1, sm: 2 }, 
            flexWrap: 'nowrap', 
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollBehavior: 'smooth',
            '&::-webkit-scrollbar': {
              height: 4,
              backgroundColor: 'rgba(255,255,255,0.1)'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(255,255,255,0.3)',
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.5)'
              }
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent'
            },
            // Firefox scrollbar
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.3) transparent',
            // Add padding to show scrollbar
            pb: 0.5
          }}
        >
          {getMenuItems().map((item) => (
            <Button
              key={item.path}
              color="inherit"
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                px: { xs: 0.5, sm: 1 },
                py: 0.5,
                borderRadius: 1,
                minWidth: { xs: 'auto', sm: 'auto' },
                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.15)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                },
                transition: 'all 0.2s ease-in-out',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                '& .MuiButton-startIcon': {
                  marginRight: { xs: 0, sm: 0.5 },
                  marginLeft: 0
                },
                '& .MuiButton-startIcon > *:nth-of-type(1)': {
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }
              }}
            >
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                {item.label}
              </Box>
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          <Chip
            icon={user?.userType === 'Admin' ? <AdminPanelSettings /> : <Person />}
            label={user?.userType}
            color={user?.userType === 'Admin' ? 'secondary' : 'default'}
            variant="outlined"
            size="small"
            sx={{ 
              color: 'white', 
              borderColor: 'rgba(255,255,255,0.5)',
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              height: { xs: 24, sm: 32 },
              display: { xs: 'none', sm: 'flex' }
            }}
          />
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 }, mr: { xs: 0.5, sm: 1 }, bgcolor: 'secondary.main' }}>
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
            <Typography 
              variant="body2" 
              sx={{ 
                mr: { xs: 0.5, sm: 1 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                display: { xs: 'none', md: 'block' }
              }}
            >
              {user?.name}
            </Typography>
            <IconButton 
              color="inherit" 
              onClick={onLogout} 
              title="Logout"
              size="small"
              sx={{ p: { xs: 0.5, sm: 1 } }}
            >
              <Logout sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
            </IconButton>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;