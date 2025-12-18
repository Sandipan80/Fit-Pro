import { createContext, useContext, useEffect, useState } from 'react';
import { 
  trackPageView, 
  trackEvent, 
  trackFeatureUsage, 
  trackMetric 
} from '../services/trackingService';

// Create the tracking context
const TrackingContext = createContext();

/**
 * Custom hook to use the tracking context
 */
export const useTracking = () => {
  const context = useContext(TrackingContext);
  
  if (!context) {
    throw new Error('useTracking must be used within a TrackingProvider');
  }
  
  return context;
};

/**
 * Tracking Provider component
 */
export const TrackingProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize tracking on first render
  useEffect(() => {
    if (!isInitialized) {
      // Track initial page load
      trackPageView(window.location.hash.replace('#', '') || 'home', {
        referrer: document.referrer,
        initialLoad: true
      });
      
      setIsInitialized(true);
    }
  }, [isInitialized]);
  
  // Create the value object for the context
  const value = {
    trackPageView,
    trackEvent,
    trackFeatureUsage,
    trackMetric,
    
    // Convenience methods for common tracking events
    trackButtonClick: (buttonName, additionalData = {}) => {
      trackEvent('button', 'click', buttonName, additionalData);
    },
    
    trackVideoInteraction: (videoId, action, additionalData = {}) => {
      trackEvent('video', action, videoId, additionalData);
    },
    
    trackFormSubmission: (formName, formData = {}) => {
      trackEvent('form', 'submit', formName, {
        // Omit sensitive data
        fields: Object.keys(formData).filter(key => 
          !['password', 'creditCard', 'cvv'].includes(key)
        ),
        ...formData
      });
    },
    
    trackSearch: (searchTerm, resultCount) => {
      trackEvent('search', 'query', searchTerm, { resultCount });
    },
    
    trackWorkoutCompletion: (workoutId, duration, metrics = {}) => {
      trackMetric('workout_completion', {
        workoutId,
        duration,
        ...metrics
      });
    }
  };
  
  return (
    <TrackingContext.Provider value={value}>
      {children}
    </TrackingContext.Provider>
  );
}; 