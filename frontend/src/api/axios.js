import axios from 'axios';

// When running on Render, API is on same origin ('').
// When running on Vercel or other domain without custom VITE_API_URL, default to Render backend.
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host.includes('onrender.com')) {
      return '';
    }
  }
  return 'https://glaucoma-vit-main1.onrender.com';
};

const api = axios.create({
  baseURL: getBaseUrl(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
