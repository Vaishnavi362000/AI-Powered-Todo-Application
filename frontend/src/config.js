// todo/frontend/src/config.js

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000',
  withCredentials: true,
});

// Add request interceptor to handle FormData properly
api.interceptors.request.use(config => {
  if (config.data instanceof FormData) {
    // Let the browser set the Content-Type for FormData
    delete config.headers['Content-Type'];
  } else {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

export default api;