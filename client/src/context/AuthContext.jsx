import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('speakwise_token'));
  const [loading, setLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem('speakwise_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${savedToken}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
            setToken(savedToken);
          } else {
            logout();
          }
        } else {
          logout();
        }
      } catch (err) {
        console.error('Session verification error:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      localStorage.setItem('speakwise_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true, user: data.user };
    } else {
      return { success: false, message: data.message || 'Login failed' };
    }
  };

  const register = async (name, email, password, confirmPassword) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, confirmPassword })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      localStorage.setItem('speakwise_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true, user: data.user };
    } else {
      return { success: false, message: data.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('speakwise_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedFields) => {
    setUser(prev => prev ? { ...prev, ...updatedFields } : null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
