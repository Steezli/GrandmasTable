import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      return Promise.reject(data.error || { code: 'API_ERROR', message: 'An error occurred' });
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({ code: 'NETWORK_ERROR', message: 'Network error. Please check your connection.' });
    } else {
      // Something else happened
      return Promise.reject({ code: 'UNKNOWN_ERROR', message: 'An unexpected error occurred' });
    }
  }
);

export default api;

