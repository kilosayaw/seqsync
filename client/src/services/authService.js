// SEGSYNC/client/src/services/authService.js
import apiClient from './apiClient';
import { toast } from 'react-toastify';

const register = async (email, password, username) => {
  try {
    const payload = { email, password };
    if (username) payload.username = username;
    const response = await apiClient.post('/auth/register', payload);
    if (response.data && response.data.token) { // Assuming token is returned on register for auto-login
      localStorage.setItem('seqsync_token', response.data.token);
      toast.success(`Welcome, ${response.data.user?.username || response.data.user?.email}! Registration successful.`);
    } else {
      toast.success(response.data?.message || "Registration successful! Please log in.");
    }
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Registration failed.';
    toast.error(errorMsg);
    throw error.response?.data || new Error(errorMsg);
  }
};

const login = async (email, password) => {
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.data && response.data.token) {
      localStorage.setItem('seqsync_token', response.data.token);
      toast.success(`Welcome back, ${response.data.user?.username || response.data.user?.email}!`);
    }
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Login failed.';
    toast.error(errorMsg);
    throw error.response?.data || new Error(errorMsg);
  }
};

const logout = () => {
  localStorage.removeItem('seqsync_token');
  toast.info("You have been logged out.");
  // No API call needed for JWT logout unless invalidating server-side refresh tokens
};

const getProfile = async () => {
  try {
    const response = await apiClient.get('/auth/profile');
    return response.data.data.user; // Assuming backend returns { status, data: { user }}
  } catch (error) {
    // Error already logged by apiClient interceptor if 401
    if (error.response?.status !== 401) {
         toast.error(error.response?.data?.message || error.message || "Failed to fetch profile.");
    }
    throw error.response?.data || error;
  }
};

const authService = { register, login, logout, getProfile };
export default authService;