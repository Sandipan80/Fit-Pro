// Utility functions for persistent filter storage
import { useState, useCallback } from 'react';

const STORAGE_PREFIX = 'workout_filters_';

// Save filters to localStorage
export const saveFilters = (pageName, filters) => {
  try {
    const key = `${STORAGE_PREFIX}${pageName}`;
    localStorage.setItem(key, JSON.stringify({
      ...filters,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Error saving filters to localStorage:', error);
  }
};

// Load filters from localStorage
export const loadFilters = (pageName, defaultFilters = {}) => {
  try {
    const key = `${STORAGE_PREFIX}${pageName}`;
    const stored = localStorage.getItem(key);
    
    if (stored) {
      const parsed = JSON.parse(stored);
      // Check if the stored filters are less than 24 hours old
      const isExpired = Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000;
      
      if (isExpired) {
        // Remove expired filters
        localStorage.removeItem(key);
        return defaultFilters;
      }
      
      // Remove timestamp from the returned object
      const { timestamp, ...filters } = parsed;
      return { ...defaultFilters, ...filters };
    }
  } catch (error) {
    console.error('Error loading filters from localStorage:', error);
  }
  
  return defaultFilters;
};

// Clear filters for a specific page
export const clearFilters = (pageName) => {
  try {
    const key = `${STORAGE_PREFIX}${pageName}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing filters from localStorage:', error);
  }
};

// Clear all filter storage
export const clearAllFilters = () => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing all filters from localStorage:', error);
  }
};

// Hook for managing persistent filters
export const usePersistentFilters = (pageName, defaultFilters = {}) => {
  const [filters, setFilters] = useState(() => loadFilters(pageName, defaultFilters));

  const updateFilters = useCallback((newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    saveFilters(pageName, updatedFilters);
  }, [filters, pageName]);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    clearFilters(pageName);
  }, [defaultFilters, pageName]);

  return [filters, updateFilters, resetFilters];
}; 