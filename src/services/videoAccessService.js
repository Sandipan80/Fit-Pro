import { auth } from '../components/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import paymentService from './paymentService';

class VideoAccessService {
  constructor() {
    this.currentUser = null;
    this.userSubscription = null;
    this.isLoading = true;
    
    // Listen for auth state changes
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      if (user) {
        await this.loadUserSubscription(user.uid);
      } else {
        this.userSubscription = null;
      }
      this.isLoading = false;
    });
  }

  async loadUserSubscription(userId) {
    try {
      this.userSubscription = await paymentService.getUserSubscription(userId);
    } catch (error) {
      console.error('Error loading user subscription:', error);
      this.userSubscription = null;
    }
  }

  // Check if user can access a specific video
  canAccessVideo(video) {
    // If video doesn't require payment, allow access
    if (!video.requiresPayment) {
      return { canAccess: true, reason: 'free_video' };
    }

    // If user is not authenticated, require login
    if (!this.currentUser) {
      return { canAccess: false, reason: 'login_required', message: 'Please log in to access premium videos' };
    }

    // If user has no subscription, require payment
    if (!this.userSubscription) {
      return { canAccess: false, reason: 'subscription_required', message: 'Premium subscription required' };
    }

    // Check if subscription is active
    if (this.userSubscription.subscriptionStatus !== 'active') {
      return { canAccess: false, reason: 'inactive_subscription', message: 'Your subscription is inactive' };
    }

    // Check if subscription level matches video access level
    const subscriptionLevel = this.userSubscription.currentPlan;
    const videoAccessLevel = video.accessLevel;

    if (subscriptionLevel === 'free' && videoAccessLevel === 'premium') {
      return { canAccess: false, reason: 'upgrade_required', message: 'Upgrade to Premium to access this video' };
    }

    // Check if subscription has expired
    if (this.userSubscription.endDate) {
      const endDate = new Date(this.userSubscription.endDate.toDate());
      if (endDate < new Date()) {
        return { canAccess: false, reason: 'expired_subscription', message: 'Your subscription has expired' };
      }
    }

    return { canAccess: true, reason: 'premium_access' };
  }

  // Get preview access for videos
  canPreviewVideo(video) {
    // All videos can be previewed, but with different durations
    return {
      canPreview: true,
      previewDuration: video.previewDuration || 180, // Default 3 minutes
      reason: 'preview_available'
    };
  }

  // Get user's current subscription status
  getUserSubscriptionStatus() {
    return {
      isAuthenticated: !!this.currentUser,
      subscription: this.userSubscription,
      isLoading: this.isLoading
    };
  }

  // Get available videos based on user's subscription
  getAvailableVideos(allVideos) {
    if (!allVideos) return [];

    return allVideos.map(video => {
      const accessCheck = this.canAccessVideo(video);
      const previewCheck = this.canPreviewVideo(video);
      
      return {
        ...video,
        canAccess: accessCheck.canAccess,
        accessReason: accessCheck.reason,
        accessMessage: accessCheck.message,
        canPreview: previewCheck.canPreview,
        previewDuration: previewCheck.previewDuration
      };
    });
  }

  // Get free videos only
  getFreeVideos(allVideos) {
    if (!allVideos) return [];
    return allVideos.filter(video => !video.requiresPayment);
  }

  // Get premium videos only
  getPremiumVideos(allVideos) {
    if (!allVideos) return [];
    return allVideos.filter(video => video.requiresPayment);
  }

  // Get videos user can access
  getAccessibleVideos(allVideos) {
    if (!allVideos) return [];
    return allVideos.filter(video => this.canAccessVideo(video).canAccess);
  }

  // Get upgrade prompt message
  getUpgradeMessage() {
    if (!this.currentUser) {
      return {
        title: 'Join FitProo Premium',
        message: 'Get unlimited access to all workout videos, personalized plans, and exclusive content.',
        action: 'Sign Up Now',
        type: 'login'
      };
    }

    if (!this.userSubscription || this.userSubscription.currentPlan === 'free') {
      return {
        title: 'Upgrade to Premium',
        message: 'Unlock unlimited access to premium workout videos, advanced features, and personalized training plans.',
        action: 'Upgrade Now',
        type: 'upgrade'
      };
    }

    if (this.userSubscription.subscriptionStatus !== 'active') {
      return {
        title: 'Reactivate Your Subscription',
        message: 'Your subscription is currently inactive. Reactivate to continue enjoying premium features.',
        action: 'Reactivate',
        type: 'reactivate'
      };
    }

    return null;
  }

  // Check if user needs to upgrade for a specific video
  needsUpgradeForVideo(video) {
    const accessCheck = this.canAccessVideo(video);
    return !accessCheck.canAccess && accessCheck.reason === 'upgrade_required';
  }

  // Get subscription benefits for upgrade
  getUpgradeBenefits() {
    return {
      features: [
        'Unlimited access to all workout videos',
        'Personalized workout plans',
        'Advanced progress tracking',
        'Nutrition guidance',
        '24/7 AI fitness coach',
        'Premium workout categories',
        'Custom meal plans',
        'No ads',
        'HD video quality',
        'Offline downloads'
      ],
      price: '₹999/month',
      savings: 'Save 50% compared to individual video purchases'
    };
  }
}

// Create singleton instance
const videoAccessService = new VideoAccessService();

export default videoAccessService; 