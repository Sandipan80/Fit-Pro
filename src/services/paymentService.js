import { auth, db } from '../components/firebase';
import { doc, updateDoc, getDoc, setDoc, collection, addDoc, query, where, orderBy, getDocs, onSnapshot } from 'firebase/firestore';

class PaymentService {
  constructor() {
    this.subscribers = new Map();
    this.cache = new Map();
    this.syncInterval = null;
    this.initializeSync();
  }

  // Initialize sync mechanism
  initializeSync() {
    // Clear any existing interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Set up periodic sync every 10 seconds (increased frequency)
    this.syncInterval = setInterval(() => {
      this.syncAllUserData();
    }, 10000);

    // Set up real-time listeners for authenticated users
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.setupRealtimeSync(user.uid);
      } else {
        this.cleanupRealtimeSync();
      }
    });
  }

  // Set up real-time sync for a user
  setupRealtimeSync(userId) {
    console.log('Setting up real-time sync for user:', userId);
    
    // Listen to user subscription changes
    const userUnsubscribe = onSnapshot(doc(db, 'users', userId), (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        console.log('Real-time user data update:', userData);
        this.notifySubscribers('subscription', userId, userData);
        this.cache.set(`user_${userId}`, userData);
      }
    }, (error) => {
      console.error('Real-time sync error for user:', error);
    });

    // Temporarily disable real-time payment sync to avoid index issues
    // Will rely on periodic sync instead
    console.log('Real-time payment sync disabled to avoid index issues');
    
    // Store unsubscribe functions (only user sync for now)
    this.subscribers.set(userId, {
      user: userUnsubscribe,
      payments: null // No real-time payment sync
    });
  }

  // Clean up real-time sync
  cleanupRealtimeSync() {
    console.log('Cleaning up real-time sync');
    this.subscribers.forEach((unsubscribers) => {
      if (unsubscribers.user) unsubscribers.user();
      if (unsubscribers.payments) unsubscribers.payments();
    });
    this.subscribers.clear();
  }

  // Notify subscribers of data changes
  notifySubscribers(type, userId, data) {
    const event = new CustomEvent('paymentSync', {
      detail: { type, userId, data, timestamp: Date.now() }
    });
    window.dispatchEvent(event);
  }

  // Sync all user data
  async syncAllUserData() {
    const user = auth.currentUser;
    if (!user) return;

    try {
      console.log('Syncing all user data for:', user.uid);
      
      // Sync subscription
      const subscription = await this.getUserSubscription(user.uid);
      
      // Sync payment history
      const payments = await this.getPaymentHistory(user.uid);
      
      // Notify subscribers
      this.notifySubscribers('subscription', user.uid, subscription);
      this.notifySubscribers('payments', user.uid, payments);
      
      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  // Get user's current subscription status
  async getUserSubscription(userId) {
    try {
      if (!userId) {
        console.log('No userId provided');
        return this.getDefaultSubscription();
      }

      console.log('Fetching subscription for user:', userId);
      
      // Check cache first
      const cached = this.cache.get(`user_${userId}`);
      if (cached) {
        console.log('Returning cached subscription data');
        return cached;
      }
      
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('User data found:', userData);
        
        const subscription = {
          currentPlan: userData.currentPlan || 'free',
          planName: userData.planName || 'Free Plan',
          subscriptionStatus: userData.subscriptionStatus || 'inactive',
          startDate: userData.startDate,
          endDate: userData.endDate,
          lastPayment: userData.lastPayment,
          paymentHistory: userData.paymentHistory || [],
          updatedAt: userData.updatedAt || new Date()
        };
        
        // Cache the result
        this.cache.set(`user_${userId}`, subscription);
        
        return subscription;
      } else {
        console.log('User document does not exist, creating default subscription');
        const defaultSubscription = this.getDefaultSubscription();
        
        // Save the default subscription
        await setDoc(doc(db, 'users', userId), defaultSubscription);
        
        // Cache the result
        this.cache.set(`user_${userId}`, defaultSubscription);
        
        return defaultSubscription;
      }
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      return this.getDefaultSubscription();
    }
  }

  // Get default subscription
  getDefaultSubscription() {
    return {
      currentPlan: 'free',
      planName: 'Free Plan',
      subscriptionStatus: 'active',
      startDate: new Date(),
      endDate: null,
      lastPayment: null,
      paymentHistory: [],
      updatedAt: new Date()
    };
  }

  // Get payment history for a user
  async getPaymentHistory(userId) {
    try {
      if (!userId) {
        console.log('No userId provided for payment history');
        return [];
      }

      console.log('Fetching payment history for user:', userId);
      
      // Check cache first
      const cached = this.cache.get(`payments_${userId}`);
      if (cached) {
        console.log('Returning cached payment history');
        return cached;
      }
      
      // First try with the composite query (requires index)
      try {
        const paymentsQuery = query(
          collection(db, 'payments'),
          where('userId', '==', userId),
          orderBy('timestamp', 'desc')
        );
        
        const querySnapshot = await getDocs(paymentsQuery);
        const payments = [];
        
        querySnapshot.forEach((doc) => {
          payments.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        console.log('Found payments with ordered query:', payments.length);
        
        // Cache the result
        this.cache.set(`payments_${userId}`, payments);
        
        return payments;
      } catch (indexError) {
        // If index doesn't exist, fall back to simple query and sort in memory
        console.log('Index not available, falling back to simple query:', indexError.message);
        
        const paymentsQuery = query(
          collection(db, 'payments'),
          where('userId', '==', userId)
        );
        
        const querySnapshot = await getDocs(paymentsQuery);
        const payments = [];
        
        querySnapshot.forEach((doc) => {
          payments.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        // Sort in memory by timestamp (descending)
        payments.sort((a, b) => {
          const timestampA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
          const timestampB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
          return timestampB - timestampA;
        });
        
        console.log('Found payments with simple query:', payments.length);
        
        // Cache the result
        this.cache.set(`payments_${userId}`, payments);
        
        return payments;
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return [];
    }
  }

  // Process payment and update subscription
  async processPayment(paymentData) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Processing payment for user:', user.uid);

      // Generate transaction ID if not provided
      if (!paymentData.transactionId) {
        paymentData.transactionId = this.generateTransactionId();
      }

      // Add user information
      paymentData.userId = user.uid;
      paymentData.userEmail = user.email;
      paymentData.timestamp = new Date();
      paymentData.currency = 'INR';

      // Save payment record
      const paymentRef = await addDoc(collection(db, 'payments'), paymentData);
      console.log('Payment record saved:', paymentRef.id);

      // Update user subscription
      await this.updateUserSubscription(user.uid, paymentData);

      // Clear cache to force refresh
      this.cache.delete(`user_${user.uid}`);
      this.cache.delete(`payments_${user.uid}`);

      // Trigger immediate sync
      await this.syncAllUserData();

      return {
        success: true,
        paymentId: paymentRef.id,
        transactionId: paymentData.transactionId
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  // Update user subscription in Firebase
  async updateUserSubscription(userId, paymentData) {
    try {
      if (!userId) {
        throw new Error('No userId provided');
      }

      console.log('Updating subscription for user:', userId);
      
      const userRef = doc(db, 'users', userId);
      
      // Calculate subscription end date (30 days from now)
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      const subscriptionData = {
        currentPlan: paymentData.plan,
        planName: paymentData.planName,
        subscriptionStatus: 'active',
        startDate: new Date(),
        endDate: endDate,
        lastPayment: {
          amount: paymentData.amount,
          transactionId: paymentData.transactionId,
          date: new Date(),
          method: paymentData.paymentMethod
        },
        updatedAt: new Date()
      };

      // Get existing payment history
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        subscriptionData.paymentHistory = userData.paymentHistory || [];
      }

      // Add new payment to history
      subscriptionData.paymentHistory.push({
        amount: paymentData.amount,
        transactionId: paymentData.transactionId,
        date: new Date(),
        method: paymentData.paymentMethod,
        plan: paymentData.plan
      });

      // Update the document
      await updateDoc(userRef, subscriptionData);
      
      console.log('Subscription updated successfully');
      
      // Clear cache
      this.cache.delete(`user_${userId}`);
      
      return subscriptionData;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription(userId) {
    try {
      if (!userId) {
        throw new Error('No userId provided');
      }

      const userRef = doc(db, 'users', userId);
      
      const subscriptionData = {
        subscriptionStatus: 'cancelled',
        cancelledAt: new Date(),
        updatedAt: new Date()
      };

      await updateDoc(userRef, subscriptionData);
      
      return { success: true };
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  // Renew subscription
  async renewSubscription(userId, plan) {
    try {
      if (!userId) {
        throw new Error('No userId provided');
      }

      const userRef = doc(db, 'users', userId);
      
      // Get current subscription
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const currentEndDate = userData.endDate ? new Date(userData.endDate.toDate()) : new Date();
      const newEndDate = new Date(currentEndDate.getTime() + 30 * 24 * 60 * 60 * 1000);

      const subscriptionData = {
        currentPlan: plan,
        subscriptionStatus: 'active',
        endDate: newEndDate,
        updatedAt: new Date()
      };

      await updateDoc(userRef, subscriptionData);
      
      return { success: true, newEndDate };
    } catch (error) {
      console.error('Error renewing subscription:', error);
      throw error;
    }
  }

  // Check if subscription is active
  async isSubscriptionActive(userId) {
    try {
      if (!userId) {
        return false;
      }

      const subscription = await this.getUserSubscription(userId);
      if (!subscription) return false;

      if (subscription.subscriptionStatus !== 'active') return false;

      // Check if subscription has expired
      if (subscription.endDate) {
        const endDate = new Date(subscription.endDate.toDate());
        return endDate > new Date();
      }

      return false;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  // Get plan details
  getPlanDetails(planId) {
    const plans = {
      free: {
        id: 'free',
        name: 'Free Plan',
        price: 0,
        features: [
          'Basic workout access',
          'Limited videos',
          'Community support',
          'Basic progress tracking'
        ],
        duration: 'Lifetime',
        maxUsers: 1
      },
      premium: {
        id: 'premium',
        name: 'Premium Plan',
        price: 999,
        features: [
          'Unlimited workout videos',
          'Personalized workout plans',
          'Nutrition guidance',
          'Advanced progress tracking',
          '24/7 AI fitness coach',
          'Premium workout categories',
          'Custom meal plans'
        ],
        duration: '1 Month',
        maxUsers: 1
      },
      family: {
        id: 'family',
        name: 'Family Plan',
        price: 1499,
        features: [
          'Up to 5 family members',
          'All Premium features',
          'Family progress tracking',
          'Shared meal plans',
          'Family workout challenges',
          'Group nutrition guidance',
          'Family leaderboards'
        ],
        duration: '1 Month',
        maxUsers: 5
      }
    };

    return plans[planId] || plans.free;
  }

  // Generate transaction ID
  generateTransactionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `TXN${timestamp}${random}`.toUpperCase();
  }

  // Validate payment details
  validatePaymentDetails(paymentMethod, details) {
    const errors = [];

    if (paymentMethod === 'upi') {
      if (!details.upiId) {
        errors.push('UPI ID is required');
      }
      if (!details.phoneNumber) {
        errors.push('Phone number is required');
      }
      // Basic UPI ID format validation
      if (details.upiId && !details.upiId.includes('@')) {
        errors.push('Invalid UPI ID format');
      }
    } else if (paymentMethod === 'bank') {
      if (!details.accountNumber) {
        errors.push('Account number is required');
      }
      if (!details.ifscCode) {
        errors.push('IFSC code is required');
      }
      if (!details.accountHolderName) {
        errors.push('Account holder name is required');
      }
      // Basic IFSC code validation
      if (details.ifscCode && details.ifscCode.length !== 11) {
        errors.push('IFSC code must be 11 characters');
      }
    }

    return errors;
  }

  // Get payment methods
  getPaymentMethods() {
    return [
      {
        id: 'upi',
        name: 'UPI Payment',
        description: 'Pay using UPI ID or QR code',
        icon: '💳',
        supportedApps: ['Google Pay', 'PhonePe', 'Paytm', 'BHIM']
      },
      {
        id: 'bank',
        name: 'Bank Transfer',
        description: 'Direct bank account transfer',
        icon: '🏦',
        supportedBanks: ['All major Indian banks']
      }
    ];
  }

  // Calculate subscription benefits
  calculateBenefits(currentPlan, newPlan) {
    const currentPlanDetails = this.getPlanDetails(currentPlan);
    const newPlanDetails = this.getPlanDetails(newPlan);

    const benefits = {
      priceDifference: newPlanDetails.price - currentPlanDetails.price,
      newFeatures: newPlanDetails.features.filter(feature => 
        !currentPlanDetails.features.includes(feature)
      ),
      upgrade: newPlanDetails.price > currentPlanDetails.price,
      downgrade: newPlanDetails.price < currentPlanDetails.price
    };

    return benefits;
  }

  // Initialize user subscription (for new users)
  async initializeUserSubscription(userId, userEmail) {
    try {
      if (!userId) {
        throw new Error('No userId provided');
      }

      console.log('Initializing subscription for new user:', userId);
      
      const defaultSubscription = {
        currentPlan: 'free',
        planName: 'Free Plan',
        subscriptionStatus: 'active',
        startDate: new Date(),
        endDate: null, // Free plan has no end date
        lastPayment: null,
        paymentHistory: [],
        userEmail: userEmail,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'users', userId), defaultSubscription);
      console.log('Default subscription created for user:', userId);
      
      return defaultSubscription;
    } catch (error) {
      console.error('Error initializing user subscription:', error);
      throw error;
    }
  }

  // Test method to verify service works without index
  async testPaymentService() {
    const user = auth.currentUser;
    if (!user) {
      console.log('No user authenticated for testing');
      return;
    }

    try {
      console.log('Testing payment service...');
      
      // Test subscription fetch
      const subscription = await this.getUserSubscription(user.uid);
      console.log('Subscription test result:', subscription);
      
      // Test payment history fetch
      const payments = await this.getPaymentHistory(user.uid);
      console.log('Payment history test result:', payments.length, 'payments');
      
      console.log('Payment service test completed successfully');
      return { subscription, payments };
    } catch (error) {
      console.error('Payment service test failed:', error);
      throw error;
    }
  }

  // Cleanup method
  cleanup() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.cleanupRealtimeSync();
    this.cache.clear();
  }
}

// Create singleton instance
const paymentService = new PaymentService();

export default paymentService; 