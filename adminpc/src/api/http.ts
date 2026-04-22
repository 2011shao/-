import axios from 'axios';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  timeout: 10000,
});

http.interceptors.request.use((config) => {
  config.headers['x-user-id'] = localStorage.getItem('x-user-id') || 'u_demo_hq';
  config.headers['x-user-role'] = localStorage.getItem('x-user-role') || 'HQ';
  config.headers['x-user-store-id'] = localStorage.getItem('x-user-store-id') || 'store_demo';
  return config;
});

http.interceptors.response.use(
  (resp) => resp,
  (error) => Promise.reject(error),
);
