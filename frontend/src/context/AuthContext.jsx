import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      // In a real app, you might want to fetch user details here using the token
      setUser({ name: 'User' }); // Mock user for now since no /me endpoint provided
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const token = response.data.access_token || response.data.token;
    if (token) {
      setToken(token);
      setUser(response.data.user || { name: email.split('@')[0], email });
    }
    return response.data;
  };

  const register = async (name, email, password, confirm_password) => {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
      confirm_password: confirm_password || password
    });
    return response.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
