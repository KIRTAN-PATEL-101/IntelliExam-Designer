// lib/axios.ts
import axios from 'axios';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  withCredentials: true,
});

// Flag to prevent multiple redirects and track redirect timing
let isRedirecting = false;
let lastRedirectTime = 0;
const REDIRECT_COOLDOWN = 10000; // 10 seconds cooldown between redirects

// Custom event to communicate with React components
const redirectEvent = new CustomEvent('auth-redirect', { detail: { path: '/signin' } });

// Request interceptor to add Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    // Try to get token from localStorage
    const accessToken = localStorage.getItem('accessToken');
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log('🔑 Adding Authorization header to request:', config.url);
    } else {
      console.log('⚠️ No access token found for request:', config.url);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          console.log('🔄 Attempting token refresh...');
          
          const response = await axios.post('http://127.0.0.1:8000/api/auth/api/token/refresh/', {
            refresh: refreshToken
          });
          
          const newAccessToken = response.data.access;
          localStorage.setItem('accessToken', newAccessToken);
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
          
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
          // Only trigger redirect event if cooldown has passed
          const now = Date.now();
          if (!isRedirecting && (now - lastRedirectTime) > REDIRECT_COOLDOWN) {
            isRedirecting = true;
            lastRedirectTime = now;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            
            // Dispatch custom event instead of hard redirect
            setTimeout(() => {
              window.dispatchEvent(redirectEvent);
              isRedirecting = false;
            }, 1000);
          }
        }
      } else {
        // No refresh token, trigger redirect event if cooldown has passed
        const now = Date.now();
        if (!isRedirecting && (now - lastRedirectTime) > REDIRECT_COOLDOWN) {
          isRedirecting = true;
          lastRedirectTime = now;
          console.log('❌ No refresh token, triggering redirect');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          
          // Dispatch custom event instead of hard redirect
          setTimeout(() => {
            window.dispatchEvent(redirectEvent);
            isRedirecting = false;
          }, 1000);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;