import React from 'react';

// Performance optimization utilities

// Lazy load components to reduce initial bundle size
export const lazyLoadComponent = (importFunc) => {
  return React.lazy(() => {
    return new Promise((resolve) => {
      // Add a small delay to show loading state
      setTimeout(() => {
        resolve(importFunc());
      }, 100);
    });
  });
};

// Debounce function to limit function calls
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function to limit function calls
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memoize expensive calculations
export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
};

// Preload critical resources
export const preloadResource = (url, type = 'image') => {
  if (type === 'image') {
    const img = new Image();
    img.src = url;
  } else if (type === 'script') {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    document.head.appendChild(script);
  }
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry.target);
      }
    });
  }, defaultOptions);
};

// Performance monitoring
export const measurePerformance = (name, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${name} took ${end - start}ms`);
  return result;
};

// Async performance monitoring
export const measureAsyncPerformance = async (name, fn) => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  console.log(`${name} took ${end - start}ms`);
  return result;
};

// Memory usage monitoring
export const getMemoryUsage = () => {
  if (performance.memory) {
    return {
      used: Math.round(performance.memory.usedJSHeapSize / 1048576),
      total: Math.round(performance.memory.totalJSHeapSize / 1048576),
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
    };
  }
  return null;
};

// Optimize images
export const optimizeImage = (src, width, height, quality = 0.8) => {
  // This is a placeholder for image optimization
  // In a real app, you might use a service like Cloudinary or similar
  return src;
};

// Batch DOM updates
export const batchDOMUpdates = (updates) => {
  // Use requestAnimationFrame to batch DOM updates
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
};

// Cache management
export const cacheManager = {
  cache: new Map(),
  
  set(key, value, ttl = 300000) { // 5 minutes default
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  },
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  },
  
  clear() {
    this.cache.clear();
  },
  
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
};

// Auto cleanup cache every 5 minutes
setInterval(() => {
  cacheManager.cleanup();
}, 300000);

export default {
  lazyLoadComponent,
  debounce,
  throttle,
  memoize,
  preloadResource,
  createIntersectionObserver,
  measurePerformance,
  measureAsyncPerformance,
  getMemoryUsage,
  optimizeImage,
  batchDOMUpdates,
  cacheManager
}; 