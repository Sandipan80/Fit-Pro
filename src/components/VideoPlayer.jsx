import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTracking } from "../context/TrackingContext";
import { usePaymentSync } from "../context/PaymentSyncContext";

const VideoPlayer = ({ video, onClose, onUpgrade, onLogin }) => {
  const { trackVideoInteraction } = useTracking();
  const { canAccessPremium, hasActiveSubscription } = usePaymentSync();

  // Core video states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem("videoPlayer_volume");
    return saved ? parseFloat(saved) : 1;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // UI states
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showQuality, setShowQuality] = useState(false);
  const [showPreviewOverlay, setShowPreviewOverlay] = useState(false);
  const [previewEnded, setPreviewEnded] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);
  const [showThumbnail, setShowThumbnail] = useState(false);
  const [thumbnailPosition, setThumbnailPosition] = useState(0);
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);

  // Video quality and playback
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState("Auto");
  const [availableQualities] = useState([
    "Auto",
    "1080p",
    "720p",
    "480p",
    "360p",
  ]);
  const [playbackRates] = useState([0.5, 0.75, 1, 1.25, 1.5, 2]);

  // Refs
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const progressRef = useRef(null);
  const volumeSliderRef = useRef(null);
  const settingsRef = useRef(null);
  const lastInteractionRef = useRef(Date.now());
  const bufferingTimeoutRef = useRef(null);
  const qualityCheckRef = useRef(null);

  // Memoized access check for performance
  const hasAccess = useMemo(() => {
    if (!video) return false;
    return !video.requiresPayment || canAccessPremium();
  }, [video, canAccessPremium]);

  // Save volume to localStorage
  useEffect(() => {
    localStorage.setItem("videoPlayer_volume", volume.toString());
  }, [volume]);

  // Optimized video loading with lazy loading
  useEffect(() => {
    if (!videoRef.current || !video?.videoUrl) {
      return;
    }

    console.log("Loading video:", video.videoUrl);
    const videoElement = videoRef.current;

    // Reset states
    setIsLoading(true);
    setCurrentTime(0);
    setDuration(0);
    setPreviewEnded(false);
    setShowPreviewOverlay(false);
    setError(null);
    setIsPlaying(false);
    setBuffering(false);

    // Clear any existing timeouts
    if (bufferingTimeoutRef.current) {
      clearTimeout(bufferingTimeoutRef.current);
    }

    // Set video source with preload optimization
    videoElement.src = video.videoUrl;
    videoElement.preload = hasAccess ? "metadata" : "none";

    // Event handlers with debouncing
    const handleLoadedMetadata = () => {
      console.log("Video metadata loaded, duration:", videoElement.duration);
      setDuration(videoElement.duration);
      setIsLoading(false);

      // Auto-play for accessible videos with user interaction check
      if (hasAccess && Date.now() - lastInteractionRef.current < 5000) {
        videoElement.play().catch((e) => {
          console.log("Auto-play prevented:", e);
        });
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);

      // Check preview duration for premium videos
      if (
        !hasAccess &&
        videoElement.currentTime >= (video?.previewDuration || 180)
      ) {
        setPreviewEnded(true);
        videoElement.pause();
        setIsPlaying(false);
        setShowPreviewOverlay(true);
      }
    };

    const handleEnded = () => {
      console.log("Video ended");
      setIsPlaying(false);
      setCurrentTime(0);
      if (video?.id) {
        trackVideoInteraction(video.id, "completed", { duration });
      }
    };

    const handleError = (error) => {
      console.error("Video error:", error);
      console.error("Video URL:", video.videoUrl);
      console.error("Error details:", videoElement.error);

      let errorMessage = "Video failed to load. Please try again.";

      if (videoElement.error) {
        switch (videoElement.error.code) {
          case 1:
            errorMessage = "Video loading was aborted.";
            break;
          case 2:
            errorMessage = "Network error occurred while loading video.";
            break;
          case 3:
            errorMessage =
              "Video decoding failed. The video format may not be supported.";
            break;
          case 4:
            errorMessage = "Video source not supported.";
            break;
          default:
            errorMessage = `Video error: ${videoElement.error.message}`;
        }
      }

      setIsLoading(false);
      setError(errorMessage);
    };

    const handleCanPlay = () => {
      console.log("Video can play");
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      console.log("Video load started");
      setIsLoading(true);
    };

    const handleLoadedData = () => {
      console.log("Video data loaded");
      setIsLoading(false);
    };

    const handleStalled = () => {
      console.log("Video stalled");
      setBuffering(true);
      // Clear buffering after 3 seconds
      bufferingTimeoutRef.current = setTimeout(() => {
        setBuffering(false);
      }, 3000);
    };

    const handleWaiting = () => {
      console.log("Video waiting for data");
      setBuffering(true);
    };

    const handleCanPlayThrough = () => {
      console.log("Video can play through");
      setBuffering(false);
      if (bufferingTimeoutRef.current) {
        clearTimeout(bufferingTimeoutRef.current);
      }
    };

    const handleVolumeChange = () => {
      setVolume(videoElement.volume);
      setIsMuted(videoElement.muted);
    };

    const handleRateChange = () => {
      setPlaybackRate(videoElement.playbackRate);
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    // Handle picture-in-picture change
    const handlePictureInPictureChange = () => {
      setIsPictureInPicture(!!document.pictureInPictureElement);
    };

    // Add event listeners
    videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    videoElement.addEventListener("ended", handleEnded);
    videoElement.addEventListener("error", handleError);
    videoElement.addEventListener("canplay", handleCanPlay);
    videoElement.addEventListener("loadstart", handleLoadStart);
    videoElement.addEventListener("loadeddata", handleLoadedData);
    videoElement.addEventListener("stalled", handleStalled);
    videoElement.addEventListener("waiting", handleWaiting);
    videoElement.addEventListener("canplaythrough", handleCanPlayThrough);
    videoElement.addEventListener("volumechange", handleVolumeChange);
    videoElement.addEventListener("ratechange", handleRateChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener(
      "pictureinpicturechange",
      handlePictureInPictureChange
    );

    // Load the video
    videoElement.load();

    return () => {
      // Cleanup event listeners
      videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      videoElement.removeEventListener("ended", handleEnded);
      videoElement.removeEventListener("error", handleError);
      videoElement.removeEventListener("canplay", handleCanPlay);
      videoElement.removeEventListener("loadstart", handleLoadStart);
      videoElement.removeEventListener("loadeddata", handleLoadedData);
      videoElement.removeEventListener("stalled", handleStalled);
      videoElement.removeEventListener("waiting", handleWaiting);
      videoElement.removeEventListener("canplaythrough", handleCanPlayThrough);
      videoElement.removeEventListener("volumechange", handleVolumeChange);
      videoElement.removeEventListener("ratechange", handleRateChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "pictureinpicturechange",
        handlePictureInPictureChange
      );

      // Clear timeouts
      if (bufferingTimeoutRef.current) {
        clearTimeout(bufferingTimeoutRef.current);
      }
    };
  }, [
    video?.videoUrl,
    hasAccess,
    video?.id,
    video?.previewDuration,
    trackVideoInteraction,
  ]);

  // Optimized controls auto-hide with interaction tracking
  useEffect(() => {
    if (showControls && isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isPlaying]);

  // Track user interaction
  const trackInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now();
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  }, []);

  // Optimized mouse movement detection
  const handleMouseMove = useCallback(() => {
    trackInteraction();
  }, [trackInteraction]);

  // Optimized play/pause toggle
  const togglePlay = useCallback(() => {
    trackInteraction();

    if (!hasAccess) {
      setShowPreviewOverlay(true);
      return;
    }

    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        if (video?.id) {
          trackVideoInteraction(video.id, "pause", { currentTime });
        }
      } else {
        videoRef.current.play().catch((e) => {
          console.error("Play failed:", e);
          setError("Failed to play video. Please try again.");
        });
        if (video?.id) {
          trackVideoInteraction(video.id, "play", { currentTime });
        }
      }
      setIsPlaying(!isPlaying);
    }
  }, [
    isPlaying,
    hasAccess,
    video?.id,
    currentTime,
    trackVideoInteraction,
    trackInteraction,
  ]);

  // Optimized seek function
  const seekTo = useCallback(
    (time) => {
      if (videoRef.current) {
        videoRef.current.currentTime = Math.max(0, Math.min(time, duration));
        setCurrentTime(videoRef.current.currentTime);
      }
    },
    [duration]
  );

  // Optimized volume control
  const handleVolumeChange = useCallback((newVolume) => {
    if (videoRef.current) {
      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      videoRef.current.volume = clampedVolume;
      setVolume(clampedVolume);
      setIsMuted(clampedVolume === 0);
    }
  }, []);

  // Optimized mute toggle
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Optimized playback rate change
  const changePlaybackRate = useCallback((rate) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  }, []);

  // Quality change with adaptive streaming simulation
  const changeQuality = useCallback((newQuality) => {
    setQuality(newQuality);
    console.log("Quality changed to:", newQuality);
    // In a real implementation, you would change the video source here
    // For now, we'll simulate quality change
  }, []);

  // Optimized fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  // Optimized time formatting
  const formatTime = useCallback((time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  // Optimized progress bar interaction
  const handleProgressClick = useCallback(
    (e) => {
      if (progressRef.current) {
        const rect = progressRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const clickTime = (clickX / width) * duration;
        seekTo(clickTime);
      }
    },
    [duration, seekTo]
  );

  const handleProgressHover = useCallback(
    (e) => {
      if (progressRef.current) {
        const rect = progressRef.current.getBoundingClientRect();
        const hoverX = e.clientX - rect.left;
        const width = rect.width;
        const hoverTimeValue = (hoverX / width) * duration;
        setHoverTime(hoverTimeValue);
        setThumbnailPosition(hoverX);
        setShowThumbnail(true);
      }
    },
    [duration]
  );

  const handleProgressLeave = useCallback(() => {
    setShowThumbnail(false);
  }, []);

  // Optimized keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!showControls) return;

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          seekTo(Math.max(0, currentTime - 10));
          break;
        case "ArrowRight":
          e.preventDefault();
          seekTo(Math.min(duration, currentTime + 10));
          break;
        case "ArrowUp":
          e.preventDefault();
          handleVolumeChange(Math.min(1, volume + 0.1));
          break;
        case "ArrowDown":
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 0.1));
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "Escape":
          if (isFullscreen) {
            toggleFullscreen();
          } else {
            handleClose();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [
    showControls,
    togglePlay,
    currentTime,
    duration,
    seekTo,
    volume,
    handleVolumeChange,
    toggleMute,
    toggleFullscreen,
    isFullscreen,
  ]);

  // Optimized click outside to close settings
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
        setShowQuality(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Optimized close function
  const handleClose = useCallback(
    (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      console.log("Closing video player");

      // Pause video if playing
      if (videoRef.current && isPlaying) {
        videoRef.current.pause();
      }

      // Exit picture-in-picture if active
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture().catch(console.error);
      }

      // Exit fullscreen if active
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(console.error);
      }

      // Reset states
      setIsPlaying(false);
      setCurrentTime(0);
      setShowControls(true);
      setShowSettings(false);
      setShowPreviewOverlay(false);
      setError(null);

      // Call the onClose prop
      if (onClose && typeof onClose === "function") {
        onClose();
      }
    },
    [isPlaying, onClose]
  );

  // Optimized settings toggle
  const handleSettingsToggle = useCallback(
    (e) => {
      e.stopPropagation();
      setShowSettings(!showSettings);
    },
    [showSettings]
  );

  // Optimized settings option click
  const handleSettingsOption = useCallback(
    (action, value) => {
      if (action === "playbackRate") {
        changePlaybackRate(value);
      } else if (action === "quality") {
        changeQuality(value);
      }

      setShowSettings(false);
    },
    [changePlaybackRate, changeQuality]
  );

  // Memoized tooltip component
  const Tooltip = useCallback(
    ({ children, text }) => (
      <span className="relative group">
        {children}
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-black/80 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {text}
        </span>
      </span>
    ),
    []
  );

  // Memoized progress percentage
  const progressPercentage = useMemo(() => {
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  }, [currentTime, duration]);

  // Memoized buffered percentage (simulated)
  const bufferedPercentage = useMemo(() => {
    return Math.min(progressPercentage + 20, 100); // Simulate buffering
  }, [progressPercentage]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full h-full max-w-7xl max-h-[90vh] bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 video-player-container"
          onClick={(e) => e.stopPropagation()}
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setShowControls(false)}
          tabIndex={0}
          aria-label="Video Player"
        >
          {/* Video Element with Enhanced Attributes */}
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            poster={video?.thumbnail}
            onClick={togglePlay}
            onDoubleClick={toggleFullscreen}
            preload="metadata"
            playsInline
            controlsList="nodownload"
            crossOrigin="anonymous"
            aria-label={video?.title || "Video content"}
          >
            Your browser does not support the video tag.
          </video>

          {/* Enhanced Loading Overlay */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-white/20"></div>
                  </div>
                  <p className="text-white text-lg font-medium">
                    Loading video...
                  </p>
                  <p className="text-white/70 text-sm mt-2">{video?.title}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Buffering Indicator */}
          <AnimatePresence>
            {buffering && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/30 flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-white/20"></div>
                  </div>
                  <p className="text-white text-sm font-medium">Buffering...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Error Overlay */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 flex items-center justify-center"
              >
                <div className="text-center text-white max-w-md mx-auto">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-bold mb-2">Video Error</h3>
                  <p className="text-gray-300 mb-6">{error}</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => {
                        setError(null);
                        setIsLoading(true);
                        if (videoRef.current) {
                          videoRef.current.load();
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                    >
                      Retry
                    </button>
                    <button
                      onClick={() => {
                        console.log("Video debug info:", {
                          src: videoRef.current?.src,
                          readyState: videoRef.current?.readyState,
                          networkState: videoRef.current?.networkState,
                          error: videoRef.current?.error,
                        });
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                    >
                      Debug Info
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Premium Preview Overlay */}
          <AnimatePresence>
            {showPreviewOverlay && !hasAccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end"
              >
                <div className="w-full p-8 text-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
                    <div className="text-6xl mb-4">🔒</div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Premium Content
                    </h3>
                    <p className="text-gray-300 mb-6">
                      {previewEnded
                        ? "Preview ended. Upgrade to continue watching!"
                        : `Preview: ${formatTime(video?.previewDuration || 0)} remaining`}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={onUpgrade}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors transform hover:scale-105"
                      >
                        Upgrade Now
                      </button>
                      <button
                        onClick={onLogin}
                        className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                      >
                        Login
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Video Controls */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"
              >
                {/* Top Controls */}
                <div className="absolute top-0 left-0 right-0 p-4 pointer-events-auto">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <h2 className="text-white text-lg font-semibold truncate max-w-md">
                        {video?.title}
                      </h2>
                      {video?.requiresPayment && (
                        <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full premium-badge font-medium">
                          PREMIUM
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Picture-in-Picture Button */}
                      <Tooltip
                        text={
                          isPictureInPicture
                            ? "Exit Picture in Picture"
                            : "Picture in Picture"
                        }
                      >
                        <button
                          onClick={async () => {
                            try {
                              if (
                                videoRef.current &&
                                document.pictureInPictureEnabled
                              ) {
                                if (document.pictureInPictureElement) {
                                  await document.exitPictureInPicture();
                                } else {
                                  await videoRef.current.requestPictureInPicture();
                                }
                              } else {
                                console.log("Picture-in-Picture not supported");
                                // Show a toast or alert to user
                                alert(
                                  "Picture-in-Picture is not supported in your browser"
                                );
                              }
                            } catch (error) {
                              console.error("Picture-in-Picture error:", error);
                              alert("Failed to toggle Picture-in-Picture mode");
                            }
                          }}
                          className={`transition-colors p-2 rounded-lg hover:bg-white/10 ${
                            isPictureInPicture
                              ? "text-purple-400 bg-purple-400/20"
                              : "text-white hover:text-purple-400"
                          }`}
                          aria-label={
                            isPictureInPicture
                              ? "Exit Picture in Picture"
                              : "Picture in Picture"
                          }
                          disabled={!document.pictureInPictureEnabled}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z" />
                          </svg>
                        </button>
                      </Tooltip>

                      {/* Close Button */}
                      <button
                        onClick={(e) => {
                          if (isPictureInPicture) {
                            const confirmClose = window.confirm(
                              "Video is in Picture-in-Picture mode. Close anyway?"
                            );
                            if (!confirmClose) {
                              e.preventDefault();
                              e.stopPropagation();
                              return;
                            }
                          }
                          handleClose(e);
                        }}
                        className="text-white hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/20"
                        aria-label="Close video player"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Center Play Button */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                  <Tooltip text={isPlaying ? "Pause" : "Play"}>
                    <button
                      onClick={togglePlay}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-4 transition-all duration-300 hover:scale-110 transform"
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <svg
                          className="w-12 h-12"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                      ) : (
                        <svg
                          className="w-12 h-12"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                  </Tooltip>
                </div>

                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
                  {/* Enhanced Progress Bar */}
                  <div className="mb-4 flex items-center gap-2">
                    {/* Skip Backward 10s */}
                    <Tooltip text="Back 10s">
                      <button
                        onClick={() => seekTo(Math.max(0, currentTime - 10))}
                        className="video-control-btn text-white hover:text-purple-400 transition-colors p-2 rounded-lg hover:bg-white/10"
                        aria-label="Skip Back 10 seconds"
                        tabIndex={0}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 5v2.21C7.61 7.86 4 11.7 4 16h2c0-3.31 2.69-6 6-6v2l4-3-4-3z" />
                        </svg>
                      </button>
                    </Tooltip>

                    {/* Progress Bar */}
                    <div
                      ref={progressRef}
                      className="relative h-2 bg-white/20 rounded-full cursor-pointer group flex-1 progress-bar"
                      onClick={handleProgressClick}
                      onMouseMove={handleProgressHover}
                      onMouseLeave={handleProgressLeave}
                      aria-label="Seek Bar"
                      tabIndex={0}
                    >
                      {/* Buffered Progress */}
                      <div
                        className="absolute h-full bg-white/40 rounded-full transition-all duration-300"
                        style={{ width: `${bufferedPercentage}%` }}
                      ></div>

                      {/* Played Progress */}
                      <div
                        className="absolute h-full bg-purple-500 rounded-full transition-all duration-100"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>

                      {/* Progress Handle */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-purple-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{
                          left: `${progressPercentage}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      ></div>

                      {/* Hover Time Indicator */}
                      {showThumbnail && (
                        <div
                          className="absolute bottom-6 bg-black/80 text-white text-xs px-2 py-1 rounded"
                          style={{
                            left: thumbnailPosition,
                            transform: "translateX(-50%)",
                          }}
                        >
                          {formatTime(hoverTime)}
                        </div>
                      )}
                    </div>

                    {/* Skip Forward 10s */}
                    <Tooltip text="Forward 10s">
                      <button
                        onClick={() =>
                          seekTo(Math.min(duration, currentTime + 10))
                        }
                        className="video-control-btn text-white hover:text-purple-400 transition-colors p-2 rounded-lg hover:bg-white/10"
                        aria-label="Skip Forward 10 seconds"
                        tabIndex={0}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 5v2.21c4.39 1.65 8 5.49 8 10.79h-2c0-3.31-2.69-6-6-6v2l-4-3 4-3z" />
                        </svg>
                      </button>
                    </Tooltip>
                  </div>

                  {/* Main Controls Row */}
                  <div className="flex items-center justify-between">
                    {/* Left Controls */}
                    <div className="flex items-center gap-2">
                      {/* Play/Pause */}
                      <Tooltip text={isPlaying ? "Pause" : "Play"}>
                        <button
                          onClick={togglePlay}
                          className="video-control-btn text-white hover:text-purple-400 transition-colors p-2 rounded-lg hover:bg-white/10"
                          aria-label={isPlaying ? "Pause" : "Play"}
                        >
                          {isPlaying ? (
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          )}
                        </button>
                      </Tooltip>

                      {/* Volume Control */}
                      <div className="relative group">
                        <Tooltip text={isMuted ? "Unmute" : "Mute"}>
                          <button
                            onClick={toggleMute}
                            className="video-control-btn text-white hover:text-purple-400 transition-colors p-2 rounded-lg hover:bg-white/10"
                            aria-label={isMuted ? "Unmute" : "Mute"}
                          >
                            {isMuted || volume === 0 ? (
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                              </svg>
                            ) : volume < 0.5 ? (
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                              </svg>
                            ) : (
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                              </svg>
                            )}
                          </button>
                        </Tooltip>

                        {/* Volume Slider */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                          <div className="bg-black/80 rounded-lg p-2">
                            <input
                              ref={volumeSliderRef}
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={volume}
                              onChange={(e) =>
                                handleVolumeChange(parseFloat(e.target.value))
                              }
                              className="w-20 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                              style={{
                                background: `linear-gradient(to right, white 0%, white ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%, rgba(255,255,255,0.2) 100%)`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Time Display */}
                      <div className="text-white text-sm font-mono">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-2">
                      {/* Playback Rate */}
                      <div className="relative group">
                        <Tooltip text={`${playbackRate}x`}>
                          <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="video-control-btn text-white hover:text-purple-400 transition-colors p-2 rounded-lg hover:bg-white/10"
                            aria-label="Playback Settings"
                          >
                            <span className="text-xs font-medium">
                              {playbackRate}x
                            </span>
                          </button>
                        </Tooltip>

                        {/* Settings Dropdown */}
                        <AnimatePresence>
                          {showSettings && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-2 min-w-32"
                              ref={settingsRef}
                            >
                              <div className="text-white text-xs font-medium mb-2">
                                Playback Speed
                              </div>
                              {playbackRates.map((rate) => (
                                <button
                                  key={rate}
                                  onClick={() =>
                                    handleSettingsOption("playbackRate", rate)
                                  }
                                  className={`block w-full text-left px-2 py-1 rounded text-sm transition-colors ${
                                    playbackRate === rate
                                      ? "bg-purple-600 text-white"
                                      : "text-white hover:bg-white/10"
                                  }`}
                                >
                                  {rate}x
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Fullscreen */}
                      <Tooltip
                        text={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                      >
                        <button
                          onClick={toggleFullscreen}
                          className="video-control-btn text-white hover:text-purple-400 transition-colors p-2 rounded-lg hover:bg-white/10"
                          aria-label={
                            isFullscreen ? "Exit Fullscreen" : "Fullscreen"
                          }
                        >
                          {isFullscreen ? (
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                            </svg>
                          )}
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Picture-in-Picture Indicator */}
          <AnimatePresence>
            {isPictureInPicture && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium z-10"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z" />
                  </svg>
                  PiP Mode
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoPlayer;
