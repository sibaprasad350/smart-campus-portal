import React, { useState, useEffect } from 'react';
import { lostFoundAPI } from '../services/api';
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
  Avatar,
  Alert
} from '@mui/material';
import { Add, Edit, Delete, FindInPage, Search, Report } from '@mui/icons-material';

const LostFound = ({ user }) => {
  const [tabValue, setTabValue] = useState(0);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [lostItems, setLostItems] = useState([]);

  useEffect(() => {
    fetchLostFoundItems();
  }, []);

  const fetchLostFoundItems = async () => {
    try {
      const response = await lostFoundAPI.getAll();
      setLostItems(response.data);
    } catch (error) {
      console.error('Error fetching lost found items:', error);
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    status: 'Lost',
    image: null,
    phone: ''
  });

  const [imagePreview, setImagePreview] = useState(null);

  const categories = ['Electronics', 'Bags', 'Keys', 'Clothing', 'Books', 'Accessories', 'Other'];
  const statuses = ['Lost', 'Found', 'Claimed'];

  const handleAdd = () => {
    setEditMode(false);
    setFormData({ title: '', description: '', category: '', location: '', status: 'Lost', image: null, phone: '' });
    setOpen(true);
  };

  const handleEdit = (item) => {
    setEditMode(true);
    setSelectedItem(item);
    setFormData(item);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description || !formData.category || !formData.location) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      const itemData = {
        ...formData,
        reportedBy: user?.name || 'Anonymous',
        contact: user?.email || 'N/A'
      };

      console.log('Saving lost found item:', itemData);
      if (editMode) {
        const response = await lostFoundAPI.update({ ...itemData, id: selectedItem.id });
        console.log('Update response:', response);
        setLostItems(lostItems.map(item => item.id === selectedItem.id ? response.data : item));
      } else {
        const response = await lostFoundAPI.create(itemData);
        console.log('Create response:', response);
        setLostItems([...lostItems, response.data]);
      }
      setFormData({ title: '', description: '', category: '', location: '', status: 'Lost', image: null, phone: '' });
      setOpen(false);
    } catch (error) {
      console.error('Error saving lost found item:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const handleDelete = async (id) => {
    try {
      await lostFoundAPI.delete(id);
      setLostItems(lostItems.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting lost found item:', error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const item = lostItems.find(item => item.id === id);
      const response = await lostFoundAPI.update({ ...item, status: newStatus });
      setLostItems(lostItems.map(item => item.id === id ? response.data : item));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Lost': return 'error';
      case 'Found': return 'warning';
      case 'Claimed': return 'success';
      default: return 'default';
    }
  };

  const filteredItems = tabValue === 0 
    ? lostItems.filter(item => item.status === 'Lost')
    : tabValue === 1 
    ? lostItems.filter(item => item.status === 'Found')
    : lostItems;

  const handleFoundItem = async (id) => {
    await handleStatusChange(id, 'Found');
  };

  const handleClaimItem = async (id) => {
    await handleStatusChange(id, 'Claimed');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            <FindInPage sx={{ mr: 2, verticalAlign: 'middle' }} />
            Lost & Found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {user?.userType === 'Admin' 
              ? 'Manage lost and found items database' 
              : 'Report lost items and search for found items'}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
          {user?.userType === 'Admin' ? 'Add Item' : 'Report Item'}
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Lost Items" />
          <Tab label="Found Items" />
          {user?.userType === 'Admin' && <Tab label="All Items" />}
        </Tabs>
      </Box>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'error.light', color: 'white' }}>
            <Typography variant="h4">
              {lostItems.filter(item => item.status === 'Lost').length}
            </Typography>
            <Typography variant="body2">Lost Items</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', color: 'white' }}>
            <Typography variant="h4">
              {lostItems.filter(item => item.status === 'Found').length}
            </Typography>
            <Typography variant="body2">Found Items</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', color: 'white' }}>
            <Typography variant="h4">
              {lostItems.filter(item => item.status === 'Claimed').length}
            </Typography>
            <Typography variant="body2">Claimed Items</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Items Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography>Loading items...</Typography>
        </Box>
      ) : filteredItems.length === 0 ? (
        <Alert severity="info">
          No {tabValue === 0 ? 'lost' : tabValue === 1 ? 'found' : ''} items to display.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredItems.map((item) => (
            <Grid item xs={12} md={6} key={item.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  {item.image && (
                    <Box 
                      sx={{ 
                        mb: 2, 
                        textAlign: 'center',
                        cursor: 'pointer'
                      }}
                      onClick={() => setImagePreview(item.image)}
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: 150, 
                          borderRadius: 8,
                          objectFit: 'cover'
                        }}
                      />
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h2">
                      {item.title}
                    </Typography>
                    <Chip
                      label={item.status}
                      color={getStatusColor(item.status)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {item.description}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      📍 Location: {item.location}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      📅 Date: {item.date}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      👤 Reported by: {item.reportedBy}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Chip label={item.category} variant="outlined" size="small" />
                    <Typography variant="body2" color="text.secondary">
                      {item.contact}
                    </Typography>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {user?.userType === 'Admin' && (
                      <>
                        <IconButton onClick={() => handleEdit(item)} size="small">
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(item.id)} size="small">
                          <Delete />
                        </IconButton>
                        {item.status === 'Lost' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleFoundItem(item.id)}
                          >
                            Mark as Found
                          </Button>
                        )}
                        {item.status !== 'Claimed' && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleStatusChange(item.id, 'Claimed')}
                          >
                            Mark as Claimed
                          </Button>
                        )}
                      </>
                    )}
                    
                    {user?.userType === 'Student' && (
                      <>
                        {item.status === 'Lost' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleFoundItem(item.id)}
                          >
                            Found This Item
                          </Button>
                        )}
                        {item.status === 'Found' && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleFoundItem(item.id)}
                            >
                              Found This Item
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              onClick={() => handleClaimItem(item.id)}
                            >
                              Claimed This Item
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Item' : user?.userType === 'Admin' ? 'Add Item' : 'Report Lost/Found Item'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Item Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
            label="Location Found/Lost"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            margin="normal"
            placeholder="Contact number for found items"
          />
          <TextField
            fullWidth
            select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            margin="normal"
            SelectProps={{ native: true }}
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </TextField>
          <Box sx={{ mt: 2 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="item-image-upload"
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    setFormData({ ...formData, image: e.target.result });
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            <label htmlFor="item-image-upload">
              <Button variant="outlined" component="span" fullWidth>
                Upload Item Photo
              </Button>
            </label>
            {formData.image && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <img
                  src={formData.image}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editMode ? 'Update' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog 
        open={!!imagePreview} 
        onClose={() => setImagePreview(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ textAlign: 'center', p: 2 }}>
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Full size preview"
              style={{ 
                maxWidth: '100%', 
                maxHeight: '80vh',
                objectFit: 'contain'
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImagePreview(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LostFound;