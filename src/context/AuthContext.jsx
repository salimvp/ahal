import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      try {
        const currentUser = await api.verifyToken();
        setUser(currentUser);
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkUser();
  }, []);

  const login = async (username, password) => {
    const res = await api.login(username, password);
    localStorage.setItem('ssmo_admin_token', res.token);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('ssmo_admin_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
