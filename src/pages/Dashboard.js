import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Avatar,
  Chip
} from '@mui/material';
import {
  Schedule,
  Restaurant,
  Event,
  FindInPage,
  Help,
  AdminPanelSettings,
  Person,
  TrendingUp,
  Security
} from '@mui/icons-material';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();

  const getServiceCards = () => {
    const baseCards = [
      {
        title: 'Timetable',
        description: user?.userType === 'Admin' 
          ? 'Manage class schedules, rooms, and faculty assignments'
          : 'View your class schedule and upcoming lectures',
        icon: <Schedule sx={{ fontSize: 40 }} />,
        path: '/timetable',
        color: '#1976d2',
        access: user?.userType === 'Admin' ? 'Full Management' : 'View Only'
      },
      {
        title: 'Cafeteria',
        description: user?.userType === 'Admin'
          ? 'Manage menu items, pricing, and customer feedback'
          : 'Browse menu, check prices, and view ratings',
        icon: <Restaurant sx={{ fontSize: 40 }} />,
        path: '/cafeteria',
        color: '#ed6c02',
        access: user?.userType === 'Admin' ? 'Full Management' : 'View Only'
      }
    ];

    const additionalCards = [
      {
        title: 'Events',
        description: user?.userType === 'Admin'
          ? 'Create, manage, and monitor campus events'
          : 'View upcoming events and submit event reports',
        icon: <Event sx={{ fontSize: 40 }} />,
        path: '/events',
        color: '#2e7d32',
        access: user?.userType === 'Admin' ? 'Full Management' : 'Report Only'
      },
      {
        title: 'Lost & Found',
        description: user?.userType === 'Admin'
          ? 'Manage lost items database and user requests'
          : 'Report lost items and search for found items',
        icon: <FindInPage sx={{ fontSize: 40 }} />,
        path: '/lost-found',
        color: '#9c27b0',
        access: user?.userType === 'Admin' ? 'Full Management' : 'Limited Access'
      },
      {
        title: 'Academic Query',
        description: user?.userType === 'Admin'
          ? 'Manage student queries and provide responses'
          : 'Submit academic queries and track responses',
        icon: <Help sx={{ fontSize: 40 }} />,
        path: '/academic-query',
        color: '#d32f2f',
        access: user?.userType === 'Admin' ? 'Full Management' : 'Report Only'
      }
    ];

    if (user?.userType === 'Admin') {
      additionalCards.push({
        title: 'User Management',
        description: 'Add new users and manage user accounts and permissions',
        icon: <AdminPanelSettings sx={{ fontSize: 40 }} />,
        path: '/user-management',
        color: '#7b1fa2',
        access: 'Admin Only'
      });
    }

    return [...baseCards, ...additionalCards];
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 2,
            bgcolor: user?.userType === 'Admin' ? 'secondary.main' : 'primary.main'
          }}
        >
          {user?.userType === 'Admin' ? <AdminPanelSettings sx={{ fontSize: 40 }} /> : <Person sx={{ fontSize: 40 }} />}
        </Avatar>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.name}!
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {user?.userType} Dashboard
        </Typography>
        <Chip
          icon={user?.userType === 'Admin' ? <Security /> : <TrendingUp />}
          label={user?.userType === 'Admin' ? 'Full System Access' : 'Student Access'}
          color={user?.userType === 'Admin' ? 'secondary' : 'primary'}
          sx={{ mt: 1 }}
        />
      </Box>

      {/* Service Cards */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Available Services
      </Typography>
      
      <Grid container spacing={3}>
        {getServiceCards().map((service) => (
          <Grid item xs={12} sm={6} md={4} key={service.title}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                  '& .service-icon': {
                    transform: 'scale(1.1)'
                  }
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 3 }}>
                <Box 
                  className="service-icon"
                  sx={{ 
                    color: service.color, 
                    mb: 2,
                    transition: 'transform 0.3s ease-in-out'
                  }}
                >
                  {service.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {service.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {service.description}
                </Typography>
                <Chip
                  label={service.access}
                  size="small"
                  color={user?.userType === 'Admin' ? 'success' : 'default'}
                  variant="outlined"
                />
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => navigate(service.path)}
                  sx={{ bgcolor: service.color }}
                >
                  Access {service.title}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Stats */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Quick Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              textAlign: 'center', 
              p: 3,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 2
              }
            }}>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                {user?.userType === 'Admin' ? '6' : '5'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available Services
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              textAlign: 'center', 
              p: 3,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 2
              }
            }}>
              <Typography variant="h4" color="success.main">
                24/7
              </Typography>
              <Typography variant="body2" color="text.secondary">
                System Availability
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              textAlign: 'center', 
              p: 3,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 2
              }
            }}>
              <Typography variant="h4" color="warning.main">
                AWS
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cloud Infrastructure
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              textAlign: 'center', 
              p: 3,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 2
              }
            }}>
              <Typography variant="h4" color="info.main">
                Secure
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Data Protection
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;