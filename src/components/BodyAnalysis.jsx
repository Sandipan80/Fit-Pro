import React, { useState, useEffect } from 'react';
import BodyAnalysisService, { BODY_TYPES, PHYSIQUE_CHARACTERISTICS } from '../services/bodyAnalysisService';

const BodyAnalysis = ({ routing }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [measurements, setMeasurements] = useState({
    height: '',
    weight: '',
    wristCircumference: '',
    ankleCircumference: '',
    shoulderWidth: '',
    hipWidth: '',
    bodyFatPercentage: '',
    muscleMass: ''
  });
  
  const [characteristics, setCharacteristics] = useState({
    metabolism: 'moderate',
    weightGainTendency: 'moderate',
    muscleBuildingAbility: 'moderate',
    fatGainTendency: 'moderate'
  });
  
  const [goals, setGoals] = useState({
    primary: 'muscle_gain',
    secondary: 'strength',
    age: '',
    gender: 'male',
    activityLevel: 'moderate',
    fitnessLevel: 'beginner',
    availableTime: 60
  });
  
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bodyAnalysisService = new BodyAnalysisService();

  const handleMeasurementChange = (field, value) => {
    setMeasurements(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCharacteristicChange = (field, value) => {
    setCharacteristics(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGoalChange = (field, value) => {
    setGoals(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep1 = () => {
    const required = ['height', 'weight', 'wristCircumference'];
    return required.every(field => measurements[field] && measurements[field] > 0);
  };

  const validateStep2 = () => {
    return true; // Characteristics are optional
  };

  const validateStep3 = () => {
    const required = ['age', 'gender', 'activityLevel', 'fitnessLevel'];
    return required.every(field => goals[field]);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return validateStep1();
      case 2: return validateStep2();
      case 3: return validateStep3();
      default: return true;
    }
  };

  const nextStep = () => {
    if (canProceed()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const performAnalysis = async () => {
    setLoading(true);
    setError('');

    try {
      // Convert string values to numbers
      const numericMeasurements = Object.keys(measurements).reduce((acc, key) => {
        acc[key] = measurements[key] ? parseFloat(measurements[key]) : 0;
        return acc;
      }, {});

      const numericGoals = {
        ...goals,
        age: goals.age ? parseInt(goals.age) : 25
      };

      // Analyze body type
      const bodyAnalysis = bodyAnalysisService.analyzeBodyType(numericMeasurements, characteristics);
      
      // Generate workout plan
      const workoutPlan = bodyAnalysisService.generateWorkoutPlan(
        bodyAnalysis.bodyType,
        numericGoals,
        numericGoals.fitnessLevel,
        numericGoals.availableTime
      );
      
      // Generate diet plan
      const dietPlan = bodyAnalysisService.generateDietPlan(
        bodyAnalysis.bodyType,
        numericGoals,
        numericMeasurements.weight,
        numericMeasurements.height,
        numericGoals.activityLevel
      );

      const fullAnalysis = {
        bodyAnalysis,
        workoutPlan,
        dietPlan,
        measurements: numericMeasurements,
        goals: numericGoals,
        characteristics
      };

      setAnalysis(fullAnalysis);
      
      // Save analysis
      const userId = 'user_' + Date.now(); // In production, use actual user ID
      bodyAnalysisService.saveAnalysis(userId, fullAnalysis);
      
    } catch (err) {
      setError('Error performing analysis. Please check your inputs and try again.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Measurements</h3>
        <p className="text-gray-600 mb-6">Please provide your basic body measurements for accurate analysis.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Height (cm)
          </label>
          <input
            type="number"
            value={measurements.height}
            onChange={(e) => handleMeasurementChange('height', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            placeholder="170"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Weight (kg)
          </label>
          <input
            type="number"
            value={measurements.weight}
            onChange={(e) => handleMeasurementChange('weight', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            placeholder="70"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wrist Circumference (cm)
          </label>
          <input
            type="number"
            value={measurements.wristCircumference}
            onChange={(e) => handleMeasurementChange('wristCircumference', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            placeholder="16"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ankle Circumference (cm)
          </label>
          <input
            type="number"
            value={measurements.ankleCircumference}
            onChange={(e) => handleMeasurementChange('ankleCircumference', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            placeholder="22"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shoulder Width (cm)
          </label>
          <input
            type="number"
            value={measurements.shoulderWidth}
            onChange={(e) => handleMeasurementChange('shoulderWidth', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            placeholder="45"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hip Width (cm)
          </label>
          <input
            type="number"
            value={measurements.hipWidth}
            onChange={(e) => handleMeasurementChange('hipWidth', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            placeholder="35"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Body Characteristics</h3>
        <p className="text-gray-600 mb-6">Help us understand your body's natural tendencies.</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Metabolism Rate
          </label>
          <select
            value={characteristics.metabolism}
            onChange={(e) => handleCharacteristicChange('metabolism', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            <option value="slow">Slow - Gain weight easily</option>
            <option value="moderate">Moderate - Average metabolism</option>
            <option value="fast">Fast - Hard to gain weight</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Weight Gain Tendency
          </label>
          <select
            value={characteristics.weightGainTendency}
            onChange={(e) => handleCharacteristicChange('weightGainTendency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            <option value="easy">Easy - Gain weight quickly</option>
            <option value="moderate">Moderate - Average weight gain</option>
            <option value="difficult">Difficult - Hard to gain weight</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Muscle Building Ability
          </label>
          <select
            value={characteristics.muscleBuildingAbility}
            onChange={(e) => handleCharacteristicChange('muscleBuildingAbility', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            <option value="poor">Poor - Hard to build muscle</option>
            <option value="moderate">Moderate - Average muscle building</option>
            <option value="good">Good - Build muscle easily</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fat Gain Tendency
          </label>
          <select
            value={characteristics.fatGainTendency}
            onChange={(e) => handleCharacteristicChange('fatGainTendency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            <option value="easy">Easy - Gain fat quickly</option>
            <option value="moderate">Moderate - Average fat gain</option>
            <option value="difficult">Difficult - Hard to gain fat</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Goals & Preferences</h3>
        <p className="text-gray-600 mb-6">Tell us about your fitness goals and current situation.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Goal
          </label>
          <select
            value={goals.primary}
            onChange={(e) => handleGoalChange('primary', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            <option value="muscle_gain">Build Muscle</option>
            <option value="weight_loss">Lose Weight</option>
            <option value="strength">Increase Strength</option>
            <option value="endurance">Improve Endurance</option>
            <option value="maintenance">Maintain Current</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age
          </label>
          <input
            type="number"
            value={goals.age}
            onChange={(e) => handleGoalChange('age', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            placeholder="25"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender
          </label>
          <select
            value={goals.gender}
            onChange={(e) => handleGoalChange('gender', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Activity Level
          </label>
          <select
            value={goals.activityLevel}
            onChange={(e) => handleGoalChange('activityLevel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            <option value="sedentary">Sedentary (Little to no exercise)</option>
            <option value="light">Light (1-3 days/week)</option>
            <option value="moderate">Moderate (3-5 days/week)</option>
            <option value="active">Active (6-7 days/week)</option>
            <option value="veryActive">Very Active (Physical job + exercise)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fitness Level
          </label>
          <select
            value={goals.fitnessLevel}
            onChange={(e) => handleGoalChange('fitnessLevel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            <option value="beginner">Beginner (0-1 years)</option>
            <option value="intermediate">Intermediate (1-3 years)</option>
            <option value="advanced">Advanced (3+ years)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available Time per Workout (minutes)
          </label>
          <select
            value={goals.availableTime}
            onChange={(e) => handleGoalChange('availableTime', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes</option>
            <option value={75}>75 minutes</option>
            <option value={90}>90 minutes</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderResults = () => {
    if (!analysis) return null;

    const { bodyAnalysis, workoutPlan, dietPlan } = analysis;
    const bodyTypeInfo = PHYSIQUE_CHARACTERISTICS[bodyAnalysis.bodyType];

    return (
      <div className="space-y-8">
        {/* Body Type Analysis */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Your Body Type: {bodyTypeInfo.name}</h3>
          <p className="text-gray-600 mb-4">{bodyTypeInfo.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Characteristics:</h4>
              <ul className="space-y-1">
                {bodyTypeInfo.characteristics.map((char, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    {char}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Analysis Results:</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Frame Size:</span> {bodyAnalysis.frameSize}</p>
                <p><span className="font-medium">BMI:</span> {bodyAnalysis.bmi}</p>
                <p><span className="font-medium">Body Type:</span> {bodyTypeInfo.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Workout Plan */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Personalized Workout Plan</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Plan Details:</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Frequency:</span> {workoutPlan.frequency}</p>
                <p><span className="font-medium">Duration:</span> {workoutPlan.duration}</p>
                <p><span className="font-medium">Level:</span> {workoutPlan.fitnessLevel}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Focus Areas:</h4>
              <ul className="space-y-1">
                {workoutPlan.focus.map((focus, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {focus}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Recommended Exercises:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {workoutPlan.exercises.map((exercise, index) => (
                <div key={index} className="bg-gray-50 px-3 py-2 rounded text-sm">
                  {exercise}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Diet Plan */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Personalized Diet Plan</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{dietPlan.targetCalories}</div>
              <div className="text-sm text-gray-600">Daily Calories</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{dietPlan.macronutrients.protein}g</div>
              <div className="text-sm text-gray-600">Protein</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{dietPlan.hydration}L</div>
              <div className="text-sm text-gray-600">Water Daily</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Macronutrients:</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Protein:</span> {dietPlan.macronutrients.protein}g</p>
                <p><span className="font-medium">Carbs:</span> {dietPlan.macronutrients.carbs}g</p>
                <p><span className="font-medium">Fats:</span> {dietPlan.macronutrients.fats}g</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Meal Timing:</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Frequency:</span> {dietPlan.mealTiming.frequency}</p>
                <p><span className="font-medium">Pre-workout:</span> {dietPlan.mealTiming.preWorkout}</p>
                <p><span className="font-medium">Post-workout:</span> {dietPlan.mealTiming.postWorkout}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="font-semibold text-gray-800 mb-2">Diet Recommendations:</h4>
            <ul className="space-y-1">
              {dietPlan.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setCurrentStep(1)}
            className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Start Over
          </button>
          <button
            onClick={() => {
              // Save to user profile or generate PDF
              alert('Analysis saved! You can view this in your profile.');
            }}
            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Save Analysis
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Body Analysis & Personalized Plans</h1>
          <p className="text-xl text-gray-600">
            Get personalized workout and diet recommendations based on your unique body structure
          </p>
        </div>

        {!analysis ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      currentStep > step ? 'bg-purple-600' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="mb-8">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg">
                {error}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {currentStep < 3 ? (
                <button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={performAnalysis}
                  disabled={loading || !canProceed()}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Analyzing...' : 'Generate Analysis'}
                </button>
              )}
            </div>
          </div>
        ) : (
          renderResults()
        )}
      </div>
    </div>
  );
};

export default BodyAnalysis; 