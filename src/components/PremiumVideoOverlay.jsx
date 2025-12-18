import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePaymentSync } from '../context/PaymentSyncContext';

const PremiumVideoOverlay = ({ video, onUpgrade, onLogin, onClose, isVisible = false, onRefresh }) => {
  const [showDetails, setShowDetails] = useState(false);
  const { canAccessPremium, hasActiveSubscription, getCurrentPlan } = usePaymentSync();
  
  // Check if user actually has access now
  const hasAccess = video?.accessLevel === 'free' || canAccessPremium();
  const isPremiumUser = hasActiveSubscription();

  const handleUpgrade = () => {
    if (isPremiumUser) {
      // User already has premium, try to refresh access
      onRefresh?.();
    } else {
      // User needs to upgrade
      onUpgrade?.();
    }
  };

  const handleRefresh = () => {
    onRefresh?.();
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Don't render if not visible or video is null
  if (!isVisible || !video) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative h-48 bg-gradient-to-br from-purple-600 to-blue-600">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">🔒</div>
                <h2 className="text-2xl font-bold mb-2">
                  {isPremiumUser ? 'Access Issue' : 'Premium Video'}
                </h2>
                <p className="text-purple-100">
                  {isPremiumUser ? 'Refresh your access' : 'Unlock exclusive content'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Video Info */}
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={video?.thumbnail}
                  alt={video?.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-1">{video?.title}</h3>
                <p className="text-sm text-gray-600 mb-2">with {video?.instructor}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>{video?.duration}</span>
                  <span>•</span>
                  <span>{video?.level}</span>
                  <span>•</span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">Premium</span>
                </div>
              </div>
            </div>

            {/* Status Info */}
            {isPremiumUser && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-1">Premium Access Detected</h4>
                    <p className="text-sm text-blue-600">
                      You have a {getCurrentPlan()} subscription. Try refreshing your access.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      ✓
                    </div>
                    <div className="text-xs text-blue-500">Premium</div>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Info */}
            <div className="bg-purple-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-purple-800 mb-1">Preview Available</h4>
                  <p className="text-sm text-purple-600">
                    Watch first {formatDuration(video?.previewDuration || 180)} for free
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatDuration(video?.previewDuration || 180)}
                  </div>
                  <div className="text-xs text-purple-500">preview</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {isPremiumUser ? (
                <>
                  <button
                    onClick={handleRefresh}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
                  >
                    🔄 Refresh Access
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleUpgrade}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                  >
                    Upgrade Now
                  </button>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {showDetails ? 'Hide Details' : 'View Details'}
                  </button>
                </>
              )}
            </div>

            {/* Additional Details */}
            <AnimatePresence>
              {showDetails && !isPremiumUser && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 pt-4 border-t border-gray-200"
                >
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>• Access to all premium workout videos</p>
                    <p>• Personalized workout plans based on your goals</p>
                    <p>• Advanced progress tracking and analytics</p>
                    <p>• Nutrition guidance and meal planning</p>
                    <p>• 24/7 AI fitness coach support</p>
                    <p>• HD video quality and offline downloads</p>
                    <p>• No advertisements</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PremiumVideoOverlay; 