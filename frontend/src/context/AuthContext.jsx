import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Verify token with server on every app load ───────────────────────────
  const verifyToken = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }

    try {
      const { data } = await api.get('/auth/me');
      // Server confirmed token is valid — update user data in case it changed
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch {
      // Token invalid or expired — clean up silently
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { verifyToken(); }, [verifyToken]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('localFavs'); // clear guest favourites on logout too
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch {}
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      loading,
      refreshUser,
      isAdmin:        user?.role === 'admin',
      isLoggedIn:     !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);