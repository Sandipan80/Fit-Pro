import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '../components/firebase';
import paymentService from '../services/paymentService';

const PaymentSyncContext = createContext();

export const usePaymentSync = () => {
  const context = useContext(PaymentSyncContext);
  if (!context) {
    throw new Error('usePaymentSync must be used within a PaymentSyncProvider');
  }
  return context;
};

export const PaymentSyncProvider = ({ children }) => {
  const [subscription, setSubscription] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  // Load initial data
  const loadUserData = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      setSubscription(null);
      setPaymentHistory([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Loading payment data for user:', user.uid);

      // Load subscription and payment history in parallel
      const [subscriptionData, paymentsData] = await Promise.all([
        paymentService.getUserSubscription(user.uid),
        paymentService.getPaymentHistory(user.uid)
      ]);

      setSubscription(subscriptionData);
      setPaymentHistory(paymentsData);
      setLastSync(new Date());
      
      console.log('Payment data loaded successfully');
    } catch (err) {
      console.error('Error loading payment data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle payment sync events
  const handlePaymentSync = useCallback((event) => {
    const { type, userId, data } = event.detail;
    
    console.log('Payment sync event received:', type, userId);
    
    if (type === 'subscription') {
      setSubscription(data);
    } else if (type === 'payments') {
      setPaymentHistory(data);
    }
    
    setLastSync(new Date());
  }, []);

  // Refresh data manually
  const refreshData = useCallback(async () => {
    await loadUserData();
  }, [loadUserData]);

  // Manual sync trigger
  const triggerSync = useCallback(async () => {
    try {
      console.log('Manual sync triggered');
      await paymentService.syncAllUserData();
      await loadUserData();
    } catch (error) {
      console.error('Manual sync failed:', error);
    }
  }, [loadUserData]);

  // Process payment
  const processPayment = useCallback(async (paymentData) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await paymentService.processPayment(paymentData);
      
      // Refresh data after successful payment
      await loadUserData();
      
      return result;
    } catch (err) {
      console.error('Error processing payment:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadUserData]);

  // Check if user has active subscription
  const hasActiveSubscription = useCallback(() => {
    if (!subscription) return false;
    return subscription.subscriptionStatus === 'active' && 
           subscription.currentPlan !== 'free';
  }, [subscription]);

  // Check if user can access premium content
  const canAccessPremium = useCallback(() => {
    if (!subscription) return false;
    return (
      subscription.subscriptionStatus === 'active' &&
      (subscription.currentPlan === 'premium' || subscription.currentPlan === 'family')
    );
  }, [subscription]);

  // Get subscription status
  const getSubscriptionStatus = useCallback(() => {
    if (!subscription) return 'unknown';
    return subscription.subscriptionStatus;
  }, [subscription]);

  // Get current plan
  const getCurrentPlan = useCallback(() => {
    if (!subscription) return 'free';
    return subscription.currentPlan;
  }, [subscription]);

  // Initialize on mount
  useEffect(() => {
    loadUserData();

    // Listen for auth state changes
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        loadUserData();
      } else {
        setSubscription(null);
        setPaymentHistory([]);
        setLoading(false);
      }
    });

    // Listen for payment sync events
    window.addEventListener('paymentSync', handlePaymentSync);

    return () => {
      unsubscribeAuth();
      window.removeEventListener('paymentSync', handlePaymentSync);
    };
  }, [loadUserData, handlePaymentSync]);

  const value = {
    subscription,
    paymentHistory,
    loading,
    error,
    lastSync,
    refreshData,
    triggerSync,
    processPayment,
    hasActiveSubscription,
    canAccessPremium,
    getSubscriptionStatus,
    getCurrentPlan
  };

  return (
    <PaymentSyncContext.Provider value={value}>
      {children}
    </PaymentSyncContext.Provider>
  );
}; 