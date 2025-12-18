import React, { useMemo } from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'purple', 
  text = 'Loading...',
  fullScreen = false,
  className = '',
  ariaLabel = 'Loading content'
}) => {
  // Memoized size classes for better performance
  const sizeClasses = useMemo(() => ({
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-16 h-16'
  }), []);

  // Memoized color classes for better performance
  const colorClasses = useMemo(() => ({
    purple: 'border-purple-600',
    blue: 'border-blue-600',
    green: 'border-green-600',
    red: 'border-red-600',
    gray: 'border-gray-600',
    white: 'border-white'
  }), []);

  // Memoized spinner component
  const spinner = useMemo(() => (
    <div 
      className={`flex flex-col items-center justify-center ${className}`}
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      <div 
        className={`${sizeClasses[size]} ${colorClasses[color]} border-2 border-t-transparent rounded-full animate-spin loading-spinner`}
        aria-hidden="true"
      ></div>
      {text && (
        <p className="mt-2 text-sm text-gray-600 font-medium">{text}</p>
      )}
    </div>
  ), [sizeClasses, colorClasses, size, color, className, ariaLabel, text]);

  if (fullScreen) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100"
        role="dialog"
        aria-modal="true"
        aria-label="Loading overlay"
      >
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner; 