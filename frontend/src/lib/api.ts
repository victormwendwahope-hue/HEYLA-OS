import axios from 'axios';

const api = axios.create({
baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api/v1' : 'https://heyla-os-backend.onrender.com/api/v1/'),
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  console.log('[API DEBUG] Full URL:', config.baseURL + config.url);
  console.log('[API DEBUG] Method:', config.method, 'Path:', config.url);
  const token = localStorage.getItem('heyla_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for errors - NO auto-logout
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    // Retry Render cold start 502s
    if (error.response?.status === 502 && !config._retry) {
      config._retry = true;
      console.log('[API] Retrying 502 cold start...');
      return api(config);
    }
    // Log but don't logout on 401 - handle in stores
    console.error('[API ERROR]', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export default api;

