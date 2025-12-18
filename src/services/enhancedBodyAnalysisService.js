// Enhanced Body Analysis Service for advanced physique recognition and personalized recommendations

// Advanced body type classifications with subtypes
export const BODY_TYPES = {
  ECTOMORPH: 'ectomorph',
  MESOMORPH: 'mesomorph', 
  ENDOMORPH: 'endomorph',
  ECTO_MESOMORPH: 'ecto-mesomorph',
  MESO_ENDOMORPH: 'meso-endomorph',
  // Advanced subtypes
  ATHLETIC_ECTOMORPH: 'athletic-ectomorph',
  POWER_MESOMORPH: 'power-mesomorph',
  LEAN_ENDOMORPH: 'lean-endomorph',
  BALANCED_HYBRID: 'balanced-hybrid'
};

// Enhanced physique characteristics with detailed analysis
export const PHYSIQUE_CHARACTERISTICS = {
  [BODY_TYPES.ECTOMORPH]: {
    name: 'Ectomorph',
    description: 'Naturally thin with long limbs and small muscle mass',
    characteristics: [
      'Naturally thin and lean',
      'Long limbs and narrow frame',
      'Small joints and muscle mass',
      'Fast metabolism',
      'Difficulty gaining weight and muscle',
      'Low body fat percentage',
      'Narrow shoulders and hips'
    ],
    workoutFocus: [
      'Strength training with compound movements',
      'Progressive overload with longer rest periods',
      'Higher calorie intake with frequent meals',
      'Adequate rest between workouts (48-72 hours)',
      'Focus on muscle building over cardio',
      'Lower rep ranges (4-8 reps) with heavier weights'
    ],
    dietFocus: [
      'High calorie surplus (400-600 calories)',
      'High protein (2.0-2.4g per kg body weight)',
      'Moderate to high carbs (4-7g per kg)',
      'Healthy fats (0.8-1.2g per kg)',
      'Frequent meals (6-8 times per day)',
      'Pre and post-workout nutrition timing'
    ],
    metabolism: 'fast',
    muscleBuildingPotential: 'low',
    fatGainTendency: 'very_low',
    recoveryRate: 'slow'
  },
  [BODY_TYPES.MESOMORPH]: {
    name: 'Mesomorph',
    description: 'Athletic build with natural muscle mass and strength',
    characteristics: [
      'Athletic and muscular build',
      'Medium frame and bone structure',
      'Gains muscle easily',
      'Responds well to training',
      'Can gain and lose weight relatively easily',
      'Broad shoulders and narrow waist',
      'Good muscle definition'
    ],
    workoutFocus: [
      'Balanced strength and cardio training',
      'Moderate to high intensity workouts',
      'Variety in training methods',
      'Consistent progressive overload',
      'Moderate rest periods (24-48 hours)',
      'Mix of compound and isolation exercises'
    ],
    dietFocus: [
      'Moderate calorie surplus (200-400 calories)',
      'High protein (1.8-2.2g per kg body weight)',
      'Balanced macronutrients',
      'Regular meal timing',
      'Adequate hydration',
      'Strategic carb cycling'
    ],
    metabolism: 'moderate',
    muscleBuildingPotential: 'high',
    fatGainTendency: 'moderate',
    recoveryRate: 'fast'
  },
  [BODY_TYPES.ENDOMORPH]: {
    name: 'Endomorph',
    description: 'Naturally heavier with more body fat and slower metabolism',
    characteristics: [
      'Naturally heavier build',
      'Wider frame and larger joints',
      'Higher body fat percentage',
      'Slower metabolism',
      'Gains muscle and fat easily',
      'Rounder body shape',
      'Strong lower body'
    ],
    workoutFocus: [
      'High-intensity cardio training',
      'Strength training with higher reps',
      'Circuit training and HIIT',
      'Regular cardio sessions',
      'Focus on compound movements',
      'Shorter rest periods (30-60 seconds)'
    ],
    dietFocus: [
      'Calorie deficit (300-500 calories)',
      'High protein (2.0-2.4g per kg body weight)',
      'Lower carb intake (2-4g per kg)',
      'Higher fiber foods',
      'Regular meal timing',
      'Adequate hydration',
      'Intermittent fasting options'
    ],
    metabolism: 'slow',
    muscleBuildingPotential: 'moderate',
    fatGainTendency: 'high',
    recoveryRate: 'moderate'
  },
  [BODY_TYPES.ATHLETIC_ECTOMORPH]: {
    name: 'Athletic Ectomorph',
    description: 'Thin but athletic with good muscle definition',
    characteristics: [
      'Thin but athletic build',
      'Good muscle definition',
      'Fast metabolism with training adaptation',
      'Excellent endurance',
      'Good recovery rate',
      'Lean muscle mass'
    ],
    workoutFocus: [
      'Strength training with moderate volume',
      'Endurance training integration',
      'Sport-specific training',
      'Moderate rest periods',
      'Progressive overload',
      'Recovery-focused approach'
    ],
    dietFocus: [
      'Moderate calorie surplus (300-400 calories)',
      'High protein (1.8-2.0g per kg body weight)',
      'Strategic carb timing',
      'Quality nutrition sources',
      'Hydration focus',
      'Performance-based nutrition'
    ],
    metabolism: 'fast_adaptive',
    muscleBuildingPotential: 'moderate',
    fatGainTendency: 'very_low',
    recoveryRate: 'fast'
  },
  [BODY_TYPES.POWER_MESOMORPH]: {
    name: 'Power Mesomorph',
    description: 'Strong, muscular build with power athlete characteristics',
    characteristics: [
      'Strong, muscular build',
      'Excellent strength potential',
      'Good power output',
      'Moderate to fast metabolism',
      'Good muscle building response',
      'Athletic performance focus'
    ],
    workoutFocus: [
      'Power and strength training',
      'Olympic lifts and compound movements',
      'Moderate cardio for conditioning',
      'Progressive overload',
      'Sport-specific training',
      'Recovery and mobility work'
    ],
    dietFocus: [
      'Moderate calorie surplus (300-500 calories)',
      'High protein (2.0-2.4g per kg body weight)',
      'Strategic carb cycling',
      'Performance nutrition timing',
      'Quality supplementation',
      'Hydration and electrolyte balance'
    ],
    metabolism: 'moderate_fast',
    muscleBuildingPotential: 'very_high',
    fatGainTendency: 'low_moderate',
    recoveryRate: 'very_fast'
  }
};

// Enhanced body measurements and analysis
export class EnhancedBodyAnalysisService {
  constructor() {
    this.bodyType = null;
    this.measurements = {};
    this.goals = {};
    this.activityLevel = 'moderate';
    this.analysisHistory = [];
  }

  // Advanced body type analysis with multiple factors
  analyzeBodyType(measurements, characteristics = {}) {
    const {
      height,
      weight,
      wristCircumference,
      ankleCircumference,
      shoulderWidth,
      hipWidth,
      bodyFatPercentage,
      muscleMass,
      chestCircumference,
      waistCircumference,
      armCircumference,
      thighCircumference,
      calfCircumference
    } = measurements;

    const {
      metabolism = 'moderate',
      weightGainTendency = 'moderate',
      muscleBuildingAbility = 'moderate',
      fatGainTendency = 'moderate',
      recoveryRate = 'moderate',
      energyLevels = 'moderate'
    } = characteristics;

    // Calculate advanced body metrics
    const frameSize = this.calculateFrameSize(height, wristCircumference);
    const bmi = this.calculateBMI(height, weight);
    const bodyFatEstimate = this.estimateBodyFat(bmi, frameSize, measurements);
    const muscleMassEstimate = this.estimateMuscleMass(weight, bodyFatEstimate);
    const bodyComposition = this.calculateBodyComposition(weight, bodyFatEstimate, muscleMassEstimate);
    const somatotype = this.calculateSomatotype(measurements, characteristics);
    
    // Advanced body type determination using multiple algorithms
    const bodyType = this.determineAdvancedBodyType({
      frameSize,
      bmi,
      bodyFatEstimate,
      muscleMassEstimate,
      bodyComposition,
      somatotype,
      characteristics,
      measurements
    });

    this.bodyType = bodyType;
    this.measurements = measurements;
    
    return {
      bodyType,
      frameSize,
      bmi,
      bodyFatPercentage: bodyFatEstimate,
      muscleMass: muscleMassEstimate,
      bodyComposition,
      somatotype,
      characteristics: PHYSIQUE_CHARACTERISTICS[bodyType],
      confidence: this.calculateAnalysisConfidence(measurements, characteristics)
    };
  }

  // Calculate frame size with enhanced accuracy
  calculateFrameSize(height, wristCircumference) {
    const heightInches = height * 0.393701;
    const wristInches = wristCircumference * 0.393701;
    
    // Enhanced frame size calculation
    const frameIndex = heightInches / wristInches;
    
    if (frameIndex > 10.4) return 'small';
    if (frameIndex < 9.6) return 'large';
    return 'medium';
  }

  // Enhanced BMI calculation with interpretation
  calculateBMI(height, weight) {
    const heightMeters = height / 100;
    const bmi = weight / (heightMeters * heightMeters);
    
    return {
      value: parseFloat(bmi.toFixed(1)),
      category: this.getBMICategory(bmi),
      healthRisk: this.getBMIHealthRisk(bmi)
    };
  }

  // Get BMI category
  getBMICategory(bmi) {
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'overweight';
    return 'obese';
  }

  // Get BMI health risk assessment
  getBMIHealthRisk(bmi) {
    if (bmi < 18.5) return 'low';
    if (bmi < 25) return 'very_low';
    if (bmi < 30) return 'moderate';
    return 'high';
  }

  // Enhanced body fat estimation
  estimateBodyFat(bmi, frameSize, measurements) {
    const { chestCircumference, waistCircumference, hipWidth } = measurements;
    
    // Multiple estimation methods for accuracy
    const bmiBased = this.estimateBodyFatFromBMI(bmi.value, frameSize);
    const circumferenceBased = this.estimateBodyFatFromCircumference(chestCircumference, waistCircumference, hipWidth);
    
    // Weighted average for better accuracy
    return Math.round((bmiBased * 0.6 + circumferenceBased * 0.4) * 10) / 10;
  }

  estimateBodyFatFromBMI(bmi, frameSize) {
    let baseFat = 20;
    
    if (bmi < 18.5) baseFat = 12;
    else if (bmi < 25) baseFat = 18;
    else if (bmi < 30) baseFat = 25;
    else baseFat = 32;
    
    // Adjust for frame size
    if (frameSize === 'small') baseFat -= 2;
    else if (frameSize === 'large') baseFat += 2;
    
    return Math.max(8, Math.min(40, baseFat));
  }

  estimateBodyFatFromCircumference(chest, waist, hipWidth) {
    if (!chest || !waist) return 20; // Default if measurements missing
    
    // Simplified Navy method approximation
    const waistToChestRatio = waist / chest;
    let estimatedFat = 15;
    
    if (waistToChestRatio > 0.9) estimatedFat = 25;
    else if (waistToChestRatio > 0.8) estimatedFat = 20;
    else estimatedFat = 15;
    
    return estimatedFat;
  }

  // Enhanced muscle mass estimation
  estimateMuscleMass(weight, bodyFatPercentage) {
    const leanBodyMass = weight * (1 - bodyFatPercentage / 100);
    return Math.round(leanBodyMass * 0.6 * 10) / 10; // Assume 60% of lean mass is muscle
  }

  // Calculate body composition
  calculateBodyComposition(weight, bodyFatPercentage, muscleMass) {
    const fatMass = weight * (bodyFatPercentage / 100);
    const boneMass = weight * 0.15; // Estimated bone mass
    const otherMass = weight - fatMass - muscleMass - boneMass;
    
    return {
      fat: Math.round(fatMass * 10) / 10,
      muscle: muscleMass,
      bone: Math.round(boneMass * 10) / 10,
      other: Math.round(otherMass * 10) / 10,
      leanBodyMass: Math.round((weight - fatMass) * 10) / 10
    };
  }

  // Calculate somatotype (Sheldon's body type classification)
  calculateSomatotype(measurements, characteristics) {
    const { height, weight, shoulderWidth, hipWidth } = measurements;
    const { metabolism, muscleBuildingAbility } = characteristics;
    
    // Simplified somatotype calculation
    let endomorphy = 0, mesomorphy = 0, ectomorphy = 0;
    
    // Endomorphy (fatness)
    if (weight > height * 0.4) endomorphy += 3;
    else if (weight > height * 0.35) endomorphy += 2;
    else endomorphy += 1;
    
    // Mesomorphy (muscularity)
    if (muscleBuildingAbility === 'good') mesomorphy += 3;
    else if (muscleBuildingAbility === 'moderate') mesomorphy += 2;
    else mesomorphy += 1;
    
    // Ectomorphy (linearity)
    if (height > 180 && weight < 70) ectomorphy += 3;
    else if (height > 175 && weight < 75) ectomorphy += 2;
    else ectomorphy += 1;
    
    return { endomorphy, mesomorphy, ectomorphy };
  }

  // Advanced body type determination
  determineAdvancedBodyType(analysis) {
    const { frameSize, bmi, bodyFatEstimate, muscleMassEstimate, somatotype, characteristics } = analysis;
    
    // Primary classification based on somatotype
    const { endomorphy, mesomorphy, ectomorphy } = somatotype;
    
    // Determine dominant component
    const maxComponent = Math.max(endomorphy, mesomorphy, ectomorphy);
    
    if (maxComponent === ectomorphy) {
      if (mesomorphy >= 2) return BODY_TYPES.ATHLETIC_ECTOMORPH;
      return BODY_TYPES.ECTOMORPH;
    } else if (maxComponent === mesomorphy) {
      if (endomorphy >= 2) return BODY_TYPES.POWER_MESOMORPH;
      return BODY_TYPES.MESOMORPH;
    } else if (maxComponent === endomorphy) {
      return BODY_TYPES.ENDOMORPH;
    }
    
    // Secondary classification based on characteristics
    if (characteristics.muscleBuildingAbility === 'good' && characteristics.fatGainTendency === 'easy') {
      return BODY_TYPES.MESO_ENDOMORPH;
    } else if (characteristics.muscleBuildingAbility === 'moderate' && characteristics.fatGainTendency === 'difficult') {
      return BODY_TYPES.ECTO_MESOMORPH;
    }
    
    return BODY_TYPES.BALANCED_HYBRID;
  }

  // Calculate analysis confidence
  calculateAnalysisConfidence(measurements, characteristics) {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on measurement completeness
    const requiredMeasurements = ['height', 'weight', 'wristCircumference'];
    const optionalMeasurements = ['chestCircumference', 'waistCircumference', 'shoulderWidth', 'hipWidth'];
    
    const hasRequired = requiredMeasurements.every(m => measurements[m] && measurements[m] > 0);
    const hasOptional = optionalMeasurements.filter(m => measurements[m] && measurements[m] > 0).length;
    
    if (hasRequired) confidence += 0.3;
    confidence += (hasOptional / optionalMeasurements.length) * 0.2;
    
    return Math.min(0.95, confidence);
  }

  // Enhanced workout plan generation with periodization
  generateWorkoutPlan(bodyType, goals, fitnessLevel = 'beginner', availableTime = 60) {
    const baseWorkout = PHYSIQUE_CHARACTERISTICS[bodyType].workoutFocus;
    
    const workoutTemplates = this.getAdvancedWorkoutTemplates(bodyType, fitnessLevel);
    const template = workoutTemplates[fitnessLevel] || workoutTemplates.beginner;
    
    // Generate periodized plan
    const periodizedPlan = this.generatePeriodizedPlan(bodyType, goals, fitnessLevel, availableTime);
    
    return {
      bodyType,
      fitnessLevel,
      frequency: template.frequency,
      duration: template.duration,
      focus: template.focus,
      exercises: template.exercises,
      recommendations: baseWorkout,
      periodizedPlan,
      progressionStrategy: this.getProgressionStrategy(bodyType, fitnessLevel),
      recoveryGuidelines: this.getRecoveryGuidelines(bodyType, fitnessLevel)
    };
  }

  // Get advanced workout templates
  getAdvancedWorkoutTemplates(bodyType, fitnessLevel) {
    const templates = {
      [BODY_TYPES.ECTOMORPH]: {
        beginner: {
          frequency: '3-4 times per week',
          duration: '45-60 minutes',
          focus: ['Compound movements', 'Progressive overload', 'Adequate rest', 'Form mastery'],
          exercises: [
            'Squats', 'Deadlifts', 'Bench Press', 'Pull-ups', 'Overhead Press',
            'Rows', 'Lunges', 'Dips', 'Planks', 'Farmer\'s Walks'
          ]
        },
        intermediate: {
          frequency: '4-5 times per week',
          duration: '60-75 minutes',
          focus: ['Split training', 'Progressive overload', 'Recovery', 'Volume management'],
          exercises: [
            'Power cleans', 'Romanian deadlifts', 'Incline bench press',
            'Weighted pull-ups', 'Military press', 'Barbell rows',
            'Front squats', 'Dumbbell presses', 'Face pulls'
          ]
        },
        advanced: {
          frequency: '5-6 times per week',
          duration: '75-90 minutes',
          focus: ['Periodization', 'Advanced techniques', 'Optimal recovery', 'Performance tracking'],
          exercises: [
            'Olympic lifts', 'Advanced variations', 'Supersets', 'Drop sets',
            'Complex training', 'Plyometrics', 'Sport-specific movements'
          ]
        }
      },
      [BODY_TYPES.MESOMORPH]: {
        beginner: {
          frequency: '3-4 times per week',
          duration: '45-60 minutes',
          focus: ['Balanced training', 'Form mastery', 'Consistency', 'Progressive overload'],
          exercises: [
            'Squats', 'Deadlifts', 'Bench Press', 'Pull-ups', 'Overhead Press',
            'Rows', 'Cardio intervals', 'Core work', 'Mobility exercises'
          ]
        },
        intermediate: {
          frequency: '4-5 times per week',
          duration: '60-75 minutes',
          focus: ['Progressive overload', 'Variety', 'Recovery', 'Performance optimization'],
          exercises: [
            'Compound movements', 'Isolation exercises', 'HIIT cardio',
            'Plyometrics', 'Mobility work', 'Sport-specific training'
          ]
        },
        advanced: {
          frequency: '5-6 times per week',
          duration: '75-90 minutes',
          focus: ['Advanced techniques', 'Periodization', 'Performance', 'Recovery optimization'],
          exercises: [
            'Advanced lifts', 'Complex movements', 'Sport-specific training',
            'Power development', 'Endurance work', 'Skill development'
          ]
        }
      },
      [BODY_TYPES.ENDOMORPH]: {
        beginner: {
          frequency: '4-5 times per week',
          duration: '45-60 minutes',
          focus: ['Cardio emphasis', 'Compound movements', 'Consistency', 'Calorie burn'],
          exercises: [
            'Walking', 'Cycling', 'Swimming', 'Bodyweight squats',
            'Push-ups', 'Planks', 'Light resistance training', 'Mobility work'
          ]
        },
        intermediate: {
          frequency: '5-6 times per week',
          duration: '60-75 minutes',
          focus: ['High-intensity cardio', 'Strength training', 'Recovery', 'Fat loss'],
          exercises: [
            'HIIT', 'Circuit training', 'Compound lifts', 'Cardio intervals',
            'Resistance training', 'Mobility work', 'Recovery sessions'
          ]
        },
        advanced: {
          frequency: '6 times per week',
          duration: '75-90 minutes',
          focus: ['Advanced cardio', 'Strength maintenance', 'Performance', 'Body composition'],
          exercises: [
            'Advanced HIIT', 'Complex movements', 'Endurance training',
            'Strength work', 'Recovery protocols', 'Performance testing'
          ]
        }
      }
    };
    
    return templates[bodyType] || templates[BODY_TYPES.MESOMORPH];
  }

  // Generate periodized training plan
  generatePeriodizedPlan(bodyType, goals, fitnessLevel, availableTime) {
    const periodization = {
      beginner: {
        phase1: { weeks: '1-4', focus: 'Form and habit building', intensity: 'Low', volume: 'Low' },
        phase2: { weeks: '5-8', focus: 'Progressive overload', intensity: 'Moderate', volume: 'Moderate' },
        phase3: { weeks: '9-12', focus: 'Consistency and improvement', intensity: 'Moderate', volume: 'Moderate' }
      },
      intermediate: {
        phase1: { weeks: '1-4', focus: 'Volume building', intensity: 'Moderate', volume: 'High' },
        phase2: { weeks: '5-8', focus: 'Intensity increase', intensity: 'High', volume: 'Moderate' },
        phase3: { weeks: '9-12', focus: 'Peak performance', intensity: 'High', volume: 'Low' }
      },
      advanced: {
        phase1: { weeks: '1-4', focus: 'Hypertrophy', intensity: 'Moderate', volume: 'Very High' },
        phase2: { weeks: '5-8', focus: 'Strength', intensity: 'High', volume: 'Moderate' },
        phase3: { weeks: '9-12', focus: 'Power', intensity: 'Very High', volume: 'Low' }
      }
    };
    
    return periodization[fitnessLevel] || periodization.beginner;
  }

  // Get progression strategy
  getProgressionStrategy(bodyType, fitnessLevel) {
    const strategies = {
      beginner: {
        weightProgression: '5-10% increase every 2-3 weeks',
        volumeProgression: 'Add 1 set every 2 weeks',
        intensityProgression: 'Gradual increase over 4-6 weeks',
        techniqueFocus: 'Primary focus on form and safety'
      },
      intermediate: {
        weightProgression: '2.5-5% increase every 1-2 weeks',
        volumeProgression: 'Add 1-2 sets every week',
        intensityProgression: 'Moderate increase over 3-4 weeks',
        techniqueFocus: 'Maintain form while increasing load'
      },
      advanced: {
        weightProgression: '1-3% increase every week',
        volumeProgression: 'Periodized volume changes',
        intensityProgression: 'Advanced periodization techniques',
        techniqueFocus: 'Perfect form with maximum load'
      }
    };
    
    return strategies[fitnessLevel] || strategies.beginner;
  }

  // Get recovery guidelines
  getRecoveryGuidelines(bodyType, fitnessLevel) {
    const recovery = {
      beginner: {
        restBetweenWorkouts: '48-72 hours',
        sleepRecommendation: '7-9 hours per night',
        nutritionTiming: 'Within 2 hours post-workout',
        activeRecovery: 'Light walking, stretching',
        stressManagement: 'Moderate stress reduction techniques'
      },
      intermediate: {
        restBetweenWorkouts: '24-48 hours',
        sleepRecommendation: '7-9 hours per night',
        nutritionTiming: 'Within 1 hour post-workout',
        activeRecovery: 'Light cardio, mobility work',
        stressManagement: 'Regular stress management practices'
      },
      advanced: {
        restBetweenWorkouts: '12-24 hours',
        sleepRecommendation: '8-10 hours per night',
        nutritionTiming: 'Immediate post-workout',
        activeRecovery: 'Structured recovery protocols',
        stressManagement: 'Comprehensive stress management'
      }
    };
    
    return recovery[fitnessLevel] || recovery.beginner;
  }

  // Enhanced diet plan generation with advanced nutrition science
  generateDietPlan(bodyType, goals, weight, height, activityLevel = 'moderate', fitnessLevel = 'beginner') {
    const baseDiet = PHYSIQUE_CHARACTERISTICS[bodyType].dietFocus;
    
    // Calculate advanced metabolic metrics
    const bmr = this.calculateBMR(weight, height, goals.age || 25, goals.gender || 'male');
    const tdee = this.calculateTDEE(bmr, activityLevel);
    const targetCalories = this.calculateTargetCalories(tdee, bodyType, goals);
    
    // Calculate advanced macronutrients
    const macronutrients = this.calculateAdvancedMacros(targetCalories, bodyType, goals, weight);
    
    // Generate meal timing and frequency
    const mealTiming = this.generateAdvancedMealTiming(bodyType, goals);
    
    // Calculate hydration needs
    const hydration = this.calculateAdvancedHydration(weight, activityLevel, bodyType);
    
    // Generate supplement recommendations
    const supplements = this.generateSupplementRecommendations(bodyType, goals, fitnessLevel);
    
    return {
      bodyType,
      goals,
      targetCalories: Math.round(targetCalories),
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      macronutrients,
      recommendations: baseDiet,
      mealTiming,
      hydration,
      supplements,
      nutritionStrategy: this.getNutritionStrategy(bodyType, goals)
    };
  }

  // Calculate advanced BMR using multiple formulas
  calculateBMR(weight, height, age, gender) {
    // Mifflin-St Jeor Equation (most accurate)
    let bmr;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    // Apply body composition adjustments
    const bodyComposition = this.calculateBodyComposition(weight, 20, weight * 0.4); // Estimate
    const compositionFactor = (bodyComposition.muscle / weight) * 1.1 + (bodyComposition.fat / weight) * 0.9;
    
    return bmr * compositionFactor;
  }

  // Calculate TDEE with activity multipliers
  calculateTDEE(bmr, activityLevel) {
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9
    };
    
    return bmr * activityMultipliers[activityLevel];
  }

  // Calculate target calories based on body type and goals
  calculateTargetCalories(tdee, bodyType, goals) {
    let targetCalories = tdee;
    
    if (goals.primary === 'weight_loss') {
      targetCalories = tdee * 0.85; // 15% deficit
    } else if (goals.primary === 'muscle_gain') {
      if (bodyType === BODY_TYPES.ECTOMORPH) {
        targetCalories = tdee * 1.15; // 15% surplus for ectomorphs
      } else {
        targetCalories = tdee * 1.1; // 10% surplus for others
      }
    }
    
    return targetCalories;
  }

  // Calculate advanced macronutrients
  calculateAdvancedMacros(targetCalories, bodyType, goals, weight) {
    const bodyTypeInfo = PHYSIQUE_CHARACTERISTICS[bodyType];
    
    // Base protein calculation
    let proteinMultiplier = 1.6;
    if (bodyTypeInfo.muscleBuildingPotential === 'high') proteinMultiplier = 2.0;
    if (bodyTypeInfo.muscleBuildingPotential === 'very_high') proteinMultiplier = 2.2;
    
    // Adjust for goals
    if (goals.primary === 'muscle_gain') proteinMultiplier += 0.2;
    if (goals.primary === 'weight_loss') proteinMultiplier += 0.1;
    
    const protein = weight * proteinMultiplier;
    
    // Calculate fats (25-35% of calories)
    const fatPercentage = bodyTypeInfo.metabolism === 'slow' ? 0.35 : 0.25;
    const fats = (targetCalories * fatPercentage) / 9;
    
    // Calculate carbs (remaining calories)
    const proteinCalories = protein * 4;
    const fatCalories = fats * 9;
    const carbCalories = targetCalories - proteinCalories - fatCalories;
    const carbs = carbCalories / 4;
    
    return {
      protein: Math.round(protein),
      fats: Math.round(fats),
      carbs: Math.round(carbs),
      fiber: Math.round(weight * 0.014), // 14g per 1000 calories
      proteinPercentage: Math.round((proteinCalories / targetCalories) * 100),
      fatPercentage: Math.round((fatCalories / targetCalories) * 100),
      carbPercentage: Math.round((carbCalories / targetCalories) * 100)
    };
  }

  // Generate advanced meal timing
  generateAdvancedMealTiming(bodyType, goals) {
    const bodyTypeInfo = PHYSIQUE_CHARACTERISTICS[bodyType];
    
    const baseMeals = {
      [BODY_TYPES.ECTOMORPH]: {
        frequency: '6-8 meals per day',
        timing: ['Breakfast', 'Mid-morning snack', 'Lunch', 'Afternoon snack', 'Pre-workout', 'Post-workout', 'Dinner', 'Evening snack'],
        preWorkout: '2-3 hours before',
        postWorkout: 'Within 30 minutes',
        mealSpacing: '2-3 hours apart'
      },
      [BODY_TYPES.MESOMORPH]: {
        frequency: '4-5 meals per day',
        timing: ['Breakfast', 'Mid-morning snack', 'Lunch', 'Dinner', 'Post-workout'],
        preWorkout: '2-3 hours before',
        postWorkout: 'Within 30 minutes',
        mealSpacing: '3-4 hours apart'
      },
      [BODY_TYPES.ENDOMORPH]: {
        frequency: '3-4 meals per day',
        timing: ['Breakfast', 'Lunch', 'Dinner', 'Optional snack'],
        preWorkout: '2-3 hours before',
        postWorkout: 'Within 30 minutes',
        mealSpacing: '4-5 hours apart'
      }
    };
    
    return baseMeals[bodyType] || baseMeals[BODY_TYPES.MESOMORPH];
  }

  // Calculate advanced hydration needs
  calculateAdvancedHydration(weight, activityLevel, bodyType) {
    const baseHydration = weight * 0.033; // 33ml per kg body weight
    const activityMultipliers = {
      sedentary: 1.0,
      light: 1.2,
      moderate: 1.4,
      active: 1.6,
      veryActive: 1.8
    };
    
    let hydration = baseHydration * activityMultipliers[activityLevel];
    
    // Adjust for body type
    if (bodyType === BODY_TYPES.ECTOMORPH) hydration *= 1.1; // Higher hydration for ectomorphs
    if (bodyType === BODY_TYPES.ENDOMORPH) hydration *= 0.9; // Lower hydration for endomorphs
    
    return Math.round(hydration);
  }

  // Generate supplement recommendations
  generateSupplementRecommendations(bodyType, goals, fitnessLevel) {
    const supplements = {
      essential: ['Multivitamin', 'Omega-3', 'Vitamin D'],
      performance: [],
      recovery: [],
      specific: []
    };
    
    // Add performance supplements based on goals
    if (goals.primary === 'muscle_gain') {
      supplements.performance.push('Creatine Monohydrate', 'Whey Protein');
    }
    
    if (goals.primary === 'weight_loss') {
      supplements.performance.push('Caffeine', 'Green Tea Extract');
    }
    
    // Add body type specific supplements
    if (bodyType === BODY_TYPES.ECTOMORPH) {
      supplements.specific.push('Weight Gainer', 'BCAAs');
    }
    
    if (bodyType === BODY_TYPES.ENDOMORPH) {
      supplements.specific.push('CLA', 'L-Carnitine');
    }
    
    return supplements;
  }

  // Get nutrition strategy
  getNutritionStrategy(bodyType, goals) {
    const strategies = {
      [BODY_TYPES.ECTOMORPH]: {
        primary: 'Calorie surplus with frequent meals',
        secondary: 'High protein and carb intake',
        timing: 'Strategic meal timing around workouts',
        supplements: 'Focus on weight gain and muscle building'
      },
      [BODY_TYPES.MESOMORPH]: {
        primary: 'Balanced nutrition with moderate surplus',
        secondary: 'Quality protein and balanced macros',
        timing: 'Regular meal timing with workout nutrition',
        supplements: 'Performance and recovery focus'
      },
      [BODY_TYPES.ENDOMORPH]: {
        primary: 'Calorie control with high protein',
        secondary: 'Lower carb intake with quality fats',
        timing: 'Intermittent fasting options',
        supplements: 'Fat loss and metabolism support'
      }
    };
    
    return strategies[bodyType] || strategies[BODY_TYPES.MESOMORPH];
  }

  // Save analysis results with enhanced data
  saveAnalysis(userId, analysis) {
    const analysisData = {
      userId,
      timestamp: new Date().toISOString(),
      bodyType: analysis.bodyType,
      measurements: analysis.measurements,
      goals: analysis.goals,
      workoutPlan: analysis.workoutPlan,
      dietPlan: analysis.dietPlan,
      confidence: analysis.confidence,
      version: '2.0'
    };
    
    // Save to localStorage for demo purposes
    localStorage.setItem(`enhancedBodyAnalysis_${userId}`, JSON.stringify(analysisData));
    
    // Add to analysis history
    this.analysisHistory.push(analysisData);
    
    return analysisData;
  }

  // Load analysis results
  loadAnalysis(userId) {
    const saved = localStorage.getItem(`enhancedBodyAnalysis_${userId}`);
    return saved ? JSON.parse(saved) : null;
  }

  // Get analysis history
  getAnalysisHistory() {
    return this.analysisHistory;
  }
}

export default EnhancedBodyAnalysisService; 