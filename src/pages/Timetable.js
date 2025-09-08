import React, { useState, useEffect } from 'react';
import { timetableAPI } from '../services/api';
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
  Chip
} from '@mui/material';
import { Add, Edit, Delete, Schedule } from '@mui/icons-material';

const Timetable = ({ user }) => {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const response = await timetableAPI.getAll();
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    subject: '',
    time: '',
    room: '',
    faculty: '',
    day: ''
  });

  const handleAdd = () => {
    setEditMode(false);
    setFormData({ subject: '', time: '', room: '', faculty: '', day: '' });
    setOpen(true);
  };

  const handleEdit = (classItem) => {
    setEditMode(true);
    setSelectedClass(classItem);
    setFormData(classItem);
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editMode) {
        const response = await timetableAPI.update({ ...formData, id: selectedClass.id });
        setClasses(classes.map(c => c.id === selectedClass.id ? response.data : c));
      } else {
        const response = await timetableAPI.create(formData);
        setClasses([...classes, response.data]);
      }
      setOpen(false);
    } catch (error) {
      console.error('Error saving timetable:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await timetableAPI.delete(id);
      setClasses(classes.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting timetable:', error);
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            <Schedule sx={{ mr: 2, verticalAlign: 'middle' }} />
            Timetable Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {user?.userType === 'Admin' ? 'Manage class schedules and assignments' : 'View your class schedule'}
          </Typography>
        </Box>
        {user?.userType === 'Admin' && (
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
            Add Class
          </Button>
        )}
      </Box>

      {/* Weekly View */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography>Loading timetable...</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {days.map(day => (
            <Grid item xs={12} md={2.4} key={day}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    {day}
                  </Typography>
                  {classes.filter(c => c.day === day).map(classItem => (
                    <Box key={classItem.id} sx={{ mb: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {classItem.subject}
                      </Typography>
                      <Typography variant="caption" display="block">
                        {classItem.time}
                      </Typography>
                      <Typography variant="caption" display="block">
                        {classItem.room}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {classItem.faculty}
                      </Typography>
                      {user?.userType === 'Admin' && (
                        <Box sx={{ mt: 1 }}>
                          <IconButton size="small" onClick={() => handleEdit(classItem)}>
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDelete(classItem.id)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Table View */}
      {!loading && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            All Classes
          </Typography>
          {classes.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Typography>No classes scheduled. Add some classes to get started!</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Subject</TableCell>
                    <TableCell>Day</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Room</TableCell>
                    <TableCell>Faculty</TableCell>
                    {user?.userType === 'Admin' && <TableCell>Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {classes.map((classItem) => (
                    <TableRow key={classItem.id}>
                      <TableCell>{classItem.subject}</TableCell>
                      <TableCell>
                        <Chip label={classItem.day} size="small" />
                      </TableCell>
                      <TableCell>{classItem.time}</TableCell>
                      <TableCell>{classItem.room}</TableCell>
                      <TableCell>{classItem.faculty}</TableCell>
                      {user?.userType === 'Admin' && (
                        <TableCell>
                          <IconButton onClick={() => handleEdit(classItem)}>
                            <Edit />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(classItem.id)}>
                            <Delete />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Class' : 'Add New Class'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Room"
            value={formData.room}
            onChange={(e) => setFormData({ ...formData, room: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Faculty"
            value={formData.faculty}
            onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            select
            label="Day"
            value={formData.day}
            onChange={(e) => setFormData({ ...formData, day: e.target.value })}
            margin="normal"
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            {days.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Timetable;