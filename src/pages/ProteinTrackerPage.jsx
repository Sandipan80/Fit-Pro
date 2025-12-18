import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getNutritionRecommendation, getDailyNutritionLog, addFoodEntry, searchFoods } from '../utils/api';
import syncService from '../utils/syncService';

const ProteinTrackerPage = ({ routing }) => {
  console.log('[ProteinTrackerPage] Render:', {
    hash: window.location.hash,
    currentPage: routing?.currentPage,
    isAuthenticated: routing?.isAuthenticated,
    isLoading: routing?.isLoading
  });
  const [nutritionData, setNutritionData] = useState({
    recommended: 0,
    current: 0,
    weight: 0,
    activityLevel: 'moderate',
    goal: 'maintenance'
  });
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
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [servingSize, setServingSize] = useState(1);
  const [mealType, setMealType] = useState('snack');
  const [activeTab, setActiveTab] = useState('summary');

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

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch protein recommendation data
      const recommendationResponse = await getNutritionRecommendation();
      
      // Fetch nutrition log data
      const today = new Date().toISOString().split('T')[0];
      const logResponse = await getDailyNutritionLog(today);
      
      if (recommendationResponse.success && recommendationResponse.data) {
        setNutritionData(recommendationResponse.data);
      }
      
      if (logResponse.success && logResponse.data) {
        setNutritionLog({
          foodEntries: logResponse.data.foodEntries || [],
          proteinTarget: logResponse.data.proteinTarget || recommendationResponse.data?.recommended || 0,
          totalProtein: logResponse.data.totalProtein || 0,
          totalCalories: logResponse.data.totalCalories || 0,
          totalCarbs: logResponse.data.totalCarbs || 0,
          totalFat: logResponse.data.totalFat || 0
        });
      }
      
      // Ensure nutritionData.current is synced with nutritionLog.totalProtein
      if (recommendationResponse.success && logResponse.success) {
        const currentProtein = logResponse.data.totalProtein || 0;
        
        if (recommendationResponse.data.current !== currentProtein) {
          setNutritionData(prev => ({
            ...prev,
            current: currentProtein
          }));
        }
      }
    } catch (err) {
      setError('Error connecting to the server');
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

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
        
        setNutritionData(prev => ({
          ...prev,
            current: totals.protein
        }));
      }
      };
      
      loadSharedFoodLog();
    }
  }, [isAuthenticated]); // Only depend on authentication status

  // Search foods
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

      setIsSearching(true);
    try {
      const results = await searchFoods(searchTerm);
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Add food entry
  const handleAddFood = async () => {
    if (!selectedFood) return;
    
    try {
      const foodData = {
        name: selectedFood.name,
        protein: Math.round(selectedFood.protein * servingSize * 10) / 10,
        calories: Math.round(selectedFood.calories * servingSize * 10) / 10,
        carbs: Math.round((selectedFood.carbs || 0) * servingSize * 10) / 10,
        fat: Math.round((selectedFood.fat || 0) * servingSize * 10) / 10,
        servingSize: servingSize,
        mealType: mealType
      };
      
      // Use sync service to add food
      syncService.addFoodToLog(foodData);
      
      // Update local state
      const updatedFoodLog = syncService.getCurrentFoodLog();
      const totals = syncService.calculateTotals(updatedFoodLog);
      
      setNutritionLog(prev => ({
        ...prev,
        foodEntries: updatedFoodLog,
        totalProtein: totals.protein,
        totalCalories: totals.calories,
        totalCarbs: totals.carbs,
        totalFat: totals.fat
      }));
      
      // Update nutrition data current protein
      setNutritionData(prev => ({
        ...prev,
        current: totals.protein
      }));
      
      // Reset form
      setSelectedFood(null);
      setServingSize(1);
      setMealType('snack');
      
    } catch (err) {
      console.error('Add food error:', err);
    }
  };

  // Calculate percentage of daily goal
  const calculatePercentage = () => {
    if (!nutritionData.recommended || nutritionData.recommended <= 0) return 0;
    const percent = (nutritionData.current / nutritionData.recommended) * 100;
    return Math.min(100, Math.round(percent));
  };

  // Remove food entry
  const handleRemoveFood = (foodId) => {
    // Use sync service to remove food
    syncService.removeFoodFromLog(foodId);
    
    // Update local state
    const updatedFoodLog = syncService.getCurrentFoodLog();
    const totals = syncService.calculateTotals(updatedFoodLog);
    
    setNutritionLog(prev => ({
      ...prev,
      foodEntries: updatedFoodLog,
      totalProtein: totals.protein,
      totalCalories: totals.calories,
      totalCarbs: totals.carbs,
      totalFat: totals.fat
    }));
    
    // Update nutrition data current protein
    setNutritionData(prev => ({
      ...prev,
      current: totals.protein
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar routing={routing} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-6 rounded-xl shadow-md mb-8">
            <h2 className="text-2xl font-bold text-indigo-800 mb-4">Track Your Protein Intake</h2>
            <p className="text-gray-700 mb-4">
              Sign in to track your daily protein intake and get personalized recommendations based on your fitness goals.
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
        <h1 className="text-3xl font-bold text-indigo-800 mb-6">Protein Tracker</h1>
        
        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : (
          <>
            {/* Summary Card */}
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-6 rounded-xl shadow-md mb-8">
              <h2 className="text-2xl font-bold text-indigo-800 mb-4">Today's Protein Intake</h2>
              
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Daily Goal: {nutritionData.recommended}g</span>
                  <span className="font-semibold text-indigo-800">{calculatePercentage()}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-4 rounded-full"
                    style={{ width: `${calculatePercentage()}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-gray-500 text-sm">Current</p>
                  <p className="text-2xl font-bold text-indigo-700">{nutritionData.current}g</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-gray-500 text-sm">Remaining</p>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.max(0, nutritionData.recommended - nutritionData.current)}g
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-gray-500 text-sm">Weight</p>
                  <p className="text-2xl font-bold text-indigo-700">{nutritionData.weight} kg</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-gray-500 text-sm">Goal</p>
                  <p className="text-2xl font-bold text-indigo-700 capitalize">{nutritionData.goal}</p>
                </div>
              </div>
            </div>
            
            {/* Tabs Navigation */}
            <div className="bg-white rounded-lg shadow-md mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('summary')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'summary' 
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Summary
                </button>
                <button
                    onClick={() => setActiveTab('add')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'add'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Add Food
                </button>
                <button
                    onClick={() => setActiveTab('log')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'log'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Food Log
                </button>
              </nav>
            </div>
            
            {/* Tab Content */}
              <div className="p-6">
            {activeTab === 'summary' && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Nutrition Overview</h2>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
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
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 className="font-medium mb-3">Protein Requirements</h3>
                  <p className="text-gray-700 mb-2">
                    Based on your weight of {nutritionData.weight}kg and your goal of "{nutritionData.goal}", 
                    your daily recommended protein intake is {nutritionData.recommended}g.
                  </p>
                  <p className="text-gray-700">
                    This is approximately {(nutritionData.recommended / nutritionData.weight).toFixed(1)}g of protein per kg of body weight.
                  </p>
                </div>
              </div>
            )}
            
                {activeTab === 'add' && (
                  <div className="space-y-6">
                    {/* Search Section */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h2 className="text-xl font-semibold mb-4">Search Foods</h2>
                      <div className="flex gap-2 mb-4">
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search for foods..."
                          className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          onClick={handleSearch}
                          disabled={isSearching}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                          {isSearching ? 'Searching...' : 'Search'}
                        </button>
                      </div>
                      
                      {searchResults.length > 0 && (
                        <div className="space-y-2">
                          {searchResults.map((food) => (
                            <div
                              key={food._id}
                              onClick={() => setSelectedFood(food)}
                              className={`p-3 border rounded-md cursor-pointer transition-colors ${
                                selectedFood?._id === food._id
                                  ? 'border-indigo-500 bg-indigo-50'
                                  : 'border-gray-200 hover:border-indigo-300'
                              }`}
                            >
                              <div className="font-medium">{food.name}</div>
                              <div className="text-sm text-gray-600">
                                {food.protein}g protein • {food.calories} calories
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Add Food Section */}
                    {selectedFood && (
                      <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Add Food</h2>
                        
                        <div className="mb-4">
                          <h3 className="font-medium mb-2">Selected Food: {selectedFood.name}</h3>
                    <div className="bg-gray-100 p-3 rounded-md mb-4">
                      <p className="text-sm mb-2">Nutrition (based on servings):</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Protein:</span>
                          <span className="font-medium ml-1">
                            {Math.round(selectedFood.protein * servingSize * 10) / 10}g
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Calories:</span>
                          <span className="font-medium ml-1">
                            {Math.round(selectedFood.calories * servingSize * 10) / 10}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Carbs:</span>
                          <span className="font-medium ml-1">
                            {Math.round((selectedFood.carbs || 0) * servingSize * 10) / 10}g
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Fat:</span>
                          <span className="font-medium ml-1">
                            {Math.round((selectedFood.fat || 0) * servingSize * 10) / 10}g
                          </span>
                        </div>
                      </div>
                    </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Serving Size</label>
                            <input
                              type="number"
                              value={servingSize}
                              onChange={(e) => setServingSize(parseFloat(e.target.value) || 1)}
                              min="0.1"
                              step="0.1"
                              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
                            <select
                              value={mealType}
                              onChange={(e) => setMealType(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="breakfast">Breakfast</option>
                              <option value="lunch">Lunch</option>
                              <option value="dinner">Dinner</option>
                              <option value="snack">Snack</option>
                            </select>
                          </div>
                          <div className="flex items-end">
                      <button
                        onClick={handleAddFood}
                              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        Add to Log
                      </button>
                          </div>
                        </div>
                    </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'log' && (
              <div className="bg-white rounded-lg shadow-md p-6">
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
                                  <button
                              onClick={() => handleRemoveFood(food.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                                  >
                              Remove
                                  </button>
                          </div>
                        ))}
                        </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProteinTrackerPage; 