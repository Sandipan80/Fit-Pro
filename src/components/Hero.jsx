import { useTracking } from "../context/TrackingContext";
import { useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";

const Hero = ({ routing }) => {
  const { trackButtonClick } = useTracking();

  // Check if user is authenticated
  const isAuthenticated = routing?.isAuthenticated || false;

  // Debug authentication state
  useEffect(() => {
    console.log("[Hero] Authentication state changed:", {
      isAuthenticated,
      routingIsAuthenticated: routing?.isAuthenticated,
      routingObject: routing,
    });
  }, [isAuthenticated, routing?.isAuthenticated]);

  // Optimized navigation handler with useCallback
  const handleNavigation = useCallback((page) => {
    // Track the button click before navigation
    trackButtonClick(`hero_${page}_button`, {
      destination: page,
      section: "hero",
    });

    if (routing && routing.navigateTo) {
      routing.navigateTo(page);
    } else {
      window.location.hash = `#${page}`;
    }
  }, [trackButtonClick, routing]);

  // Memoized animation variants for better performance
  const animationVariants = useMemo(() => ({
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          duration: 0.8,
          staggerChildren: 0.2,
          delayChildren: 0.3
        }
      }
    },
    item: {
      hidden: { opacity: 0, y: 30 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.8,
          ease: [0.6, -0.05, 0.01, 0.99]
        }
      }
    },
    button: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.6,
          ease: "easeOut"
        }
      },
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
    },
    floating: {
      animate: {
        y: [-10, 10, -10],
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    }
  }), []);

  // Memoized button configurations
  const buttonConfigs = useMemo(() => ({
    primary: {
      className: "group relative bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 px-10 rounded-xl text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 overflow-hidden focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-gray-900",
      hoverGradient: "from-purple-700 to-indigo-700"
    },
    secondary: {
      className: "group relative bg-white/10 backdrop-blur-sm text-white font-bold py-4 px-10 rounded-xl text-lg border border-white/20 hover:bg-white/20 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-gray-900",
      hoverBg: "bg-white/5"
    },
    success: {
      className: "group relative bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 px-10 rounded-xl text-lg shadow-2xl hover:shadow-green-500/25 transition-all duration-300 overflow-hidden focus:outline-none focus:ring-4 focus:ring-green-500/50 focus:ring-offset-2 focus:ring-offset-gray-900",
      hoverGradient: "from-green-700 to-emerald-700"
    }
  }), []);

  // Memoized stats data
  const statsData = useMemo(() => [
    { number: "500+", label: "Workout Videos", color: "text-purple-400" },
    { number: "50K+", label: "Active Users", color: "text-indigo-400" },
    { number: "24/7", label: "Support", color: "text-pink-400" }
  ], []);

  // Memoized floating particles
  const floatingParticles = useMemo(() => [
    { className: "absolute top-20 left-20 w-4 h-4 bg-purple-400 rounded-full opacity-60", delay: 0 },
    { className: "absolute top-40 right-32 w-6 h-6 bg-indigo-400 rounded-full opacity-40", delay: 1 },
    { className: "absolute bottom-32 left-1/4 w-3 h-3 bg-pink-400 rounded-full opacity-50", delay: 2 }
  ], []);

  return (
    <section
      id="home"
      className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white py-20 md:py-32 overflow-hidden min-h-screen flex items-center"
      role="banner"
      aria-label="Hero section"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-purple-900/40 to-indigo-900/60 z-10"></div>
        
        {/* Background image with parallax effect */}
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <img
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Workout background"
            className="w-full h-full object-cover"
            loading="eager"
          />
        </motion.div>

        {/* Floating particles */}
        {floatingParticles.map((particle, index) => (
          <motion.div
            key={index}
            className={particle.className}
            variants={animationVariants.floating}
            animate="animate"
            style={{ animationDelay: `${particle.delay}s` }}
            aria-hidden="true"
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-20">
        <motion.div
          className="max-w-4xl"
          variants={animationVariants.container}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            variants={animationVariants.item}
          >
            Transform Your Body,{" "}
            <motion.span 
              className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent"
              variants={animationVariants.floating}
              animate="animate"
            >
              Transform Your Life
            </motion.span>
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl mb-10 text-gray-200 leading-relaxed"
            variants={animationVariants.item}
          >
            Discover hundreds of workout videos for all fitness levels. From
            yoga and HIIT to weight loss and beginner-friendly routines.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-6 mb-12"
            variants={animationVariants.item}
          >
            {!isAuthenticated ? (
              <>
                <motion.button
                  onClick={() => handleNavigation("signup")}
                  className={buttonConfigs.primary.className}
                  variants={animationVariants.button}
                  whileHover="hover"
                  whileTap="tap"
                  aria-label="Start your fitness journey by signing up"
                >
                  <span className="relative z-10">🚀 Start Your Journey</span>
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${buttonConfigs.primary.hoverGradient}`}
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
                
                <motion.button
                  onClick={() => handleNavigation("featured")}
                  className={buttonConfigs.secondary.className}
                  variants={animationVariants.button}
                  whileHover="hover"
                  whileTap="tap"
                  aria-label="Browse available workout videos"
                >
                  <span className="relative z-10">💪 Browse Workouts</span>
                  <motion.div
                    className={`absolute inset-0 ${buttonConfigs.secondary.hoverBg} rounded-xl`}
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  onClick={() => handleNavigation("track")}
                  className={buttonConfigs.success.className}
                  variants={animationVariants.button}
                  whileHover="hover"
                  whileTap="tap"
                  aria-label="Track your fitness progress"
                >
                  <span className="relative z-10">📊 Track Your Progress</span>
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${buttonConfigs.success.hoverGradient}`}
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
                
                <motion.button
                  onClick={() => handleNavigation("featured")}
                  className={buttonConfigs.secondary.className}
                  variants={animationVariants.button}
                  whileHover="hover"
                  whileTap="tap"
                  aria-label="Browse available workout videos"
                >
                  <span className="relative z-10">💪 Browse Workouts</span>
                  <motion.div
                    className={`absolute inset-0 ${buttonConfigs.secondary.hoverBg} rounded-xl`}
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              </>
            )}
          </motion.div>

          <motion.div 
            className="flex items-center gap-6"
            variants={animationVariants.item}
          >
            <div className="flex items-center gap-3">
              <motion.div 
                className="flex -space-x-2"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                aria-label="User avatars"
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 border-2 border-white shadow-lg"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.2, zIndex: 10 }}
                    aria-hidden="true"
                  />
                ))}
              </motion.div>
              <motion.p 
                className="text-lg font-medium text-gray-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                Join 50,000+ fitness enthusiasts
              </motion.p>
            </div>
          </motion.div>

          {/* Stats section */}
          <motion.div 
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={animationVariants.item}
          >
            {statsData.map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 card-hover"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.2 }}
                role="region"
                aria-label={`${stat.label} statistics`}
              >
                <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.number}</div>
                <div className="text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
