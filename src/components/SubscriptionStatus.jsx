import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import paymentService from '../services/paymentService';

const SubscriptionStatus = () => {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadSubscription(currentUser.uid);
      } else {
        setUser(null);
        setSubscription(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadSubscription = async (userId) => {
    try {
      setLoading(true);
      const sub = await paymentService.getUserSubscription(userId);
      setSubscription(sub);
    } catch (error) {
      console.error('Error loading subscription:', error);
      setError('Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date.toDate()).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const end = new Date(endDate.toDate());
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: '✓' },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: '⊘' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: '✗' },
      expired: { color: 'bg-orange-100 text-orange-800', icon: '⏰' }
    };

    const config = statusConfig[status] || statusConfig.inactive;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {status}
      </span>
    );
  };

  const getPlanIcon = (planId) => {
    const icons = {
      free: '🆓',
      premium: '⭐',
      family: '👨‍👩‍👧‍👦'
    };
    return icons[planId] || '📋';
  };

  const getPlanColor = (planId) => {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      premium: 'bg-purple-100 text-purple-800',
      family: 'bg-blue-100 text-blue-800'
    };
    return colors[planId] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription status...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Please Sign In</h3>
        <p className="text-gray-600">You need to be signed in to view subscription status.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Subscription Found</h3>
          <p className="text-gray-600 mb-4">You don't have an active subscription yet.</p>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            View Plans
          </button>
        </div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(subscription.endDate);
  const isExpired = daysRemaining === 0 && subscription.subscriptionStatus === 'active';
  const currentStatus = isExpired ? 'expired' : subscription.subscriptionStatus;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{getPlanIcon(subscription.currentPlan)}</div>
            <div>
              <h2 className="text-xl font-bold">{subscription.planName}</h2>
              <p className="text-purple-100">Subscription Status</p>
            </div>
          </div>
          {getStatusBadge(currentStatus)}
        </div>
      </div>

      {/* Status Details */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {daysRemaining}
            </div>
            <div className="text-sm text-gray-600">Days Remaining</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatDate(subscription.startDate)}
            </div>
            <div className="text-sm text-gray-600">Start Date</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatDate(subscription.endDate)}
            </div>
            <div className="text-sm text-gray-600">End Date</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {subscription.paymentHistory?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Total Payments</div>
          </div>
        </div>

        {/* Progress Bar */}
        {subscription.startDate && subscription.endDate && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Subscription Progress</span>
              <span>{Math.round(((30 - daysRemaining) / 30) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(((30 - daysRemaining) / 30) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Last Payment */}
        {subscription.lastPayment && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">Last Payment</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Amount:</span>
                <span className="ml-2 font-medium">{formatCurrency(subscription.lastPayment.amount)}</span>
              </div>
              <div>
                <span className="text-gray-600">Date:</span>
                <span className="ml-2 font-medium">{formatDate(subscription.lastPayment.date)}</span>
              </div>
              <div>
                <span className="text-gray-600">Method:</span>
                <span className="ml-2 font-medium capitalize">{subscription.lastPayment.method}</span>
              </div>
            </div>
            {subscription.lastPayment.transactionId && (
              <div className="mt-2">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="ml-2 font-mono text-sm">{subscription.lastPayment.transactionId}</span>
              </div>
            )}
          </div>
        )}

        {/* Plan Features */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">Plan Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {paymentService.getPlanDetails(subscription.currentPlan).features.map((feature, index) => (
              <div key={index} className="flex items-center text-sm text-gray-700">
                <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {currentStatus === 'active' && daysRemaining > 0 && (
            <>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Renew Early
              </button>
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                Upgrade Plan
              </button>
            </>
          )}
          
          {currentStatus === 'expired' && (
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Renew Subscription
            </button>
          )}
          
          {currentStatus === 'active' && (
            <button className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors">
              Cancel Subscription
            </button>
          )}
          
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            View Payment History
          </button>
        </div>

        {/* Warning for expiring soon */}
        {currentStatus === 'active' && daysRemaining <= 7 && daysRemaining > 0 && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-yellow-800">
                Your subscription expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}. 
                Consider renewing to maintain uninterrupted access.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionStatus; 