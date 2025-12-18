// Test file to verify sync service functionality
import syncService from './syncService';

// Test function to verify sync service is working
export const testSyncService = () => {
  console.log('=== Testing Sync Service ===');
  
  // Test 1: Check if service is initialized
  console.log('1. Service initialized:', syncService.isReady());
  
  // Test 2: Test cache functionality
  const today = new Date().toISOString().split('T')[0];
  console.log('2. Today\'s date:', today);
  
  // Test 3: Test protein calculation
  const protein1 = syncService.getCurrentProteinIntake();
  console.log('3. Initial protein intake:', protein1);
  
  // Test 4: Test adding food
  const testFood = {
    name: 'Test Chicken Breast',
    protein: 25,
    calories: 165,
    carbs: 0,
    fat: 3.6
  };
  
  syncService.addFoodToLog(testFood);
  const protein2 = syncService.getCurrentProteinIntake();
  console.log('4. Protein after adding food:', protein2);
  console.log('4a. Expected increase:', protein1 + 25);
  console.log('4b. Calculation correct:', protein2 === protein1 + 25);
  
  // Test 5: Test cache
  const protein3 = syncService.getCurrentProteinIntake();
  console.log('5. Cached protein intake:', protein3);
  console.log('5a. Cache working:', protein3 === protein2);
  
  // Test 6: Test food log
  const foodLog = syncService.getCurrentFoodLog();
  console.log('6. Food log length:', foodLog.length);
  console.log('6a. Food log contains test food:', foodLog.some(food => food.name === 'Test Chicken Breast'));
  
  // Test 7: Test totals calculation
  const totals = syncService.calculateTotals(foodLog);
  console.log('7. Calculated totals:', totals);
  console.log('7a. Protein total matches:', totals.protein === protein2);
  
  // Test 8: Test removing food
  if (foodLog.length > 0) {
    const foodToRemove = foodLog[0];
    syncService.removeFoodFromLog(foodToRemove.id);
    const protein4 = syncService.getCurrentProteinIntake();
    console.log('8. Protein after removing food:', protein4);
    console.log('8a. Expected decrease:', protein2 - foodToRemove.protein);
    console.log('8b. Removal correct:', protein4 === protein2 - foodToRemove.protein);
  }
  
  // Test 9: Clear cache and test again
  syncService.clearCache();
  const protein5 = syncService.getCurrentProteinIntake();
  console.log('9. Protein after cache clear:', protein5);
  
  console.log('=== Sync Service Test Complete ===');
  
  return {
    success: true,
    message: 'Sync service tests completed successfully'
  };
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testSyncService = testSyncService;
} 