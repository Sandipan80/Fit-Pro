import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import VideoPlayer from '../components/VideoPlayer';
import { useTracking } from '../context/TrackingContext';
import { usePaymentSync } from '../context/PaymentSyncContext';
import PremiumVideoOverlay from '../components/PremiumVideoOverlay';
import { motion } from 'framer-motion';

// Import video data from FeaturedVideosPage
import { videos as allVideos, getRelatedVideos } from './FeaturedVideosPage';

const SingleVideoPage = ({ routing }) => {
  const { trackVideoInteraction, trackPageView, trackButtonClick, trackEvent } = useTracking();
  const {
    subscription,
    canAccessPremium,
    hasActiveSubscription,
    getCurrentPlan,
    triggerSync
  } = usePaymentSync();
  
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showDescription, setShowDescription] = useState(true);
  const [playDuration, setPlayDuration] = useState(0);
  const [showPremiumOverlay, setShowPremiumOverlay] = useState(false);
  const [videoAccess, setVideoAccess] = useState(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use useRef for timer to avoid dependency issues
  const playTimerRef = useRef(null);
  
  // Get video ID from routing parameters
  const videoId = routing?.params?.id;
  
  // Load video data based on ID
  useEffect(() => {
    console.log('SingleVideoPage: Loading video data');
    console.log('Routing params:', routing?.params);
    console.log('Video ID:', videoId);
    console.log('Available videos count:', allVideos.length);
    
    if (videoId) {
      console.log('Loading video with ID:', videoId, 'Type:', typeof videoId);
      console.log('Available videos:', allVideos.map(v => ({ id: v.id, title: v.title })));
      
      // Try different ways to match the video ID
      let foundVideo = null;
      
      // First try exact match
      foundVideo = allVideos.find(v => v.id === parseInt(videoId));
      
      // If not found, try string comparison
      if (!foundVideo) {
        foundVideo = allVideos.find(v => v.id.toString() === videoId.toString());
      }
      
      // If still not found, try loose comparison
      if (!foundVideo) {
        foundVideo = allVideos.find(v => v.id == videoId);
      }
      
      if (foundVideo) {
        console.log('Found video:', foundVideo.title);
        setVideo(foundVideo);
        setLoading(false);
        setError(null);
      } else {
        console.error('Video not found for ID:', videoId);
        console.error('Available video IDs:', allVideos.map(v => v.id));
        setError(`Video not found (ID: ${videoId}). Available IDs: ${allVideos.map(v => v.id).join(', ')}`);
        setLoading(false);
        setVideo(null);
      }
    } else {
      console.error('No video ID provided');
      console.error('Routing object:', routing);
      setError('No video ID provided. Please check the URL.');
      setLoading(false);
      setVideo(null);
    }
  }, [videoId, routing?.params]);
  
  // Reset states when video changes
  useEffect(() => {
    if (video) {
      setShowVideoPlayer(false);
      setVideoPlaying(false);
      setPlayDuration(0);
      setShowPremiumOverlay(false);
      setError(null);
    }
  }, [video]);
  
  // Track page view on component mount
  useEffect(() => {
    if (video) {
      // Track detailed page view for video page
      trackPageView('video', {
        videoId: video.id,
        videoTitle: video.title,
        instructor: video.instructor,
        videoCategory: video.tags.join(',')
      });
    }
  }, [video, trackPageView]);
  
  // Check video access using payment sync context
  useEffect(() => {
    if (video) {
      const checkAccess = () => {
        console.log('Checking video access for:', video.title);
        console.log('Video access level:', video.accessLevel);
        console.log('Can access premium:', canAccessPremium());
        console.log('Has active subscription:', hasActiveSubscription());
        console.log('Current plan:', getCurrentPlan());
        
        const canAccess = video.accessLevel === 'free' || canAccessPremium();
        const access = {
          canAccess,
          reason: canAccess ? null : 'upgrade_required',
          previewDuration: video.previewDuration || 180
        };
        
        console.log('Access result:', access);
        setVideoAccess(access);
        
        // Show premium overlay if user can't access the video
        if (!access.canAccess && access.reason === 'upgrade_required') {
          console.log('Showing premium overlay - access denied');
          setShowPremiumOverlay(true);
        } else {
          console.log('Hiding premium overlay - access granted');
          setShowPremiumOverlay(false);
        }
      };
      
      checkAccess();
    }
  }, [video, canAccessPremium, hasActiveSubscription, getCurrentPlan, subscription]);
  
  // Track video play time - Fixed to avoid infinite re-renders
  useEffect(() => {
    if (videoPlaying && videoAccess?.canAccess && video) {
      // Start a timer when video plays
      playTimerRef.current = setInterval(() => {
        setPlayDuration(prev => prev + 1);
      }, 1000);
      
      // Track video play event
      trackVideoInteraction(video.id, 'play', {
        videoTitle: video.title,
        instructor: video.instructor
      });
    } else if (playTimerRef.current) {
      // Stop timer when video pauses
      clearInterval(playTimerRef.current);
      playTimerRef.current = null;
      
      // Only track pause if we've been playing
      if (playDuration > 0 && video) {
        // Track video pause event
        trackVideoInteraction(video.id, 'pause', {
          videoTitle: video.title,
          playDuration,
          instructor: video.instructor
        });
      }
    }
    
    // Clean up timer on component unmount or when dependencies change
    return () => {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
        playTimerRef.current = null;
        
        // Track video exit if it was playing
        if (videoPlaying && video) {
          trackVideoInteraction(video.id, 'exit', {
            videoTitle: video.title,
            playDuration,
            instructor: video.instructor,
            completionPercentage: Math.min(100, Math.round((playDuration / (parseInt(video.duration) * 60)) * 100))
          });
        }
      }
    };
  }, [videoPlaying, videoAccess?.canAccess, video, playDuration, trackVideoInteraction]);
  
  // Handle video play/pause
  const handleVideoToggle = () => {
    console.log('Video toggle clicked, video access:', videoAccess);
    
    if (!videoAccess?.canAccess) {
      console.log('Access denied, showing premium overlay');
      setShowPremiumOverlay(true);
      return;
    }
    
    console.log('Opening video player for video:', video?.title);
    setShowVideoPlayer(true);
    setVideoPlaying(true);
  };
  
  // Handle video player close
  const handleVideoPlayerClose = () => {
    console.log('Video player close requested');
    setShowVideoPlayer(false);
    setVideoPlaying(false);
    setPlayDuration(0); // Reset play duration when closing
  };
  
  // Handle tab changes
  const handleTabChange = (tab) => {
    // Track tab change
    trackEvent('tab', 'change', tab, {
      videoId: video.id,
      previousTab: showDescription ? 'description' : 'comments'
    });
    
    if (tab === 'description') {
      setShowDescription(true);
      setShowComments(false);
    } else {
      setShowDescription(false);
      setShowComments(true);
    }
  };
  
  // Handle social actions
  const handleSocialAction = (action) => {
    trackButtonClick(action, {
      videoId: video.id,
      videoTitle: video.title
    });
    
    // Show success message
    alert(`${action} action completed!`);
  };
  
  // Handle related video click
  const handleRelatedVideoClick = (relatedVideo) => {
    trackButtonClick('related_video_click', {
      fromVideoId: video.id,
      toVideoId: relatedVideo.id,
      fromVideoTitle: video.title,
      toVideoTitle: relatedVideo.title
    });
    
    // Navigate to the related video
    routing.navigateTo('video', { id: relatedVideo.id });
  };
  
  // Handle refresh access
  const handleRefreshAccess = async () => {
    console.log('Refreshing access...');
    try {
      // Trigger a manual sync to refresh payment data
      await triggerSync();
      
      // Re-check access after sync
      const canAccess = video.accessLevel === 'free' || canAccessPremium();
      const access = {
        canAccess,
        reason: canAccess ? null : 'upgrade_required',
        previewDuration: video.previewDuration || 180
      };
      
      setVideoAccess(access);
      
      if (canAccess) {
        console.log('Access granted after refresh, hiding premium overlay');
        setShowPremiumOverlay(false);
      } else {
        console.log('Access still denied after refresh');
      }
    } catch (error) {
      console.error('Error refreshing access:', error);
    }
  };
  
  // Handle upgrade
  const handleUpgrade = () => {
    trackButtonClick('upgrade_click', {
      videoId: video.id,
      videoTitle: video.title,
      currentPlan: getCurrentPlan()
    });
    
    routing.navigateTo('subscription');
  };
  
  // Handle login
  const handleLogin = () => {
    trackButtonClick('login_click', {
      videoId: video.id,
      videoTitle: video.title
    });
    
    routing.navigateTo('login');
  };
  
  // Get related videos using the imported function
  const relatedVideos = getRelatedVideos(video, allVideos, 6);
  
  // Mock comments
  const comments = [
    {
      id: 1,
      user: "FitnessFan123",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg",
      comment: "This workout is perfect for beginners! I can feel the difference after just a week.",
      likes: 45,
      date: "2 days ago",
      replies: [
        {
          id: 1,
          user: video?.instructor || "Instructor",
          avatar: "https://randomuser.me/api/portraits/women/44.jpg",
          comment: "Thank you! I'm so glad you're enjoying the workout. Keep up the great work! 💪",
          likes: 12,
          date: "1 day ago"
        }
      ]
    },
    {
      id: 2,
      user: "YogaLover",
      avatar: "https://randomuser.me/api/portraits/men/28.jpg",
      comment: "The warm-up section is really effective. I feel much more energized throughout the day.",
      likes: 23,
      date: "3 days ago"
    },
    {
      id: 3,
      user: "HealthJourney",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
      comment: "I've been doing this workout for 3 weeks now and I've lost 5 pounds! The instructor explains everything so clearly.",
      likes: 67,
      date: "1 week ago"
    }
  ];
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading video...</p>
          <p className="text-sm text-gray-500 mt-2">Video ID: {videoId}</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !video) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Video Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => routing.navigateTo('featured')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Browse Videos
            </button>
            <button
              onClick={() => routing.navigateTo('video', { id: 1 })}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Test: Load Video ID 1
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar routing={routing} />
      
      <main className="pt-6 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Column */}
            <div className="lg:col-span-2">
              {/* Video Player */}
              <div className="bg-black relative aspect-video rounded-xl overflow-hidden">
                <div className="absolute inset-0">
                  <img 
                    src={video?.thumbnail} 
                    alt={video?.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <button 
                      onClick={handleVideoToggle}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xl rounded-full p-6 transition-transform hover:scale-110"
                    >
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Access Status Overlay */}
                  {!videoAccess?.canAccess && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      🔒 {videoAccess?.reason === 'upgrade_required' ? 'Premium Required' : 'Access Restricted'}
                    </div>
                  )}
                  
                  {/* Preview Duration Indicator */}
                  {!videoAccess?.canAccess && video?.previewDuration && (
                    <div className="absolute top-4 right-4 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      Preview: {Math.floor(video.previewDuration / 60)}:{(video.previewDuration % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Fullscreen Video Player */}
              {showVideoPlayer && (
                <VideoPlayer
                  video={video}
                  onClose={handleVideoPlayerClose}
                  onUpgrade={handleUpgrade}
                  onLogin={handleLogin}
                />
              )}
              
              {/* Video Info */}
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">{video?.title}</h1>
                  {video?.requiresPayment && (
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-bold">
                      PREMIUM
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center mt-2 text-gray-600 text-sm gap-x-4">
                  <span>{video?.views?.toLocaleString() || '0'} views</span>
                  <span>•</span>
                  <span>{video?.date || 'N/A'}</span>
                  <span>•</span>
                  <span>{video?.duration || 'N/A'}</span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">{video?.level || 'N/A'}</span>
                </div>
                
                <div className="flex items-center justify-between mt-4 border-b border-gray-200 pb-4">
                  <div className="flex items-center">
                    <img src="https://randomuser.me/api/portraits/women/44.jpg" alt={video?.instructor} className="w-10 h-10 rounded-full" />
                    <div className="ml-3">
                      <p className="font-medium">{video?.instructor}</p>
                      <p className="text-sm text-gray-600">Certified Fitness Instructor</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Refresh Access Button for Testing */}
                    {video?.accessLevel === 'premium' && (
                      <button
                        onClick={handleRefreshAccess}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors text-sm"
                        title="Refresh access after payment"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        <span>Refresh Access</span>
                      </button>
                    )}
                    
                    <button 
                      onClick={() => handleSocialAction('like')}
                      className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>{video?.likes?.toLocaleString() || '0'}</span>
                    </button>
                    
                    <button 
                      onClick={() => handleSocialAction('share')}
                      className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      <span>Share</span>
                    </button>
                    
                    <button 
                      onClick={() => handleSocialAction('save')}
                      className="flex items-center space-x-2 text-gray-600 hover:text-yellow-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      <span>Save</span>
                    </button>
                  </div>
                </div>
                
                {/* Tabs */}
                <div className="flex border-b border-gray-200 mt-4">
                  <button
                    onClick={() => handleTabChange('description')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                      showDescription 
                        ? 'border-purple-500 text-purple-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Description
                  </button>
                  <button
                    onClick={() => handleTabChange('comments')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                      showComments 
                        ? 'border-purple-500 text-purple-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Comments ({comments.length})
                  </button>
                </div>
                
                {/* Description Content */}
                {showDescription && (
                  <div className="py-4">
                    <p className="text-gray-700 whitespace-pre-line">{video?.description}</p>
                    
                    <div className="mt-6">
                      <h3 className="font-semibold text-gray-800">Equipment needed:</h3>
                      <ul className="mt-2 list-disc pl-5 text-gray-700">
                        {video?.equipmentNeeded.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mt-6 flex flex-wrap gap-2">
                      {video?.tags.map((tag, index) => (
                        <span key={index} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Comments Content */}
                {showComments && (
                  <div className="py-4">
                    <div className="space-y-6">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex space-x-3">
                          <img src={comment.avatar} alt={comment.user} className="w-10 h-10 rounded-full flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-gray-800">{comment.user}</span>
                              <span className="text-gray-500 text-sm">{comment.date}</span>
                            </div>
                            <p className="text-gray-700 mb-2">{comment.comment}</p>
                            <div className="flex items-center space-x-4 text-sm">
                              <button className="text-gray-500 hover:text-red-500 transition-colors">
                                <span>👍 {comment.likes}</span>
                              </button>
                              <button className="text-gray-500 hover:text-blue-500 transition-colors">
                                Reply
                              </button>
                            </div>
                            
                            {/* Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                              <div className="mt-4 space-y-4">
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className="flex space-x-3 ml-4">
                                    <img src={reply.avatar} alt={reply.user} className="w-8 h-8 rounded-full flex-shrink-0" />
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <span className="font-medium text-gray-800">{reply.user}</span>
                                        <span className="text-gray-500 text-sm">{reply.date}</span>
                                      </div>
                                      <p className="text-gray-700 mb-2">{reply.comment}</p>
                                      <div className="flex items-center space-x-4 text-sm">
                                        <button className="text-gray-500 hover:text-red-500 transition-colors">
                                          <span>👍 {reply.likes}</span>
                                        </button>
                                        <button className="text-gray-500 hover:text-blue-500 transition-colors">
                                          Reply
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Up Next */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <h3 className="p-4 font-semibold text-gray-800 border-b border-gray-200">Up Next</h3>
                <div className="divide-y divide-gray-200">
                  {relatedVideos.map((relatedVideo) => (
                    <div 
                      key={relatedVideo.id} 
                      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleRelatedVideoClick(relatedVideo)}
                    >
                      <div className="flex space-x-3">
                        <div className="w-32 h-20 rounded-md overflow-hidden flex-shrink-0">
                          <img 
                            src={relatedVideo.thumbnail} 
                            alt={relatedVideo.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 line-clamp-2">{relatedVideo.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{relatedVideo.instructor}</p>
                          <p className="text-xs text-gray-500 mt-1">{relatedVideo.duration}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-200">
                  <a href="#" data-nav="featured" className="text-purple-600 hover:text-purple-800 font-medium">View all videos</a>
                </div>
              </div>
              
              {/* Instructor Profile */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <h3 className="p-4 font-semibold text-gray-800 border-b border-gray-200">About the Instructor</h3>
                <div className="p-4">
                  <div className="flex items-center">
                    <img src="https://randomuser.me/api/portraits/women/44.jpg" alt={video?.instructor} className="w-16 h-16 rounded-full" />
                    <div className="ml-4">
                      <h4 className="font-semibold">{video?.instructor}</h4>
                      <p className="text-sm text-gray-600">Certified Fitness Instructor</p>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-700">Priya is a certified personal trainer with over 8 years of experience. She specializes in weight loss and beginner-friendly workouts that anyone can do at home with minimal equipment.</p>
                  <button className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition-colors">
                    View All Workouts
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Premium Video Overlay */}
      <PremiumVideoOverlay
        video={video}
        isVisible={showPremiumOverlay}
        onUpgrade={handleUpgrade}
        onLogin={handleLogin}
        onClose={() => setShowPremiumOverlay(false)}
        onRefresh={handleRefreshAccess}
      />
      
      <Footer routing={routing} />
    </div>
  );
};

export default SingleVideoPage; 