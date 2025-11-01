// src/context/AuthContext.tsx
import React, { createContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";
import axiosInstance from '@/lib/axios';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Check auth status on first load only
  useEffect(() => {
    // Prevent multiple auth checks
    if (hasCheckedAuth) return;
    
    const checkAuth = async () => {
      try {
        const res = await axiosInstance.get("/auth/auth-check/");
        setIsAuthenticated(true);
        setUser(res.data);
        console.log('✅ Auth check successful:', res.data);
      } catch (error: any) {
        console.log('❌ Auth check failed:', error.response?.status);
        setIsAuthenticated(false);
        setUser(null);
        
        // Clear any invalid tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // DO NOT redirect here - let the components handle their own navigation
      } finally {
        setLoading(false);
        setHasCheckedAuth(true);
      }
    };

    checkAuth();
  }, [hasCheckedAuth]);

  // Login function
  const login = async (email: string, password: string) => {
    const res = await axios.post(
      "http://127.0.0.1:8000/api/auth/login/",
      { email, password },
      { withCredentials: true }
    );

    // Save tokens in localStorage if they exist (backup, cookies already set by backend)
    if (res.data.access) localStorage.setItem("accessToken", res.data.access);
    if (res.data.refresh) localStorage.setItem("refreshToken", res.data.refresh);
    
    console.log('Tokens in response:', {
      access: res.data.access ? 'present' : 'missing',
      refresh: res.data.refresh ? 'present' : 'missing'
    });

    // Update auth state instantly
    setIsAuthenticated(true);
    setUser(res.data.user || { email }); // backend now returns user info
    
    console.log('Login successful, user:', res.data.user); // Debug log
    return res.data.user; // Return user info for immediate use
  };

  // Logout function
 const logout = async () => {
  try {
    await axios.post(
      "http://127.0.0.1:8000/api/auth/logout/",
      {},
      { withCredentials: true }
    );
  } catch (err) {
    console.error("Logout error:", err);
  } finally {
    // Always clear local state, even if backend call fails
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
    setUser(null);
  }
};

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
