import React, { useState, useCallback, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EnhancedBodyAnalysisService, { BODY_TYPES, PHYSIQUE_CHARACTERISTICS } from '../services/enhancedBodyAnalysisService';

const BodyAnalysisPage = ({ routing }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [measurements, setMeasurements] = useState({
    height: '',
    weight: '',
    wristCircumference: '',
    ankleCircumference: '',
    shoulderWidth: '',
    hipWidth: '',
    bodyFatPercentage: '',
    muscleMass: '',
    // Enhanced measurements
    chestCircumference: '',
    waistCircumference: '',
    armCircumference: '',
    thighCircumference: '',
    calfCircumference: '',
    neckCircumference: ''
  });
  
  const [characteristics, setCharacteristics] = useState({
    metabolism: 'moderate',
    weightGainTendency: 'moderate',
    muscleBuildingAbility: 'moderate',
    fatGainTendency: 'moderate',
    recoveryRate: 'moderate',
    energyLevels: 'moderate',
    stressLevel: 'moderate',
    sleepQuality: 'moderate'
  });
  
  const [goals, setGoals] = useState({
    primary: 'muscle_gain',
    secondary: 'strength',
    age: '',
    gender: 'male',
    activityLevel: 'moderate',
    fitnessLevel: 'beginner',
    availableTime: 60,
    // Enhanced goals
    targetWeight: '',
    targetBodyFat: '',
    timeline: '12_weeks',
    experience: 'beginner',
    injuries: [],
    preferences: []
  });
  
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const enhancedBodyAnalysisService = new EnhancedBodyAnalysisService();

  const handleMeasurementChange = useCallback((field, value) => {
    setMeasurements(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleCharacteristicChange = useCallback((field, value) => {
    setCharacteristics(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleGoalChange = useCallback((field, value) => {
    setGoals(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Enhanced validation functions
  const validateStep1 = useCallback(() => {
    const required = ['height', 'weight', 'wristCircumference'];
    const missing = required.filter(field => !measurements[field] || measurements[field] <= 0);
    
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(', ')}`);
      return false;
    }
    
    // Validate measurement ranges
    if (measurements.height && (measurements.height < 120 || measurements.height > 250)) {
      setError('Height should be between 120-250 cm');
      return false;
    }
    
    if (measurements.weight && (measurements.weight < 30 || measurements.weight > 300)) {
      setError('Weight should be between 30-300 kg');
      return false;
    }
    
    setError('');
    return true;
  }, [measurements]);

  const validateStep2 = useCallback(() => {
    setError(''); // Clear any previous errors
    return true; // Characteristics are optional
  }, []);

  const validateStep3 = useCallback(() => {
    const required = ['age', 'gender', 'activityLevel', 'fitnessLevel'];
    const missing = required.filter(field => !goals[field]);
    
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(', ')}`);
      return false;
    }
    
    // Validate age
    if (goals.age && (parseInt(goals.age) < 13 || parseInt(goals.age) > 100)) {
      setError('Please enter a valid age between 13 and 100');
      return false;
    }
    
    setError('');
    return true;
  }, [goals]);

  // Enhanced canProceed calculation
  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 1: 
        const required1 = ['height', 'weight', 'wristCircumference'];
        const hasRequired1 = required1.every(field => measurements[field] && measurements[field] > 0);
        const validHeight = !measurements.height || (measurements.height >= 120 && measurements.height <= 250);
        const validWeight = !measurements.weight || (measurements.weight >= 30 && measurements.weight <= 300);
        return hasRequired1 && validHeight && validWeight;
      case 2: 
        return true; // Characteristics are optional
      case 3: 
        const required3 = ['age', 'gender', 'activityLevel', 'fitnessLevel'];
        const hasRequired = required3.every(field => goals[field]);
        const validAge = !goals.age || (parseInt(goals.age) >= 13 && parseInt(goals.age) <= 100);
        return hasRequired && validAge;
      default: 
        return true;
    }
  }, [currentStep, measurements, goals]);

  const nextStep = useCallback(() => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
    } else if (currentStep === 2) {
      validateStep2();
    } else if (currentStep === 3) {
      if (!validateStep3()) return;
    }
    
    setCurrentStep(prev => prev + 1);
  }, [currentStep, validateStep1, validateStep2, validateStep3]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => prev - 1);
  }, []);

  // Enhanced analysis with more comprehensive results
  const performAnalysis = useCallback(async () => {
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

      // Enhanced body type analysis
      const bodyAnalysis = enhancedBodyAnalysisService.analyzeBodyType(numericMeasurements, characteristics);
      
      // Generate comprehensive workout plan
      const workoutPlan = enhancedBodyAnalysisService.generateWorkoutPlan(
        bodyAnalysis.bodyType,
        numericGoals,
        numericGoals.fitnessLevel,
        numericGoals.availableTime
      );
      
      // Generate comprehensive diet plan
      const dietPlan = enhancedBodyAnalysisService.generateDietPlan(
        bodyAnalysis.bodyType,
        numericGoals,
        numericMeasurements.weight,
        numericMeasurements.height,
        numericGoals.activityLevel,
        numericGoals.fitnessLevel
      );

      // Calculate additional metrics
      const additionalMetrics = calculateAdditionalMetrics(numericMeasurements, bodyAnalysis);

      const fullAnalysis = {
        bodyAnalysis,
        workoutPlan,
        dietPlan,
        measurements: numericMeasurements,
        goals: numericGoals,
        characteristics,
        additionalMetrics,
        timestamp: new Date().toISOString(),
        version: '2.0'
      };

      setAnalysis(fullAnalysis);
      
      // Save enhanced analysis
      const userId = 'user_' + Date.now(); // In production, use actual user ID
      enhancedBodyAnalysisService.saveAnalysis(userId, fullAnalysis);
      
    } catch (err) {
      setError('Error performing analysis. Please check your inputs and try again.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  }, [measurements, goals, characteristics]);

  // Calculate additional health and fitness metrics
  const calculateAdditionalMetrics = (measurements, bodyAnalysis) => {
    const { height, weight, waistCircumference, chestCircumference } = measurements;
    const { bmi, bodyFatPercentage } = bodyAnalysis;
    
    const metrics = {
      bmiCategory: bmi.category,
      healthRisk: bmi.healthRisk,
      idealWeightRange: calculateIdealWeightRange(height, bodyAnalysis.frameSize),
      bodyFatCategory: getBodyFatCategory(bodyFatPercentage, goals.gender),
      waistToHeightRatio: waistCircumference ? (waistCircumference / height) : null,
      waistToChestRatio: waistCircumference && chestCircumference ? (waistCircumference / chestCircumference) : null,
      metabolicAge: calculateMetabolicAge(weight, height, goals.age, bodyFatPercentage),
      fitnessScore: calculateFitnessScore(measurements, characteristics, goals)
    };
    
    return metrics;
  };

  const calculateIdealWeightRange = (height, frameSize) => {
    const heightInches = height * 0.393701;
    const baseWeight = (heightInches - 60) * 2.3 + 50; // Hamwi formula
    
    const ranges = {
      small: { min: baseWeight * 0.9, max: baseWeight * 1.0 },
      medium: { min: baseWeight * 0.95, max: baseWeight * 1.05 },
      large: { min: baseWeight * 1.0, max: baseWeight * 1.1 }
    };
    
    return ranges[frameSize] || ranges.medium;
  };

  const getBodyFatCategory = (bodyFat, gender) => {
    if (gender === 'male') {
      if (bodyFat < 6) return 'Essential fat';
      if (bodyFat < 14) return 'Athletes';
      if (bodyFat < 18) return 'Fitness';
      if (bodyFat < 25) return 'Average';
      return 'Obese';
    } else {
      if (bodyFat < 14) return 'Essential fat';
      if (bodyFat < 21) return 'Athletes';
      if (bodyFat < 25) return 'Fitness';
      if (bodyFat < 32) return 'Average';
      return 'Obese';
    }
  };

  const calculateMetabolicAge = (weight, height, age, bodyFat) => {
    // Simplified metabolic age calculation
    const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    const expectedBmr = 10 * weight + 6.25 * height - 5 * 25 + 5; // Compare to age 25
    
    const ratio = bmr / expectedBmr;
    return Math.round(25 + (ratio - 1) * 20); // Rough estimation
  };

  const calculateFitnessScore = (measurements, characteristics, goals) => {
    let score = 50; // Base score
    
    // Adjust based on body composition
    if (measurements.bodyFatPercentage) {
      const bodyFat = measurements.bodyFatPercentage;
      if (bodyFat < 15) score += 20;
      else if (bodyFat < 20) score += 15;
      else if (bodyFat < 25) score += 10;
      else if (bodyFat < 30) score += 5;
    }
    
    // Adjust based on characteristics
    if (characteristics.muscleBuildingAbility === 'good') score += 10;
    if (characteristics.recoveryRate === 'fast') score += 10;
    if (characteristics.energyLevels === 'high') score += 10;
    
    // Adjust based on goals and experience
    if (goals.fitnessLevel === 'advanced') score += 15;
    else if (goals.fitnessLevel === 'intermediate') score += 10;
    
    return Math.min(100, Math.max(0, score));
  };

  // Reset function to start over completely
  const resetForm = useCallback(() => {
    // Show confirmation dialog if user has entered data
    const hasData = Object.values(measurements).some(val => val !== '') || 
                   Object.values(goals).some(val => val !== '' && val !== 'muscle_gain' && val !== 'male' && val !== 'moderate' && val !== 'beginner' && val !== 60);
    
    if (hasData && !window.confirm('Are you sure you want to start over? All your entered data will be lost.')) {
      return;
    }
    
    setMeasurements({
      height: '',
      weight: '',
      wristCircumference: '',
      ankleCircumference: '',
      shoulderWidth: '',
      hipWidth: '',
      bodyFatPercentage: '',
      muscleMass: '',
      chestCircumference: '',
      waistCircumference: '',
      armCircumference: '',
      thighCircumference: '',
      calfCircumference: '',
      neckCircumference: ''
    });
    
    setCharacteristics({
      metabolism: 'moderate',
      weightGainTendency: 'moderate',
      muscleBuildingAbility: 'moderate',
      fatGainTendency: 'moderate',
      recoveryRate: 'moderate',
      energyLevels: 'moderate',
      stressLevel: 'moderate',
      sleepQuality: 'moderate'
    });
    
    setGoals({
      primary: 'muscle_gain',
      secondary: 'strength',
      age: '',
      gender: 'male',
      activityLevel: 'moderate',
      fitnessLevel: 'beginner',
      availableTime: 60,
      targetWeight: '',
      targetBodyFat: '',
      timeline: '12_weeks',
      experience: 'beginner',
      injuries: [],
      preferences: []
    });
    
    setAnalysis(null);
    setError('');
    setCurrentStep(1);
    setShowAdvancedOptions(false);
  }, [measurements, goals]);

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Body Measurements</h3>
        <p className="text-gray-600 mb-6">Please provide your body measurements for accurate analysis. More measurements = more accurate results.</p>
      </div>
      
      {/* Basic Measurements */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-3">Essential Measurements</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Height (cm) *
            </label>
            <input
              type="number"
              value={measurements.height}
              onChange={(e) => handleMeasurementChange('height', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="170"
              min="120"
              max="250"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight (kg) *
            </label>
            <input
              type="number"
              value={measurements.weight}
              onChange={(e) => handleMeasurementChange('weight', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="70"
              min="30"
              max="300"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wrist Circumference (cm) *
            </label>
            <input
              type="number"
              value={measurements.wristCircumference}
              onChange={(e) => handleMeasurementChange('wristCircumference', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="16"
              min="10"
              max="30"
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
              min="15"
              max="40"
            />
          </div>
        </div>
      </div>

      {/* Advanced Measurements Toggle */}
      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium"
        >
          <span>{showAdvancedOptions ? 'Hide' : 'Show'} Advanced Measurements</span>
          <svg
            className={`w-5 h-5 transform transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Advanced Measurements */}
      {showAdvancedOptions && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-900 mb-3">Advanced Measurements (Optional)</h4>
          <p className="text-sm text-green-700 mb-4">These measurements will provide more accurate body composition analysis.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                min="30"
                max="70"
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
                min="25"
                max="60"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chest Circumference (cm)
              </label>
              <input
                type="number"
                value={measurements.chestCircumference}
                onChange={(e) => handleMeasurementChange('chestCircumference', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="95"
                min="70"
                max="150"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Waist Circumference (cm)
              </label>
              <input
                type="number"
                value={measurements.waistCircumference}
                onChange={(e) => handleMeasurementChange('waistCircumference', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="80"
                min="50"
                max="150"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arm Circumference (cm)
              </label>
              <input
                type="number"
                value={measurements.armCircumference}
                onChange={(e) => handleMeasurementChange('armCircumference', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="30"
                min="20"
                max="50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thigh Circumference (cm)
              </label>
              <input
                type="number"
                value={measurements.thighCircumference}
                onChange={(e) => handleMeasurementChange('thighCircumference', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="55"
                min="35"
                max="80"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calf Circumference (cm)
              </label>
              <input
                type="number"
                value={measurements.calfCircumference}
                onChange={(e) => handleMeasurementChange('calfCircumference', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="35"
                min="25"
                max="55"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Neck Circumference (cm)
              </label>
              <input
                type="number"
                value={measurements.neckCircumference}
                onChange={(e) => handleMeasurementChange('neckCircumference', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="38"
                min="25"
                max="50"
              />
            </div>
          </div>
        </div>
      )}

      {/* Body Composition Estimates */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h4 className="font-medium text-yellow-900 mb-3">Body Composition Estimates (Optional)</h4>
        <p className="text-sm text-yellow-700 mb-4">If you have access to body composition measurements, please provide them for enhanced accuracy.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Body Fat Percentage (%)
            </label>
            <input
              type="number"
              value={measurements.bodyFatPercentage}
              onChange={(e) => handleMeasurementChange('bodyFatPercentage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="15"
              min="5"
              max="50"
              step="0.1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Muscle Mass (kg)
            </label>
            <input
              type="number"
              value={measurements.muscleMass}
              onChange={(e) => handleMeasurementChange('muscleMass', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="35"
              min="20"
              max="100"
              step="0.1"
            />
          </div>
        </div>
      </div>

      {/* Measurement Tips */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Measurement Tips</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Measure in the morning before eating for most accurate results</li>
          <li>• Use a flexible measuring tape and measure at the widest point</li>
          <li>• For circumference measurements, keep the tape snug but not tight</li>
          <li>• Stand naturally with arms at your sides when measuring</li>
          <li>• If you don't have body fat measurements, we'll estimate them</li>
        </ul>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Body Characteristics</h3>
        <p className="text-gray-600 mb-6">Help us understand your body's natural tendencies and responses to training.</p>
      </div>
      
      {/* Primary Characteristics */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-3">Primary Characteristics</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metabolism Rate
            </label>
            <select
              value={characteristics.metabolism}
              onChange={(e) => handleCharacteristicChange('metabolism', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="slow">Slow - Difficulty losing weight</option>
              <option value="moderate">Moderate - Balanced metabolism</option>
              <option value="fast">Fast - Difficulty gaining weight</option>
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
              <option value="difficult">Difficult - Hard to gain weight</option>
              <option value="moderate">Moderate - Balanced weight gain</option>
              <option value="easy">Easy - Tend to gain weight easily</option>
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
              <option value="poor">Poor - Difficulty building muscle</option>
              <option value="moderate">Moderate - Average muscle building</option>
              <option value="good">Good - Responds well to training</option>
              <option value="excellent">Excellent - Very responsive to training</option>
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
              <option value="difficult">Difficult - Hard to gain fat</option>
              <option value="moderate">Moderate - Balanced fat gain</option>
              <option value="easy">Easy - Tend to gain fat easily</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced Characteristics */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-medium text-green-900 mb-3">Enhanced Characteristics</h4>
        <p className="text-sm text-green-700 mb-4">These additional characteristics help us create more personalized recommendations.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recovery Rate
            </label>
            <select
              value={characteristics.recoveryRate}
              onChange={(e) => handleCharacteristicChange('recoveryRate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="slow">Slow - Need more rest between workouts</option>
              <option value="moderate">Moderate - Average recovery time</option>
              <option value="fast">Fast - Quick recovery between workouts</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Energy Levels
            </label>
            <select
              value={characteristics.energyLevels}
              onChange={(e) => handleCharacteristicChange('energyLevels', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="low">Low - Often feel tired</option>
              <option value="moderate">Moderate - Generally good energy</option>
              <option value="high">High - High energy throughout the day</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stress Level
            </label>
            <select
              value={characteristics.stressLevel}
              onChange={(e) => handleCharacteristicChange('stressLevel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="low">Low - Minimal stress</option>
              <option value="moderate">Moderate - Some stress</option>
              <option value="high">High - High stress levels</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sleep Quality
            </label>
            <select
              value={characteristics.sleepQuality}
              onChange={(e) => handleCharacteristicChange('sleepQuality', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="poor">Poor - Difficulty sleeping well</option>
              <option value="moderate">Moderate - Generally good sleep</option>
              <option value="excellent">Excellent - Deep, restful sleep</option>
            </select>
          </div>
        </div>
      </div>

      {/* Characteristic Descriptions */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Understanding Your Characteristics</h4>
        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Metabolism Rate:</strong> How quickly your body processes calories and nutrients.</p>
          <p><strong>Weight Gain Tendency:</strong> How easily you gain or lose weight naturally.</p>
          <p><strong>Muscle Building Ability:</strong> How responsive your body is to strength training.</p>
          <p><strong>Fat Gain Tendency:</strong> How easily you store fat when consuming excess calories.</p>
          <p><strong>Recovery Rate:</strong> How quickly you recover between workouts.</p>
          <p><strong>Energy Levels:</strong> Your natural energy throughout the day.</p>
          <p><strong>Stress Level:</strong> Your current stress levels and their impact on fitness.</p>
          <p><strong>Sleep Quality:</strong> The quality and consistency of your sleep.</p>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Goals & Preferences</h3>
        <p className="text-gray-600 mb-6">Tell us about your fitness goals and current situation for personalized recommendations.</p>
      </div>
      
      {/* Primary Goals */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-3">Primary Goals</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Goal *
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
              <option value="body_recomposition">Body Recomposition</option>
              <option value="sport_performance">Sport Performance</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Goal
            </label>
            <select
              value={goals.secondary}
              onChange={(e) => handleGoalChange('secondary', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="strength">Strength</option>
              <option value="endurance">Endurance</option>
              <option value="flexibility">Flexibility</option>
              <option value="power">Power</option>
              <option value="balance">Balance</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-medium text-green-900 mb-3">Personal Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age *
            </label>
            <input
              type="number"
              value={goals.age}
              onChange={(e) => handleGoalChange('age', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="25"
              min="13"
              max="100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender *
            </label>
            <select
              value={goals.gender}
              onChange={(e) => handleGoalChange('gender', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activity Level *
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
              Fitness Level *
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
        </div>
      </div>

      {/* Enhanced Goals */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h4 className="font-medium text-yellow-900 mb-3">Enhanced Goals (Optional)</h4>
        <p className="text-sm text-yellow-700 mb-4">These additional goals help us create more targeted recommendations.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Weight (kg)
            </label>
            <input
              type="number"
              value={goals.targetWeight}
              onChange={(e) => handleGoalChange('targetWeight', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="75"
              min="30"
              max="300"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Body Fat (%)
            </label>
            <input
              type="number"
              value={goals.targetBodyFat}
              onChange={(e) => handleGoalChange('targetBodyFat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="15"
              min="5"
              max="50"
              step="0.1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timeline
            </label>
            <select
              value={goals.timeline}
              onChange={(e) => handleGoalChange('timeline', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="4_weeks">4 weeks</option>
              <option value="8_weeks">8 weeks</option>
              <option value="12_weeks">12 weeks</option>
              <option value="16_weeks">16 weeks</option>
              <option value="6_months">6 months</option>
              <option value="1_year">1 year</option>
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
              <option value={120}>120 minutes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Training Preferences */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <h4 className="font-medium text-purple-900 mb-3">Training Preferences</h4>
        <p className="text-sm text-purple-700 mb-4">Help us understand your training preferences and limitations.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Training Experience
            </label>
            <select
              value={goals.experience}
              onChange={(e) => handleGoalChange('experience', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="beginner">Beginner - New to fitness</option>
              <option value="intermediate">Intermediate - Some experience</option>
              <option value="advanced">Advanced - Experienced lifter</option>
              <option value="expert">Expert - Professional/Competitive</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Equipment Access
            </label>
            <select
              value={goals.equipmentAccess || 'gym'}
              onChange={(e) => handleGoalChange('equipmentAccess', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="gym">Full Gym Access</option>
              <option value="home_gym">Home Gym</option>
              <option value="limited">Limited Equipment</option>
              <option value="bodyweight">Bodyweight Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Health Considerations */}
      <div className="bg-red-50 p-4 rounded-lg">
        <h4 className="font-medium text-red-900 mb-3">Health Considerations</h4>
        <p className="text-sm text-red-700 mb-4">Please let us know about any health considerations that might affect your training.</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Do you have any injuries or health conditions?
            </label>
            <textarea
              value={goals.injuries?.join(', ') || ''}
              onChange={(e) => handleGoalChange('injuries', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="e.g., Lower back pain, knee injury, etc. (leave blank if none)"
              rows="3"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Any dietary restrictions or preferences?
            </label>
            <textarea
              value={goals.preferences?.join(', ') || ''}
              onChange={(e) => handleGoalChange('preferences', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="e.g., Vegetarian, gluten-free, etc. (leave blank if none)"
              rows="3"
            />
          </div>
        </div>
      </div>

      {/* Goal Setting Tips */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Setting Effective Goals</h4>
        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>SMART Goals:</strong> Specific, Measurable, Achievable, Relevant, Time-bound</p>
          <p><strong>Realistic Timeline:</strong> Muscle gain typically takes 0.5-1kg per month</p>
          <p><strong>Weight Loss:</strong> Aim for 0.5-1kg per week for sustainable results</p>
          <p><strong>Consistency:</strong> Regular training and nutrition are key to success</p>
          <p><strong>Patience:</strong> Results take time - focus on progress, not perfection</p>
        </div>
      </div>
    </div>
  );

  const renderResults = () => {
    if (!analysis) return null;

    const { bodyAnalysis, workoutPlan, dietPlan, additionalMetrics } = analysis;
    const bodyTypeInfo = PHYSIQUE_CHARACTERISTICS[bodyAnalysis.bodyType];

    return (
      <div className="space-y-8">
        {/* Header with Confidence Score */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-3xl font-bold mb-2">Your Body Analysis Results</h3>
              <p className="text-purple-100">Comprehensive analysis completed with enhanced accuracy</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{Math.round(bodyAnalysis.confidence * 100)}%</div>
              <div className="text-sm text-purple-100">Confidence Score</div>
            </div>
          </div>
        </div>

        {/* Body Type Analysis */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-800">Body Type: {bodyTypeInfo.name}</h3>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              {bodyAnalysis.bodyType}
            </span>
          </div>
          
          <p className="text-gray-600 mb-6 text-lg">{bodyTypeInfo.description}</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-3">Key Characteristics</h4>
              <ul className="space-y-2">
                {bodyTypeInfo.characteristics.slice(0, 4).map((char, index) => (
                  <li key={index} className="text-sm text-blue-800 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {char}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-3">Body Metrics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-800">Frame Size:</span>
                  <span className="font-medium">{bodyAnalysis.frameSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-800">BMI:</span>
                  <span className="font-medium">{bodyAnalysis.bmi.value} ({bodyAnalysis.bmi.category})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-800">Body Fat:</span>
                  <span className="font-medium">{bodyAnalysis.bodyFatPercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-800">Muscle Mass:</span>
                  <span className="font-medium">{bodyAnalysis.muscleMass} kg</span>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-3">Somatotype</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-800">Endomorphy:</span>
                  <span className="font-medium">{bodyAnalysis.somatotype.endomorphy}/7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-800">Mesomorphy:</span>
                  <span className="font-medium">{bodyAnalysis.somatotype.mesomorphy}/7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-800">Ectomorphy:</span>
                  <span className="font-medium">{bodyAnalysis.somatotype.ectomorphy}/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Health Metrics */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Health & Fitness Metrics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-lg text-white">
              <div className="text-2xl font-bold">{additionalMetrics.fitnessScore}</div>
              <div className="text-sm text-blue-100">Fitness Score</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-lg text-white">
              <div className="text-2xl font-bold">{additionalMetrics.metabolicAge}</div>
              <div className="text-sm text-green-100">Metabolic Age</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-lg text-white">
              <div className="text-2xl font-bold">{additionalMetrics.bodyFatCategory}</div>
              <div className="text-sm text-purple-100">Body Fat Category</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-lg text-white">
              <div className="text-2xl font-bold">{additionalMetrics.healthRisk}</div>
              <div className="text-sm text-orange-100">Health Risk</div>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Ideal Weight Range</h4>
              <p className="text-gray-600">
                {Math.round(additionalMetrics.idealWeightRange.min)} - {Math.round(additionalMetrics.idealWeightRange.max)} kg
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Body Composition</h4>
              <div className="text-sm text-gray-600">
                <div>Fat: {bodyAnalysis.bodyComposition.fat} kg</div>
                <div>Muscle: {bodyAnalysis.bodyComposition.muscle} kg</div>
                <div>Lean Mass: {bodyAnalysis.bodyComposition.leanBodyMass} kg</div>
              </div>
            </div>
          </div>
        </div>

        {/* Workout Plan */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Personalized Workout Plan</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Training Overview</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Frequency:</span>
                  <span className="font-medium">{workoutPlan.frequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{workoutPlan.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Level:</span>
                  <span className="font-medium capitalize">{workoutPlan.fitnessLevel}</span>
                </div>
              </div>
              
              <h4 className="font-semibold text-gray-800 mb-3 mt-4">Focus Areas</h4>
              <ul className="space-y-1">
                {workoutPlan.focus.map((focus, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {focus}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Recommended Exercises</h4>
              <div className="grid grid-cols-2 gap-2">
                {workoutPlan.exercises.slice(0, 8).map((exercise, index) => (
                  <div key={index} className="bg-blue-50 px-3 py-2 rounded text-sm text-blue-800">
                    {exercise}
                  </div>
                ))}
              </div>
              
              <h4 className="font-semibold text-gray-800 mb-3 mt-4">Recovery Guidelines</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Rest between workouts: {workoutPlan.recoveryGuidelines.restBetweenWorkouts}</div>
                <div>Sleep: {workoutPlan.recoveryGuidelines.sleepRecommendation}</div>
                <div>Nutrition timing: {workoutPlan.recoveryGuidelines.nutritionTiming}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Diet Plan */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Personalized Nutrition Plan</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-3">Daily Targets</h4>
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-800">{dietPlan.targetCalories}</div>
                  <div className="text-sm text-green-600">Total Calories</div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="font-semibold text-green-800">{dietPlan.macronutrients.protein}g</div>
                    <div className="text-xs text-green-600">Protein</div>
                  </div>
                  <div>
                    <div className="font-semibold text-green-800">{dietPlan.macronutrients.carbs}g</div>
                    <div className="text-xs text-green-600">Carbs</div>
                  </div>
                  <div>
                    <div className="font-semibold text-green-800">{dietPlan.macronutrients.fats}g</div>
                    <div className="text-xs text-green-600">Fats</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Nutrition Strategy</h4>
              <ul className="space-y-2">
                {dietPlan.recommendations.slice(0, 4).map((rec, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {rec}
                  </li>
                ))}
              </ul>
              
              <h4 className="font-semibold text-gray-800 mb-3 mt-4">Meal Timing</h4>
              <div className="text-sm text-gray-600">
                <div>Frequency: {dietPlan.mealTiming.frequency}</div>
                <div>Pre-workout: {dietPlan.mealTiming.preWorkout}</div>
                <div>Post-workout: {dietPlan.mealTiming.postWorkout}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Hydration & Supplements</h4>
              <div className="space-y-3">
                <div>
                  <div className="text-lg font-bold text-blue-800">{dietPlan.hydration}L</div>
                  <div className="text-sm text-gray-600">Daily Water Intake</div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-800 mb-2">Recommended Supplements</h5>
                  <div className="space-y-1">
                    {dietPlan.supplements.essential.slice(0, 3).map((supp, index) => (
                      <div key={index} className="text-sm text-gray-600">• {supp}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={resetForm}
            className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Start New Analysis
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Print Results
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar routing={routing} />
      <div className="py-10">
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
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-800 rounded-lg flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Success Message */}
              {!error && currentStep > 1 && (
                <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-800 rounded-lg flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Step {currentStep - 1} completed successfully!
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <div className="flex gap-4">
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Start Over
                  </button>
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                </div>
                
                {currentStep < 3 ? (
                  <button
                    onClick={nextStep}
                    disabled={!canProceed}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={performAnalysis}
                    disabled={loading || !canProceed}
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
      <Footer routing={routing} />
    </div>
  );
};

export default BodyAnalysisPage; 