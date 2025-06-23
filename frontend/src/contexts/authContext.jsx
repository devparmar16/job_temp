import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = `${import.meta.env.VITE_API_URL}/api/v1/user`;

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/me`, { withCredentials: true });
        setUser(data.user);
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email, password, role) => {
    try {
      const { data } = await axios.post(`${API_URL}/login`, { email, password, role }, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      });
      setIsAuthenticated(true);
      setUser(data.user);
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (name, email, phone, password, role) => {
    try {
      const { data } = await axios.post(`${API_URL}/register`, { name, email, phone, password, role }, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      });
      setIsAuthenticated(true);
      setUser(data.user);
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const updateProfile = async (updateData) => {
    try {
      const { data } = await axios.put(`${API_URL}/profile/update`, updateData, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      });
      setUser(data.user);
      toast.success(data.message);
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
      return { success: false };
    }
  };

  const updateProfilePicture = async (formData) => {
    try {
      const { data } = await axios.put(`${API_URL}/profile/picture/update`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(data.user);
      toast.success(data.message);
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile picture');
      return { success: false };
    }
  };

  const removeProfilePicture = async () => {
    try {
      const { data } = await axios.delete(`${API_URL}/profile/picture/remove`, {
        withCredentials: true,
      });
      setUser(data.user);
      toast.success(data.message);
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove profile picture');
      return { success: false };
    }
  };

  const logout = async () => {
    try {
      await axios.get(`${API_URL}/logout`, { withCredentials: true });
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, setUser, login, register, logout, loading, updateProfile, updateProfilePicture, removeProfilePicture }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
}; 