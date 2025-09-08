import React, { useState, useEffect } from 'react';
import { cafeteriaAPI } from '../services/api';
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
  Rating,
  Chip,
  IconButton,
  CardMedia
} from '@mui/material';
import { Add, Edit, Delete, Restaurant, Star, ListAlt, Feedback } from '@mui/icons-material';

const Cafeteria = ({ user }) => {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedFeedbackItem, setSelectedFeedbackItem] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orders, setOrders] = useState([]);
  const [feedbackData, setFeedbackData] = useState({ rating: 0, comment: '' });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenuItems();
    if (user?.userType === 'Admin') {
      fetchOrders();
      // Refresh orders every 30 seconds for admin
      const interval = setInterval(fetchOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.userType]);

  const fetchOrders = async () => {
    try {
      console.log('Fetching orders from API...');
      const response = await cafeteriaAPI.getOrders();
      console.log('Orders fetched:', response.data);
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
  };

  const refreshOrders = async () => {
    if (user?.userType === 'Admin') {
      console.log('Refreshing orders...');
      await fetchOrders();
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await cafeteriaAPI.getMenuItems();
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMenuItems = selectedCategory 
    ? menuItems.filter(item => item.category === selectedCategory)
    : menuItems;

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    available: true,
    image: null
  });

  const categories = ['Main Course', 'Salads', 'Beverages', 'Desserts', 'Snacks'];

  const handleAdd = () => {
    setEditMode(false);
    setFormData({ name: '', price: '', category: '', description: '', available: true, image: null });
    setOpen(true);
  };

  const handleEdit = (item) => {
    setEditMode(true);
    setSelectedItem(item);
    setFormData(item);
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editMode) {
        const response = await cafeteriaAPI.updateMenuItem({ ...formData, id: selectedItem.id });
        setMenuItems(menuItems.map(item => item.id === selectedItem.id ? response.data : item));
      } else {
        const response = await cafeteriaAPI.createMenuItem(formData);
        setMenuItems([...menuItems, response.data]);
      }
      setOpen(false);
    } catch (error) {
      console.error('Error saving menu item:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await cafeteriaAPI.deleteMenuItem(id);
      setMenuItems(menuItems.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting menu item:', error);
    }
  };

  const toggleAvailability = async (id) => {
    try {
      const item = menuItems.find(item => item.id === id);
      const response = await cafeteriaAPI.updateMenuItem({ ...item, available: !item.available });
      setMenuItems(menuItems.map(item => item.id === id ? response.data : item));
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const handleOrder = async (item) => {
    try {
      const orderData = {
        itemId: item.id,
        itemName: item.name,
        price: item.price,
        customerName: user?.name || 'Anonymous'
      };
      
      console.log('Placing order:', orderData);
      const response = await cafeteriaAPI.createOrder(orderData);
      console.log('Order response:', response);
      
      // Update local orders state
      setOrders(prevOrders => [...prevOrders, response.data]);
      setOrderSuccess(true);
      setTimeout(() => setOrderSuccess(false), 3000);
      
      // Refresh orders for admin view
      if (user?.userType === 'Admin') {
        await fetchOrders();
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  const handleFeedback = (item) => {
    setSelectedFeedbackItem(item);
    setFeedbackData({ rating: 0, comment: '' });
    setFeedbackOpen(true);
  };

  const submitFeedback = async () => {
    try {
      await cafeteriaAPI.submitFeedback({
        itemId: selectedFeedbackItem.id,
        rating: feedbackData.rating,
        comment: feedbackData.comment,
        userName: user?.name
      });
      
      // Refresh menu items to get updated ratings from backend
      await fetchMenuItems();
      
      setFeedbackOpen(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            <Restaurant sx={{ mr: 2, verticalAlign: 'middle' }} />
            Cafeteria Menu
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {user?.userType === 'Admin' ? 'Manage menu items and pricing' : 'Browse available food items'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {user?.userType === 'Admin' && (
            <>
              <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
                Add Menu Item
              </Button>
              <Button variant="outlined" startIcon={<ListAlt />} onClick={() => { refreshOrders(); setOrdersOpen(true); }}>
                View Orders ({orders.length})
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Category Filters */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>Categories</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label="All"
            variant={selectedCategory === '' ? 'filled' : 'outlined'}
            clickable
            onClick={() => setSelectedCategory('')}
            sx={{ mb: 1 }}
          />
          {categories.map(category => (
            <Chip
              key={category}
              label={category}
              variant={selectedCategory === category ? 'filled' : 'outlined'}
              clickable
              onClick={() => setSelectedCategory(category)}
              sx={{ mb: 1 }}
            />
          ))}
        </Box>
      </Box>

      {/* Menu Items Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography>Loading menu items...</Typography>
        </Box>
      ) : filteredMenuItems.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography>No menu items found. Add some items to get started!</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredMenuItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="div"
                sx={{
                  height: 140,
                  bgcolor: 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundImage: item.image ? `url(${item.image})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {!item.image && <Restaurant sx={{ fontSize: 60, color: 'grey.400' }} />}
              </CardMedia>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" component="h2">
                    {item.name}
                  </Typography>
                  <Chip
                    label={item.available ? 'Available' : 'Out of Stock'}
                    color={item.available ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {item.description}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="primary">
                    ₹{item.price}
                  </Typography>
                  <Chip label={item.category} variant="outlined" size="small" />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Rating value={item.rating} readOnly size="small" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    ({item.rating})
                  </Typography>
                </Box>

                {user?.userType === 'Admin' ? (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton onClick={() => handleEdit(item)} size="small">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(item.id)} size="small">
                      <Delete />
                    </IconButton>
                    <Button
                      size="small"
                      onClick={() => toggleAvailability(item.id)}
                      color={item.available ? 'error' : 'success'}
                    >
                      {item.available ? 'Mark Unavailable' : 'Mark Available'}
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
                    {item.available && (
                      <Button
                        variant="contained"
                        size="medium"
                        fullWidth
                        onClick={() => handleOrder(item)}
                        sx={{ py: 1 }}
                      >
                        Order Now
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      size="medium"
                      fullWidth
                      startIcon={<Feedback />}
                      onClick={() => handleFeedback(item)}
                      sx={{ py: 1 }}
                    >
                      Feedback
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          ))}
        </Grid>
      )}

      {/* Statistics for Admin */}
      {user?.userType === 'Admin' && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom>Menu Statistics</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" color="primary">
                  {menuItems.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Items
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" color="success.main">
                  {menuItems.filter(item => item.available).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Available Items
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" color="warning.main">
                  {categories.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Categories
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" color="info.main">
                  {(menuItems.reduce((sum, item) => sum + item.rating, 0) / menuItems.length).toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Rating
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Item Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Price (₹)"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
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
          <Box sx={{ mt: 2 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="image-upload"
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
            <label htmlFor="image-upload">
              <Button variant="outlined" component="span" fullWidth>
                Upload Food Photo
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
            {editMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Orders Dialog */}
      <Dialog open={ordersOpen} onClose={() => setOrdersOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Today's Orders ({orders.length})
            <Button onClick={refreshOrders} size="small" variant="outlined">
              Refresh
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {orders.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">No orders placed today</Typography>
              <Typography variant="body2" color="text.secondary">Orders will appear here when customers place them</Typography>
            </Box>
          ) : (
            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
              {orders.map((order, index) => (
                <Card key={order.id || index} sx={{ mb: 2, p: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={8}>
                      <Typography variant="h6" color="primary">{order.itemName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Customer: {order.customerName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="h6" color="success.main">₹{order.price}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(order.orderTime || order.createdAt).toLocaleTimeString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrdersOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Rate & Review</DialogTitle>
        <DialogContent>
          {selectedFeedbackItem && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedFeedbackItem.name}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography component="legend">Rating</Typography>
                <Rating
                  value={feedbackData.rating}
                  onChange={(event, newValue) => {
                    setFeedbackData({ ...feedbackData, rating: newValue });
                  }}
                />
              </Box>
              <TextField
                fullWidth
                label="Your Review"
                multiline
                rows={3}
                value={feedbackData.comment}
                onChange={(e) => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                margin="normal"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackOpen(false)}>Cancel</Button>
          <Button onClick={submitFeedback} variant="contained">
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      {orderSuccess && (
        <Box
          sx={{
            position: 'fixed',
            top: 80,
            right: 20,
            bgcolor: 'success.main',
            color: 'white',
            p: 2,
            borderRadius: 1,
            zIndex: 1300,
            boxShadow: 3
          }}
        >
          🎉 Woohoo! Your order has been successfully placed!
        </Box>
      )}
    </Container>
  );
};

export default Cafeteria;