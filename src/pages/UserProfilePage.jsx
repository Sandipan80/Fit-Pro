import { useState, useEffect } from 'react';
import { auth, db } from '../components/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { updateUserProfile } from '../utils/api';
import syncService from '../utils/syncService';

const UserProfilePage = ({ routing }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // New state for profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    fullName: '',
    email: '',
    height: '',
    weight: '',
    age: '',
    gender: '',
    fitnessGoal: '',
    fitnessLevel: '',
    activityLevel: 'moderate'
  });
  const [editErrors, setEditErrors] = useState({});
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          if (routing && routing.navigateTo) {
            routing.navigateTo('login');
          }
          return;
        }

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = {
            ...userDoc.data(),
            email: user.email,
            uid: user.uid
          };
          setUserData(data);
          
          // Initialize edit data with current user data
          setEditData({
            fullName: data.fullName || '',
            email: user.email || '',
            height: data.height || '',
            weight: data.weight || '',
            age: data.age || '',
            gender: data.gender || '',
            fitnessGoal: data.fitnessGoal || '',
            fitnessLevel: data.fitnessLevel || '',
            activityLevel: data.activityLevel || 'moderate'
          });
        } else {
          setError('User profile not found');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();

    // Listen for sync events - only if syncService is available
    const handleSyncCompleted = (data) => {
      console.log('Sync completed in UserProfilePage:', data);
      // Update local state if needed
      if (data.profileData && data.source === 'proteinTracker') {
        setUserData(prev => ({
          ...prev,
          ...data.profileData.firebaseData
        }));
      }
    };

    // Safely add event listener
    if (syncService && syncService.EVENTS && syncService.EVENTS.SYNC_COMPLETED) {
      syncService.addEventListener(syncService.EVENTS.SYNC_COMPLETED, handleSyncCompleted);
    }

    return () => {
      // Safely remove event listener
      if (syncService && syncService.EVENTS && syncService.EVENTS.SYNC_COMPLETED) {
        syncService.removeEventListener(syncService.EVENTS.SYNC_COMPLETED, handleSyncCompleted);
      }
    };
  }, [routing]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      if (routing && routing.navigateTo) {
        routing.navigateTo('home');
      }
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out');
    }
  };

  // Handle input changes for edit form
  const handleEditChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field if it exists
    if (editErrors[field]) {
      setEditErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Validate edit form
  const validateEditForm = () => {
    const errors = {};
    
    if (!editData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!editData.height) {
      errors.height = 'Height is required';
    } else if (isNaN(editData.height) || editData.height < 100 || editData.height > 250) {
      errors.height = 'Please enter a valid height in cm (100-250)';
    }
    
    if (!editData.weight) {
      errors.weight = 'Weight is required';
    } else if (isNaN(editData.weight) || editData.weight < 30 || editData.weight > 300) {
      errors.weight = 'Please enter a valid weight in kg (30-300)';
    }
    
    if (!editData.age) {
      errors.age = 'Age is required';
    } else if (isNaN(editData.age) || editData.age < 13 || editData.age > 100) {
      errors.age = 'Please enter a valid age between 13 and 100';
    }
    
    if (!editData.gender) {
      errors.gender = 'Gender is required';
    }
    
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    if (!validateEditForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Prepare data for Firebase update
      const firebaseUpdateData = {
        fullName: editData.fullName,
        height: parseInt(editData.height),
        weight: parseInt(editData.weight),
        age: parseInt(editData.age),
        gender: editData.gender,
        fitnessGoal: editData.fitnessGoal,
        fitnessLevel: editData.fitnessLevel,
        activityLevel: editData.activityLevel,
        lastUpdated: new Date()
      };

      // Update Firebase
      await updateDoc(doc(db, 'users', user.uid), firebaseUpdateData);

      // Prepare data for protein tracker API
      const proteinTrackerData = {
        weight: parseInt(editData.weight),
        height: parseInt(editData.height),
        age: parseInt(editData.age),
        gender: editData.gender,
        activityLevel: editData.activityLevel,
        goal: editData.fitnessGoal === 'Weight Loss' ? 'weight_loss' : 
              editData.fitnessGoal === 'Muscle Gain' ? 'muscle_gain' : 'maintenance'
      };

      // Use sync service to sync profile data - with error handling
      let updatedProteinData = null;
      if (syncService && typeof syncService.syncProfileData === 'function') {
        try {
          updatedProteinData = await syncService.syncProfileData(proteinTrackerData, 'firebase');
        } catch (syncError) {
          console.warn('Sync service error (non-critical):', syncError);
          // Continue without sync - this is not critical for profile update
        }
      }
      
      // Update local state regardless of sync success
      setUserData(prev => ({
        ...prev,
        ...firebaseUpdateData
      }));
      
      setIsEditing(false);
      
      // Show success message
      if (updatedProteinData) {
        alert('Profile updated successfully! Your protein requirements have been recalculated.');
      } else {
        alert('Profile updated successfully!');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    // Reset edit data to current user data
    setEditData({
      fullName: userData?.fullName || '',
      email: userData?.email || '',
      height: userData?.height || '',
      weight: userData?.weight || '',
      age: userData?.age || '',
      gender: userData?.gender || '',
      fitnessGoal: userData?.fitnessGoal || '',
      fitnessLevel: userData?.fitnessLevel || '',
      activityLevel: userData?.activityLevel || 'moderate'
    });
    setEditErrors({});
    setIsEditing(false);
  };

  // Calculate BMI
  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return Math.round(bmi * 10) / 10;
  };

  // Get BMI category and color
  const getBMICategory = (bmi) => {
    if (!bmi) return { category: 'N/A', color: 'gray' };
    if (bmi < 18.5) return { category: 'Underweight', color: 'blue' };
    if (bmi < 25) return { category: 'Normal', color: 'green' };
    if (bmi < 30) return { category: 'Overweight', color: 'orange' };
    return { category: 'Obese', color: 'red' };
  };

  // Only calculate BMI if userData exists
  const currentBMI = userData ? calculateBMI(userData.weight, userData.height) : null;
  const bmiInfo = getBMICategory(currentBMI);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => routing.navigateTo('home')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  // Mock recent workouts
  const recentWorkouts = [
    {
      id: 1,
      title: "Morning Stretch Routine",
      instructor: "Neha Gupta",
      duration: "15 min",
      level: "Beginner",
      category: "stretching",
      thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1520&q=80",
      date: "2023-06-15"
    },
    {
      id: 2,
      title: "HIIT Cardio Blast",
      instructor: "Arjun Patel",
      duration: "45 min",
      level: "Intermediate",
      category: "cardio",
      thumbnail: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      date: "2023-06-14"
    },
    {
      id: 3,
      title: "Core Workout Challenge",
      instructor: "Vikram Malhotra",
      duration: "25 min",
      level: "Intermediate",
      category: "core",
      thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      date: "2023-06-13"
    },
    {
      id: 4,
      title: "Full Body Strength",
      instructor: "Rahul Verma",
      duration: "50 min",
      level: "Advanced",
      category: "strength",
      thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      date: "2023-06-12"
    },
    {
      id: 5,
      title: "Pilates for Beginners",
      instructor: "Kavya Iyer",
      duration: "30 min",
      level: "Beginner",
      category: "pilates",
      thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      date: "2023-06-11"
    }
  ];
  
  // Mock saved workouts
  const savedWorkouts = [
    {
      id: 4,
      title: "30-Day Yoga Challenge",
      instructor: "Priya Sharma",
      level: "All Levels",
      duration: "20-30 min",
      thumbnail: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    {
      id: 5,
      title: "Full Body Strength",
      instructor: "Rahul Verma",
      level: "Advanced",
      duration: "50 min",
      thumbnail: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    {
      id: 6,
      title: "Pilates for Beginners",
      instructor: "Kavya Iyer",
      level: "Beginner",
      duration: "40 min",
      thumbnail: "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    }
  ];
  
  // Mock weekly activity
  const weeklyActivity = [
    { day: 'Mon', minutes: 30 },
    { day: 'Tue', minutes: 45 },
    { day: 'Wed', minutes: 20 },
    { day: 'Thu', minutes: 0 },
    { day: 'Fri', minutes: 35 },
    { day: 'Sat', minutes: 60 },
    { day: 'Sun', minutes: 15 }
  ];
  
  // Function to render the active tab content
  const renderTabContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">Completed Workouts</p>
                    <h3 className="text-3xl font-bold mt-1">{userData?.completedWorkouts || 0}</h3>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <span className="text-green-500">↑ 12%</span> from last month
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">Total Minutes</p>
                    <h3 className="text-3xl font-bold mt-1">{userData?.totalMinutes || 0}</h3>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <span className="text-green-500">↑ 8%</span> from last month
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">Current Streak</p>
                    <h3 className="text-3xl font-bold mt-1">{userData?.streak || 0} days</h3>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  Your longest streak: 14 days
                </div>
              </div>
            </div>
            
            {/* Activity Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Activity</h3>
              <div className="h-60 flex items-end justify-between">
                {weeklyActivity.map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className={`w-10 ${item.minutes > 0 ? 'bg-purple-500' : 'bg-gray-200'} rounded-t-md`} 
                      style={{ height: `${(item.minutes / 60) * 180}px` }}
                    ></div>
                    <p className="mt-2 text-sm text-gray-600">{item.day}</p>
                    <p className="text-xs text-gray-500">{item.minutes} min</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Recent Workouts */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Recent Workouts</h3>
                <a href="#" data-nav="featured" className="text-purple-600 hover:text-purple-800 text-sm font-medium">View All</a>
              </div>
              <div className="space-y-4">
                {recentWorkouts.map(workout => (
                  <div key={workout.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-48 h-32 sm:h-auto">
                        <img 
                          src={workout.thumbnail} 
                          alt={workout.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-800">{workout.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">with {workout.instructor}</p>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="mr-4">{workout.date}</span>
                            <span>{workout.duration}</span>
                          </div>
                          <button className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-1 px-3 rounded-lg transition-colors"
                            onClick={() => {
                              if (routing && routing.navigateTo) {
                                routing.navigateTo('singleVideo', { id: workout.id });
                              }
                            }}
                          >
                            Watch Again
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'saved':
        return (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Saved Workouts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedWorkouts.map(workout => (
                <div key={workout.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="aspect-video relative">
                    <img 
                      src={workout.thumbnail} 
                      alt={workout.title} 
                      className="w-full h-full object-cover"
                    />
                    <button className="absolute top-3 right-3 bg-white/90 hover:bg-white p-1.5 rounded-full shadow text-gray-700 hover:text-red-500 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-800">{workout.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">with {workout.instructor}</p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-2">
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">{workout.level}</span>
                        <span className="text-xs text-gray-500">{workout.duration}</span>
                      </div>
                      <button className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-1 px-3 rounded-lg transition-colors"
                        onClick={() => {
                          if (routing && routing.navigateTo) {
                            routing.navigateTo('singleVideo', { id: workout.id });
                          }
                        }}
                      >
                        Start
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Account Settings</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                    <span className="text-2xl text-purple-600">
                      {userData?.fullName?.charAt(0) || userData?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <button className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                    Change Photo
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={editData.fullName}
                    onChange={(e) => handleEditChange('fullName', e.target.value)}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                  {editErrors.fullName && <p className="text-red-500 text-xs mt-1">{editErrors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    value={editData.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
              </div>

              {/* Height and Weight Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                  <input 
                    type="number" 
                    value={editData.height}
                    onChange={(e) => handleEditChange('height', e.target.value)}
                    disabled={!isEditing}
                    min="100"
                    max="250"
                    step="0.1"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                  {editErrors.height && <p className="text-red-500 text-xs mt-1">{editErrors.height}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                  <input 
                    type="number" 
                    value={editData.weight}
                    onChange={(e) => handleEditChange('weight', e.target.value)}
                    disabled={!isEditing}
                    min="30"
                    max="300"
                    step="0.1"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                  {editErrors.weight && <p className="text-red-500 text-xs mt-1">{editErrors.weight}</p>}
                </div>
              </div>

              {/* Age and Gender Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input 
                    type="number" 
                    value={editData.age}
                    onChange={(e) => handleEditChange('age', e.target.value)}
                    disabled={!isEditing}
                    min="13"
                    max="100"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                  {editErrors.age && <p className="text-red-500 text-xs mt-1">{editErrors.age}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    value={editData.gender}
                    onChange={(e) => handleEditChange('gender', e.target.value)}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                  {editErrors.gender && <p className="text-red-500 text-xs mt-1">{editErrors.gender}</p>}
                </div>
              </div>

              {/* Fitness Goal and Level Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fitness Goal</label>
                  <select
                    value={editData.fitnessGoal}
                    onChange={(e) => handleEditChange('fitnessGoal', e.target.value)}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <option value="">Select your goal</option>
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Muscle Gain">Muscle Gain</option>
                    <option value="General Fitness">General Fitness</option>
                    <option value="Endurance">Endurance</option>
                    <option value="Flexibility">Flexibility</option>
                    <option value="Sports Performance">Sports Performance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fitness Level</label>
                  <select
                    value={editData.fitnessLevel}
                    onChange={(e) => handleEditChange('fitnessLevel', e.target.value)}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <option value="">Select your level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Professional">Professional</option>
                  </select>
                </div>
              </div>

              {/* Activity Level Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
                <select
                  value={editData.activityLevel}
                  onChange={(e) => handleEditChange('activityLevel', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <option value="sedentary">Sedentary (Little or no exercise)</option>
                  <option value="light">Light (1-3 days/week)</option>
                  <option value="moderate">Moderate (3-5 days/week)</option>
                  <option value="active">Active (6-7 days/week)</option>
                  <option value="very_active">Very Active (Hard exercise, physical job)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Subscription</label>
                <div className="flex justify-between items-center p-4 border border-gray-300 rounded-lg">
                  <div>
                    <span className="block font-medium">{userData?.plan || 'Free Plan'}</span>
                    <span className="text-sm text-gray-600">Renews on October 15, 2023</span>
                  </div>
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                    Manage
                  </button>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-gray-600">Email notifications</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-gray-600">New workout reminders</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              {isEditing && (
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleCancelEdit}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-6 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
              )}
            </div>
          </div>
        );
        
      default:
        return <div>Dashboard content</div>;
    }
  };
  
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
          <div className="max-w-7xl mx-auto">
            {/* Profile Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-3xl text-purple-600">
                    {userData?.fullName?.charAt(0) || userData?.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl font-bold text-gray-800">{userData?.fullName || 'User'}</h1>
                  <p className="text-gray-600 mt-1">{userData?.email || 'No email'}</p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                    <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                      {userData?.fitnessLevel || 'New Member'}
                    </span>
                    <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                      {userData?.fitnessGoal || 'Getting Started'}
                    </span>
                    <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                      Member since {userData?.createdAt ? new Date(userData.createdAt.toDate()).toLocaleDateString() : 'Recently'}
                    </span>
                  </div>
                  
                  {/* BMI and Physical Stats */}
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <span className="text-gray-500 block">Height</span>
                      <span className="font-medium">{userData?.height || 'N/A'} cm</span>
                    </div>
                    <div className="text-center">
                      <span className="text-gray-500 block">Weight</span>
                      <span className="font-medium">{userData?.weight || 'N/A'} kg</span>
                    </div>
                    <div className="text-center">
                      <span className="text-gray-500 block">BMI</span>
                      <span className="font-medium">{currentBMI || 'N/A'}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-gray-500 block">Status</span>
                      <span className={`font-medium text-${bmiInfo.color}-600`}>
                        {bmiInfo.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  {['dashboard', 'saved', 'settings'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-4 text-sm font-medium ${
                        activeTab === tab
                          ? 'border-b-2 border-purple-600 text-purple-600'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </main>
      
      <Footer routing={routing} />
    </motion.div>
  );
};

export default UserProfilePage; 