import { useState, useEffect } from 'react';
import { auth } from '../components/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../components/firebase';
import LoadingSpinner from '../components/LoadingSpinner';
import Breadcrumb from '../components/Breadcrumb';

const WorkoutAnalyticsPage = ({ routing }) => {
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalWorkouts: 0,
    totalDuration: 0,
    averageDuration: 0,
    favoriteCategory: '',
    weeklyProgress: [],
    monthlyProgress: [],
    strengthProgress: {},
    cardioProgress: {},
    recentWorkouts: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('duration');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        loadAnalytics(user.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadAnalytics = async (userId) => {
    try {
      setLoading(true);
      
      // Get user profile
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();

      // Get workout history
      const workoutsRef = collection(db, 'workouts');
      const workoutsQuery = query(
        workoutsRef,
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        limit(50)
      );
      const workoutsSnapshot = await getDocs(workoutsQuery);
      const workouts = workoutsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate analytics
      const totalWorkouts = workouts.length;
      const totalDuration = workouts.reduce((sum, workout) => sum + (workout.duration || 0), 0);
      const averageDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

      // Calculate favorite category
      const categoryCount = {};
      workouts.forEach(workout => {
        const category = workout.category || 'Other';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });
      const favoriteCategory = Object.keys(categoryCount).reduce((a, b) => 
        categoryCount[a] > categoryCount[b] ? a : b, 'None'
      );

      // Calculate weekly progress
      const now = new Date();
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      const weeklyWorkouts = workouts.filter(workout => 
        new Date(workout.date.toDate()) >= weekStart
      );
      const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(weekStart);
        day.setDate(day.getDate() + i);
        const dayWorkouts = weeklyWorkouts.filter(workout => {
          const workoutDate = new Date(workout.date.toDate());
          return workoutDate.toDateString() === day.toDateString();
        });
        return {
          date: day,
          count: dayWorkouts.length,
          duration: dayWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0)
        };
      });

      // Calculate monthly progress
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyWorkouts = workouts.filter(workout => 
        new Date(workout.date.toDate()) >= monthStart
      );
      const monthlyProgress = Array.from({ length: 30 }, (_, i) => {
        const day = new Date(monthStart);
        day.setDate(day.getDate() + i);
        if (day > now) return null;
        
        const dayWorkouts = monthlyWorkouts.filter(workout => {
          const workoutDate = new Date(workout.date.toDate());
          return workoutDate.toDateString() === day.toDateString();
        });
        return {
          date: day,
          count: dayWorkouts.length,
          duration: dayWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0)
        };
      }).filter(Boolean);

      // Calculate strength and cardio progress
      const strengthWorkouts = workouts.filter(w => w.type === 'strength');
      const cardioWorkouts = workouts.filter(w => w.type === 'cardio');
      
      const strengthProgress = {
        total: strengthWorkouts.length,
        averageDuration: strengthWorkouts.length > 0 
          ? Math.round(strengthWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0) / strengthWorkouts.length)
          : 0
      };

      const cardioProgress = {
        total: cardioWorkouts.length,
        averageDuration: cardioWorkouts.length > 0
          ? Math.round(cardioWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0) / cardioWorkouts.length)
          : 0
      };

      setAnalytics({
        totalWorkouts,
        totalDuration,
        averageDuration,
        favoriteCategory,
        weeklyProgress,
        monthlyProgress,
        strengthProgress,
        cardioProgress,
        recentWorkouts: workouts.slice(0, 5)
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getProgressColor = (value, max) => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading analytics..." />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please log in to view analytics</h2>
          <button
            onClick={() => routing.navigateTo('login')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumb 
        routing={routing} 
        items={[{ label: 'Workout Analytics', path: 'analytics' }]} 
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Workout Analytics</h1>
          <p className="text-gray-600">Track your fitness journey and performance insights</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Workouts</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalWorkouts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Duration</p>
                <p className="text-2xl font-bold text-gray-900">{formatDuration(analytics.totalDuration)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-gray-900">{formatDuration(analytics.averageDuration)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Favorite Category</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.favoriteCategory}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Weekly Progress</h3>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
              >
                <option value="duration">Duration</option>
                <option value="count">Workout Count</option>
              </select>
            </div>
            <div className="space-y-3">
              {analytics.weeklyProgress.map((day, index) => {
                const value = selectedMetric === 'duration' ? day.duration : day.count;
                const maxValue = selectedMetric === 'duration' 
                  ? Math.max(...analytics.weeklyProgress.map(d => d.duration))
                  : Math.max(...analytics.weeklyProgress.map(d => d.count));
                const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
                
                return (
                  <div key={index} className="flex items-center">
                    <span className="w-16 text-sm text-gray-600">
                      {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <div className="flex-1 ml-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">
                          {selectedMetric === 'duration' ? formatDuration(value) : `${value} workouts`}
                        </span>
                        <span className="text-gray-500">{Math.round(percentage)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(value, maxValue)}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Workout Types</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Strength Training</span>
                  <span className="text-sm text-gray-500">
                    {analytics.strengthProgress.total} workouts
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 bg-blue-500 rounded-full"
                    style={{ 
                      width: `${analytics.totalWorkouts > 0 ? (analytics.strengthProgress.total / analytics.totalWorkouts) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Avg: {formatDuration(analytics.strengthProgress.averageDuration)}
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Cardio</span>
                  <span className="text-sm text-gray-500">
                    {analytics.cardioProgress.total} workouts
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 bg-green-500 rounded-full"
                    style={{ 
                      width: `${analytics.totalWorkouts > 0 ? (analytics.cardioProgress.total / analytics.totalWorkouts) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Avg: {formatDuration(analytics.cardioProgress.averageDuration)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Workouts */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Workouts</h3>
          {analytics.recentWorkouts.length > 0 ? (
            <div className="space-y-3">
              {analytics.recentWorkouts.map((workout, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-800">{workout.title || 'Workout'}</h4>
                    <p className="text-sm text-gray-600">
                      {workout.category} • {formatDuration(workout.duration)}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {workout.date.toDate().toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent workouts found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutAnalyticsPage; 