import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://4jifheiwy3.execute-api.us-west-2.amazonaws.com/prod';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth', credentials),
  logout: () => {
    localStorage.removeItem('authToken');
    return Promise.resolve();
  },
  healthCheck: () => api.get('/auth/health'),
};

// Timetable API
export const timetableAPI = {
  getAll: () => api.get('/timetable'),
  create: (data) => api.post('/timetable', data),
  update: (data) => api.put('/timetable', data),
  delete: (id) => api.delete(`/timetable?id=${id}`),
  healthCheck: () => api.get('/timetable/health'),
};

// Cafeteria API
export const cafeteriaAPI = {
  getMenuItems: () => api.get('/cafeteria'),
  createMenuItem: (data) => api.post('/cafeteria', data),
  updateMenuItem: (data) => api.put('/cafeteria', data),
  deleteMenuItem: (id) => api.delete(`/cafeteria?id=${id}`),
  submitFeedback: (data) => api.post('/cafeteria/feedback', data),
  getFeedback: (itemId) => api.get(`/cafeteria/feedback?itemId=${itemId}`),
  createOrder: (data) => api.post('/cafeteria/orders', data),
  getOrders: () => api.get('/cafeteria/orders'),
  healthCheck: () => api.get('/cafeteria/health'),
};

// Events API
export const eventsAPI = {
  getAll: () => api.get('/events'),
  create: (data) => api.post('/events', data),
  update: (data) => api.put('/events', data),
  delete: (id) => api.delete(`/events?id=${id}`),
  healthCheck: () => api.get('/events/health'),
};

// Lost & Found API
export const lostFoundAPI = {
  getAll: () => api.get('/lostfound'),
  create: (data) => api.post('/lostfound', data),
  update: (data) => api.put('/lostfound', data),
  delete: (id) => api.delete(`/lostfound?id=${id}`),
  healthCheck: () => api.get('/lostfound/health'),
};

// Academic Query API
export const academicQueryAPI = {
  getAll: () => api.get('/academic-query'),
  create: (data) => api.post('/academic-query', data),
  update: (data) => api.put('/academic-query', data),
  delete: (id) => api.delete(`/academic-query?id=${id}`),
  healthCheck: () => api.get('/academic-query/health'),
};

// User Management API
export const userManagementAPI = {
  getAll: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  update: (data) => api.put('/users', data),
  delete: (userId) => api.delete(`/users?userId=${userId}`),
  healthCheck: () => api.get('/users/health'),
};

// Utility functions
export const uploadImageToS3 = async (file, folder = 'general') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.url;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};

export default api;