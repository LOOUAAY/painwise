import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const initialized = useRef(false);

  // Check for existing session on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.role) {
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  // This login function now sets the user data rather than making an API call
  // The API call is handled by Login.jsx via api.login() and api.loginDoctor()
  const login = (role, userData) => {
    try {
      // Store user data with the role
      const user = { ...userData, role };
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Error setting user authentication:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};