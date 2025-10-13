// frontend/src/utils/api.js
// API utility functions

const API_BASE = 'https://andys-zipline-production.up.railway.app/api';

export const apiCall = async (endpoint, token, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    ...options
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Auth helpers
export const getStoredToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const setStoredToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

export const removeStoredToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};