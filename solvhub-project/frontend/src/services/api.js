import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Helper to get full image URL
export const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${BASE_URL}${path}`;
};

// Add token to requests if available
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

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
    updatePassword: (data) => api.put('/auth/password', data)
};

// Technician APIs
export const technicianAPI = {
    getAll: (params) => api.get('/technicians', { params }),
    getById: (id) => api.get(`/technicians/${id}`),
    create: (data) => api.post('/technicians', data),
    update: (id, data) => api.put(`/technicians/${id}`, data),
    getMyProfile: () => api.get('/technicians/me/profile'),
    updateAvailability: (data) => api.put('/technicians/availability/status', data),
    uploadPhoto: (formData) => api.post('/technicians/me/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
};

// Booking APIs
export const bookingAPI = {
    create: (data) => api.post('/bookings', data),
    getCustomerBookings: (params) => api.get('/bookings/customer', { params }),
    getTechnicianBookings: (params) => api.get('/bookings/technician', { params }),
    getById: (id) => api.get(`/bookings/${id}`),
    updateStatus: (id, data) => api.put(`/bookings/${id}/status`, data),
    cancel: (id, data) => api.put(`/bookings/${id}/cancel`, data),
    getAvailableSlots: (technicianId, date) => api.get(`/bookings/availability/${technicianId}`, { params: { date } })
};

export const reviewAPI = {
    create: (data) => api.post('/reviews', data),
    getTechnicianReviews: (technicianId, params) => api.get(`/reviews/${technicianId}`, { params }),
    getMyReviews: () => api.get('/reviews/customer/my-reviews'),
    update: (id, data) => api.put(`/reviews/${id}`, data),
    delete: (id) => api.delete(`/reviews/${id}`)
};

export default api;
