import React, { useState, useEffect } from 'react';
import { getNutritionRecommendation, updateUserProfile } from '../utils/api';
import { auth, db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { usePersistentFilters } from '../utils/filterStorage';
import syncService from '../utils/syncService';
import { motion, AnimatePresence } from 'framer-motion';

// Common food items with protein content
const commonFoods = [
  // High Protein Foods
  { name: 'Chicken Breast (100g)', protein: 31, calories: 165, category: 'protein' },
  { name: 'Salmon (100g)', protein: 25, calories: 208, category: 'protein' },
  { name: 'Eggs (2 large)', protein: 12, calories: 140, category: 'protein' },
  { name: 'Greek Yogurt (170g)', protein: 17, calories: 100, category: 'dairy' },
  { name: 'Cottage Cheese (100g)', protein: 11, calories: 98, category: 'dairy' },
  { name: 'Tuna (100g)', protein: 26, calories: 116, category: 'protein' },
  { name: 'Lean Beef (100g)', protein: 26, calories: 250, category: 'protein' },
  { name: 'Turkey Breast (100g)', protein: 29, calories: 157, category: 'protein' },
  { name: 'Pork Chop (100g)', protein: 25, calories: 231, category: 'protein' },
  { name: 'Shrimp (100g)', protein: 24, calories: 99, category: 'protein' },
  { name: 'Tofu (100g)', protein: 8, calories: 76, category: 'vegetarian' },
  { name: 'Lentils (100g cooked)', protein: 9, calories: 116, category: 'vegetarian' },
  { name: 'Chickpeas (100g cooked)', protein: 9, calories: 164, category: 'vegetarian' },
  { name: 'Quinoa (100g cooked)', protein: 4, calories: 120, category: 'vegetarian' },
  { name: 'Almonds (30g)', protein: 6, calories: 164, category: 'nuts' },
  { name: 'Peanut Butter (2 tbsp)', protein: 8, calories: 188, category: 'nuts' },
  { name: 'Milk (240ml)', protein: 8, calories: 103, category: 'dairy' },
  { name: 'Cheese (30g)', protein: 7, calories: 113, category: 'dairy' },
  { name: 'Protein Shake (1 scoop)', protein: 25, calories: 120, category: 'supplements' },
  { name: 'Whey Protein (30g)', protein: 24, calories: 113, category: 'supplements' },
  
  // Fruits
  { name: 'Apple (1 medium)', protein: 0.5, calories: 95, category: 'fruits' },
  { name: 'Banana (1 medium)', protein: 1.3, calories: 105, category: 'fruits' },
  { name: 'Orange (1 medium)', protein: 1.2, calories: 62, category: 'fruits' },
  { name: 'Strawberries (100g)', protein: 0.7, calories: 32, category: 'fruits' },
  { name: 'Blueberries (100g)', protein: 0.7, calories: 57, category: 'fruits' },
  { name: 'Grapes (100g)', protein: 0.6, calories: 69, category: 'fruits' },
  { name: 'Mango (1 medium)', protein: 1.1, calories: 135, category: 'fruits' },
  { name: 'Pineapple (100g)', protein: 0.5, calories: 50, category: 'fruits' },
  { name: 'Avocado (1 medium)', protein: 2.9, calories: 160, category: 'fruits' },
  { name: 'Kiwi (1 medium)', protein: 1.1, calories: 42, category: 'fruits' },
  
  // Indian Dishes
  { name: 'Dal (100g cooked)', protein: 6, calories: 116, category: 'indian dishes' },
  { name: 'Rajma (100g cooked)', protein: 8, calories: 127, category: 'indian dishes' },
  { name: 'Chana Masala (100g)', protein: 7, calories: 164, category: 'indian dishes' },
  { name: 'Paneer (100g)', protein: 18, calories: 265, category: 'indian dishes' },
  { name: 'Tandoori Chicken (100g)', protein: 25, calories: 200, category: 'indian dishes' },
  { name: 'Butter Chicken (100g)', protein: 20, calories: 280, category: 'indian dishes' },
  { name: 'Fish Curry (100g)', protein: 22, calories: 180, category: 'indian dishes' },
  { name: 'Egg Curry (100g)', protein: 12, calories: 150, category: 'indian dishes' },
  { name: 'Methi Paratha (1 piece)', protein: 4, calories: 120, category: 'indian dishes' },
  { name: 'Roti (1 piece)', protein: 3, calories: 80, category: 'indian dishes' },
  { name: 'Idli (2 pieces)', protein: 4, calories: 100, category: 'indian dishes' },
  { name: 'Dosa (1 piece)', protein: 3, calories: 120, category: 'indian dishes' },
  { name: 'Upma (100g)', protein: 4, calories: 150, category: 'indian dishes' },
  { name: 'Poha (100g)', protein: 3, calories: 130, category: 'indian dishes' },
  { name: 'Biryani (100g)', protein: 8, calories: 250, category: 'indian dishes' },
  { name: 'Kebab (100g)', protein: 18, calories: 220, category: 'indian dishes' },
  { name: 'Samosa (1 piece)', protein: 4, calories: 200, category: 'indian dishes' },
  { name: 'Pakora (100g)', protein: 6, calories: 180, category: 'indian dishes' },
  { name: 'Raita (100g)', protein: 3, calories: 80, category: 'indian dishes' },
  { name: 'Lassi (240ml)', protein: 4, calories: 120, category: 'indian dishes' },
  
  // Additional Proteins
  { name: 'Lamb (100g)', protein: 25, calories: 294, category: 'protein' },
  { name: 'Duck (100g)', protein: 23, calories: 337, category: 'protein' },
  { name: 'Cod (100g)', protein: 20, calories: 82, category: 'protein' },
  { name: 'Sardines (100g)', protein: 24, calories: 208, category: 'protein' },
  { name: 'Mackerel (100g)', protein: 19, calories: 305, category: 'protein' },
  
  // Additional Vegetarian
  { name: 'Black Beans (100g cooked)', protein: 8, calories: 132, category: 'vegetarian' },
  { name: 'Kidney Beans (100g cooked)', protein: 8, calories: 127, category: 'vegetarian' },
  { name: 'Edamame (100g)', protein: 11, calories: 121, category: 'vegetarian' },
  { name: 'Tempeh (100g)', protein: 20, calories: 192, category: 'vegetarian' },
  { name: 'Seitan (100g)', protein: 25, calories: 370, category: 'vegetarian' },
  
  // Additional Dairy
  { name: 'Yogurt (170g)', protein: 9, calories: 100, category: 'dairy' },
  { name: 'Kefir (240ml)', protein: 11, calories: 104, category: 'dairy' },
  { name: 'Ricotta (100g)', protein: 11, calories: 174, category: 'dairy' },
  { name: 'Feta (100g)', protein: 14, calories: 264, category: 'dairy' },
  
  // Additional Nuts & Seeds
  { name: 'Walnuts (30g)', protein: 4, calories: 185, category: 'nuts' },
  { name: 'Cashews (30g)', protein: 5, calories: 157, category: 'nuts' },
  { name: 'Pistachios (30g)', protein: 6, calories: 159, category: 'nuts' },
  { name: 'Chia Seeds (30g)', protein: 5, calories: 138, category: 'nuts' },
  { name: 'Flax Seeds (30g)', protein: 5, calories: 150, category: 'nuts' },
  { name: 'Pumpkin Seeds (30g)', protein: 9, calories: 158, category: 'nuts' },
  { name: 'Sunflower Seeds (30g)', protein: 6, calories: 164, category: 'nuts' }
];

const ProteinTracker = ({ routing }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [proteinData, setProteinData] = useState(null);
  // New state for food log
  const [foodName, setFoodName] = useState('');
  const [foodProtein, setFoodProtein] = useState('');
  const [foodLog, setFoodLog] = useState([]);
  const [addError, setAddError] = useState('');
  const [showCommonFoods, setShowCommonFoods] = useState(false);
  
  // Use persistent filters for search and category
  const [filters, updateFilters, resetFilters] = usePersistentFilters('proteinTracker', {
    searchTerm: '',
    selectedCategory: 'all'
  });
  
  const { searchTerm, selectedCategory } = filters;
  
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileData, setProfileData] = useState({
    weight: 70,
    height: 175,
    age: 30,
    gender: 'male',
    activityLevel: 'moderate',
    goal: 'maintenance'
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isNewDay, setIsNewDay] = useState(false);

  // Use the global authentication state from routing
  const isAuthenticated = routing?.isAuthenticated || false;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.02,
      y: -5,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    tap: {
      scale: 0.95
    }
  };

  const progressVariants = {
    hidden: { width: 0 },
    visible: {
      width: "100%",
      transition: {
        duration: 1,
        ease: "easeOut"
      }
    }
  };

  // Get unique categories
  const categories = ['all', ...new Set(commonFoods.map(food => food.category))];

  // Filter foods based on search term and category
  const filteredFoods = commonFoods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Check if it's a new day and reset if needed
  useEffect(() => {
    const checkNewDay = () => {
      const today = new Date().toISOString().split('T')[0];
      const lastCheck = localStorage.getItem('lastDayCheck');
      
      if (lastCheck !== today) {
        setIsNewDay(true);
        localStorage.setItem('lastDayCheck', today);
        
        // Clear any stale data
        syncService.clearCache();
      }
    };
    
    checkNewDay();
  }, []);

  // Listen for food log updates from other components
  useEffect(() => {
    const handleFoodLogUpdate = (event) => {
      const { foodLog: updatedFoodLog } = event.detail || {};
      if (updatedFoodLog) {
        setFoodLog(updatedFoodLog);
        
        // Update protein data with current intake
        if (proteinData) {
          const currentProtein = syncService.getCurrentProteinIntake();
          setProteinData(prev => ({
            ...prev,
            current: currentProtein
          }));
        }
      }
    };

    const handleProteinDataUpdate = (event) => {
      // Handle both syncService events and window events
      let eventData;
      
      if (event.detail) {
        // Window event
        eventData = event.detail;
    } else {
        // SyncService event - event is the data directly
        eventData = event;
      }
      
      const { current } = eventData || {};
      
      if (current !== undefined && proteinData) {
        setProteinData(prev => ({
          ...prev,
          current: current
        }));
      }
    };

    // Add event listeners
    window.addEventListener('foodLogUpdated', handleFoodLogUpdate);
    window.addEventListener('proteinDataUpdated', handleProteinDataUpdate);
    
    // Also listen to sync service events
    syncService.addEventListener(syncService.EVENTS.FOOD_LOG_UPDATED, handleFoodLogUpdate);
    syncService.addEventListener(syncService.EVENTS.PROTEIN_DATA_UPDATED, handleProteinDataUpdate);
    
    return () => {
      window.removeEventListener('foodLogUpdated', handleFoodLogUpdate);
      window.removeEventListener('proteinDataUpdated', handleProteinDataUpdate);
      syncService.removeEventListener(syncService.EVENTS.FOOD_LOG_UPDATED, handleFoodLogUpdate);
      syncService.removeEventListener(syncService.EVENTS.PROTEIN_DATA_UPDATED, handleProteinDataUpdate);
    };
  }, [proteinData]);

  // Fetch protein data on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchProteinData();
      } else {
      setLoading(false);
    }
  }, [isAuthenticated]); // Only depend on isAuthenticated, not on every render

  const fetchProteinData = async () => {
    try {
      setLoading(true);
      
      // Use sync service to fetch user profile from Firebase
      const firebaseProfileData = await syncService.fetchUserProfileFromFirebase();
      
      if (firebaseProfileData) {
        // Use Firebase profile data to update local profile
        setProfileData(firebaseProfileData);
        
        // Get nutrition recommendation using Firebase profile data
        const response = await getNutritionRecommendation();
        if (response.success) {
          // Get current protein intake from sync service
          const currentProtein = syncService.getCurrentProteinIntake();
          const currentFoodLog = syncService.getCurrentFoodLog();
          
          // Update food log state
          if (currentFoodLog.length > 0) {
            setFoodLog(currentFoodLog);
          }
          
          // Update protein data with current intake
          const updatedProteinData = {
            ...response.data,
            current: currentProtein
          };
          setProteinData(updatedProteinData);
          
          // Sync protein intake data
          syncService.syncProteinIntake(currentProtein, currentFoodLog);
        } else {
          setError(response.message || 'Failed to fetch protein data');
        }
      } else {
        // Fallback to existing API if Firebase profile not available
        console.log('Falling back to existing API for profile data');
        const response = await getNutritionRecommendation();
        if (response.success) {
          // Get current protein intake from sync service
          const currentProtein = syncService.getCurrentProteinIntake();
          const currentFoodLog = syncService.getCurrentFoodLog();
          
          // Update food log state
          if (currentFoodLog.length > 0) {
            setFoodLog(currentFoodLog);
          }
          
          // Update protein data with current intake
          const updatedProteinData = {
            ...response.data,
            current: currentProtein
          };
          setProteinData(updatedProteinData);
          
          // Sync protein intake data
          syncService.syncProteinIntake(currentProtein, currentFoodLog);
        } else {
          setError(response.message || 'Failed to fetch protein data');
        }
      }
    } catch (err) {
      setError('Error connecting to the server. Please try again later.');
      console.error('Protein tracker error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      // Use sync service to sync profile data
      const updatedProteinData = await syncService.syncProfileData(profileData, 'proteinTracker');
      
      if (updatedProteinData) {
        setProteinData(updatedProteinData);
        setShowProfileForm(false);
        
        // Show success message
        alert('Profile updated successfully! Your protein requirements have been recalculated.');
      } else {
        setError('Failed to update profile');
      }
    } catch (err) {
      setError('Error updating profile. Please try again.');
      console.error('Profile update error:', err);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Calculate percentage of daily goal
  const calculatePercentage = () => {
    if (!proteinData || !proteinData.recommended || proteinData.recommended <= 0) return 0;
    const percent = (getCurrentProtein() / proteinData.recommended) * 100;
    return Math.min(100, Math.round(percent));
  };

  // Check if protein intake exceeds recommendation
  const isExceedingProtein = () => {
    if (!proteinData || !proteinData.recommended) return false;
    return getCurrentProtein() > proteinData.recommended;
  };

  // Get warning message based on excess amount
  const getWarningMessage = () => {
    if (!isExceedingProtein()) return null;
    const excess = getCurrentProtein() - proteinData.recommended;
    if (excess <= 10) {
      return "You're slightly over your protein goal. Consider reducing intake for the rest of the day.";
    } else if (excess <= 30) {
      return "You're moderately over your protein goal. High protein intake may strain your kidneys.";
    } else {
      return "You're significantly over your protein goal. Excessive protein can cause health issues. Consider consulting a nutritionist.";
    }
  };

  // Get current protein (use sync service)
  const getCurrentProtein = () => {
    return syncService.getCurrentProteinIntake();
  };

  // Handle adding food manually
  const handleAddFood = (e) => {
    e.preventDefault();
    
    if (!foodName.trim() || !foodProtein) {
      setAddError('Please enter both food name and protein content');
      return;
    }

    const proteinValue = parseFloat(foodProtein);
    if (isNaN(proteinValue) || proteinValue <= 0) {
      setAddError('Please enter a valid protein amount');
      return;
    }
    
    const newFood = {
      name: foodName.trim(),
      protein: proteinValue,
      calories: 0, // Default value
      carbs: 0,
      fat: 0,
      mealType: 'snack'
    };

    // Use sync service to add food
    syncService.addFoodToLog(newFood);
    
    // Update local state
    setFoodLog(syncService.getCurrentFoodLog());
    
    // Update protein data
    const currentProtein = syncService.getCurrentProteinIntake();
    setProteinData(prev => ({
      ...prev,
      current: currentProtein
    }));

    // Reset form
    setFoodName('');
    setFoodProtein('');
    setAddError('');
  };

  // Handle adding food from common foods
  const handleAddCommonFood = (food) => {
    // Use sync service to add food
    syncService.addFoodToLog(food);
    
    // Update local state
    setFoodLog(syncService.getCurrentFoodLog());
    
    // Update protein data
    const currentProtein = syncService.getCurrentProteinIntake();
    setProteinData(prev => ({
      ...prev,
      current: currentProtein
    }));
  };

  // Handle removing food
  const handleRemoveFood = (foodId) => {
    // Use sync service to remove food
    syncService.removeFoodFromLog(foodId);
    
    // Update local state
    setFoodLog(syncService.getCurrentFoodLog());
    
    // Update protein data
    const currentProtein = syncService.getCurrentProteinIntake();
    setProteinData(prev => ({
      ...prev,
      current: currentProtein
    }));
  };

  // Navigate to protein tracker page
  const navigateToProteinTracker = () => {
    if (routing && routing.navigateTo) {
      routing.navigateTo('protein');
    } else {
      window.location.hash = '#protein';
    }
  };

  // Add food to log
  const addFoodToLog = (foodItem) => {
    // Use sync service to add food to log
    syncService.addFoodToLog(foodItem);
  };

  // Remove food from log
  const removeFoodFromLog = (foodId) => {
    // Use sync service to remove food from log
    syncService.removeFoodFromLog(foodId);
  };

  if (!isAuthenticated) {
    return (
      <motion.div 
        className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center">
          <motion.div 
            className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <span className="text-2xl">🥩</span>
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Track Your Protein Intake</h2>
          <p className="text-gray-600 mb-8 text-lg">
          Sign in to track your daily protein intake and get personalized recommendations based on your fitness goals.
        </p>
          <motion.button
          onClick={() => {
            if (routing && routing.navigateTo) {
              routing.navigateTo('login');
            } else {
              window.location.hash = '#login';
            }
          }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
        >
          Sign In to Get Started
          </motion.button>
      </div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <motion.div 
        className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
          {error}
        </div>
        <motion.button
          onClick={fetchProteinData} 
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Try Again
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Main Protein Tracking Card */}
      <motion.div 
        className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
        variants={cardVariants}
        whileHover="hover"
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            <span className="mr-3">🥩</span>
            Today's Protein Intake
          </h2>
          <div className="flex items-center gap-3">
          {isExceedingProtein() && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <span className="text-2xl">⚠️</span>
              </motion.div>
          )}
            <span className={`text-sm font-semibold px-4 py-2 rounded-full border ${
            isExceedingProtein() 
                ? 'text-red-700 bg-red-50 border-red-200' 
                : 'text-indigo-700 bg-indigo-50 border-indigo-200'
          }`}>
            {isExceedingProtein() ? 'Exceeded Goal' : `${calculatePercentage()}% of goal`}
        </span>
        </div>
      </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
            <motion.div 
              className={`h-6 rounded-full transition-all duration-500 ${
              isExceedingProtein() 
                ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                : 'bg-gradient-to-r from-indigo-500 to-purple-600'
            }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, calculatePercentage())}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
        </div>
      </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            className="text-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100"
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-gray-600 text-sm font-medium">Current</span>
            <p className={`text-3xl font-bold mt-2 ${isExceedingProtein() ? 'text-red-600' : 'text-indigo-700'}`}>
            {getCurrentProtein()}g
          </p>
          </motion.div>
          
          <motion.div 
            className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100"
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-gray-600 text-sm font-medium">Goal</span>
            <p className="text-3xl font-bold mt-2 text-purple-700">{proteinData?.recommended || 0}g</p>
          </motion.div>
          
          <motion.div 
            className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100"
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-gray-600 text-sm font-medium">Remaining</span>
            <p className={`text-3xl font-bold mt-2 ${isExceedingProtein() ? 'text-red-600' : 'text-green-600'}`}>
            {isExceedingProtein() 
              ? `+${Math.abs((proteinData?.recommended || 0) - getCurrentProtein())}g over`
              : `${Math.max(0, (proteinData?.recommended || 0) - getCurrentProtein())}g`
            }
          </p>
          </motion.div>
      </div>
      
      {/* Warning Message */}
        <AnimatePresence>
      {isExceedingProtein() && (
            <motion.div 
              className="mb-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
          <div className="flex items-start">
            <div className="flex-shrink-0">
                  <span className="text-2xl">⚠️</span>
            </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                Protein Intake Warning
              </h3>
                  <div className="text-red-700">
                <p>{getWarningMessage()}</p>
              </div>
            </div>
          </div>
            </motion.div>
      )}
        </AnimatePresence>
      </motion.div>

      {/* Quick Add Section */}
      <motion.div 
        className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
        variants={cardVariants}
        whileHover="hover"
      >
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="mr-3">➕</span>
          Quick Add Food
              </h3>
        
        {/* Manual Add Form */}
        <form onSubmit={handleAddFood} className="mb-6">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="Food name"
              className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            />
            <input
              type="number"
              value={foodProtein}
              onChange={(e) => setFoodProtein(e.target.value)}
              placeholder="Protein (g)"
              step="0.1"
              min="0"
              className="w-32 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            />
            <motion.button
              type="submit"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Add
            </motion.button>
            </div>
          {addError && <p className="text-red-600 text-sm">{addError}</p>}
        </form>

        {/* Common Foods */}
        <div>
          <motion.button
            onClick={() => setShowCommonFoods(!showCommonFoods)}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold mb-4 flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="mr-2">{showCommonFoods ? '▼' : '▶'}</span>
            {showCommonFoods ? 'Hide Common Foods' : 'Show Common Foods'}
          </motion.button>
          
          <AnimatePresence>
        {showCommonFoods && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
            {/* Search and Filter */}
                <div className="flex gap-4 mb-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => updateFilters({ searchTerm: e.target.value })}
                    placeholder="Search foods..."
                    className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => updateFilters({ selectedCategory: e.target.value })}
                    className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            
            {/* Food Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
              {filteredFoods.map((food, index) => (
                    <motion.button
                  key={index}
                  onClick={() => handleAddCommonFood(food)}
                      className="text-left p-4 border border-gray-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200 hover:shadow-md"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="font-semibold text-sm text-gray-800">{food.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{food.protein}g protein</div>
                    </motion.button>
              ))}
            </div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
      </motion.div>

      {/* Food Log */}
      <AnimatePresence>
      {foodLog.length > 0 && (
          <motion.div 
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
            variants={cardVariants}
            whileHover="hover"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="mr-3">📝</span>
              Today's Food Log
            </h3>
            <div className="space-y-3">
              {foodLog.map((food, index) => (
                <motion.div 
                  key={food.id} 
                  className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <div>
                    <span className="font-semibold text-gray-800">{food.name}</span>
                    <span className="text-gray-600 ml-3 font-medium">{food.protein}g protein</span>
                  </div>
                  <motion.button
                    onClick={() => handleRemoveFood(food.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-red-50 transition-all duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    Remove
                  </motion.button>
                </motion.div>
            ))}
        </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Profile Section */}
      <motion.div 
        className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
        variants={cardVariants}
        whileHover="hover"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="mr-3">⚙️</span>
            Personalized Protein Requirements
          </h3>
          <motion.button
            onClick={() => setShowProfileForm(!showProfileForm)}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-50 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showProfileForm ? 'Hide Profile' : 'Update Profile'}
          </motion.button>
        </div>
        
        <AnimatePresence mode="wait">
        {showProfileForm ? (
            <motion.form 
              key="form"
              onSubmit={handleProfileUpdate} 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  value={profileData.weight}
                  onChange={(e) => setProfileData({...profileData, weight: parseFloat(e.target.value) || 0})}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  min="30"
                  max="300"
                  step="0.1"
                  required
                />
              </div>
              <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Height (cm)</label>
                <input
                  type="number"
                  value={profileData.height}
                  onChange={(e) => setProfileData({...profileData, height: parseFloat(e.target.value) || 0})}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  min="100"
                  max="250"
                  step="0.1"
                  required
                />
              </div>
              <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  value={profileData.age}
                  onChange={(e) => setProfileData({...profileData, age: parseInt(e.target.value) || 0})}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  min="15"
                  max="100"
                  required
                />
              </div>
              <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                <select
                  value={profileData.gender}
                  onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Activity Level</label>
                <select
                  value={profileData.activityLevel}
                  onChange={(e) => setProfileData({...profileData, activityLevel: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="sedentary">Sedentary (Little or no exercise)</option>
                  <option value="light">Light (1-3 days/week)</option>
                  <option value="moderate">Moderate (3-5 days/week)</option>
                  <option value="active">Active (6-7 days/week)</option>
                  <option value="very_active">Very Active (Hard exercise, physical job)</option>
                </select>
              </div>
              <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Goal</label>
                <select
                  value={profileData.goal}
                  onChange={(e) => setProfileData({...profileData, goal: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="weight_loss">Weight Loss</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="muscle_gain">Muscle Gain</option>
                </select>
              </div>
            </div>
              <div className="flex gap-4">
                <motion.button
                type="submit"
                disabled={isUpdatingProfile}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
              >
                  {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
                </motion.button>
                <motion.button
                type="button"
                onClick={() => setShowProfileForm(false)}
                  className="bg-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-400 transition-all duration-300"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
              >
                Cancel
                </motion.button>
            </div>
            </motion.form>
        ) : (
            <motion.div 
              key="display"
              className="bg-gradient-to-r from-gray-50 to-indigo-50 p-6 rounded-xl border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-6">
                <div className="flex items-center">
                  <span className="text-gray-500 font-medium">Weight:</span>
                  <span className="font-semibold ml-2">{profileData.weight} kg</span>
              </div>
                <div className="flex items-center">
                  <span className="text-gray-500 font-medium">Height:</span>
                  <span className="font-semibold ml-2">{profileData.height} cm</span>
              </div>
                <div className="flex items-center">
                  <span className="text-gray-500 font-medium">Age:</span>
                  <span className="font-semibold ml-2">{profileData.age} years</span>
              </div>
                <div className="flex items-center">
                  <span className="text-gray-500 font-medium">Gender:</span>
                  <span className="font-semibold ml-2 capitalize">{profileData.gender}</span>
              </div>
                <div className="flex items-center">
                  <span className="text-gray-500 font-medium">Activity:</span>
                  <span className="font-semibold ml-2 capitalize">{profileData.activityLevel.replace('_', ' ')}</span>
              </div>
                <div className="flex items-center">
                  <span className="text-gray-500 font-medium">Goal:</span>
                  <span className="font-semibold ml-2 capitalize">{profileData.goal.replace('_', ' ')}</span>
              </div>
            </div>
              <div className="p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl border border-indigo-200">
                <p className="text-indigo-800 font-semibold">
                  <span className="mr-2">🎯</span>
                  Your personalized protein requirement: <span className="text-2xl font-bold">{proteinData?.recommended || 0}g</span> per day
                </p>
                <p className="text-indigo-600 mt-2 text-sm">
                  This is calculated based on your body composition, activity level, and fitness goals.
              </p>
            </div>
            </motion.div>
        )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default ProteinTracker; 