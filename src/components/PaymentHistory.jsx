import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import paymentService from '../services/paymentService';

const PaymentHistory = () => {
  const [user, setUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, completed, pending, failed

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadPaymentHistory(currentUser.uid);
      } else {
        setUser(null);
        setPayments([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadPaymentHistory = async (userId) => {
    try {
      setLoading(true);
      const history = await paymentService.getPaymentHistory(userId);
      setPayments(history);
    } catch (error) {
      console.error('Error loading payment history:', error);
      setError('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date.toDate()).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', icon: '✓' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      failed: { color: 'bg-red-100 text-red-800', icon: '✗' },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: '⊘' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {status}
      </span>
    );
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      upi: '💳',
      bank: '🏦',
      card: '💳',
      wallet: '👛'
    };
    return icons[method] || '💳';
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    return payment.status === filter;
  });

  const getTotalSpent = () => {
    return payments
      .filter(payment => payment.status === 'completed')
      .reduce((total, payment) => total + payment.amount, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment history...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Please Sign In</h3>
        <p className="text-gray-600">You need to be signed in to view payment history.</p>
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

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Payment History</h2>
            <p className="text-sm text-gray-600 mt-1">
              {payments.length} payment{payments.length !== 1 ? 's' : ''} • 
              Total spent: {formatCurrency(getTotalSpent())}
            </p>
          </div>
          
          {/* Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Payments</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment List */}
      <div className="divide-y divide-gray-200">
        {filteredPayments.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "You haven't made any payments yet." 
                : `No ${filter} payments found.`
              }
            </p>
          </div>
        ) : (
          filteredPayments.map((payment) => (
            <div key={payment.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Payment Method Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                      {getPaymentMethodIcon(payment.paymentMethod)}
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {payment.planName}
                      </h4>
                      {getStatusBadge(payment.status)}
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <span>{formatDate(payment.timestamp)}</span>
                      <span>•</span>
                      <span className="font-mono">{payment.transactionId}</span>
                      {payment.paymentMethod && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{payment.paymentMethod}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(payment.amount)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {payment.currency}
                  </div>
                </div>
              </div>

              {/* Payment Details (Expandable) */}
              {payment.paymentDetails && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <details className="group">
                    <summary className="cursor-pointer text-sm text-purple-600 hover:text-purple-700 font-medium">
                      View Payment Details
                    </summary>
                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {payment.paymentMethod === 'upi' && (
                          <>
                            <div>
                              <span className="text-gray-600">UPI ID:</span>
                              <span className="ml-2 font-mono">{payment.paymentDetails.upiId}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Phone:</span>
                              <span className="ml-2">{payment.paymentDetails.phoneNumber}</span>
                            </div>
                          </>
                        )}
                        {payment.paymentMethod === 'bank' && (
                          <>
                            <div>
                              <span className="text-gray-600">Account:</span>
                              <span className="ml-2 font-mono">{payment.paymentDetails.accountNumber}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">IFSC:</span>
                              <span className="ml-2 font-mono">{payment.paymentDetails.ifscCode}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Holder:</span>
                              <span className="ml-2">{payment.paymentDetails.accountHolderName}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </details>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {payments.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div>
                <span className="text-gray-600">Total Payments:</span>
                <span className="ml-2 font-medium">{payments.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Completed:</span>
                <span className="ml-2 font-medium text-green-600">
                  {payments.filter(p => p.status === 'completed').length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Total Spent:</span>
                <span className="ml-2 font-medium text-purple-600">
                  {formatCurrency(getTotalSpent())}
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <button
                onClick={() => window.print()}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Download Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory; 