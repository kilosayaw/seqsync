// src/services/apiClient.js
import axios from 'axios';
import { supabase } from './supabaseClient'; // Import supabase client

const apiClient = axios.create({ /* ... */ });

apiClient.interceptors.request.use(
  async (config) => { // Make interceptor async
    const { data: { session } } = await supabase.auth.getSession(); // Get current Supabase session
    const token = session?.access_token; // Supabase JWT

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.request.use(
  (config) => {
    // This assumes your custom backend uses JWTs stored under 'seqsync_token'
    // If your custom backend relies on Supabase sessions directly (less common for custom Express),
    // you might need to get the Supabase session token here.
    // For now, assuming a separate JWT for the custom backend if applicable.
    const token = localStorage.getItem('seqsync_token'); // Token for YOUR custom backend
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('[apiClient] Custom API returned Unauthorized (401).');
      // If this token is DIFFERENT from Supabase token, handle its removal/logout distinctly.
      // localStorage.removeItem('seqsync_token'); // Example
      // Potentially trigger a specific logout action for the custom backend session.
    }
    return Promise.reject(error);
  }
);

export default apiClient;