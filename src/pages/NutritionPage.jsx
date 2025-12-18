import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getNutritionRecommendation, getDailyNutritionLog } from '../utils/api';
import syncService from '../utils/syncService';

const NutritionPage = ({ routing }) => {
  const [nutritionLog, setNutritionLog] = useState({
    foodEntries: [],
    proteinTarget: 0,
    totalProtein: 0,
    totalCalories: 0,
    totalCarbs: 0,
    totalFat: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in
  const isAuthenticated = routing?.isAuthenticated || false;

  // Fetch data on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Load shared food log from sync service - simplified to prevent circular dependencies
  useEffect(() => {
    if (isAuthenticated) {
      const loadSharedFoodLog = () => {
        const currentFoodLog = syncService.getCurrentFoodLog();
        const currentProtein = syncService.getCurrentProteinIntake();
        
        if (currentFoodLog.length > 0) {
          const totals = syncService.calculateTotals(currentFoodLog);
          
          setNutritionLog(prev => ({
            ...prev,
            foodEntries: currentFoodLog,
            totalProtein: totals.protein,
            totalCalories: totals.calories,
            totalCarbs: totals.carbs,
            totalFat: totals.fat
          }));
        }
      };
      
      loadSharedFoodLog();
    }
  }, [isAuthenticated]); // Only depend on authentication status

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch nutrition log data
      const today = new Date().toISOString().split('T')[0];
      const logResponse = await getDailyNutritionLog(today);
      
      if (logResponse.success && logResponse.data) {
        setNutritionLog({
          foodEntries: logResponse.data.foodEntries || [],
          proteinTarget: logResponse.data.proteinTarget || 0,
          totalProtein: logResponse.data.totalProtein || 0,
          totalCalories: logResponse.data.totalCalories || 0,
          totalCarbs: logResponse.data.totalCarbs || 0,
          totalFat: logResponse.data.totalFat || 0
        });
      }
    } catch (err) {
      setError('Error connecting to the server');
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar routing={routing} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-6 rounded-xl shadow-md mb-8">
            <h2 className="text-2xl font-bold text-indigo-800 mb-4">Nutrition Tracking</h2>
            <p className="text-gray-700 mb-4">
              Sign in to track your nutrition and get personalized recommendations based on your fitness goals.
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
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar routing={routing} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/2 mb-4"></div>
            <div className="h-20 bg-gray-300 rounded mb-4"></div>
            <div className="h-40 bg-gray-300 rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
    }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar routing={routing} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-indigo-800 mb-6">Nutrition Tracking</h1>
        
        {loading ? (
          <div className="animate-pulse flex flex-col gap-4">
            <div className="h-8 bg-gray-300 rounded w-1/2"></div>
            <div className="h-20 bg-gray-300 rounded"></div>
            <div className="h-40 bg-gray-300 rounded"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : (
          <>
            {/* Protein Progress */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Today's Protein Progress</h2>
              
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span>Goal: {nutritionLog.proteinTarget}g</span>
                  <span>
                    {nutritionLog.totalProtein}g / {nutritionLog.proteinTarget}g
                    ({nutritionLog.proteinTarget > 0 
                      ? Math.round((nutritionLog.totalProtein / nutritionLog.proteinTarget) * 100) 
                      : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-4 rounded-full"
                    style={{ width: `${nutritionLog.proteinTarget > 0 
                      ? Math.min(100, Math.round((nutritionLog.totalProtein / nutritionLog.proteinTarget) * 100))
                      : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-indigo-50 p-3 rounded-md">
                  <p className="text-xs text-gray-500">Protein</p>
                  <p className="text-lg font-bold">{nutritionLog.totalProtein}g</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-md">
                  <p className="text-xs text-gray-500">Calories</p>
                  <p className="text-lg font-bold">{nutritionLog.totalCalories || 0}</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-md">
                  <p className="text-xs text-gray-500">Carbs</p>
                  <p className="text-lg font-bold">{nutritionLog.totalCarbs || 0}g</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-md">
                  <p className="text-xs text-gray-500">Fat</p>
                  <p className="text-lg font-bold">{nutritionLog.totalFat || 0}g</p>
                </div>
              </div>
            </div>
            
            {/* Food Log */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Today's Food Log</h2>
              
              {nutritionLog.foodEntries.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No foods logged today. Add some foods to get started!</p>
              ) : (
                <div className="space-y-3">
                  {nutritionLog.foodEntries.map((food) => (
                    <div key={food.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-md">
                      <div>
                        <div className="font-medium">{food.name}</div>
                        <div className="text-sm text-gray-600">
                          {food.protein}g protein • {food.calories} calories
                          {food.servingSize && food.servingSize !== 1 && ` • ${food.servingSize} servings`}
                      </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    if (routing && routing.navigateTo) {
                      routing.navigateTo('protein');
                    } else {
                      window.location.hash = '#protein';
                    }
                  }}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Add Food to Log
                </button>
                                <button
                  onClick={() => {
                    if (routing && routing.navigateTo) {
                      routing.navigateTo('track-progress');
                    } else {
                      window.location.hash = '#track-progress';
                    }
                  }}
                  className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
                                >
                  View Progress
                                </button>
                              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default NutritionPage; 