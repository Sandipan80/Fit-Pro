// Centralized synchronization service for person profile and protein intake
import { auth, db } from '../components/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateUserProfile, getNutritionRecommendation } from './api';

class SyncService {
  constructor() {
    this.listeners = new Map();
    this.syncInProgress = false;
    this.isInitialized = false;
    this.cache = new Map(); // Add cache to prevent duplicate calculations
    this.lastSyncTime = 0; // Add timestamp to prevent rapid successive syncs
    this.syncDebounceMs = 1000; // Minimum time between syncs
  }

  // Event types for synchronization
  static EVENTS = {
    PROFILE_UPDATED: 'profileUpdated',
    PROTEIN_DATA_UPDATED: 'proteinDataUpdated',
    FOOD_LOG_UPDATED: 'foodLogUpdated',
    SYNC_COMPLETED: 'syncCompleted'
  };

  // Add event listener
  addEventListener(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);
  }

  // Remove event listener
  removeEventListener(eventType, callback) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).delete(callback);
    }
  }

  // Dispatch event to all listeners
  dispatchEvent(eventType, data) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${eventType} listener:`, error);
        }
      });
    }
    
    // Also dispatch to window for backward compatibility
    try {
      window.dispatchEvent(new CustomEvent(eventType, { detail: data }));
    } catch (error) {
      console.error(`Error dispatching window event ${eventType}:`, error);
    }
  }

  // Fetch user profile from Firebase
  async fetchUserProfileFromFirebase() {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('No authenticated user found');
        return null;
      }

      // Wait a bit to ensure Firebase is fully initialized
      await new Promise(resolve => setTimeout(resolve, 100));

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('Fetched user profile from Firebase:', userData);
        
        // Map Firebase user data to protein tracker format
        const mappedProfileData = {
          weight: userData.weight || 70,
          height: userData.height || 175,
          age: userData.age || 30,
          gender: userData.gender || 'male',
          activityLevel: userData.activityLevel || 'moderate',
          goal: this.mapFitnessGoalToProteinGoal(userData.fitnessGoal),
          // Keep original Firebase data for reference
          firebaseData: userData
        };
        
        return mappedProfileData;
      } else {
        console.log('User document not found in Firebase');
        return null;
      }
    } catch (err) {
      console.error('Error fetching user profile from Firebase:', err);
      return null;
    }
  }

  // Update user profile in Firebase
  async updateUserProfileInFirebase(profileData) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Map protein tracker data to Firebase format
      const firebaseUserData = {
        weight: profileData.weight,
        height: profileData.height,
        age: profileData.age,
        gender: profileData.gender,
        activityLevel: profileData.activityLevel,
        fitnessGoal: this.mapProteinGoalToFitnessGoal(profileData.goal),
        lastUpdated: new Date()
      };

      await updateDoc(doc(db, 'users', user.uid), firebaseUserData);
      console.log('User profile updated in Firebase:', firebaseUserData);
      return true;
    } catch (err) {
      console.error('Error updating user profile in Firebase:', err);
      return false;
    }
  }

  // Map fitness goal to protein goal
  mapFitnessGoalToProteinGoal(fitnessGoal) {
    switch (fitnessGoal) {
      case 'Weight Loss':
        return 'weight_loss';
      case 'Muscle Gain':
        return 'muscle_gain';
      default:
        return 'maintenance';
    }
  }

  // Map protein goal to fitness goal
  mapProteinGoalToFitnessGoal(proteinGoal) {
    switch (proteinGoal) {
      case 'weight_loss':
        return 'Weight Loss';
      case 'muscle_gain':
        return 'Muscle Gain';
      default:
        return 'General Fitness';
    }
  }

  // Sync profile data between Firebase and protein tracker API
  async syncProfileData(profileData, source = 'firebase') {
    // Prevent rapid successive syncs
    const now = Date.now();
    if (now - this.lastSyncTime < this.syncDebounceMs) {
      console.log('Sync debounced - too soon since last sync');
      return null;
    }
    
    if (this.syncInProgress) {
      console.log('Sync already in progress, skipping...');
      return null;
    }

    this.syncInProgress = true;
    this.lastSyncTime = now;
    
    try {
      let updatedProteinData = null;

      if (source === 'firebase') {
        // Profile was updated in Firebase, update protein tracker API
        const apiResponse = await updateUserProfile(profileData);
        if (apiResponse.success) {
          updatedProteinData = apiResponse.data;
        } else {
          throw new Error(apiResponse.message || 'Failed to update protein requirements');
        }
      } else if (source === 'proteinTracker') {
        // Profile was updated in protein tracker, update Firebase
        const firebaseSuccess = await this.updateUserProfileInFirebase(profileData);
        if (!firebaseSuccess) {
          throw new Error('Failed to update Firebase profile');
        }
        
        // Get updated protein data
        const apiResponse = await getNutritionRecommendation();
        if (apiResponse.success) {
          updatedProteinData = apiResponse.data;
        }
      }

      // Dispatch sync completed event
      this.dispatchEvent(SyncService.EVENTS.SYNC_COMPLETED, {
        profileData,
        proteinData: updatedProteinData,
        source
      });

      return updatedProteinData;
    } catch (error) {
      console.error('Error during profile sync:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  // Centralized method to get current protein intake (prevents duplicate calculations)
  getCurrentProteinIntake() {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `protein_${today}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const savedFoodLog = localStorage.getItem(`foodLog_${today}`);
    
    if (savedFoodLog) {
      const foodLog = JSON.parse(savedFoodLog);
      const totalProtein = foodLog.reduce((sum, food) => sum + (food.protein || 0), 0);
      
      // Cache the result
      this.cache.set(cacheKey, totalProtein);
      return totalProtein;
    }
    
    // Cache zero result
    this.cache.set(cacheKey, 0);
    return 0;
  }

  // Centralized method to get current food log
  getCurrentFoodLog() {
    const today = new Date().toISOString().split('T')[0];
    const savedFoodLog = localStorage.getItem(`foodLog_${today}`);
    
    if (savedFoodLog) {
      return JSON.parse(savedFoodLog);
    }
    
    return [];
  }

  // Centralized method to calculate totals from food log
  calculateTotals(foodLog) {
    return {
      protein: foodLog.reduce((sum, food) => sum + (food.protein || 0), 0),
      calories: foodLog.reduce((sum, food) => sum + (food.calories || 0), 0),
      carbs: foodLog.reduce((sum, food) => sum + (food.carbs || 0), 0),
      fat: foodLog.reduce((sum, food) => sum + (food.fat || 0), 0)
    };
  }

  // Sync protein intake data across components (simplified to prevent conflicts)
  syncProteinIntake(currentProtein, foodLog = null) {
    const today = new Date().toISOString().split('T')[0];
    
    // Clear cache for today
    this.cache.delete(`protein_${today}`);
    
    // Update localStorage only if foodLog is provided
    if (foodLog) {
      localStorage.setItem(`foodLog_${today}`, JSON.stringify(foodLog));
    }

    // Update nutrition recommendation in localStorage
    const recommendation = localStorage.getItem('nutrition_recommendation');
    if (recommendation) {
      const recData = JSON.parse(recommendation);
      const updatedRec = {
        ...recData,
        current: currentProtein,
        lastUpdated: today
      };
      localStorage.setItem('nutrition_recommendation', JSON.stringify(updatedRec));
    }

    // Dispatch protein data updated event
    this.dispatchEvent(SyncService.EVENTS.PROTEIN_DATA_UPDATED, {
      current: currentProtein,
      foodLog,
      date: today
    });
  }

  // Add food to log and sync (centralized)
  addFoodToLog(foodItem) {
    const today = new Date().toISOString().split('T')[0];
    const currentFoodLog = this.getCurrentFoodLog();
    
    const newFoodItem = {
      ...foodItem,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };
    
    const updatedFoodLog = [...currentFoodLog, newFoodItem];
    const totals = this.calculateTotals(updatedFoodLog);
    
    // Update localStorage
    localStorage.setItem(`foodLog_${today}`, JSON.stringify(updatedFoodLog));
    
    // Clear cache
    this.cache.delete(`protein_${today}`);
    
    // Sync protein intake
    this.syncProteinIntake(totals.protein, updatedFoodLog);
    
    // Dispatch food log updated event
    this.dispatchEvent(SyncService.EVENTS.FOOD_LOG_UPDATED, {
      foodLog: updatedFoodLog,
      totalProtein: totals.protein,
      totalCalories: totals.calories,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
      date: today
    });
    
    return newFoodItem;
  }

  // Remove food from log and sync (centralized)
  removeFoodFromLog(foodId) {
    const today = new Date().toISOString().split('T')[0];
    const currentFoodLog = this.getCurrentFoodLog();
    
    const updatedFoodLog = currentFoodLog.filter(food => food.id !== foodId);
    const totals = this.calculateTotals(updatedFoodLog);
    
    // Update localStorage
    localStorage.setItem(`foodLog_${today}`, JSON.stringify(updatedFoodLog));
    
    // Clear cache
    this.cache.delete(`protein_${today}`);
    
    // Sync protein intake
    this.syncProteinIntake(totals.protein, updatedFoodLog);
    
    // Dispatch food log updated event
    this.dispatchEvent(SyncService.EVENTS.FOOD_LOG_UPDATED, {
      foodLog: updatedFoodLog,
      totalProtein: totals.protein,
      totalCalories: totals.calories,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
      date: today
    });
  }

  // Initialize sync service
  async initialize() {
    try {
      this.isInitialized = true;
      // Fetch initial profile data
      const profileData = await this.fetchUserProfileFromFirebase();
      if (profileData) {
        // Sync with protein tracker API
        await this.syncProfileData(profileData, 'firebase');
      }
    } catch (error) {
      console.error('Error initializing sync service:', error);
    }
  }

  // Check if service is ready
  isReady() {
    return this.isInitialized;
  }

  // Clear cache (useful for testing or when data becomes stale)
  clearCache() {
    this.cache.clear();
  }
}

// Create singleton instance
const syncService = new SyncService();

// Ensure EVENTS are available immediately
syncService.EVENTS = SyncService.EVENTS;

// Add debug logging
console.log('SyncService initialized with EVENTS:', syncService.EVENTS);

export default syncService; 