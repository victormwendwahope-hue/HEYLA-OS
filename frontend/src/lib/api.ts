import axios from 'axios';

const api = axios.create({
baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api/v1' : 'https://heyla-os-backend.onrender.com/api/v1'),
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('heyla_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('heyla_token');
      localStorage.removeItem('heyla_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

