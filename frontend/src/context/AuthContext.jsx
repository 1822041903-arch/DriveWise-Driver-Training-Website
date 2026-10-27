import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem('drivewise_token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me').then((response) => setUser(response.data.user)).catch(() => {
      localStorage.removeItem('drivewise_token');
    }).finally(() => setLoading(false));
  }, []);
  const value = useMemo(() => ({
    user,
    loading,
    async login(credentials) {
      const { data } = await api.post('/auth/login', credentials);
      localStorage.setItem('drivewise_token', data.token);
      setUser(data.user);
      return data.user;
    },
    async register(details) {
      const { data } = await api.post('/auth/register', details);
      localStorage.setItem('drivewise_token', data.token);
      setUser(data.user);
      return data.user;
    },
    logout() { localStorage.removeItem('drivewise_token'); setUser(null); }
  }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth phải nằm trong AuthProvider');
  return value;
}
