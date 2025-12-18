// Mock payment service for development
// In a real application, this would integrate with a payment processor like Stripe

export const subscriptionPlans = {
  basic: {
    id: 'basic',
    name: 'Basic Plan',
    price: 299,
    features: [
      'Access to basic workout plans',
      'Progress tracking',
      'Basic nutrition guidance',
      'Email support'
    ]
  },
  premium: {
    id: 'premium',
    name: 'Premium Plan',
    price: 599,
    features: [
      'All Basic features',
      'Personalized workout plans',
      'Advanced analytics',
      'Video coaching sessions',
      'Priority support',
      'Custom meal plans'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro Plan',
    price: 999,
    features: [
      'All Premium features',
      '1-on-1 personal training',
      'Advanced body composition analysis',
      'Nutrition consultation',
      'Recovery protocols',
      '24/7 support'
    ]
  }
};

// Mock subscription data storage
const mockSubscriptions = new Map();

export const initializeSubscription = async (planId) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const plan = subscriptionPlans[planId];
  if (!plan) {
    throw new Error('Invalid plan selected');
  }
  
  // In a real app, this would integrate with a payment processor
  // For now, we'll simulate a successful subscription
  const subscription = {
    id: `sub_${Date.now()}`,
    plan: plan.name,
    planId: planId,
    status: 'active',
    isActive: true,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    daysRemaining: 30
  };
  
  // Store subscription (in real app, this would be in a database)
  mockSubscriptions.set('current_user', subscription);
  
  return {
    success: true,
    message: `Successfully subscribed to ${plan.name}!`,
    subscription
  };
};

export const verifySubscription = async (userId) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real app, this would check the database for the user's subscription
  const subscription = mockSubscriptions.get('current_user');
  
  if (!subscription) {
    return {
      isActive: false,
      status: 'none',
      plan: null,
      daysRemaining: 0
    };
  }
  
  // Check if subscription is still valid
  const now = new Date();
  const endDate = new Date(subscription.endDate);
  const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
  
  if (daysRemaining <= 0) {
    subscription.isActive = false;
    subscription.status = 'expired';
  }
  
  return {
    ...subscription,
    daysRemaining: Math.max(0, daysRemaining)
  };
};

export const cancelSubscription = async () => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const subscription = mockSubscriptions.get('current_user');
  if (!subscription) {
    throw new Error('No active subscription found');
  }
  
  // Mark subscription as cancelled but keep it active until end date
  subscription.status = 'cancelled';
  subscription.cancelledAt = new Date().toISOString();
  
  return {
    success: true,
    message: 'Subscription cancelled successfully. You will continue to have access until the end of your billing period.',
    subscription
  };
}; 