import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useTracking } from '../context/TrackingContext';
import ProteinTracker from '../components/ProteinTracker';
import syncService from '../utils/syncService';
import { motion, AnimatePresence } from 'framer-motion';

const TrackProgressPage = ({ routing }) => {
  const { trackPageView, trackEvent } = useTracking();
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [activeSection, setActiveSection] = useState('workouts'); // 'workouts' or 'nutrition'
  const [activeNutritionTab, setActiveNutritionTab] = useState('protein'); // 'protein', 'calories', or 'hydration'
  const [workoutForm, setWorkoutForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: '',
    duration: '',
    notes: '',
    feeling: 'good'
  });

  // Check if user is logged in
  const isAuthenticated = routing?.isAuthenticated || false;

  // Animation variants
  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  };

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

  // Load workouts from localStorage
  const loadWorkouts = () => {
    try {
      const savedWorkouts = localStorage.getItem('userWorkouts');
      if (savedWorkouts) {
        const parsedWorkouts = JSON.parse(savedWorkouts);
        // Sort workouts by date (newest first)
        const sortedWorkouts = parsedWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date));
        setWorkouts(sortedWorkouts);
      } else {
        setWorkouts([]);
      }
    } catch (error) {
      console.error('Error loading workouts:', error);
      setWorkouts([]);
    }
  };

  // Save workouts to localStorage
  const saveWorkouts = (workoutList) => {
    try {
      localStorage.setItem('userWorkouts', JSON.stringify(workoutList));
    } catch (error) {
      console.error('Error saving workouts:', error);
    }
  };

  useEffect(() => {
    // Track page view
    trackPageView('Track Progress');
    
    // Load workouts from localStorage instead of mock data
    loadWorkouts();
  }, [trackPageView]);

  const handleAddWorkout = (e) => {
    e.preventDefault();
    
    if (!workoutForm.type || !workoutForm.duration) {
      alert('Please fill in all required fields');
      return;
    }
    
    const newWorkout = {
      id: Date.now(),
      ...workoutForm,
      duration: parseInt(workoutForm.duration),
      calories: Math.round(parseInt(workoutForm.duration) * 6.5) // Rough estimate
    };
    
    const updatedWorkouts = [newWorkout, ...workouts];
    setWorkouts(updatedWorkouts);
    saveWorkouts(updatedWorkouts);
    
    // Reset form
    setWorkoutForm({
      date: new Date().toISOString().split('T')[0],
      type: '',
      duration: '',
      notes: '',
      feeling: 'good'
    });
    
    // Track event
    trackEvent('workout_added', {
      workout_type: newWorkout.type,
      duration: newWorkout.duration
    });
  };

  const handleDeleteWorkout = (workoutId) => {
    const updatedWorkouts = workouts.filter(w => w.id !== workoutId);
    setWorkouts(updatedWorkouts);
    saveWorkouts(updatedWorkouts);
    trackEvent('workout_deleted', { workout_id: workoutId });
  };

  const handleClearAllWorkouts = () => {
    if (window.confirm('Are you sure you want to delete all workouts? This action cannot be undone.')) {
      setWorkouts([]);
      saveWorkouts([]);
      trackEvent('all_workouts_deleted');
    }
  };

  const getFeelingColor = (feeling) => {
    switch (feeling) {
      case 'excellent': return 'text-green-600 bg-green-100 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'okay': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'poor': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getFeelingIcon = (feeling) => {
    switch (feeling) {
      case 'excellent': return '😄';
      case 'good': return '🙂';
      case 'okay': return '😐';
      case 'poor': return '😞';
      default: return '😐';
    }
  };

  // Calculate workout statistics
  const getWorkoutStats = () => {
    if (workouts.length === 0) return null;
    
    const totalWorkouts = workouts.length;
    const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);
    const totalCalories = workouts.reduce((sum, w) => sum + w.calories, 0);
    const avgDuration = Math.round(totalDuration / totalWorkouts);
    const avgCalories = Math.round(totalCalories / totalWorkouts);
    
    // Get most common workout type
    const typeCounts = {};
    workouts.forEach(w => {
      typeCounts[w.type] = (typeCounts[w.type] || 0) + 1;
    });
    const mostCommonType = Object.keys(typeCounts).reduce((a, b) => 
      typeCounts[a] > typeCounts[b] ? a : b
    );
    
    return {
      totalWorkouts,
      totalDuration,
      totalCalories,
      avgDuration,
      avgCalories,
      mostCommonType
    };
  };

  const stats = getWorkoutStats();

  if (!isAuthenticated) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <Navbar routing={routing} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <motion.div 
            className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="text-center">
              <motion.div 
                className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Track Your Progress</h2>
              <p className="text-gray-600 mb-8 text-lg">
                Sign in to track your workouts, nutrition, and overall fitness progress with beautiful insights and analytics.
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
        </main>
        <Footer />
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <Navbar routing={routing} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <motion.h1 
          className="text-4xl md:text-5xl font-bold text-gray-800 mb-8 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
          variants={itemVariants}
        >
          Track Your Progress
        </motion.h1>
          
        {/* Section Toggle */}
        <motion.div 
          className="mb-12 flex justify-center"
          variants={itemVariants}
        >
          <div className="inline-flex bg-white rounded-2xl shadow-lg p-2 border border-gray-100">
            <motion.button
                onClick={() => setActiveSection('workouts')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeSection === 'workouts' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              💪 Workouts
            </motion.button>
            <motion.button
                onClick={() => setActiveSection('nutrition')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeSection === 'nutrition' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              >
              🥗 Nutrition
            </motion.button>
          </div>
        </motion.div>
          
        <AnimatePresence mode="wait">
          {activeSection === 'workouts' ? (
            // Workout tracking section
            <motion.div 
              key="workouts"
              className="max-w-6xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Workout Statistics */}
              {stats && (
                <motion.div 
                  className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100"
                  variants={cardVariants}
                  whileHover="hover"
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <span className="mr-3">📊</span>
                    Your Workout Statistics
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <motion.div 
                      className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl text-center border border-indigo-100"
                      whileHover={{ scale: 1.05, y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-3xl font-bold text-indigo-700 mb-2">{stats.totalWorkouts}</p>
                      <p className="text-sm text-gray-600 font-medium">Total Workouts</p>
                    </motion.div>
                    <motion.div 
                      className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl text-center border border-purple-100"
                      whileHover={{ scale: 1.05, y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-3xl font-bold text-purple-700 mb-2">{stats.totalDuration}</p>
                      <p className="text-sm text-gray-600 font-medium">Total Minutes</p>
                    </motion.div>
                    <motion.div 
                      className="bg-gradient-to-br from-pink-50 to-red-50 p-6 rounded-xl text-center border border-pink-100"
                      whileHover={{ scale: 1.05, y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-3xl font-bold text-pink-700 mb-2">{stats.avgDuration}</p>
                      <p className="text-sm text-gray-600 font-medium">Avg Duration</p>
                    </motion.div>
                    <motion.div 
                      className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl text-center border border-green-100"
                      whileHover={{ scale: 1.05, y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-3xl font-bold text-green-700 mb-2">{stats.mostCommonType}</p>
                      <p className="text-sm text-gray-600 font-medium">Favorite Type</p>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Add Workout Form */}
              <motion.div 
                className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100"
                variants={cardVariants}
                whileHover="hover"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="mr-3">➕</span>
                  Add New Workout
                </h2>
                <form onSubmit={handleAddWorkout} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                          <input
                            type="date"
                            value={workoutForm.date}
                      onChange={(e) => setWorkoutForm({...workoutForm, date: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                            required
                          />
                        </div>
                        <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Workout Type</label>
                    <select
                      value={workoutForm.type}
                      onChange={(e) => setWorkoutForm({...workoutForm, type: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      required
                    >
                      <option value="">Select type</option>
                      <option value="Strength Training">Strength Training</option>
                      <option value="Cardio">Cardio</option>
                      <option value="Yoga">Yoga</option>
                      <option value="HIIT">HIIT</option>
                      <option value="Pilates">Pilates</option>
                      <option value="Swimming">Swimming</option>
                      <option value="Cycling">Cycling</option>
                      <option value="Running">Running</option>
                      <option value="Walking">Walking</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (minutes)</label>
                          <input
                            type="number"
                            value={workoutForm.duration}
                      onChange={(e) => setWorkoutForm({...workoutForm, duration: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                            min="1"
                      max="300"
                            required
                          />
                        </div>
                        <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">How did you feel?</label>
                          <select
                            value={workoutForm.feeling}
                      onChange={(e) => setWorkoutForm({...workoutForm, feeling: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      required
                          >
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="okay">Okay</option>
                      <option value="poor">Poor</option>
                          </select>
                        </div>
                  <div className="md:col-span-2 lg:col-span-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                          <textarea
                            value={workoutForm.notes}
                      onChange={(e) => setWorkoutForm({...workoutForm, notes: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                            rows="3"
                      placeholder="How was your workout? Any achievements or challenges?"
                    />
                  </div>
                  <div className="md:col-span-2 lg:col-span-4">
                    <motion.button
                      type="submit"
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      Add Workout
                    </motion.button>
                  </div>
                </form>
              </motion.div>
              
              {/* Workout History */}
              <motion.div 
                className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <span className="mr-3">📈</span>
                    Workout History
                  </h2>
                  {workouts.length > 0 && (
                    <motion.button
                      onClick={handleClearAllWorkouts}
                      className="text-red-600 hover:text-red-800 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Clear All
                    </motion.button>
                  )}
                  </div>
                
                {workouts.length === 0 ? (
                  <motion.div 
                    className="text-center py-16"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.div 
                      className="text-gray-400 mb-6"
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </motion.div>
                    <p className="text-gray-500 text-xl mb-3 font-semibold">No workouts recorded yet</p>
                    <p className="text-gray-400">Add your first workout to start tracking your fitness journey!</p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {workouts.map((workout, index) => (
                      <motion.div 
                        key={workout.id} 
                        className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                      >
                            <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <h3 className="font-bold text-xl text-gray-800">{workout.type}</h3>
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getFeelingColor(workout.feeling)}`}>
                                {getFeelingIcon(workout.feeling)} {workout.feeling}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center">
                                <span className="font-semibold mr-2">📅</span>
                                {new Date(workout.date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center">
                                <span className="font-semibold mr-2">⏱️</span>
                                {workout.duration} min
                              </div>
                              <div className="flex items-center">
                                <span className="font-semibold mr-2">🔥</span>
                                ~{workout.calories}
                              </div>
                              <div className="flex items-center">
                                <span className="font-semibold mr-2">🕐</span>
                                {new Date(workout.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                            </div>
                            {workout.notes && (
                              <p className="text-gray-700 italic bg-gray-50 p-3 rounded-lg">"{workout.notes}"</p>
                            )}
                          </div>
                          <motion.button
                            onClick={() => handleDeleteWorkout(workout.id)}
                            className="text-red-600 hover:text-red-800 ml-4 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                            title="Delete workout"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          ) : (
            // Nutrition tracking section
            <motion.div 
              key="nutrition"
              className="max-w-5xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Nutrition Tracking Tabs */}
              <motion.div 
                className="mb-12 flex justify-center"
                variants={itemVariants}
              >
                <div className="inline-flex bg-white rounded-2xl shadow-lg p-2 border border-gray-100">
                  <motion.button
                    onClick={() => setActiveNutritionTab('protein')}
                    className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      activeNutritionTab === 'protein' 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🥩 Protein Intake
                  </motion.button>
                  <motion.button
                    onClick={() => setActiveNutritionTab('calories')}
                    className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      activeNutritionTab === 'calories' 
                        ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🔥 Calorie Tracking
                  </motion.button>
                  <motion.button
                    onClick={() => setActiveNutritionTab('hydration')}
                    className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      activeNutritionTab === 'hydration' 
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    💧 Hydration
                  </motion.button>
                </div>
              </motion.div>
              
              {/* Tab Content */}
              <AnimatePresence mode="wait">
              {activeNutritionTab === 'protein' && (
                  <motion.div
                    key="protein"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProteinTracker routing={routing} />
                  </motion.div>
              )}
              
              {activeNutritionTab === 'calories' && (
                  <motion.div
                    key="calories"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                      <span className="mr-3">🔥</span>
                      Calorie Tracking
                    </h2>
                    <p className="text-gray-600 mb-6 text-lg">
                      Track your daily calorie intake and expenditure to maintain a healthy balance.
                      </p>
                    <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-6">
                      <p className="text-teal-800 text-lg font-semibold">
                        <span className="mr-2">🚀</span>
                        Coming Soon! Advanced calorie tracking features will be available soon.
                      </p>
                    </div>
                  </motion.div>
              )}
              
              {activeNutritionTab === 'hydration' && (
                  <motion.div
                    key="hydration"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                      <span className="mr-3">💧</span>
                      Hydration Tracking
                    </h2>
                    <p className="text-gray-600 mb-6 text-lg">
                      Monitor your daily water intake to stay properly hydrated.
                      </p>
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
                      <p className="text-blue-800 text-lg font-semibold">
                        <span className="mr-2">🚀</span>
                        Coming Soon! Hydration tracking features will be available soon.
                      </p>
                    </div>
                  </motion.div>
              )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </motion.div>
  );
};

export default TrackProgressPage; 