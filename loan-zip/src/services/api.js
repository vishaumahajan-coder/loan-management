import axios from 'axios';

// Base API Configuration
// const API_BASE_URL = 'http://localhost:5000/api';
// const API_BASE_URL = 'https://lendanet-loan-production.up.railway.app/api';
const API_BASE_URL = 'https://lendent-loan-backend-production.up.railway.app/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Interceptor to add JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('lendanet_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor to handle unauthorized errors (e.g. expired token)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('lendanet_token');
            // Optional: window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
export { API_BASE_URL };
