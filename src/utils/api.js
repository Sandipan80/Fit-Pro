// Mock data service for FitPro
// This replaces the backend API with mock data for a standalone frontend

// Helper functions for localStorage
const getStoredNutritionLog = (date) => {
  // Use the same key as components for consistency
  const stored = localStorage.getItem(`foodLog_${date}`);
  if (stored) {
    const foodLog = JSON.parse(stored);
    const totalProtein = foodLog.reduce((sum, food) => sum + food.protein, 0);
    return {
      foodEntries: foodLog,
      totalProtein: totalProtein,
      totalCalories: foodLog.reduce((sum, food) => sum + food.calories, 0),
      totalCarbs: foodLog.reduce((sum, food) => sum + (food.carbs || 0), 0),
      totalFat: foodLog.reduce((sum, food) => sum + (food.fat || 0), 0)
    };
  }
  return null;
};

const setStoredNutritionLog = (date, data) => {
  // Store in the same format as components
  localStorage.setItem(`foodLog_${date}`, JSON.stringify(data.foodEntries || []));
};

const getStoredNutritionRecommendation = () => {
  const stored = localStorage.getItem('nutrition_recommendation');
  return stored ? JSON.parse(stored) : null;
};

const setStoredNutritionRecommendation = (data) => {
  localStorage.setItem('nutrition_recommendation', JSON.stringify(data));
};

// Calculate personalized protein requirements
const calculateProteinRequirement = (userData) => {
  const {
    weight, // in kg
    height, // in cm
    age,
    gender, // 'male' or 'female'
    activityLevel, // 'sedentary', 'light', 'moderate', 'active', 'very_active'
    goal // 'weight_loss', 'maintenance', 'muscle_gain'
  } = userData;

  // Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // Activity multipliers
  const activityMultipliers = {
    sedentary: 1.2,      // Little or no exercise
    light: 1.375,        // Light exercise 1-3 days/week
    moderate: 1.55,      // Moderate exercise 3-5 days/week
    active: 1.725,       // Hard exercise 6-7 days/week
    very_active: 1.9     // Very hard exercise, physical job
  };

  // Calculate Total Daily Energy Expenditure (TDEE)
  const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

  // Protein requirements based on goals (grams per kg of body weight)
  const proteinMultipliers = {
    weight_loss: 1.6,    // Higher protein for satiety and muscle preservation
    maintenance: 1.2,    // Standard protein for maintenance
    muscle_gain: 1.8     // Higher protein for muscle building
  };

  // Calculate protein requirement
  const proteinPerKg = proteinMultipliers[goal] || 1.2;
  const recommendedProtein = Math.round(weight * proteinPerKg);

  // Ensure minimum and maximum reasonable values
  const minProtein = Math.max(50, Math.round(weight * 0.8)); // Minimum 0.8g/kg or 50g
  const maxProtein = Math.min(300, Math.round(weight * 2.5)); // Maximum 2.5g/kg or 300g

  return Math.max(minProtein, Math.min(maxProtein, recommendedProtein));
};

// Mock nutrition recommendation data
const getMockNutritionRecommendation = () => {
  return {
    success: true,
    data: {
      recommended: 120,
      current: 75,
      weight: 75,
      height: 175,
      age: 30,
      gender: 'male',
      activityLevel: 'moderate',
      goal: 'maintenance',
      isComplete: true
    }
  };
};

// Mock nutrition log data
const getMockNutritionLog = () => {
  return {
    success: true,
    data: {
      foodEntries: [],
      proteinTarget: 120,
      totalProtein: 0,
      totalCalories: 0,
      totalCarbs: 0,
      totalFat: 0
    }
  };
};

// Mock food search results
const getMockFoodSearchResults = (query = '') => {
  const allFoods = [
    // Protein Sources
    {
      _id: 'mock1',
      name: 'Chicken Breast',
      protein: 31,
      calories: 165,
      carbs: 0,
      fat: 3.6,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock2',
      name: 'Whey Protein',
      protein: 25,
      calories: 120,
      carbs: 2,
      fat: 1,
      servingSize: 30,
      servingUnit: 'g'
    },
    {
      _id: 'mock3',
      name: 'Greek Yogurt',
      protein: 10,
      calories: 59,
      carbs: 3.6,
      fat: 0.4,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock4',
      name: 'Salmon',
      protein: 22,
      calories: 206,
      carbs: 0,
      fat: 13,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock5',
      name: 'Eggs',
      protein: 13,
      calories: 143,
      carbs: 0.7,
      fat: 10,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock6',
      name: 'Tuna',
      protein: 26,
      calories: 132,
      carbs: 0,
      fat: 1.2,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock7',
      name: 'Turkey Breast',
      protein: 29,
      calories: 157,
      carbs: 0,
      fat: 3.6,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock8',
      name: 'Lean Beef',
      protein: 26,
      calories: 250,
      carbs: 0,
      fat: 17,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock9',
      name: 'Pork Loin',
      protein: 27,
      calories: 143,
      carbs: 0,
      fat: 4.8,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock10',
      name: 'Cottage Cheese',
      protein: 11,
      calories: 98,
      carbs: 3.4,
      fat: 4.3,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock11',
      name: 'Tempeh',
      protein: 20,
      calories: 192,
      carbs: 7.7,
      fat: 11,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock12',
      name: 'Seitan',
      protein: 25,
      calories: 370,
      carbs: 14,
      fat: 2,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock13',
      name: 'Protein Powder (Plant)',
      protein: 20,
      calories: 120,
      carbs: 3,
      fat: 2,
      servingSize: 30,
      servingUnit: 'g'
    },
    // Legumes and Beans
    {
      _id: 'mock14',
      name: 'Black Beans',
      protein: 8.9,
      calories: 132,
      carbs: 23.7,
      fat: 0.5,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock15',
      name: 'Chickpeas',
      protein: 8.9,
      calories: 164,
      carbs: 27.4,
      fat: 2.6,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock16',
      name: 'Kidney Beans',
      protein: 8.7,
      calories: 127,
      carbs: 22.8,
      fat: 0.5,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock17',
      name: 'Edamame',
      protein: 11,
      calories: 121,
      carbs: 8.9,
      fat: 5.2,
      servingSize: 100,
      servingUnit: 'g'
    },
    // Grains and Cereals
    {
      _id: 'mock18',
      name: 'Quinoa',
      protein: 4.4,
      calories: 120,
      carbs: 21.3,
      fat: 1.9,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock19',
      name: 'Oatmeal',
      protein: 2.5,
      calories: 68,
      carbs: 12,
      fat: 1.4,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock20',
      name: 'Whole Wheat Bread',
      protein: 4,
      calories: 247,
      carbs: 41,
      fat: 3.2,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock21',
      name: 'Barley',
      protein: 2.3,
      calories: 354,
      carbs: 73.5,
      fat: 2.3,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock22',
      name: 'Buckwheat',
      protein: 3.4,
      calories: 343,
      carbs: 71.5,
      fat: 3.4,
      servingSize: 100,
      servingUnit: 'g'
    },
    // Nuts and Seeds
    {
      _id: 'mock23',
      name: 'Almonds',
      protein: 21.2,
      calories: 579,
      carbs: 21.7,
      fat: 49.9,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock24',
      name: 'Peanuts',
      protein: 25.8,
      calories: 567,
      carbs: 16.1,
      fat: 49.2,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock25',
      name: 'Walnuts',
      protein: 15.2,
      calories: 654,
      carbs: 13.7,
      fat: 65.2,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock26',
      name: 'Chia Seeds',
      protein: 16.5,
      calories: 486,
      carbs: 42.1,
      fat: 30.7,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock27',
      name: 'Flax Seeds',
      protein: 18.3,
      calories: 534,
      carbs: 28.9,
      fat: 42.2,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock28',
      name: 'Pumpkin Seeds',
      protein: 30.2,
      calories: 559,
      carbs: 10.7,
      fat: 49.1,
      servingSize: 100,
      servingUnit: 'g'
    },
    // Vegetables
    {
      _id: 'mock29',
      name: 'Spinach',
      protein: 2.9,
      calories: 23,
      carbs: 3.6,
      fat: 0.4,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock30',
      name: 'Kale',
      protein: 4.3,
      calories: 49,
      carbs: 8.8,
      fat: 0.9,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock31',
      name: 'Broccoli',
      protein: 2.8,
      calories: 34,
      carbs: 6.6,
      fat: 0.4,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock32',
      name: 'Brussels Sprouts',
      protein: 3.4,
      calories: 43,
      carbs: 8.9,
      fat: 0.3,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock33',
      name: 'Asparagus',
      protein: 2.2,
      calories: 20,
      carbs: 3.9,
      fat: 0.1,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock34',
      name: 'Bell Pepper',
      protein: 0.9,
      calories: 20,
      carbs: 4.6,
      fat: 0.2,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock35',
      name: 'Mushrooms',
      protein: 3.1,
      calories: 22,
      carbs: 3.3,
      fat: 0.3,
      servingSize: 100,
      servingUnit: 'g'
    },
    // Fruits
    {
      _id: 'mock36',
      name: 'Banana',
      protein: 1.1,
      calories: 89,
      carbs: 22.8,
      fat: 0.3,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock37',
      name: 'Apple',
      protein: 0.3,
      calories: 52,
      carbs: 13.8,
      fat: 0.2,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock38',
      name: 'Orange',
      protein: 0.9,
      calories: 47,
      carbs: 11.8,
      fat: 0.1,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock39',
      name: 'Blueberries',
      protein: 0.7,
      calories: 57,
      carbs: 14.5,
      fat: 0.3,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock40',
      name: 'Strawberries',
      protein: 0.7,
      calories: 32,
      carbs: 7.7,
      fat: 0.3,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock41',
      name: 'Avocado',
      protein: 2,
      calories: 160,
      carbs: 8.5,
      fat: 14.7,
      servingSize: 100,
      servingUnit: 'g'
    },
    // Dairy and Alternatives
    {
      _id: 'mock42',
      name: 'Almond Milk',
      protein: 1,
      calories: 13,
      carbs: 0.3,
      fat: 1.1,
      servingSize: 100,
      servingUnit: 'ml'
    },
    {
      _id: 'mock43',
      name: 'Soy Milk',
      protein: 3.3,
      calories: 33,
      carbs: 1.7,
      fat: 1.8,
      servingSize: 100,
      servingUnit: 'ml'
    },
    {
      _id: 'mock44',
      name: 'Cheese',
      protein: 25,
      calories: 402,
      carbs: 1.3,
      fat: 33.1,
      servingSize: 100,
      servingUnit: 'g'
    },
    // Other Common Foods
    {
      _id: 'mock45',
      name: 'Hummus',
      protein: 7.9,
      calories: 166,
      carbs: 14.3,
      fat: 9.6,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock46',
      name: 'Peanut Butter',
      protein: 25.1,
      calories: 588,
      carbs: 20,
      fat: 50,
      servingSize: 100,
      servingUnit: 'g'
    },
    {
      _id: 'mock47',
      name: 'Olive Oil',
      protein: 0,
      calories: 884,
      carbs: 0,
      fat: 100,
      servingSize: 100,
      servingUnit: 'ml'
    },
    {
      _id: 'mock48',
      name: 'Honey',
      protein: 0.3,
      calories: 304,
      carbs: 82.4,
      fat: 0,
      servingSize: 100,
      servingUnit: 'g'
    }
  ];
  
  if (!query) {
    return {
      success: true,
      count: allFoods.length,
      data: allFoods
    };
  }
  
  // Filter foods by search term
  const lowerQuery = query.toLowerCase();
  const results = allFoods.filter(food => 
    food.name.toLowerCase().includes(lowerQuery)
  );
  
  return {
    success: true,
    count: results.length,
    data: results
  };
};

// Mock API functions that return promises to simulate async behavior
export const getNutritionRecommendation = async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      // Try to get stored recommendation
      const stored = getStoredNutritionRecommendation();
      const today = new Date().toISOString().split('T')[0];
      
      if (stored) {
        // Check if it's a new day and sync current protein with food log
        const lastUpdated = stored.lastUpdated || today;
        if (lastUpdated !== today) {
          // It's a new day, check if there's any food log data for today
          const todayLog = getStoredNutritionLog(today);
          const currentProtein = todayLog ? todayLog.totalProtein : 0;
          
          const updatedData = {
            ...stored,
            current: currentProtein, // Use actual food log data instead of resetting to 0
            lastUpdated: today
          };
          setStoredNutritionRecommendation(updatedData);
          resolve({ success: true, data: updatedData });
          return;
        }
        
        // For the same day, ensure current protein is synced with food log
        const todayLog = getStoredNutritionLog(today);
        if (todayLog && stored.current !== todayLog.totalProtein) {
          const updatedData = {
            ...stored,
            current: todayLog.totalProtein
          };
          setStoredNutritionRecommendation(updatedData);
          resolve({ success: true, data: updatedData });
          return;
        }
        
        resolve({ success: true, data: stored });
        return;
      }

      // If no stored data, create personalized recommendation
      const userData = {
        weight: 70, // kg
        height: 175, // cm
        age: 30,
        gender: 'male',
        activityLevel: 'moderate',
        goal: 'maintenance'
      };

      // Calculate personalized protein requirement
      const recommendedProtein = calculateProteinRequirement(userData);

      // Check if there's any existing food log for today
      const todayLog = getStoredNutritionLog(today);
      const currentProtein = todayLog ? todayLog.totalProtein : 0;

      const mockData = {
        recommended: recommendedProtein,
        current: currentProtein, // Use actual food log data
        weight: userData.weight,
        height: userData.height,
        age: userData.age,
        gender: userData.gender,
        activityLevel: userData.activityLevel,
        goal: userData.goal,
        lastUpdated: today
      };
      
      // Store the mock data
      setStoredNutritionRecommendation(mockData);
      
      resolve({ success: true, data: mockData });
    }, 300);
  });
};

export const getDailyNutritionLog = async (date) => {
  return new Promise(resolve => {
    setTimeout(() => {
      // Try to get stored log for the date
      const stored = getStoredNutritionLog(date);
      if (stored) {
        resolve({ success: true, data: stored });
        return;
      }

      // If no stored data, create new log
      const newLog = getMockNutritionLog().data;
      
      // Store the new log
      setStoredNutritionLog(date, newLog);
      
      resolve({ success: true, data: newLog });
    }, 300);
  });
};

export const addFoodEntry = async (foodData) => {
  return new Promise(resolve => {
    setTimeout(() => {
      const today = new Date().toISOString().split('T')[0];
      
      // Get current log from the same storage as components
      const currentLog = getStoredNutritionLog(today) || getMockNutritionLog().data;
      
      // Add new entry with unique ID
      const newEntry = {
        ...foodData,
        id: `food-${Date.now()}`, // Use 'id' instead of '_id' to match component format
        time: new Date()
      };
      
      // Update totals
      const updatedLog = {
        ...currentLog,
        foodEntries: [...currentLog.foodEntries, newEntry],
        totalProtein: currentLog.totalProtein + foodData.protein,
        totalCalories: currentLog.totalCalories + foodData.calories,
        totalCarbs: currentLog.totalCarbs + (foodData.carbs || 0),
        totalFat: currentLog.totalFat + (foodData.fat || 0)
      };
      
      // Store updated log using the same format as components
      setStoredNutritionLog(today, updatedLog);
      
      // Update recommendation current value
      const recommendation = getStoredNutritionRecommendation();
      if (recommendation) {
        const updatedRecommendation = {
          ...recommendation,
          current: updatedLog.totalProtein,
          lastUpdated: today
        };
        setStoredNutritionRecommendation(updatedRecommendation);
      }
      
      resolve({ 
        success: true, 
        message: 'Food entry added',
        data: newEntry
      });
    }, 500);
  });
};

export const searchFoods = async (query) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(getMockFoodSearchResults(query));
    }, 300);
  });
};

// Update user profile and recalculate protein requirements
export const updateUserProfile = async (userData) => {
  return new Promise(resolve => {
    setTimeout(() => {
      // Calculate new protein requirement
      const recommendedProtein = calculateProteinRequirement(userData);
      const today = new Date().toISOString().split('T')[0];
      
      // Get current recommendation to preserve current protein intake
      const currentRecommendation = getStoredNutritionRecommendation();
      const currentProtein = currentRecommendation ? currentRecommendation.current : 0;
      
      const updatedData = {
        recommended: recommendedProtein,
        current: currentProtein, // Preserve current intake instead of resetting to 0
        weight: userData.weight,
        height: userData.height,
        age: userData.age,
        gender: userData.gender,
        activityLevel: userData.activityLevel,
        goal: userData.goal,
        lastUpdated: today
      };
      
      // Store the updated data
      setStoredNutritionRecommendation(updatedData);
      
      resolve({ 
        success: true, 
        message: 'Profile updated successfully',
        data: updatedData
      });
    }, 500);
  });
};

// Export the calculation function for use in components
export { calculateProteinRequirement };

// Export mock API object for backward compatibility
export default {
  get: async (url) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(getMockNutritionLog());
      }, 500);
    });
  },
  post: async (url, data) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ 
          success: true, 
          message: 'Operation successful (mock)',
          data: {
            ...data,
            _id: `mock-${Date.now()}`,
            createdAt: new Date()
          }
        });
      }, 500);
    });
  },
  put: async (url, data) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ 
          success: true, 
          message: 'Update successful (mock)',
          data: {
            ...data,
            updatedAt: new Date()
          }
        });
      }, 500);
    });
  },
  delete: async (url) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ 
          success: true, 
          message: 'Delete successful (mock)'
        });
      }, 500);
    });
  }
}; 