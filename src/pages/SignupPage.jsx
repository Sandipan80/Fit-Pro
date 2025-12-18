import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../components/firebase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const SignupPage = ({ routing }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    // Additional user information
    age: '',
    gender: '',
    fitnessGoal: '',
    fitnessLevel: '',
    height: '',
    weight: '',
    preferredWorkoutTime: '',
    medicalConditions: '',
    dietaryRestrictions: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Fitness goals and levels for dropdowns
  const fitnessGoals = [
    'Weight Loss',
    'Muscle Gain',
    'General Fitness',
    'Endurance',
    'Flexibility',
    'Sports Performance'
  ];
  
  const fitnessLevels = [
    'Beginner',
    'Intermediate',
    'Advanced',
    'Professional'
  ];
  
  const workoutTimes = [
    'Morning (5AM-9AM)',
    'Afternoon (12PM-4PM)',
    'Evening (5PM-9PM)',
    'Night (9PM-12AM)'
  ];
  
  // Check if Firebase is properly initialized
  useEffect(() => {
    try {
      const auth = getAuth();
      setIsFirebaseReady(!!auth);
    } catch (error) {
      console.error('Firebase initialization error:', error);
      setAuthError('Authentication service is not available. Please try again later.');
    }
  }, []);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    // Clear auth error when user makes any change
    if (authError) {
      setAuthError('');
    }
  };
  
  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Name is required';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(formData.age) || formData.age < 13 || formData.age > 100) {
      newErrors.age = 'Please enter a valid age between 13 and 100';
    }
    
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    
    if (!formData.fitnessGoal) {
      newErrors.fitnessGoal = 'Fitness goal is required';
    }
    
    if (!formData.fitnessLevel) {
      newErrors.fitnessLevel = 'Fitness level is required';
    }
    
    if (!formData.height) {
      newErrors.height = 'Height is required';
    } else if (isNaN(formData.height) || formData.height < 100 || formData.height > 250) {
      newErrors.height = 'Please enter a valid height in cm (100-250)';
    }
    
    if (!formData.weight) {
      newErrors.weight = 'Weight is required';
    } else if (isNaN(formData.weight) || formData.weight < 30 || formData.weight > 300) {
      newErrors.weight = 'Please enter a valid weight in kg (30-300)';
    }
    
    if (!formData.preferredWorkoutTime) {
      newErrors.preferredWorkoutTime = 'Preferred workout time is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };
  
  const handlePrevStep = () => {
    setCurrentStep(1);
  };
  
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    if (!isFirebaseReady) {
      setAuthError('Authentication service is not available. Please try again later.');
      return;
    }
    
    if (!validateStep2()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      // Update user profile with full name
      await updateProfile(userCredential.user, {
        displayName: formData.fullName
      });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        fullName: formData.fullName,
        email: formData.email,
        age: parseInt(formData.age),
        gender: formData.gender,
        fitnessGoal: formData.fitnessGoal,
        fitnessLevel: formData.fitnessLevel,
        height: parseInt(formData.height),
        weight: parseInt(formData.weight),
        preferredWorkoutTime: formData.preferredWorkoutTime,
        medicalConditions: formData.medicalConditions || 'None',
        dietaryRestrictions: formData.dietaryRestrictions || 'None',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        profileComplete: true
      });
      
      // Clear form
      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false,
        age: '',
        gender: '',
        fitnessGoal: '',
        fitnessLevel: '',
        height: '',
        weight: '',
        preferredWorkoutTime: '',
        medicalConditions: '',
        dietaryRestrictions: ''
      });
      
      // Show success message
      alert('Account created successfully! You can now log in.');
      
      // Redirect to login page
      if (routing && routing.navigateTo) {
        routing.navigateTo('login');
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          setAuthError('This email is already registered. Please use a different email or try logging in.');
          break;
        case 'auth/invalid-email':
          setAuthError('The email address is invalid.');
          break;
        case 'auth/operation-not-allowed':
          setAuthError('Email/password accounts are not enabled. Please contact support.');
          break;
        case 'auth/weak-password':
          setAuthError('The password is too weak. Please use a stronger password.');
          break;
        case 'auth/network-request-failed':
          setAuthError('Network error. Please check your internet connection and try again.');
          break;
        case 'auth/too-many-requests':
          setAuthError('Too many attempts. Please try again later.');
          break;
        default:
          setAuthError('An error occurred during registration. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isFirebaseReady) {
      setAuthError('Authentication service is not available. Please try again later.');
      return;
    }

    setIsLoading(true);
    setAuthError('');

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      
      // Redirect to home page after successful sign in
      if (routing && routing.navigateTo) {
        routing.navigateTo('home');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          setAuthError('Sign-in popup was closed. Please try again.');
          break;
        case 'auth/cancelled-popup-request':
          // User cancelled the popup, no need to show error
          break;
        case 'auth/network-request-failed':
          setAuthError('Network error. Please check your internet connection and try again.');
          break;
        default:
          setAuthError('An error occurred during Google sign-in. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    if (routing && routing.navigateTo) {
      routing.navigateTo('login');
    }
  };
  
  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Information</h2>
      <div className="space-y-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            value={formData.fullName}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.fullName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="John Smith"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Must be at least 6 characters long
          </p>
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="••••••••"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>
        
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="agreeTerms"
              name="agreeTerms"
              type="checkbox"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="agreeTerms" className="text-gray-600">
              I agree to the{' '}
              <a href="#" className="text-purple-600 hover:text-purple-800">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-purple-600 hover:text-purple-800">
                Privacy Policy
              </a>
            </label>
            {errors.agreeTerms && (
              <p className="mt-1 text-sm text-red-600">{errors.agreeTerms}</p>
            )}
          </div>
        </div>
        
        <div>
          <button
            type="button"
            onClick={handleNextStep}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
          >
            Next Step
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Fitness Profile</h2>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              id="age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.age ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="25"
            />
            {errors.age && (
              <p className="mt-1 text-sm text-red-600">{errors.age}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.gender ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="fitnessGoal" className="block text-sm font-medium text-gray-700 mb-1">
            Fitness Goal
          </label>
          <select
            id="fitnessGoal"
            name="fitnessGoal"
            value={formData.fitnessGoal}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.fitnessGoal ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select your goal</option>
            {fitnessGoals.map(goal => (
              <option key={goal} value={goal}>{goal}</option>
            ))}
          </select>
          {errors.fitnessGoal && (
            <p className="mt-1 text-sm text-red-600">{errors.fitnessGoal}</p>
          )}
        </div>

        <div>
          <label htmlFor="fitnessLevel" className="block text-sm font-medium text-gray-700 mb-1">
            Fitness Level
          </label>
          <select
            id="fitnessLevel"
            name="fitnessLevel"
            value={formData.fitnessLevel}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.fitnessLevel ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select your level</option>
            {fitnessLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
          {errors.fitnessLevel && (
            <p className="mt-1 text-sm text-red-600">{errors.fitnessLevel}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
              Height (cm)
            </label>
            <input
              id="height"
              name="height"
              type="number"
              value={formData.height}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.height ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="175"
            />
            {errors.height && (
              <p className="mt-1 text-sm text-red-600">{errors.height}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
              Weight (kg)
            </label>
            <input
              id="weight"
              name="weight"
              type="number"
              value={formData.weight}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.weight ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="70"
            />
            {errors.weight && (
              <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="preferredWorkoutTime" className="block text-sm font-medium text-gray-700 mb-1">
            Preferred Workout Time
          </label>
          <select
            id="preferredWorkoutTime"
            name="preferredWorkoutTime"
            value={formData.preferredWorkoutTime}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.preferredWorkoutTime ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select preferred time</option>
            {workoutTimes.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
          {errors.preferredWorkoutTime && (
            <p className="mt-1 text-sm text-red-600">{errors.preferredWorkoutTime}</p>
          )}
        </div>

        <div>
          <label htmlFor="medicalConditions" className="block text-sm font-medium text-gray-700 mb-1">
            Medical Conditions (Optional)
          </label>
          <textarea
            id="medicalConditions"
            name="medicalConditions"
            value={formData.medicalConditions}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Please list any medical conditions that might affect your workout"
            rows="2"
          />
        </div>

        <div>
          <label htmlFor="dietaryRestrictions" className="block text-sm font-medium text-gray-700 mb-1">
            Dietary Restrictions (Optional)
          </label>
          <textarea
            id="dietaryRestrictions"
            name="dietaryRestrictions"
            value={formData.dietaryRestrictions}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Please list any dietary restrictions"
            rows="2"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handlePrevStep}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2.5 px-4 rounded-lg transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors ${
              isLoading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
  
  return (
    <motion.div 
      className="min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar routing={routing} />
      
      <main className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <motion.div 
              className="text-center mb-8"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl font-bold text-gray-800">Create Your Account</h1>
              <p className="text-gray-600 mt-2">Join our community and start your fitness journey</p>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl shadow-md overflow-hidden"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="p-6">
                {authError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{authError}</p>
                  </div>
                )}
                
                <form onSubmit={handleRegister} className="space-y-6">
                  {currentStep === 1 ? renderStep1() : renderStep2()}
                </form>
                
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading || !isFirebaseReady}
                      className={`w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 ${
                        (isLoading || !isFirebaseReady) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Google
                    </button>
                  </div>
                </div>
                
                <p className="mt-8 text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={handleLoginClick}
                    className="font-medium text-purple-600 hover:text-purple-800 focus:outline-none"
                  >
                    Log in
                  </button>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      
      <Footer routing={routing} />
    </motion.div>
  );
};

export default SignupPage; 