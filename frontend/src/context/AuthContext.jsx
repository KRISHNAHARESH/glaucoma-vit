import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        localStorage.setItem('token', token);
        try {
          const res = await api.get('/auth/me');
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        } catch {
          const saved = localStorage.getItem('user');
          if (saved) {
            try { setUser(JSON.parse(saved)); } catch {}
          }
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const token = response.data.access_token || response.data.token;
    if (token) {
      setToken(token);
      localStorage.setItem('token', token);
      const rawName = email.split('@')[0];
      const fallbackName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      const userData = response.data.user || { name: fallbackName, email };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
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
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
