import React, { useState } from 'react';
import PaymentGateway from './PaymentGateway';
import paymentService from '../services/paymentService';

const PaymentIntegration = () => {
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    setShowPaymentGateway(true);
    setPaymentResult(null);
  };

  const handlePaymentComplete = (result) => {
    setPaymentResult(result);
    setShowPaymentGateway(false);
    setSelectedPlan(null);
  };

  const handlePaymentClose = () => {
    setShowPaymentGateway(false);
    setSelectedPlan(null);
  };

  const plans = [
    { id: 'premium', name: 'Premium Plan', price: 999, description: 'Unlimited access to all features' },
    { id: 'family', name: 'Family Plan', price: 1499, description: 'Up to 5 family members' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Choose Your Plan</h2>
        <p className="text-gray-600">Select a plan that fits your fitness goals</p>
      </div>

      {/* Plan Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{plan.name}</h3>
            <div className="text-3xl font-bold text-purple-600 mb-2">₹{plan.price}</div>
            <p className="text-gray-600 mb-4">{plan.description}</p>
            <button
              onClick={() => handlePlanSelect(plan.id)}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Subscribe Now
            </button>
          </div>
        ))}
      </div>

      {/* Payment Result */}
      {paymentResult && (
        <div className={`p-4 rounded-lg mb-6 ${
          paymentResult.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            {paymentResult.success ? (
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            <span className={paymentResult.success ? 'text-green-700' : 'text-red-700'}>
              {paymentResult.success 
                ? `Payment successful! Transaction ID: ${paymentResult.transactionId}`
                : 'Payment failed. Please try again.'
              }
            </span>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal */}
      {showPaymentGateway && selectedPlan && (
        <PaymentGateway
          selectedPlan={selectedPlan}
          onPaymentComplete={handlePaymentComplete}
          onClose={handlePaymentClose}
        />
      )}

      {/* Usage Instructions */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Integration Instructions</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p>1. Import the PaymentGateway component and paymentService</p>
          <p>2. Use the handlePlanSelect function to open the payment gateway</p>
          <p>3. Handle payment completion in the onPaymentComplete callback</p>
          <p>4. The payment service automatically updates Firebase with subscription data</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentIntegration; 