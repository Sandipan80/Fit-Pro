import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { usePaymentSync } from '../context/PaymentSyncContext';

const PaymentGateway = ({ selectedPlan, onPaymentComplete, onClose }) => {
  const [user, setUser] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [paymentDetails, setPaymentDetails] = useState({
    upiId: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    phoneNumber: '',
    email: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Use payment sync context
  const { processPayment: syncProcessPayment } = usePaymentSync();

  // Plan configurations
  const plans = {
    free: {
      name: 'Free Plan',
      price: 0,
      features: ['Basic workout access', 'Limited videos', 'Community support'],
      duration: 'Lifetime'
    },
    premium: {
      name: 'Premium Plan',
      price: 999,
      features: ['Unlimited workout videos', 'Personalized plans', 'Nutrition guidance', 'Progress tracking', '24/7 AI coach'],
      duration: '1 Month'
    },
    family: {
      name: 'Family Plan',
      price: 1499,
      features: ['Up to 5 family members', 'All Premium features', 'Family progress tracking', 'Shared meal plans'],
      duration: '1 Month'
    }
  };

  const selectedPlanDetails = plans[selectedPlan] || plans.free;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch user profile
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (field, value) => {
    setPaymentDetails(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const validatePaymentDetails = () => {
    if (!paymentDetails.phoneNumber) {
      setError('Please enter your phone number');
      return false;
    }
    if (paymentMethod === 'upi') {
      if (!paymentDetails.upiId) {
        setError('Please enter your UPI ID');
        return false;
      }
    } else if (paymentMethod === 'bank') {
      if (!paymentDetails.accountNumber) {
        setError('Please enter your account number');
        return false;
      }
      if (!paymentDetails.ifscCode) {
        setError('Please enter your IFSC code');
        return false;
      }
      if (!paymentDetails.accountHolderName) {
        setError('Please enter account holder name');
        return false;
      }
    }
    return true;
  };

  const generateTransactionId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `TXN${timestamp}${random}`.toUpperCase();
  };

  const processPayment = async () => {
    if (!validatePaymentDetails()) return;

    setIsProcessing(true);
    setError(null);
    setPaymentStatus('processing');

    try {
      const transactionId = generateTransactionId();
      const paymentData = {
        userId: user.uid,
        userEmail: user.email,
        plan: selectedPlan,
        planName: selectedPlanDetails.name,
        amount: selectedPlanDetails.price,
        paymentMethod: paymentMethod,
        paymentDetails: paymentDetails,
        transactionId: transactionId,
        status: 'pending',
        timestamp: new Date(),
        currency: 'INR'
      };

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate payment success (in real implementation, this would be handled by payment gateway)
      const paymentSuccess = Math.random() > 0.1; // 90% success rate for demo

      if (paymentSuccess) {
        // Update payment status
        paymentData.status = 'completed';
        paymentData.completedAt = new Date();

        // Use the sync payment service
        const result = await syncProcessPayment(paymentData);

        setPaymentStatus('success');
        setPaymentDetails({
          upiId: '',
          accountNumber: '',
          ifscCode: '',
          accountHolderName: '',
          phoneNumber: '',
          email: ''
        });

        // Notify parent component
        if (onPaymentComplete) {
          onPaymentComplete({
            success: true,
            transactionId: transactionId,
            plan: selectedPlan,
            amount: selectedPlanDetails.price
          });
        }
      } else {
        throw new Error('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message || 'Payment failed. Please try again.');
      setPaymentStatus('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payment gateway...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Complete Payment</h2>
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="text-white hover:text-gray-200 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Plan Summary */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Plan Summary</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{selectedPlanDetails.name}</span>
              <span className="text-2xl font-bold text-purple-600">₹{selectedPlanDetails.price}</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{selectedPlanDetails.duration}</p>
            <ul className="space-y-1">
              {selectedPlanDetails.features.map((feature, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Method</h3>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="upi"
                checked={paymentMethod === 'upi'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="text-purple-600 focus:ring-purple-500"
              />
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                </svg>
                <span className="font-medium">UPI Payment</span>
              </div>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="bank"
                checked={paymentMethod === 'bank'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="text-purple-600 focus:ring-purple-500"
              />
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                </svg>
                <span className="font-medium">Bank Transfer</span>
              </div>
            </label>
          </div>
        </div>

        {/* Payment Details Form */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Details</h3>
          <div className="space-y-4">
            {paymentMethod === 'upi' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UPI ID *
                </label>
                <input
                  type="text"
                  value={paymentDetails.upiId}
                  onChange={(e) => handleInputChange('upiId', e.target.value)}
                  placeholder="example@upi"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  disabled={isProcessing}
                />
              </div>
            )}
            {paymentMethod === 'bank' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    value={paymentDetails.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                    placeholder="1234567890"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    disabled={isProcessing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IFSC Code *
                  </label>
                  <input
                    type="text"
                    value={paymentDetails.ifscCode}
                    onChange={(e) => handleInputChange('ifscCode', e.target.value.toUpperCase())}
                    placeholder="SBIN0001234"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    disabled={isProcessing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Holder Name *
                  </label>
                  <input
                    type="text"
                    value={paymentDetails.accountHolderName}
                    onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    disabled={isProcessing}
                  />
                </div>
              </>
            )}
            {/* Phone Number (always required) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={paymentDetails.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                disabled={isProcessing}
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-6 border-b">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Status */}
        {paymentStatus === 'processing' && (
          <div className="p-6 border-b">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-blue-700">Processing payment...</span>
              </div>
            </div>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="p-6 border-b">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-700">Payment successful! Your subscription is now active.</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-6">
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={processPayment}
              disabled={isProcessing || paymentStatus === 'success'}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : paymentStatus === 'success' ? 'Payment Complete' : `Pay ₹${selectedPlanDetails.price}`}
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-6 bg-gray-50 rounded-b-xl">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-gray-600">
              <p className="font-medium">Secure Payment</p>
              <p>Your payment information is encrypted and secure. We never store your payment details.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway; 