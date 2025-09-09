// src/context/AuthContext.tsx
import React, { createContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
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

  // Check auth status on first load
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/auth/auth-check/", {
        withCredentials: true,
      })
      .then((res) => {
        setIsAuthenticated(true);
        setUser(res.data);
      })
      .catch(() => {
        setIsAuthenticated(false);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    const res = await axios.post(
      "http://127.0.0.1:8000/api/auth/login/",
      { email, password },
      { withCredentials: true }
    );

    // Save tokens in localStorage (backup, cookies already set by backend)
    localStorage.setItem("accessToken", res.data.access);
    localStorage.setItem("refreshToken", res.data.refresh);

    // Update auth state instantly
    setIsAuthenticated(true);
    setUser(res.data.user || { email }); // backend should return user info
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
