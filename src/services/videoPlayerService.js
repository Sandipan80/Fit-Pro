class VideoPlayerService {
  constructor() {
    this.analytics = {
      playCount: 0,
      totalWatchTime: 0,
      averageWatchTime: 0,
      completionRate: 0,
      qualityChanges: 0,
      bufferingEvents: 0
    };
    
    this.performance = {
      startTime: 0,
      loadTime: 0,
      bufferingTime: 0,
      qualityLevel: 'auto'
    };
    
    this.networkStatus = 'online';
    this.videoCache = new Map();
    this.qualityLevels = ['auto', '1080p', '720p', '480p', '360p'];
    
    this.initializeNetworkMonitoring();
    this.initializePerformanceTracking();
  }

  // Network monitoring
  initializeNetworkMonitoring() {
    window.addEventListener('online', () => {
      this.networkStatus = 'online';
      this.dispatchEvent('networkStatusChanged', { status: 'online' });
    });

    window.addEventListener('offline', () => {
      this.networkStatus = 'offline';
      this.dispatchEvent('networkStatusChanged', { status: 'offline' });
    });

    // Monitor connection quality
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', () => {
        this.updateQualityBasedOnConnection();
      });
    }
  }

  // Performance tracking
  initializePerformanceTracking() {
    this.performance.startTime = performance.now();
    
    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memoryInfo = performance.memory;
        if (memoryInfo.usedJSHeapSize > memoryInfo.jsHeapSizeLimit * 0.8) {
          this.optimizeMemory();
        }
      }, 10000);
    }
  }

  // Video analytics
  trackVideoEvent(eventType, videoId, data = {}) {
    const event = {
      type: eventType,
      videoId,
      timestamp: Date.now(),
      sessionId: this.getSessionId(),
      data
    };

    // Store locally
    this.storeAnalyticsEvent(event);

    // Send to analytics service (mock)
    this.sendAnalyticsEvent(event);

    // Update local analytics
    this.updateAnalytics(eventType, data);
  }

  updateAnalytics(eventType, data) {
    switch (eventType) {
      case 'play':
        this.analytics.playCount++;
        break;
      case 'timeupdate':
        if (data.currentTime) {
          this.analytics.totalWatchTime += data.currentTime - (data.previousTime || 0);
        }
        break;
      case 'ended':
        this.analytics.completionRate = (this.analytics.completionRate + 1) / 2;
        break;
      case 'qualitychange':
        this.analytics.qualityChanges++;
        break;
      case 'waiting':
        this.analytics.bufferingEvents++;
        break;
    }
  }

  // Quality management
  updateQualityBasedOnConnection() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      let targetQuality = 'auto';

      if (connection.effectiveType === '4g') {
        targetQuality = '1080p';
      } else if (connection.effectiveType === '3g') {
        targetQuality = '720p';
      } else {
        targetQuality = '480p';
      }

      this.setQualityLevel(targetQuality);
    }
  }

  setQualityLevel(quality) {
    this.performance.qualityLevel = quality;
    this.dispatchEvent('qualityChanged', { quality });
    this.trackVideoEvent('qualitychange', null, { quality });
  }

  getQualityLevel() {
    return this.performance.qualityLevel;
  }

  // Performance optimization
  optimizeMemory() {
    // Clear video cache if memory usage is high
    if (this.videoCache.size > 10) {
      const oldestEntries = Array.from(this.videoCache.entries())
        .slice(0, 5);
      
      oldestEntries.forEach(([key]) => {
        this.videoCache.delete(key);
      });
    }

    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
  }

  // Video caching
  cacheVideo(videoId, videoData) {
    this.videoCache.set(videoId, {
      data: videoData,
      timestamp: Date.now(),
      accessCount: 0
    });
  }

  getCachedVideo(videoId) {
    const cached = this.videoCache.get(videoId);
    if (cached) {
      cached.accessCount++;
      cached.lastAccessed = Date.now();
      return cached.data;
    }
    return null;
  }

  // Adaptive bitrate simulation
  getAdaptiveBitrateUrl(videoId, quality = 'auto') {
    const baseUrl = this.getVideoUrl(videoId);
    
    if (quality === 'auto') {
      return baseUrl; // Let browser handle adaptive bitrate
    }
    
    // Simulate different quality URLs
    const qualityMap = {
      '1080p': baseUrl.replace('.mp4', '_1080p.mp4'),
      '720p': baseUrl.replace('.mp4', '_720p.mp4'),
      '480p': baseUrl.replace('.mp4', '_480p.mp4'),
      '360p': baseUrl.replace('.mp4', '_360p.mp4')
    };
    
    return qualityMap[quality] || baseUrl;
  }

  // Video URL management
  getVideoUrl(videoId) {
    // Mock video URLs - replace with actual video service
    const videoUrls = {
      'cardio-1': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'strength-1': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      'yoga-1': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'hiit-1': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      'pilates-1': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      'dance-1': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      'boxing-1': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      'crossfit-1': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
      'zumba-1': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      'meditation-1': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4'
    };
    
    return videoUrls[videoId] || videoUrls['cardio-1'];
  }

  // Thumbnail generation
  generateThumbnail(videoId, time = 0) {
    // Mock thumbnail generation
    return `https://via.placeholder.com/320x180/8b5cf6/ffffff?text=Thumbnail+${time}s`;
  }

  // Video metadata
  getVideoMetadata(videoId) {
    const metadata = {
      'cardio-1': {
        title: 'High Intensity Cardio Workout',
        duration: 1800,
        category: 'Cardio',
        difficulty: 'Intermediate',
        calories: 300,
        equipment: ['None'],
        tags: ['cardio', 'hiit', 'fat-burning']
      },
      'strength-1': {
        title: 'Full Body Strength Training',
        duration: 2400,
        category: 'Strength',
        difficulty: 'Advanced',
        calories: 400,
        equipment: ['Dumbbells', 'Resistance Bands'],
        tags: ['strength', 'muscle-building', 'full-body']
      }
      // Add more metadata for other videos
    };
    
    return metadata[videoId] || metadata['cardio-1'];
  }

  // Session management
  getSessionId() {
    let sessionId = localStorage.getItem('videoSessionId');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('videoSessionId', sessionId);
    }
    return sessionId;
  }

  // Event system
  dispatchEvent(eventName, data) {
    const event = new CustomEvent(`videoPlayer:${eventName}`, {
      detail: data,
      bubbles: true
    });
    window.dispatchEvent(event);
  }

  // Analytics storage
  storeAnalyticsEvent(event) {
    const events = JSON.parse(localStorage.getItem('videoAnalytics') || '[]');
    events.push(event);
    
    // Keep only last 100 events
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }
    
    localStorage.setItem('videoAnalytics', JSON.stringify(events));
  }

  // Mock analytics service
  sendAnalyticsEvent(event) {
    // In a real app, this would send to Google Analytics, Mixpanel, etc.
    console.log('Analytics event:', event);
  }

  // Get analytics summary
  getAnalyticsSummary() {
    return {
      ...this.analytics,
      averageWatchTime: this.analytics.playCount > 0 
        ? this.analytics.totalWatchTime / this.analytics.playCount 
        : 0,
      sessionDuration: Date.now() - this.performance.startTime,
      networkStatus: this.networkStatus,
      qualityLevel: this.performance.qualityLevel
    };
  }

  // Performance metrics
  getPerformanceMetrics() {
    return {
      ...this.performance,
      loadTime: this.performance.loadTime,
      bufferingTime: this.performance.bufferingTime,
      memoryUsage: 'memory' in performance ? performance.memory : null,
      networkInfo: 'connection' in navigator ? navigator.connection : null
    };
  }

  // Video recommendations
  getVideoRecommendations(currentVideoId, limit = 6) {
    const currentMetadata = this.getVideoMetadata(currentVideoId);
    const allVideos = Object.keys(this.getVideoMetadata());
    
    // Simple recommendation algorithm
    const recommendations = allVideos
      .filter(id => id !== currentVideoId)
      .map(id => ({
        id,
        metadata: this.getVideoMetadata(id),
        score: this.calculateRecommendationScore(currentMetadata, this.getVideoMetadata(id))
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => ({
        id: item.id,
        ...item.metadata,
        thumbnail: this.generateThumbnail(item.id)
      }));
    
    return recommendations;
  }

  calculateRecommendationScore(current, candidate) {
    let score = 0;
    
    // Same category bonus
    if (current.category === candidate.category) score += 3;
    
    // Same difficulty bonus
    if (current.difficulty === candidate.difficulty) score += 2;
    
    // Similar duration bonus
    const durationDiff = Math.abs(current.duration - candidate.duration);
    if (durationDiff < 300) score += 1;
    
    // Tag overlap bonus
    const commonTags = current.tags.filter(tag => candidate.tags.includes(tag));
    score += commonTags.length;
    
    return score;
  }

  // Video search
  searchVideos(query, filters = {}) {
    const allVideos = Object.keys(this.getVideoMetadata());
    
    return allVideos
      .map(id => ({
        id,
        metadata: this.getVideoMetadata(id)
      }))
      .filter(video => {
        const { metadata } = video;
        
        // Text search
        const searchText = `${metadata.title} ${metadata.category} ${metadata.tags.join(' ')}`.toLowerCase();
        if (query && !searchText.includes(query.toLowerCase())) {
          return false;
        }
        
        // Category filter
        if (filters.category && metadata.category !== filters.category) {
          return false;
        }
        
        // Difficulty filter
        if (filters.difficulty && metadata.difficulty !== filters.difficulty) {
          return false;
        }
        
        // Duration filter
        if (filters.maxDuration && metadata.duration > filters.maxDuration) {
          return false;
        }
        
        return true;
      })
      .map(video => ({
        id: video.id,
        ...video.metadata,
        thumbnail: this.generateThumbnail(video.id)
      }));
  }

  // Cleanup
  cleanup() {
    this.videoCache.clear();
    localStorage.removeItem('videoSessionId');
  }
}

// Create singleton instance
const videoPlayerService = new VideoPlayerService();

export default videoPlayerService; 