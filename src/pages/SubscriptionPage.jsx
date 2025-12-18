import React, { useState, useEffect } from 'react';
import { auth } from '../components/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import PaymentGateway from '../components/PaymentGateway';
import { usePaymentSync } from '../context/PaymentSyncContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import paymentService from '../services/paymentService';

const SubscriptionPage = ({ routing }) => {
  const [user, setUser] = useState(null);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [showFeatureDetails, setShowFeatureDetails] = useState({});

  // Use payment sync context
  const {
    subscription: currentSubscription,
    paymentHistory,
    loading,
    error,
    processPayment,
    hasActiveSubscription,
    canAccessPremium,
    refreshData,
    triggerSync,
    lastSync
  } = usePaymentSync();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Auth state changed:', currentUser?.uid);
      
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handlePlanSelect = (planId) => {
    console.log('Plan selected:', planId);
    setSelectedPlan(planId);
    setShowPaymentGateway(true);
  };

  const handlePaymentComplete = async (result) => {
    console.log('Payment completed:', result);
    
    if (result.success) {
      // Refresh data to reflect new subscription
      await refreshData();
      setShowPaymentGateway(false);
      setSelectedPlan(null);
      
      // Show success message
      alert(`Payment successful! Transaction ID: ${result.transactionId}`);
    } else {
      console.error('Payment failed:', result);
    }
  };

  const handlePaymentClose = () => {
    console.log('Payment gateway closed');
    setShowPaymentGateway(false);
    setSelectedPlan(null);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date.toDate()).toLocaleDateString('en-IN');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getPlanCards = () => {
    const plans = ['free', 'premium', 'family'];
    
    return plans.map(planId => {
      const planDetails = paymentService.getPlanDetails(planId);
      const isCurrentPlan = currentSubscription?.currentPlan === planId;
      const isActive = currentSubscription?.subscriptionStatus === 'active';
      
      return (
        <div
          key={planId}
          className={`relative bg-white rounded-xl shadow-lg p-6 border-2 transition-all duration-300 hover:shadow-xl ${
            isCurrentPlan ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
          }`}
        >
          {isCurrentPlan && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Current Plan
              </span>
            </div>
          )}
          
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{planDetails.name}</h3>
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {planDetails.price === 0 ? 'Free' : `₹${planDetails.price}`}
            </div>
            <p className="text-gray-600">{planDetails.duration}</p>
          </div>

          <ul className="space-y-3 mb-6">
            {planDetails.features.map((feature, index) => (
              <li key={index} className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>

          <button
            onClick={() => handlePlanSelect(planId)}
            disabled={isCurrentPlan && isActive}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              isCurrentPlan && isActive
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {isCurrentPlan && isActive ? 'Current Plan' : planDetails.price === 0 ? 'Get Started' : 'Subscribe Now'}
          </button>
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Sign In</h2>
          <p className="text-gray-600">You need to be signed in to view subscription details.</p>
          {routing && routing.navigateTo && (
            <button
              onClick={() => routing.navigateTo('login')}
              className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar routing={routing} />
      
      <main className="flex-grow py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
            <p className="text-xl text-gray-600 mb-8">
              Start your fitness journey with our flexible subscription plans
            </p>

            {/* Billing Cycle Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className={`text-sm ${billingCycle === 'monthly' ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => handleBillingCycleChange(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${billingCycle === 'yearly' ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
                Yearly <span className="text-green-600">(Save 20%)</span>
              </span>
            </div>
          </motion.div>

          <div className="space-y-8">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-3xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-sm text-red-600">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Manual Sync Button for Testing */}
            <div className="max-w-3xl mx-auto text-center">
              <button
                onClick={triggerSync}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Syncing...
                  </>
                ) : (
                  <>
                    <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Sync Data
                  </>
                )}
              </button>
              {lastSync && (
                <p className="text-xs text-gray-500 mt-2">
                  Last sync: {new Date(lastSync).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            {getPlanCards()}
          </div>

          {/* Plan Comparison Button */}
          <div className="text-center mt-12">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              {showComparison ? 'Hide' : 'Show'} Plan Comparison
              <svg
                className={`ml-2 h-5 w-5 transform transition-transform ${showComparison ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
          </div>

          {/* Plan Comparison Table */}
          <AnimatePresence>
            {showComparison && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="max-w-4xl mx-auto mt-8 overflow-hidden"
              >
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Features
                        </th>
                        {Object.values(paymentService.getPlans()).map((plan) => (
                          <th key={plan.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {plan.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.values(paymentService.getPlans())[0].features.map((feature, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {typeof feature === 'string' ? feature : feature.title}
                          </td>
                          {Object.values(paymentService.getPlans()).map((plan) => (
                            <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-center">
                              {plan.features[index] ? (
                                <svg className="h-5 w-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                              ) : (
                                <svg className="h-5 w-5 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="max-w-3xl mx-auto mt-16 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">Why Choose FitPro?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                whileHover={{ y: -5 }}
              >
                <svg className="h-12 w-12 text-purple-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Secure Platform</h3>
                <p className="text-gray-600">Your data and progress are always secure with our platform.</p>
              </motion.div>
              <motion.div
                className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                whileHover={{ y: -5 }}
              >
                <svg className="h-12 w-12 text-purple-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Flexible Plans</h3>
                <p className="text-gray-600">Choose the plan that best fits your fitness goals and budget.</p>
              </motion.div>
              <motion.div
                className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                whileHover={{ y: -5 }}
              >
                <svg className="h-12 w-12 text-purple-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Cancel Anytime</h3>
                <p className="text-gray-600">No long-term commitments. Cancel your subscription anytime.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Gateway Modal */}
      {showPaymentGateway && selectedPlan && (
        <PaymentGateway
          selectedPlan={selectedPlan}
          onPaymentComplete={handlePaymentComplete}
          onClose={handlePaymentClose}
        />
      )}
      
      <Footer routing={routing} />
    </div>
  );
};

export default SubscriptionPage; 