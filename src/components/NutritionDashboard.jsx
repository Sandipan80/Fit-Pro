import React, { useState, useEffect } from 'react';
import ProteinTracker from './ProteinTracker';

const NutritionDashboard = ({ routing }) => {
  const [activeTab, setActiveTab] = useState('protein');
  
  // Use the global authentication state from routing
  const isAuthenticated = routing?.isAuthenticated || false;
  
  // Debug authentication state
  useEffect(() => {
    console.log('NutritionDashboard - Authentication state:', isAuthenticated);
  }, [isAuthenticated]);
  
  // Prompt for non-logged in users
  if (!isAuthenticated) {
    return (
      <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-2xl font-bold text-indigo-800 mb-4">Nutrition Dashboard</h2>
        <p className="text-gray-700 mb-4">
          Track your nutrition, set goals, and improve your fitness results with our comprehensive nutrition tools.
        </p>
        <button
          onClick={() => {
            if (routing && routing.navigateTo) {
              routing.navigateTo('login');
            } else {
              window.location.hash = '#login';
            }
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Sign In to Get Started
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
      {/* Tab navigation */}
      <div className="bg-indigo-50 px-4 flex border-b">
        <button
          onClick={() => setActiveTab('protein')}
          className={`py-3 px-4 font-medium text-sm focus:outline-none ${
            activeTab === 'protein'
              ? 'text-indigo-700 border-b-2 border-indigo-700'
              : 'text-gray-600 hover:text-indigo-600'
          }`}
        >
          Protein Tracking
        </button>
        <button
          onClick={() => setActiveTab('calories')}
          className={`py-3 px-4 font-medium text-sm focus:outline-none ${
            activeTab === 'calories'
              ? 'text-indigo-700 border-b-2 border-indigo-700'
              : 'text-gray-600 hover:text-indigo-600'
          }`}
        >
          Calories
        </button>
        <button
          onClick={() => setActiveTab('hydration')}
          className={`py-3 px-4 font-medium text-sm focus:outline-none ${
            activeTab === 'hydration'
              ? 'text-indigo-700 border-b-2 border-indigo-700'
              : 'text-gray-600 hover:text-indigo-600'
          }`}
        >
          Hydration
        </button>
      </div>
      
      {/* Tab content */}
      <div className="p-1">
        {activeTab === 'protein' && (
          <ProteinTracker routing={routing} />
        )}
        
        {activeTab === 'calories' && (
          <div className="bg-gradient-to-r from-green-100 to-teal-100 p-6 rounded-xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-teal-800">Calorie Tracking</h2>
              <span className="text-teal-700 text-sm font-medium bg-teal-100 px-3 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
            
            <p className="text-gray-700 mb-4">
              Our calorie tracking feature is currently under development. 
              Soon you'll be able to track your daily calorie intake, set goals based on your activity level,
              and get detailed breakdowns of your macronutrient consumption.
            </p>
            
            <div className="text-center">
              <button
                disabled
                className="inline-block bg-gray-400 text-white px-6 py-2 rounded-md cursor-not-allowed"
              >
                Feature Coming Soon
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'hydration' && (
          <div className="bg-gradient-to-r from-blue-100 to-cyan-100 p-6 rounded-xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-cyan-800">Hydration Tracking</h2>
              <span className="text-cyan-700 text-sm font-medium bg-cyan-100 px-3 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
            
            <p className="text-gray-700 mb-4">
              Stay tuned for our hydration tracking feature. 
              We're working on tools to help you monitor your daily water intake, 
              set reminders, and ensure you stay properly hydrated for optimal performance and recovery.
            </p>
            
            <div className="text-center">
              <button
                disabled
                className="inline-block bg-gray-400 text-white px-6 py-2 rounded-md cursor-not-allowed"
              >
                Feature Coming Soon
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NutritionDashboard; 