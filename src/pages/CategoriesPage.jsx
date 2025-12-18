import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { usePersistentFilters } from '../utils/filterStorage';

const FAVORITES_KEY = 'favorite_categories';

const CategoriesPage = ({ routing }) => {
  // Use persistent filters instead of regular state
  const [filters, updateFilters, resetFilters] = usePersistentFilters('categories', {
    activeFilter: 'all',
    searchQuery: ''
  });
  
  const { activeFilter, searchQuery } = filters;
  
  const filterOptions = [
    { id: 'all', name: 'All Categories' },
    { id: 'popular', name: 'Most Popular' },
    { id: 'new', name: 'New' },
    { id: 'beginner', name: 'Beginner Friendly' }
  ];
  
  const categories = [
    {
      id: 1,
      name: 'Strength Training',
      image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      description: 'Build muscle and increase your metabolism with our strength training workouts.',
      workouts: 45,
      popular: true,
      new: false,
      beginner: true,
      tags: ['weights', 'resistance', 'muscle building']
    },
    {
      id: 2,
      name: 'HIIT',
      image: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      description: 'High Intensity Interval Training to burn calories and improve cardiovascular health.',
      workouts: 38,
      popular: true,
      new: false,
      beginner: false,
      tags: ['cardio', 'intense', 'calorie burning']
    },
    {
      id: 3,
      name: 'Yoga',
      image: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      description: 'Improve flexibility, balance and mental well-being with our yoga classes.',
      workouts: 50,
      popular: true,
      new: false,
      beginner: true,
      tags: ['flexibility', 'mindfulness', 'balance']
    },
    {
      id: 4,
      name: 'Pilates',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      description: 'Core-focused exercises to improve posture, stability and overall strength.',
      workouts: 32,
      popular: false,
      new: false,
      beginner: true,
      tags: ['core', 'stability', 'posture']
    },
    {
      id: 5,
      name: 'Cardio Boxing',
      image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      description: 'High-energy boxing workouts that improve stamina, coordination and strength.',
      workouts: 28,
      popular: true,
      new: false,
      beginner: false,
      tags: ['boxing', 'cardio', 'coordination']
    },
    {
      id: 6,
      name: 'Barre',
      image: 'https://images.unsplash.com/photo-1570691079236-4bca6c45d440?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      description: 'Ballet-inspired workouts focusing on small, precise movements for toning.',
      workouts: 25,
      popular: false,
      new: true,
      beginner: true,
      tags: ['ballet', 'toning', 'precision']
    },
    {
      id: 7,
      name: 'Cycling',
      image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      description: 'Indoor cycling workouts that challenge your endurance and lower body strength.',
      workouts: 30,
      popular: true,
      new: false,
      beginner: true,
      tags: ['cardio', 'endurance', 'legs']
    },
    {
      id: 8,
      name: 'Kettlebell',
      image: 'https://images.unsplash.com/photo-1604247584233-99c3011a4da0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      description: 'Full-body workouts using kettlebells for strength and functional fitness.',
      workouts: 22,
      popular: false,
      new: true,
      beginner: false,
      tags: ['strength', 'functional', 'full body']
    },
    {
      id: 9,
      name: 'Dance Fitness',
      image: 'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      description: 'Fun, high-energy dance workouts that burn calories while you enjoy the music.',
      workouts: 35,
      popular: true,
      new: false,
      beginner: true,
      tags: ['dance', 'cardio', 'fun']
    },
    {
      id: 10,
      name: 'Calisthenics',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      description: 'Bodyweight exercises focusing on strength, mobility and coordination.',
      workouts: 27,
      popular: false,
      new: true,
      beginner: false,
      tags: ['bodyweight', 'strength', 'mobility']
    },
    {
      id: 11,
      name: 'Meditation',
      image: 'https://images.unsplash.com/photo-1536623975707-c4b3b2af565d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      description: 'Guided sessions to reduce stress, increase focus and improve mental well-being.',
      workouts: 40,
      popular: true,
      new: false,
      beginner: true,
      tags: ['mindfulness', 'stress relief', 'mental health']
    },
    {
      id: 12,
      name: 'Stretching',
      image: 'https://images.unsplash.com/photo-1566241142904-808784c1b3a9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      description: 'Improve flexibility, reduce muscle tension and speed up recovery time.',
      workouts: 30,
      popular: false,
      new: true,
      beginner: true,
      tags: ['flexibility', 'recovery', 'mobility']
    }
  ];
  
  const [sortBy, setSortBy] = useState('name');
  const [selectedTag, setSelectedTag] = useState(null);
  const [modalCategory, setModalCategory] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [userPreferences, setUserPreferences] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user_preferences')) || {
        fitnessLevel: 'beginner',
        preferredDuration: '15-30',
        goals: ['weight_loss'],
        availableTime: '30'
      };
    } catch {
      return {
        fitnessLevel: 'beginner',
        preferredDuration: '15-30',
        goals: ['weight_loss'],
        availableTime: '30'
      };
    }
  });

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  // Tag filtering
  const tagFilteredCategories = selectedTag
    ? categories.filter(cat => cat.tags.includes(selectedTag))
    : categories;
  
  // Filter categories based on activeFilter and searchQuery
  let filteredCategories = tagFilteredCategories.filter(category => {
    // Filter by search query
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          category.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    // Filter by category type
    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'popular') return category.popular && matchesSearch;
    if (activeFilter === 'new') return category.new && matchesSearch;
    if (activeFilter === 'beginner') return category.beginner && matchesSearch;
    return false;
  });

  // Sort
  filteredCategories = [...filteredCategories].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'workouts') return b.workouts - a.workouts;
    if (sortBy === 'popular') return (b.popular === a.popular) ? 0 : b.popular ? 1 : -1;
    return 0;
  });

  // Favorite logic
  const isFavorite = (id) => favorites.includes(id);
  const toggleFavorite = (id) => {
    setFavorites(favs => favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id]);
  };

  // Sample workouts for modal (mocked)
  const getSampleWorkouts = (category) => [
    `${category.name} Workout 1`,
    `${category.name} Workout 2`,
    `${category.name} Workout 3`
  ];

  // Quick start recommendations
  const getQuickStartWorkouts = () => {
    const quickWorkouts = [
      {
        id: 'quick-hiit',
        name: 'Quick HIIT',
        duration: '15 min',
        intensity: 'High',
        category: 'HIIT',
        description: 'Fast-paced intervals for maximum calorie burn',
        image: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'quick-yoga',
        name: 'Quick Yoga Flow',
        duration: '20 min',
        intensity: 'Low',
        category: 'Yoga',
        description: 'Gentle flow to stretch and relax',
        image: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'quick-strength',
        name: 'Quick Strength',
        duration: '25 min',
        intensity: 'Medium',
        category: 'Strength Training',
        description: 'Full-body strength in minimal time',
        image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
      }
    ];
    return quickWorkouts;
  };

  // Time-based recommendations
  const getTimeBasedWorkouts = (timeLimit) => {
    const timeWorkouts = {
      '15': [
        { name: '15-Min HIIT', category: 'HIIT', intensity: 'High' },
        { name: 'Quick Stretch', category: 'Stretching', intensity: 'Low' },
        { name: 'Express Cardio', category: 'Cardio Boxing', intensity: 'Medium' }
      ],
      '30': [
        { name: '30-Min Strength', category: 'Strength Training', intensity: 'Medium' },
        { name: 'Power Yoga', category: 'Yoga', intensity: 'Medium' },
        { name: 'Dance Cardio', category: 'Dance Fitness', intensity: 'High' }
      ],
      '45': [
        { name: 'Full Body Circuit', category: 'Strength Training', intensity: 'High' },
        { name: 'Advanced HIIT', category: 'HIIT', intensity: 'High' },
        { name: 'Barre Workout', category: 'Barre', intensity: 'Medium' }
      ]
    };
    return timeWorkouts[timeLimit] || timeWorkouts['30'];
  };

  // Personalized recommendations based on user preferences
  const getPersonalizedRecommendations = () => {
    const { fitnessLevel, goals, availableTime } = userPreferences;
    
    let recommendations = [];
    
    // Based on fitness level
    if (fitnessLevel === 'beginner') {
      recommendations.push(...categories.filter(cat => cat.beginner).slice(0, 3));
    } else if (fitnessLevel === 'intermediate') {
      recommendations.push(...categories.filter(cat => cat.popular).slice(0, 3));
    } else {
      recommendations.push(...categories.filter(cat => !cat.beginner).slice(0, 3));
    }
    
    // Based on goals
    if (goals.includes('weight_loss')) {
      recommendations.push(...categories.filter(cat => 
        cat.tags.includes('cardio') || cat.tags.includes('calorie burning')
      ).slice(0, 2));
    }
    
    if (goals.includes('muscle_gain')) {
      recommendations.push(...categories.filter(cat => 
        cat.tags.includes('strength') || cat.tags.includes('muscle building')
      ).slice(0, 2));
    }
    
    // Remove duplicates and limit to 4
    return [...new Set(recommendations)].slice(0, 4);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar routing={routing} />
      
      <main className="py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Workout Categories</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Explore our diverse range of workout categories designed to help you achieve your fitness goals.</p>
          </div>
          
          {/* Quick Start Section */}
          <div className="mb-12">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white mb-6">
              <h2 className="text-2xl font-bold mb-2">Get Started Quick</h2>
              <p className="text-purple-100">Jump right into a workout with these quick-start options</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {getQuickStartWorkouts().map(workout => (
                <div key={workout.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <img src={workout.image} alt={workout.name} className="w-full h-32 object-cover" />
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800">{workout.name}</h3>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {workout.duration}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{workout.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Intensity: {workout.intensity}</span>
                      <button
                        onClick={() => {
                          if (routing && routing.navigateTo) {
                            routing.navigateTo('workoutsPage', {
                              category: workout.category,
                              quickStart: workout.id
                            });
                          }
                        }}
                        className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                      >
                        Start Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Short on Time Section */}
          <div className="mb-12">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white mb-6">
              <h2 className="text-2xl font-bold mb-2">Short on Time?</h2>
              <p className="text-orange-100">Find the perfect workout for your available time</p>
            </div>
            
            <div className="flex flex-wrap gap-4 mb-6">
              {['15', '30', '45'].map(time => (
                <button
                  key={time}
                  onClick={() => setUserPreferences(prev => ({ ...prev, availableTime: time }))}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    userPreferences.availableTime === time
                      ? 'bg-orange-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-orange-50'
                  }`}
                >
                  {time} Minutes
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {getTimeBasedWorkouts(userPreferences.availableTime).map((workout, index) => (
                <div key={index} className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="font-semibold text-gray-800 mb-1">{workout.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{workout.category}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {workout.intensity} Intensity
                    </span>
                    <button
                      onClick={() => {
                        const category = categories.find(cat => cat.name.includes(workout.category));
                        if (category && routing && routing.navigateTo) {
                          routing.navigateTo('workoutsPage', {
                            category: category.name,
                            duration: userPreferences.availableTime
                          });
                        }
                      }}
                      className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                    >
                      Start →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Personalized Plans Section */}
          <div className="mb-12">
            <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-6 text-white mb-6">
              <h2 className="text-2xl font-bold mb-2">Personalized Plans</h2>
              <p className="text-green-100">Workouts tailored to your preferences and goals</p>
            </div>
            
            {/* Preferences Setup */}
            <div className="bg-white rounded-lg p-6 shadow-md mb-6">
              <h3 className="text-lg font-semibold mb-4">Your Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fitness Level</label>
                  <select
                    value={userPreferences.fitnessLevel}
                    onChange={(e) => setUserPreferences(prev => ({ ...prev, fitnessLevel: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Goal</label>
                  <select
                    value={userPreferences.goals[0]}
                    onChange={(e) => setUserPreferences(prev => ({ ...prev, goals: [e.target.value] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  >
                    <option value="weight_loss">Weight Loss</option>
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="endurance">Endurance</option>
                    <option value="flexibility">Flexibility</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Time</label>
                  <select
                    value={userPreferences.availableTime}
                    onChange={(e) => setUserPreferences(prev => ({ ...prev, availableTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60+ minutes</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      localStorage.setItem('user_preferences', JSON.stringify(userPreferences));
                      alert('Preferences saved!');
                    }}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
            
            {/* Personalized Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {getPersonalizedRecommendations().map(category => (
                <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <img src={category.image} alt={category.name} className="w-full h-32 object-cover" />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">{category.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{category.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">{category.workouts} workouts</span>
                      <button
                        onClick={() => {
                          if (routing && routing.navigateTo) {
                            routing.navigateTo('workoutsPage', {
                              category: category.name,
                              personalized: true
                            });
                          }
                        }}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Start
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search, Filter, Sort */}
          <div className="flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto mb-10">
            <div className="flex space-x-2 mb-4 md:mb-0 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
              {filterOptions.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => updateFilters({ activeFilter: filter.id })}
                  className={`px-4 py-2 rounded-full whitespace-nowrap ${activeFilter === filter.id ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                  {filter.name}
                </button>
              ))}
            </div>
            
            <div className="flex items-center space-x-2 w-full md:w-auto">
                <input
                  type="text"
                value={searchQuery}
                onChange={e => updateFilters({ searchQuery: e.target.value })}
                  placeholder="Search categories..."
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none w-full md:w-64"
              />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="ml-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="name">Sort: Name</option>
                <option value="workouts">Sort: Workouts</option>
                <option value="popular">Sort: Popularity</option>
              </select>
            </div>
              </div>
              
          {/* Tag Filter */}
          <div className="flex flex-wrap gap-2 mb-6 max-w-6xl mx-auto">
            {[...new Set(categories.flatMap(cat => cat.tags))].map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-3 py-1 rounded-full text-sm ${selectedTag === tag ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'}`}
              >
                #{tag}
              </button>
            ))}
            {selectedTag && (
                <button
                onClick={() => setSelectedTag(null)}
                className="ml-2 px-3 py-1 rounded-full text-sm bg-gray-300 text-gray-700"
                >
                Clear Tag
                </button>
              )}
          </div>
          
          {/* Filter Status */}
          {(activeFilter !== 'all' || searchQuery) && (
            <div className="max-w-6xl mx-auto mb-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-sm text-purple-800">
                  <span className="font-medium">Active filters:</span>
                  {activeFilter !== 'all' && (
                    <span className="ml-2 bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                      {filterOptions.find(f => f.id === activeFilter)?.name}
                    </span>
                  )}
                  {searchQuery && (
                    <span className="ml-2 bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                      Search: "{searchQuery}"
                    </span>
                  )}
                  <span className="ml-2 text-purple-600">
                    ({filteredCategories.length} results)
                  </span>
                </p>
              </div>
            </div>
          )}
          
          {/* Categories Grid */}
          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCategories.map(category => (
                <div
                  key={category.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow relative group"
                >
                  <img src={category.image} alt={category.name} className="w-full h-48 object-cover" />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-xl font-bold text-gray-800">{category.name}</h2>
                      <button
                        onClick={() => toggleFavorite(category.id)}
                        className="ml-2 text-yellow-400 hover:text-yellow-500 focus:outline-none"
                        title={isFavorite(category.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {isFavorite(category.id) ? (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.967z" /></svg>
                        ) : (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.967z" /></svg>
                        )}
                      </button>
                    </div>
                    <p className="text-gray-600 mb-3">{category.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {category.tags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(tag)}
                          className="px-2 py-1 rounded-full text-xs bg-gray-200 text-gray-700 hover:bg-blue-100"
                        >
                          #{tag}
                        </button>
                        ))}
                      </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{category.workouts} Workouts</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setModalCategory(category)}
                          className="text-purple-600 hover:underline text-sm font-medium"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => {
                            if (routing && routing.navigateTo) {
                              routing.navigateTo('workoutsPage', { category: category.name });
                            }
                          }}
                          className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors"
                        >
                          Start
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No categories found</h2>
              <p className="text-gray-500 max-w-md mx-auto">We couldn't find any workout categories matching your search criteria. Try adjusting your filters or search terms.</p>
              <button 
                onClick={() => resetFilters()}
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
          
          {/* Category Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-16">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-sm overflow-hidden text-white p-6">
              <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              <h3 className="text-xl font-bold mb-2">Get Started Quick</h3>
              <p className="opacity-90 mb-4">Not sure where to begin? Try our beginner-friendly categories designed for newcomers.</p>
              <a href="#" className="inline-flex items-center text-white font-medium hover:underline">
                View beginner workouts
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </a>
            </div>
            
            <div className="bg-gradient-to-br from-pink-500 to-red-600 rounded-xl shadow-sm overflow-hidden text-white p-6">
              <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="text-xl font-bold mb-2">Short on Time?</h3>
              <p className="opacity-90 mb-4">Browse our collection of quick workouts designed to fit into your busy schedule.</p>
              <a href="#" className="inline-flex items-center text-white font-medium hover:underline">
                Find quick workouts
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </a>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl shadow-sm overflow-hidden text-white p-6">
              <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
              <h3 className="text-xl font-bold mb-2">Personalized Plans</h3>
              <p className="opacity-90 mb-4">Get a customized workout plan tailored to your fitness goals and preferences.</p>
              <a href="#" className="inline-flex items-center text-white font-medium hover:underline">
                Create your plan
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Modal for category details */}
          {modalCategory && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-8 relative">
                <button
                  onClick={() => setModalCategory(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <img src={modalCategory.image} alt={modalCategory.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                <h2 className="text-2xl font-bold mb-2">{modalCategory.name}</h2>
                <p className="text-gray-600 mb-4">{modalCategory.description}</p>
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Sample Workouts:</h3>
                  <ul className="list-disc list-inside text-gray-700">
                    {getSampleWorkouts(modalCategory).map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
                <button
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                  onClick={() => {
                    setModalCategory(null);
                    if (routing && routing.navigateTo) {
                      routing.navigateTo('workoutsPage', { category: modalCategory.name });
                    }
                  }}
                >
                  Start Now
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer routing={routing} />
    </div>
  );
};

export default CategoriesPage; 