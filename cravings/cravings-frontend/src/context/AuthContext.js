// src/context/AuthContext.js
import { createContext, useState, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/jwt/create/', { username, password });
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);
      
      // Get user data
      const userResponse = await api.get('/auth/users/me/');
      
      // Get user role from custom endpoint
      const roleResponse = await api.get('/api/user-role/');
      
      // Fetch full profile data
      const profileResponse = await api.get('/api/profile/');
      
      const userData = {
        ...userResponse.data,
        ...profileResponse.data, // Include profile data
        role: roleResponse.data.role
      };
      
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem('refresh');
      const response = await api.post('/auth/jwt/refresh/', { refresh });
      localStorage.setItem('token', response.data.access);
      return response.data.access;
    } catch (error) {
      logout();
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);