// Mock tracking service for development
// This replaces the backend tracking with console logging

const TRACKING_ENABLED = process.env.NODE_ENV === 'development';

/**
 * Track a page view (logs to console in development)
 */
export const trackPageView = (pageName, additionalData = {}) => {
  if (!TRACKING_ENABLED) return;
  
  console.log('📊 Page view:', pageName, additionalData);
};

/**
 * Track a user event (logs to console in development)
 */
export const trackEvent = (eventCategory, eventAction, eventLabel, additionalData = {}) => {
  if (!TRACKING_ENABLED) return;
  
  console.log('📊 Event:', eventCategory, eventAction, eventLabel, additionalData);
};

/**
 * Track a feature usage (logs to console in development)
 */
export const trackFeatureUsage = (featureName, featureData = {}) => {
  if (!TRACKING_ENABLED) return;
  
  console.log('📊 Feature usage:', featureName, featureData);
};

/**
 * Track user metrics (logs to console in development)
 */
export const trackMetric = (metricType, metricData = {}) => {
  if (!TRACKING_ENABLED) return;
  
  console.log('📊 Metric:', metricType, metricData);
}; 