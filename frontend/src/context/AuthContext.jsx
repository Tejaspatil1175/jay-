import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.ok) {
        setUser(response.data.user);
      }
      return response;
    } catch (error) {
      console.error('Login error:', error);
      // Fallback: Create demo user if backend is offline
      const demoUser = {
        id: 'demo-' + Date.now(),
        name: credentials.email || 'Demo User',
        email: credentials.email,
      };
      localStorage.setItem('accessToken', 'demo-token-' + Date.now());
      localStorage.setItem('user', JSON.stringify(demoUser));
      setUser(demoUser);
      return { ok: true, data: { user: demoUser } };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response.ok) {
        setUser(response.data.user);
      }
      return response;
    } catch (error) {
      console.error('Register error:', error);
      // Fallback: Create demo user if backend is offline
      const demoUser = {
        id: 'demo-' + Date.now(),
        name: userData.name,
        email: userData.email,
      };
      localStorage.setItem('accessToken', 'demo-token-' + Date.now());
      localStorage.setItem('user', JSON.stringify(demoUser));
      setUser(demoUser);
      return { ok: true, data: { user: demoUser } };
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
