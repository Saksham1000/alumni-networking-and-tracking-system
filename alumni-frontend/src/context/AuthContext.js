import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

/**
 * Authentication Context
 * Manages user authentication state and unread messages count
 * Provides user data and authentication status to all components
 */
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Authentication state
  const [user, setUser] = useState(null);              // Current user data
  const [loading, setLoading] = useState(true);        // Loading state during auth check
  const [unreadMessages, setUnreadMessages] = useState(0); // Unread messages count

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access');
      if (!token) {
        setUser(null);
        setLoading(false);
        setUnreadMessages(0);
        return;
      }
      try {
        const res = await api.get('/users/profile/');
        setUser(res.data);
        // Fetch unread messages count
        const unreadRes = await api.get('/users/messages/unread-count/');
        setUnreadMessages(unreadRes.data.unread_count || 0);
      } catch {
        setUser(null);
        setUnreadMessages(0);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const login = async (username, password) => {
    try {
      const res = await api.post('/users/login/', { username, password });
      localStorage.setItem('access', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);
      // After login, fetch the user's profile
      const profileRes = await api.get('/users/profile/');
      setUser(profileRes.data);
      // Fetch unread messages count
      const unreadRes = await api.get('/users/messages/unread-count/');
      setUnreadMessages(unreadRes.data.unread_count || 0);
    } catch (err) {
      // Re-throw the error to be caught by the login page
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
    setUnreadMessages(0);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading, unreadMessages, setUnreadMessages }}>
      {children}
    </AuthContext.Provider>
  );
} 