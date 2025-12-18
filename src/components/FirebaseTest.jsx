import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import paymentService from '../services/paymentService';

const FirebaseTest = () => {
  const [user, setUser] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      console.log('FirebaseTest - Auth state changed:', currentUser?.uid);
    });

    return () => unsubscribe();
  }, []);

  const addTestResult = (test, result, error = null) => {
    setTestResults(prev => [...prev, {
      test,
      result,
      error,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);

    try {
      // Test 1: Check if user is authenticated
      addTestResult('User Authentication', user ? `Authenticated: ${user.uid}` : 'Not authenticated');

      if (!user) {
        addTestResult('Firebase Connection', 'Cannot test without authentication');
        return;
      }

      // Test 2: Check Firebase connection
      try {
        const testDoc = await getDoc(doc(db, 'test', 'connection'));
        addTestResult('Firebase Connection', 'Connected successfully');
      } catch (error) {
        addTestResult('Firebase Connection', 'Failed', error.message);
      }

      // Test 3: Check user document exists
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        addTestResult('User Document', userDoc.exists() ? 'Exists' : 'Does not exist');
      } catch (error) {
        addTestResult('User Document', 'Error checking', error.message);
      }

      // Test 4: Test payment service
      try {
        const subscription = await paymentService.getUserSubscription(user.uid);
        addTestResult('Payment Service', subscription ? 'Working' : 'Failed');
      } catch (error) {
        addTestResult('Payment Service', 'Error', error.message);
      }

      // Test 5: Test payment history
      try {
        const history = await paymentService.getPaymentHistory(user.uid);
        addTestResult('Payment History', `Found ${history.length} payments`);
      } catch (error) {
        addTestResult('Payment History', 'Error', error.message);
      }

    } catch (error) {
      addTestResult('Overall Test', 'Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const createTestUser = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const testUserData = {
        currentPlan: 'free',
        planName: 'Free Plan',
        subscriptionStatus: 'active',
        startDate: new Date(),
        endDate: null,
        lastPayment: null,
        paymentHistory: [],
        userEmail: user.email,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'users', user.uid), testUserData);
      addTestResult('Create Test User', 'Success');
      
      // Refresh tests
      setTimeout(runTests, 1000);
    } catch (error) {
      addTestResult('Create Test User', 'Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Firebase Connection Test</h2>
        
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={runTests}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Running Tests...' : 'Run Tests'}
            </button>
            
            {user && (
              <button
                onClick={createTestUser}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Create Test User
              </button>
            )}
          </div>

          <div className="text-sm text-gray-600">
            <p><strong>Current User:</strong> {user ? user.uid : 'Not signed in'}</p>
            <p><strong>User Email:</strong> {user ? user.email : 'N/A'}</p>
          </div>
        </div>

        {/* Test Results */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">Test Results:</h3>
          
          {testResults.length === 0 ? (
            <p className="text-gray-500">No tests run yet. Click "Run Tests" to start.</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-800">{result.test}:</span>
                    <span className={`ml-2 ${
                      result.error ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {result.result}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{result.timestamp}</span>
                </div>
                {result.error && (
                  <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                    Error: {result.error}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Debug Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Debug Information:</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Firebase Config:</strong> {db ? 'Loaded' : 'Not loaded'}</p>
            <p><strong>Auth:</strong> {auth ? 'Loaded' : 'Not loaded'}</p>
            <p><strong>User State:</strong> {user ? 'Authenticated' : 'Not authenticated'}</p>
            <p><strong>Payment Service:</strong> {paymentService ? 'Loaded' : 'Not loaded'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseTest; 