import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      // Avoid full page reloads; let app-level logic handle navigation
      // Optionally emit an event to let the app react (e.g., logout, route change)
      try {
        const logoutEvent = new CustomEvent('auth:unauthorized');
        window.dispatchEvent(logoutEvent);
      } catch (_) {
        // no-op: CustomEvent may not be supported in some environments
      }
    }
    return Promise.reject(error);
  }
);

export default api;
