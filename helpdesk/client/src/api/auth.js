import axios from 'axios';
import { getAuth } from '../utils/auth';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const { token } = getAuth();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;