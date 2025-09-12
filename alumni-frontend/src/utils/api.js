import axios from 'axios';

/**
 * API Configuration
 * Centralized axios instance for all API calls
 * Includes authentication interceptors and error handling
 */
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - adds authentication token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handles authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Allow login/register calls to surface backend error messages (e.g., not approved)
      const requestUrl = error.config?.url || '';
      const isAuthAttempt = requestUrl.includes('/users/login/') || requestUrl.includes('/users/register/');
      if (!isAuthAttempt) {
        // Clear tokens and redirect to login on unauthorized access for other requests
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// User & Auth
export const register = (data) => api.post('/users/register/', data);
export const login = (data) => api.post('/users/login/', data);
export const getProfile = () => api.get('/users/profile/');
export const updateProfile = (data) => api.put('/users/profile/', data);
export const getPublicProfile = (id) => api.get(`/users/profile/${id}/`);
export const resetPassword = (data) => api.post('/users/password-reset/', data);
export const confirmResetPassword = (data) => api.post('/users/password-reset/confirm/', data);

// Posts
export const getFeed = () => api.get('/users/feed/');
export const getPosts = (userId) => api.get(`/users/posts/user/${userId}/`);
export const createPost = (data) => api.post('/users/posts/', data);
export const likePost = (postId) => api.post(`/users/posts/${postId}/like/`);
export const addPostComment = (postId, content) => api.post(`/users/posts/${postId}/comments/`, { content });
export const getPostComments = (postId) => api.get(`/users/posts/${postId}/comments/`);
export const deletePostComment = (commentId) => api.delete(`/users/comments/${commentId}/`);
export const likeComment = (commentId) => api.post(`/users/comments/${commentId}/like/`);
export const unlikeComment = (commentId) => api.delete(`/users/comments/${commentId}/like/`);
export const getCommentLikeStatus = (commentId) => api.get(`/users/comments/${commentId}/like/`);

// Notifications
export const getNotifications = () => api.get('/users/notifications/');
export const markNotificationRead = (id) => api.post(`/users/notifications/${id}/read/`);
export const markAllNotificationsRead = () => api.post('/users/notifications/read-all/');

// Endorsements & Recommendations
export const endorseSkill = (userId, skill) => api.post(`/users/${userId}/endorse/`, { skill });
export const unendorseSkill = (userId, skill) => api.delete(`/users/${userId}/endorse/`, { data: { skill } });
export const getEndorsements = (userId) => api.get(`/users/${userId}/endorsements/`);
export const addRecommendation = (userId, text) => api.post(`/users/${userId}/recommend/`, { text });
export const getRecommendations = (userId) => api.get(`/users/${userId}/recommendations/`);

// Connections
export const getConnections = () => api.get('/users/connections/');
export const sendConnectionRequest = (to_user_id) => api.post('/users/connections/', { to_user_id });
export const acceptConnection = (id) => api.post(`/users/connections/${id}/accept/`);
export const rejectConnection = (id) => api.post(`/users/connections/${id}/reject/`);
export const removeConnection = (id) => api.delete(`/users/connections/${id}/`);
export const getMyConnections = () => api.get('/users/my-connections/');

// Messaging
export const getMessagesWith = (userId) => api.get(`/users/messages/with/${userId}/`);
export const sendMessage = (data) => api.post('/users/messages/', data);

// Jobs
export const getJobs = () => api.get('/jobs/');
export const getJob = (id) => api.get(`/jobs/${id}/`);
export const likeJobPost = (jobId) => api.post(`/jobs/${jobId}/like/`);

// Events
export const getEvents = () => api.get('/events/');
export const getEvent = (id) => api.get(`/events/${id}/`);

// Search
export const searchAlumni = (query) => api.get(`/users/search/?q=${encodeURIComponent(query)}`);
export const globalSearch = (query) => api.get(`/users/search/?q=${encodeURIComponent(query)}`); 