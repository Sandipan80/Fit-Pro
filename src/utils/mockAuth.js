/**
 * Mock authentication utilities for testing without a backend
 */

// Simple local storage based authentication
// This replaces the backend authentication with local storage

const MOCK_USER = {
  id: 'mock-user-1',
  name: 'Demo User',
  email: 'demo@example.com',
  token: 'mock-token-' + Date.now()
};

// Initialize mock user if not exists
if (!localStorage.getItem('user')) {
  localStorage.setItem('user', JSON.stringify(MOCK_USER));
}

export const setupMockAuth = () => {
  // Nothing to setup, using local storage
  console.log('Using local storage based authentication');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = () => {
  return !!getCurrentUser();
};

export const login = (email, password) => {
  // For demo purposes, accept any non-empty credentials
  if (email && password) {
    const user = {
      ...MOCK_USER,
      email,
      token: 'mock-token-' + Date.now()
    };
    localStorage.setItem('user', JSON.stringify(user));
    return Promise.resolve({ success: true, user });
  }
  return Promise.reject(new Error('Invalid credentials'));
};

export const logout = () => {
  localStorage.removeItem('user');
  return Promise.resolve({ success: true });
};

export const register = (userData) => {
  // For demo purposes, create a new mock user
  const user = {
    ...MOCK_USER,
    ...userData,
    id: 'mock-user-' + Date.now(),
    token: 'mock-token-' + Date.now()
  };
  localStorage.setItem('user', JSON.stringify(user));
  return Promise.resolve({ success: true, user });
};

export default {
  setupMockAuth,
  getCurrentUser,
  isAuthenticated,
  login,
  logout,
  register
}; 