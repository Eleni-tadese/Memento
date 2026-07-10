import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('memento_token') || null);
  const [relationshipId, setRelationshipId] = useState(() => localStorage.getItem('memento_relationship_id') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('memento_user');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  });

  const navigate = useNavigate();

  const isAuthenticated = !!token;

  const login = (newToken, newUser, newRelationshipId) => {
    localStorage.setItem('memento_token', newToken);
    localStorage.setItem('memento_user', JSON.stringify(newUser));
    localStorage.setItem('memento_relationship_id', newRelationshipId);

    setToken(newToken);
    setUser(newUser);
    setRelationshipId(newRelationshipId);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    localStorage.setItem('memento_user', JSON.stringify(updated));
    setUser(updated);
  };

  const logout = () => {
    localStorage.removeItem('memento_token');
    localStorage.removeItem('memento_user');
    localStorage.removeItem('memento_relationship_id');

    setToken(null);
    setUser(null);
    setRelationshipId(null);

    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, relationshipId, isAuthenticated, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
