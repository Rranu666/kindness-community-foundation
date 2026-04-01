import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('kl_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, only redirect to login if there was an active session token.
// Guest users (no token) get a silent rejection — no redirect.
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const hadToken = !!localStorage.getItem('kl_token');
      localStorage.removeItem('kl_token');
      if (hadToken) {
        window.location.href = '/kindlearn/login';
      }
    }
    return Promise.reject(err);
  }
);

export default client;
