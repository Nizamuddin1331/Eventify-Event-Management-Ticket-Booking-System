import axios from 'axios';
import toast from 'react-hot-toast';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response error handling
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message || 'Something went wrong';
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on auth pages
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/updateprofile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword: (data) => API.put('/auth/changepassword', data),
  toggleWishlist: (eventId) => API.post(`/auth/wishlist/${eventId}`),
};

// ─── Events ───────────────────────────────────────────────────────────────────
export const eventsAPI = {
  getAll: (params) => API.get('/events', { params }),
  getOne: (id) => API.get(`/events/${id}`),
  create: (data) => API.post('/events', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => API.put(`/events/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => API.delete(`/events/${id}`),
  getAnalytics: (id) => API.get(`/events/${id}/analytics`),
};

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const bookingsAPI = {
  create: (data) => API.post('/bookings', data),
  getMyBookings: (params) => API.get('/bookings/mybookings', { params }),
  getOne: (id) => API.get(`/bookings/${id}`),
  pay: (id, data) => API.post(`/bookings/${id}/pay`, data),
  cancel: (id, reason) => API.put(`/bookings/${id}/cancel`, { reason }),
  downloadTicket: (id) => API.get(`/bookings/${id}/ticket`, { responseType: 'blob' }),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => API.get('/admin/dashboard'),
  getUsers: (params) => API.get('/admin/users', { params }),
  updateUser: (id, data) => API.put(`/admin/users/${id}`, data),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  getAllBookings: (params) => API.get('/admin/bookings', { params }),
  toggleFeature: (id) => API.put(`/admin/events/${id}/feature`),
};

// ─── Organizer ────────────────────────────────────────────────────────────────
export const organizerAPI = {
  getDashboard: () => API.get('/organizer/dashboard'),
  getMyEvents: (params) => API.get('/organizer/events', { params }),
  getEventBookings: (id) => API.get(`/organizer/events/${id}/bookings`),
};

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviewsAPI = {
  getForEvent: (eventId) => API.get(`/reviews/event/${eventId}`),
  create: (eventId, data) => API.post(`/reviews/event/${eventId}`, data),
  update: (id, data) => API.put(`/reviews/${id}`, data),
  delete: (id) => API.delete(`/reviews/${id}`),
};

export default API;
