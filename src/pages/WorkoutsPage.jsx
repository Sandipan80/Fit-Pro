import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLocation } from 'react-router-dom';
import { usePersistentFilters } from '../utils/filterStorage';
import videoAccessService from '../services/videoAccessService';
import PremiumVideoOverlay from '../components/PremiumVideoOverlay';
import { motion } from 'framer-motion';

// Mocked workouts/videos data (could be replaced with API or context)
import { videos as allVideos } from './FeaturedVideosPage';

const WorkoutsPage = ({ routing, ...props }) => {
  // Read parameters from routing or location
  let params = {};
  if (routing && routing.params) {
    params = routing.params;
  } else if (window.location && window.location.state) {
    params = window.location.state;
  }

  // Fallback for React Router v6+ (if used)
  try {
    // eslint-disable-next-line
    const location = useLocation && useLocation();
    if (location && location.state) {
      params = { ...params, ...location.state };
    }
  } catch {}

  const [filters, updateFilters, resetFilters] = usePersistentFilters('workoutsPage', {
    search: '',
    level: 'all',
    duration: 'all',
    category: params.category || 'all',
  });
  const { search, level, duration, category } = filters;
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showPremiumOverlay, setShowPremiumOverlay] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [availableVideos, setAvailableVideos] = useState([]);
  const [userStatus, setUserStatus] = useState({});

  // Load user status and available videos
  useEffect(() => {
    const loadUserData = () => {
      const status = videoAccessService.getUserSubscriptionStatus();
      setUserStatus(status);
      
      const videosWithAccess = videoAccessService.getAvailableVideos(allVideos);
      setAvailableVideos(videosWithAccess);
    };

    loadUserData();
    
    // Set up interval to refresh user status
    const interval = setInterval(loadUserData, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Filter videos based on params and filters
  let filteredVideos = availableVideos;

  // Debug logging
  console.log('WorkoutsPage Debug:', {
    params,
    category,
    allVideosCount: allVideos.length,
    allVideosTags: [...new Set(allVideos.flatMap(v => v.tags))]
  });

  // Category filter - comprehensive logic
  const categoryToFilter = params.category || category;
  if (categoryToFilter && categoryToFilter !== 'all') {
    const categoryLower = categoryToFilter.toLowerCase();
    console.log('Filtering by category:', categoryToFilter, 'Lowercase:', categoryLower);
    
    // Define comprehensive category mappings for better filtering
    const categoryMappings = {
      'strength training': ['strength', 'muscle-building', 'advanced'],
      'hiit': ['hiit', 'cardio', 'intense', 'fat-burning'],
      'yoga': ['yoga', 'flexibility', 'mindfulness'],
      'pilates': ['pilates', 'core'],
      'cardio boxing': ['boxing', 'cardio'],
      'barre': ['barre', 'ballet', 'toning'],
      'cycling': ['cycling', 'cardio', 'endurance'],
      'kettlebell': ['kettlebell', 'strength'],
      'dance fitness': ['dance', 'cardio', 'fun'],
      'calisthenics': ['calisthenics', 'strength', 'bodyweight'],
      'meditation': ['meditation', 'yoga', 'low-impact', 'mindfulness', 'stress-relief'],
      'stretching': ['stretching', 'flexibility', 'recovery', 'quick']
    };
    
    // Get the mapped tags for this category
    const mappedTags = categoryMappings[categoryLower] || [];
    console.log('Mapped tags for', categoryLower, ':', mappedTags);
    
    // For specific categories, use direct filtering first
    if (categoryLower === 'yoga') {
      const directYogaVideos = availableVideos.filter(v => v.tags.includes('yoga'));
      console.log('Direct yoga test found:', directYogaVideos.length, 'videos');
      if (directYogaVideos.length > 0) {
        filteredVideos = directYogaVideos;
        console.log('Using direct yoga filtering, found:', filteredVideos.length, 'videos');
      } else {
        console.log('No yoga videos found with direct filtering');
      }
    } else if (categoryLower === 'strength training') {
      const directStrengthVideos = availableVideos.filter(v => 
        v.tags.includes('strength') || 
        v.tags.includes('muscle-building') || 
        v.tags.includes('advanced') ||
        v.title.toLowerCase().includes('strength')
      );
      console.log('Direct strength training test found:', directStrengthVideos.length, 'videos');
      if (directStrengthVideos.length > 0) {
        filteredVideos = directStrengthVideos;
        console.log('Using direct strength training filtering, found:', filteredVideos.length, 'videos');
      } else {
        console.log('No strength training videos found with direct filtering');
      }
    } else if (categoryLower === 'hiit') {
      const directHiitVideos = availableVideos.filter(v => 
        v.tags.includes('hiit') || 
        v.tags.includes('cardio') || 
        v.tags.includes('intense') ||
        v.tags.includes('fat-burning') ||
        v.title.toLowerCase().includes('hiit')
      );
      console.log('Direct HIIT test found:', directHiitVideos.length, 'videos');
      if (directHiitVideos.length > 0) {
        filteredVideos = directHiitVideos;
        console.log('Using direct HIIT filtering, found:', filteredVideos.length, 'videos');
      } else {
        console.log('No HIIT videos found with direct filtering');
      }
    } else if (categoryLower === 'pilates') {
      const directPilatesVideos = availableVideos.filter(v => 
        v.tags.includes('pilates') || 
        v.tags.includes('core') ||
        v.title.toLowerCase().includes('pilates')
      );
      console.log('Direct Pilates test found:', directPilatesVideos.length, 'videos');
      if (directPilatesVideos.length > 0) {
        filteredVideos = directPilatesVideos;
        console.log('Using direct Pilates filtering, found:', filteredVideos.length, 'videos');
      } else {
        console.log('No Pilates videos found with direct filtering');
      }
    } else if (categoryLower === 'cardio boxing') {
      const directBoxingVideos = availableVideos.filter(v => 
        v.tags.includes('boxing') || 
        v.tags.includes('cardio') ||
        v.title.toLowerCase().includes('boxing')
      );
      console.log('Direct Cardio Boxing test found:', directBoxingVideos.length, 'videos');
      if (directBoxingVideos.length > 0) {
        filteredVideos = directBoxingVideos;
        console.log('Using direct Cardio Boxing filtering, found:', filteredVideos.length, 'videos');
      } else {
        console.log('No Cardio Boxing videos found with direct filtering');
      }
    } else if (categoryLower === 'dance fitness') {
      console.log('Starting Dance Fitness filtering...');
      console.log('All videos count:', availableVideos.length);
      console.log('Videos with dance tag:', availableVideos.filter(v => v.tags.includes('dance')).map(v => v.title));
      console.log('Videos with cardio tag:', availableVideos.filter(v => v.tags.includes('cardio')).map(v => v.title));
      console.log('Videos with fun tag:', availableVideos.filter(v => v.tags.includes('fun')).map(v => v.title));
      
      const directDanceVideos = availableVideos.filter(v => 
        v.tags.includes('dance') || 
        v.tags.includes('cardio') || 
        v.tags.includes('fun') ||
        v.title.toLowerCase().includes('dance')
      );
      console.log('Direct Dance Fitness test found:', directDanceVideos.length, 'videos');
      console.log('Dance videos found:', directDanceVideos.map(v => ({ title: v.title, tags: v.tags })));
      
      if (directDanceVideos.length > 0) {
        filteredVideos = directDanceVideos;
        console.log('Using direct Dance Fitness filtering, found:', filteredVideos.length, 'videos');
      } else {
        console.log('No Dance Fitness videos found with direct filtering');
      }
    } else {
      // Use the general filtering logic for other categories
      filteredVideos = filteredVideos.filter(v => {
        // Check if category name appears in title
        const titleMatch = v.title.toLowerCase().includes(categoryLower);
        
        // Check if any tag matches the category exactly
        const tagMatch = v.tags.some(tag => tag.toLowerCase() === categoryLower);
        
        // Check if any tag contains the category
        const tagContainsMatch = v.tags.some(tag => tag.toLowerCase().includes(categoryLower));
        
        // Check for specific category mappings
        const mappingMatch = mappedTags.some(tag => v.tags.includes(tag));
        
        const matches = titleMatch || tagMatch || tagContainsMatch || mappingMatch;
        
        if (matches) {
          console.log('Video matched:', v.title, 'Tags:', v.tags, 'Category:', categoryLower);
        }
        
        return matches;
      });
      
      console.log('Videos after category filter:', filteredVideos.length);
      console.log('Matched videos:', filteredVideos.map(v => v.title));
    }
  }

  // Duration filter
  if (params.duration) {
    console.log('Before duration filter:', filteredVideos.length, 'videos');
    filteredVideos = filteredVideos.filter(v => v.duration.includes(params.duration));
    console.log('After duration filter:', filteredVideos.length, 'videos');
  } else if (duration && duration !== 'all') {
    console.log('Before duration filter:', filteredVideos.length, 'videos');
    filteredVideos = filteredVideos.filter(v => v.duration.includes(duration));
    console.log('After duration filter:', filteredVideos.length, 'videos');
  }

  // Level filter
  if (level && level !== 'all') {
    console.log('Before level filter:', filteredVideos.length, 'videos');
    filteredVideos = filteredVideos.filter(v => v.level.toLowerCase() === level.toLowerCase());
    console.log('After level filter:', filteredVideos.length, 'videos');
  }

  // Search filter
  if (search) {
    console.log('Before search filter:', filteredVideos.length, 'videos');
    filteredVideos = filteredVideos.filter(v =>
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase()) ||
      v.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    );
    console.log('After search filter:', filteredVideos.length, 'videos');
  }

  // Final debug log
  console.log('=== FINAL FILTERING RESULT ===');
  console.log('Final filtered videos count:', filteredVideos.length);
  console.log('Final filtered videos:', filteredVideos.map(v => v.title));
  console.log('Current category filter:', category);
  console.log('Current search filter:', search);
  console.log('Current level filter:', level);
  console.log('Current duration filter:', duration);
  console.log('================================');

  // Error handling
  useEffect(() => {
    console.log('Error handling - filteredVideos length:', filteredVideos.length);
    console.log('Error handling - categoryToFilter:', params.category || category);
    console.log('Error handling - current error state:', error);
    
    // Add a small delay to prevent race conditions
    const timeoutId = setTimeout(() => {
      if (filteredVideos.length === 0) {
        const categoryToFilter = params.category || category;
        if (categoryToFilter && categoryToFilter !== 'all') {
          console.log('Setting error for category:', categoryToFilter);
          setError(`No workouts found for "${categoryToFilter}". Showing all available workouts instead.`);
          // Reset to show all videos if no category matches
          setTimeout(() => {
            console.log('Auto-resetting category to all');
            updateFilters({ category: 'all' });
          }, 3000);
        } else {
          setError('No workouts found for your selection. Try changing filters or search.');
        }
      } else {
        console.log('Clearing error - found', filteredVideos.length, 'videos');
        setError(null);
      }
    }, 100); // Small delay to ensure filtering is complete
    
    return () => clearTimeout(timeoutId);
  }, [filteredVideos, params.category, category, updateFilters, error]);

  // Notification handler
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Navigation to single video
  const goToVideo = (video) => {
    if (video.canAccess) {
      if (routing && routing.navigateTo) {
        routing.navigateTo('video', { id: video.id });
      } else {
        showNotification('Navigation not available.');
      }
    } else {
      // Show premium overlay
      setSelectedVideo(video);
      setShowPremiumOverlay(true);
    }
  };

  const handleUpgrade = () => {
    setShowPremiumOverlay(false);
    if (routing && routing.navigateTo) {
      routing.navigateTo('subscription');
    }
  };

  const handleLogin = () => {
    setShowPremiumOverlay(false);
    if (routing && routing.navigateTo) {
      routing.navigateTo('login');
    }
  };

  const getFreeVideosCount = () => {
    return availableVideos.filter(video => !video.requiresPayment).length;
  };

  const getPremiumVideosCount = () => {
    return availableVideos.filter(video => video.requiresPayment).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar routing={routing} />
      
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Workout Videos</h1>
          <p className="text-xl text-purple-100 max-w-3xl mb-6">Find the perfect workout for your fitness journey.</p>
          
          {/* Video Stats */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <span className="text-green-400 font-semibold">{getFreeVideosCount()}</span> Free Videos
            </div>
            <div className="bg-purple-500/20 rounded-lg px-4 py-2">
              <span className="text-purple-400 font-semibold">{getPremiumVideosCount()}</span> Premium Videos
            </div>
            {userStatus.subscription && (
              <div className="bg-blue-500/20 rounded-lg px-4 py-2">
                <span className="text-blue-400 font-semibold capitalize">{userStatus.subscription.currentPlan}</span> Plan
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white py-6 shadow-md sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search workouts..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={search}
                onChange={(e) => updateFilters({ search: e.target.value })}
              />
            </div>
            
            {/* Level Filter */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={level}
              onChange={(e) => updateFilters({ level: e.target.value })}
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            
            {/* Duration Filter */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={duration}
              onChange={(e) => updateFilters({ duration: e.target.value })}
            >
              <option value="all">All Durations</option>
              <option value="10">10 min</option>
              <option value="15">15 min</option>
              <option value="20">20 min</option>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">60 min</option>
            </select>
            
            {/* Clear Filters */}
            {(search || level !== 'all' || duration !== 'all' || category !== 'all') && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mx-4 mt-4">
          {error}
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {notification}
        </div>
      )}

      {/* Videos Grid */}
      <main className="py-12">
        <div className="container mx-auto px-4">
          {filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                  onClick={() => goToVideo(video)}
                >
                  <div className="relative">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-48 object-cover" />
                    
                    {/* Premium Badge */}
                    {video.requiresPayment && (
                      <div className="absolute top-3 right-3 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        PREMIUM
                      </div>
                    )}
                    
                    {/* Access Status Badge */}
                    {!video.canAccess && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        🔒 LOCKED
                      </div>
                    )}
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="bg-white/90 hover:bg-white text-purple-600 rounded-full p-3 transform transition-transform duration-300 group-hover:scale-110">
                        {video.canAccess ? (
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        ) : (
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">{video.title}</h2>
                    <p className="text-gray-600 mb-2 line-clamp-2">{video.description}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {video.tags.map(tag => (
                        <span key={tag} className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{video.duration}</span>
                      <span>{video.level}</span>
                    </div>
                    
                    {/* Access Status */}
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">with {video.instructor}</span>
                      <div className="flex items-center space-x-2">
                        {video.canAccess ? (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                            Watch Now
                          </span>
                        ) : (
                          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                            Upgrade to Watch
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-2xl font-bold text-gray-700 mb-4">No workouts found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </main>
      
      {/* Premium Video Overlay */}
      <PremiumVideoOverlay
        video={selectedVideo}
        isVisible={showPremiumOverlay}
        onUpgrade={handleUpgrade}
        onLogin={handleLogin}
        onClose={() => setShowPremiumOverlay(false)}
      />
      
      <Footer routing={routing} />
    </div>
  );
};

export default WorkoutsPage; 