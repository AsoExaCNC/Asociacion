// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedEmpresa = localStorage.getItem('empresa');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedEmpresa && storedToken) {
      setUser(JSON.parse(storedUser));
      setEmpresa(JSON.parse(storedEmpresa));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const loginSession = (data) => {
    setToken(data.token);
    setUser(data.user);
    setEmpresa(data.empresa);

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('empresa', JSON.stringify(data.empresa));
  };

  const logoutSession = () => {
    setToken(null);
    setUser(null);
    setEmpresa(null);

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('empresa');
  };

  return (
    <AuthContext.Provider value={{ user, empresa, token, loading, loginSession, logoutSession }}>
      {children}
    </AuthContext.Provider>
  );
};