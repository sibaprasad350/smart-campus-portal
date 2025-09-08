import React, { useState, useEffect } from 'react';
import { eventsAPI } from '../services/api';
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
  Chip,
  IconButton,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import { Add, Edit, Delete, Event, Report, CalendarToday } from '@mui/icons-material';

const Events = ({ user }) => {
  const [tabValue, setTabValue] = useState(0);
  const [open, setOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventsAPI.getAll();
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const [reports, setReports] = useState([
    { id: 1, eventId: 1, studentName: 'John Doe', issue: 'Sound system issues during presentation', date: '2024-01-15' },
    { id: 2, eventId: 2, studentName: 'Jane Smith', issue: 'Insufficient seating arrangements', date: '2024-01-16' }
  ]);

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    category: ''
  });

  const [reportData, setReportData] = useState({
    eventId: '',
    issue: ''
  });

  const categories = ['Academic', 'Cultural', 'Sports', 'Career', 'Workshop'];

  const handleAddEvent = () => {
    setEditMode(false);
    setFormData({ title: '', date: '', time: '', location: '', description: '', category: '' });
    setOpen(true);
  };

  const handleEditEvent = (event) => {
    setEditMode(true);
    setSelectedEvent(event);
    setFormData(event);
    setOpen(true);
  };

  const handleSaveEvent = async () => {
    if (!formData.title || !formData.date || !formData.time || !formData.location) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      console.log('Saving event:', formData);
      if (editMode) {
        const response = await eventsAPI.update({ ...formData, id: selectedEvent.id });
        console.log('Update response:', response);
        setEvents(events.map(e => e.id === selectedEvent.id ? response.data : e));
      } else {
        const response = await eventsAPI.create(formData);
        console.log('Create response:', response);
        setEvents([...events, response.data]);
      }
      setFormData({ title: '', date: '', time: '', location: '', description: '', category: '' });
      setOpen(false);
    } catch (error) {
      console.error('Error saving event:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await eventsAPI.delete(id);
      setEvents(events.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleSubmitReport = async () => {
    if (!reportData.eventId || !reportData.issue) {
      return;
    }
    
    try {
      const newReport = {
        id: Date.now(),
        eventId: parseInt(reportData.eventId),
        studentName: user?.name || 'Anonymous',
        issue: reportData.issue,
        date: new Date().toISOString().split('T')[0]
      };
      setReports([...reports, newReport]);
      setReportData({ eventId: '', issue: '' });
      setReportOpen(false);
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  const getEventById = (eventId) => {
    return events.find(e => e.id === eventId);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            <Event sx={{ mr: 2, verticalAlign: 'middle' }} />
            {user?.userType === 'Admin' ? 'Events Management' : 'Events'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {user?.userType === 'Admin' ? 'Manage campus events and view reports' : 'View events and submit reports'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {user?.userType === 'Admin' && (
            <Button variant="contained" startIcon={<Add />} onClick={handleAddEvent}>
              Add Event
            </Button>
          )}

        </Box>
      </Box>

      {/* Events List */}
      {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography>Loading events...</Typography>
          </Box>
        ) : events.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography>No events found. Add some events to get started!</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {events.map((event) => (
            <Grid item xs={12} md={6} key={event.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h2">
                      {event.title}
                    </Typography>
                    <Chip
                      label={event.status}
                      color={event.status === 'Upcoming' ? 'primary' : 'default'}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {event.date} at {event.time}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    📍 {event.location}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {event.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip label={event.category} variant="outlined" size="small" />
                    
                    {user?.userType === 'Admin' && (
                      <Box>
                        <IconButton onClick={() => handleEditEvent(event)} size="small">
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteEvent(event.id)} size="small">
                          <Delete />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            ))}
          </Grid>
      )}

      {/* Add/Edit Event Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Event' : 'Add New Event'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Event Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            select
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            margin="normal"
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEvent} variant="contained">
            {editMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report Issue Dialog */}
      <Dialog open={reportOpen} onClose={() => setReportOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Report Event Issue</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Select Event"
            value={reportData.eventId}
            onChange={(e) => setReportData({ ...reportData, eventId: e.target.value })}
            margin="normal"
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            {events.map(event => (
              <option key={event.id} value={event.id}>{event.title}</option>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Describe the Issue"
            multiline
            rows={4}
            value={reportData.issue}
            onChange={(e) => setReportData({ ...reportData, issue: e.target.value })}
            margin="normal"
            placeholder="Please describe the issue you encountered..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitReport} variant="contained">
            Submit Report
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Events;