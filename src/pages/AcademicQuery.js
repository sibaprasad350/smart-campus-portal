import React, { useState, useEffect } from 'react';
import { academicQueryAPI } from '../services/api';
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
  Tabs,
  Tab,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  Help, 
  Send, 
  Reply,
  ExpandMore,
  CheckCircle,
  Pending,
  QuestionAnswer
} from '@mui/icons-material';

const AcademicQuery = ({ user }) => {
  const [tabValue, setTabValue] = useState(0);
  const [open, setOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [queries, setQueries] = useState([]);

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      const response = await academicQueryAPI.getAll();
      setQueries(response.data);
    } catch (error) {
      console.error('Error fetching queries:', error);
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'Medium'
  });

  const [replyData, setReplyData] = useState('');

  const categories = ['Grades', 'Registration', 'Documents', 'Financial Aid', 'Academic Policies', 'Other'];
  const priorities = ['Low', 'Medium', 'High', 'Urgent'];

  const handleSubmitQuery = async () => {
    if (!formData.title || !formData.description || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      const queryData = {
        ...formData,
        studentName: user?.name || 'Anonymous',
        studentEmail: user?.email || 'N/A'
      };
      console.log('Submitting query:', queryData);
      const response = await academicQueryAPI.create(queryData);
      console.log('Create response:', response);
      setQueries([...queries, response.data]);
      setFormData({ title: '', description: '', category: '', priority: 'Medium' });
      setOpen(false);
    } catch (error) {
      console.error('Error submitting query:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const handleReply = (query) => {
    console.log('Opening reply dialog for query:', query);
    setSelectedQuery(query);
    setReplyData(query.response || '');
    setReplyOpen(true);
  };

  const handleSubmitReply = async () => {
    if (!replyData.trim()) {
      return;
    }
    
    try {
      const updateData = {
        id: selectedQuery.id,
        response: replyData,
        respondedBy: user?.name || 'Administrator',
        responseDate: new Date().toISOString().split('T')[0],
        status: 'Resolved'
      };
      
      console.log('Sending update data:', updateData);
      const response = await academicQueryAPI.update(updateData);
      setQueries(queries.map(q => q.id === selectedQuery.id ? response.data : q));
      setReplyData('');
      setReplyOpen(false);
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
  };

  const handleDeleteQuery = async (id) => {
    try {
      await academicQueryAPI.delete(id);
      setQueries(queries.filter(q => q.id !== id));
    } catch (error) {
      console.error('Error deleting query:', error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await academicQueryAPI.update({ id, status: newStatus });
      setQueries(queries.map(q => q.id === id ? response.data : q));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'error';
      case 'In Progress': return 'warning';
      case 'Resolved': return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return 'info';
      case 'Medium': return 'primary';
      case 'High': return 'warning';
      case 'Urgent': return 'error';
      default: return 'default';
    }
  };

  const getFilteredQueries = () => {
    if (user?.userType === 'Student') {
      return queries.filter(q => q.studentEmail === user?.email);
    }
    
    switch (tabValue) {
      case 0: return queries.filter(q => q.status === 'Open');
      case 1: return queries.filter(q => q.status === 'In Progress');
      case 2: return queries.filter(q => q.status === 'Resolved');
      default: return queries;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            <Help sx={{ mr: 2, verticalAlign: 'middle' }} />
            Academic Query System
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {user?.userType === 'Admin' 
              ? 'Manage student academic queries and provide responses' 
              : 'Submit academic queries and track responses'}
          </Typography>
        </Box>
        {user?.userType === 'Student' && (
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
            Submit Query
          </Button>
        )}
      </Box>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'error.light', color: 'white' }}>
            <Typography variant="h4">
              {queries.filter(q => q.status === 'Open').length}
            </Typography>
            <Typography variant="body2">Open Queries</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', color: 'white' }}>
            <Typography variant="h4">
              {queries.filter(q => q.status === 'In Progress').length}
            </Typography>
            <Typography variant="body2">In Progress</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', color: 'white' }}>
            <Typography variant="h4">
              {queries.filter(q => q.status === 'Resolved').length}
            </Typography>
            <Typography variant="body2">Resolved</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', color: 'white' }}>
            <Typography variant="h4">
              {queries.length}
            </Typography>
            <Typography variant="body2">Total Queries</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for Admin */}
      {user?.userType === 'Admin' && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Open" />
            <Tab label="In Progress" />
            <Tab label="Resolved" />
          </Tabs>
        </Box>
      )}

      {/* Queries List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography>Loading queries...</Typography>
        </Box>
      ) : getFilteredQueries().length === 0 ? (
        <Alert severity="info">
          {user?.userType === 'Student' 
            ? 'You have not submitted any queries yet.' 
            : 'No queries in this category.'}
        </Alert>
      ) : (
        <Box>
          {getFilteredQueries().map((query) => (
            <Accordion key={query.id} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                  <QuestionAnswer color="primary" />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{query.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user?.userType === 'Admin' ? `By: ${query.studentName}` : ''} • {query.date}
                    </Typography>
                  </Box>
                  <Chip label={query.status} color={getStatusColor(query.status)} size="small" />
                  <Chip label={query.priority} color={getPriorityColor(query.priority)} size="small" />
                  <Chip label={query.category} variant="outlined" size="small" />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {query.description}
                  </Typography>
                  
                  {user?.userType === 'Admin' && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Contact: {query.studentEmail}
                    </Typography>
                  )}

                  {query.response ? (
                    <Box sx={{ bgcolor: 'success.light', color: 'white', p: 2, borderRadius: 1, mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                        ✅ Admin Response ({query.responseDate || 'Recently'}):
                      </Typography>
                      <Typography variant="body2" sx={{ bgcolor: 'rgba(255,255,255,0.9)', color: 'black', p: 1, borderRadius: 1 }}>
                        {query.response}
                      </Typography>
                      <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                        Responded by: {query.respondedBy || 'Administrator'}
                      </Typography>
                    </Box>
                  ) : (
                    user?.userType === 'Student' && (
                      <Box sx={{ bgcolor: 'warning.light', p: 2, borderRadius: 1, mb: 2 }}>
                        <Typography variant="body2" sx={{ color: 'warning.contrastText' }}>
                          ⏳ Waiting for admin response...
                        </Typography>
                      </Box>
                    )
                  )}

                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    {user?.userType === 'Admin' && (
                      <>
                        <Button
                          variant="contained"
                          startIcon={<Reply />}
                          onClick={() => handleReply(query)}
                          size="small"
                          disabled={query.status === 'Resolved'}
                        >
                          {query.response ? 'Update Reply' : 'Reply'}
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => handleStatusChange(query.id, 'In Progress')}
                          disabled={query.status === 'In Progress'}
                          size="small"
                        >
                          Mark In Progress
                        </Button>
                        <IconButton onClick={() => handleDeleteQuery(query.id)} size="small">
                          <Delete />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Submit Query Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Submit Academic Query</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Query Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
            select
            label="Priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            margin="normal"
            SelectProps={{ native: true }}
          >
            {priorities.map(priority => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            placeholder="Please describe your academic query in detail..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitQuery} variant="contained" startIcon={<Send />}>
            Submit Query
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={replyOpen} onClose={() => setReplyOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reply to Query</DialogTitle>
        <DialogContent>
          {selectedQuery && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Query: {selectedQuery.title}
              </Typography>
              <Typography variant="body2">
                {selectedQuery.description}
              </Typography>
            </Box>
          )}
          <TextField
            fullWidth
            label="Your Response"
            multiline
            rows={4}
            value={replyData}
            onChange={(e) => setReplyData(e.target.value)}
            margin="normal"
            placeholder="Type your response here..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitReply} variant="contained" startIcon={<Send />}>
            Send Reply
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AcademicQuery;