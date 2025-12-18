import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import videoAccessService from "../services/videoAccessService";

const workouts = [
  {
    id: 1,
    title: "30-Day Yoga Challenge",
    instructor: "Priya Sharma",
    duration: "20-30 min",
    level: "All Levels",
    category: "yoga",
    thumbnail:
      "https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    featured: true,
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    requiresPayment: false,
    accessLevel: "free",
  },
  {
    id: 2,
    title: "HIIT Cardio Blast",
    instructor: "Arjun Patel",
    duration: "45 min",
    level: "Intermediate",
    category: "cardio",
    thumbnail:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    featured: true,
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    requiresPayment: true,
    accessLevel: "premium",
  },
  {
    id: 3,
    title: "Weight Loss Workout",
    instructor: "Anjali Singh",
    duration: "30 min",
    level: "Beginner",
    category: "weight-loss",
    thumbnail:
      "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    featured: true,
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    requiresPayment: false,
    accessLevel: "free",
  },
  {
    id: 4,
    title: "Full Body Strength",
    instructor: "Rahul Verma",
    duration: "50 min",
    level: "Advanced",
    category: "strength",
    thumbnail:
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    featured: true,
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    requiresPayment: true,
    accessLevel: "premium",
  },
  {
    id: 5,
    title: "Morning Stretch Routine",
    instructor: "Meera Reddy",
    duration: "15 min",
    level: "All Levels",
    category: "flexibility",
    thumbnail:
      "https://images.unsplash.com/photo-1566501206188-5dd0cf160a0e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80",
    featured: true,
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    requiresPayment: false,
    accessLevel: "free",
  },
  {
    id: 6,
    title: "Core Workout Challenge",
    instructor: "Vikram Malhotra",
    duration: "25 min",
    level: "Intermediate",
    category: "core",
    thumbnail:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    featured: true,
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    requiresPayment: true,
    accessLevel: "premium",
  },
  {
    id: 7,
    title: "Pilates for Core Strength",
    instructor: "Kavya Iyer",
    duration: "40 min",
    level: "Intermediate",
    category: "pilates",
    thumbnail:
      "https://images.unsplash.com/photo-1518310952931-b1de897abd40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    featured: false,
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    requiresPayment: true,
    accessLevel: "premium",
  },
  {
    id: 8,
    title: "Quick 10-Minute Ab Workout",
    instructor: "Aditya Kapoor",
    duration: "10 min",
    level: "Beginner",
    category: "core",
    thumbnail:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    featured: false,
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    requiresPayment: false,
    accessLevel: "free",
  },
  {
    id: 9,
    title: "Advanced Power Yoga Flow",
    instructor: "Zara Khan",
    duration: "60 min",
    level: "Advanced",
    category: "yoga",
    thumbnail:
      "https://images.unsplash.com/photo-1588286840104-8957b019727f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    featured: false,
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    requiresPayment: true,
    accessLevel: "premium",
  },
  {
    id: 10,
    title: "Senior-Friendly Fitness",
    instructor: "Rajesh Kumar",
    duration: "25 min",
    level: "Beginner",
    category: "senior",
    thumbnail:
      "https://images.unsplash.com/photo-1571019613591-2f9e969b7ee4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    featured: false,
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    requiresPayment: false,
    accessLevel: "free",
  },
  {
    id: 11,
    title: "Kettlebell Total Body",
    instructor: "Jaya Menon",
    duration: "35 min",
    level: "Intermediate",
    category: "strength",
    thumbnail:
      "https://images.unsplash.com/photo-1517963628607-235ccdd5476c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    featured: false,
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    requiresPayment: true,
    accessLevel: "premium",
  },
  {
    id: 12,
    title: "Prenatal Yoga Flow",
    instructor: "Neha Gupta",
    duration: "30 min",
    level: "All Levels",
    category: "prenatal",
    thumbnail:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1520&q=80",
    featured: false,
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    requiresPayment: true,
    accessLevel: "premium",
  },
  {
    id: 13,
    title: "Boxing Cardio",
    instructor: "Amit Shah",
    duration: "45 min",
    level: "Intermediate",
    category: "boxing",
    thumbnail:
      "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    featured: false,
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    requiresPayment: true,
    accessLevel: "premium",
  },
  {
    id: 14,
    title: "Barre Fitness",
    instructor: "Nisha Rao",
    duration: "40 min",
    level: "All Levels",
    category: "barre",
    thumbnail:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    featured: false,
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    requiresPayment: true,
    accessLevel: "premium",
  },
  {
    id: 15,
    title: "Extreme HIIT Challenge",
    instructor: "Mohan Das",
    duration: "30 min",
    level: "Advanced",
    category: "hiit",
    thumbnail:
      "https://images.unsplash.com/photo-1584380931214-dbb5b72e7fd0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1474&q=80",
    featured: false,
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    requiresPayment: true,
    accessLevel: "premium",
  },
  {
    id: 16,
    title: "Dance Cardio Party",
    instructor: "Sonia Mehra",
    duration: "45 min",
    level: "All Levels",
    category: "dance",
    thumbnail:
      "https://images.unsplash.com/photo-1533681904393-9ab6eee7e408?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    featured: false,
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    requiresPayment: true,
    accessLevel: "premium",
  },
];

const FeaturedWorkouts = ({ routing }) => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoadStates, setImageLoadStates] = useState({});
  const sectionRef = useRef(null);

  // Memoized categories
  const categories = useMemo(
    () => [
      {
        id: "all",
        name: "All Workouts",
        count: workouts.filter((w) => w.featured).length,
      },
      {
        id: "yoga",
        name: "Yoga",
        count: workouts.filter((w) => w.category === "yoga" && w.featured)
          .length,
      },
      {
        id: "cardio",
        name: "Cardio",
        count: workouts.filter((w) => w.category === "cardio" && w.featured)
          .length,
      },
      {
        id: "strength",
        name: "Strength",
        count: workouts.filter((w) => w.category === "strength" && w.featured)
          .length,
      },
      {
        id: "core",
        name: "Core",
        count: workouts.filter((w) => w.category === "core" && w.featured)
          .length,
      },
      {
        id: "weight-loss",
        name: "Weight Loss",
        count: workouts.filter(
          (w) => w.category === "weight-loss" && w.featured
        ).length,
      },
      {
        id: "flexibility",
        name: "Flexibility",
        count: workouts.filter(
          (w) => w.category === "flexibility" && w.featured
        ).length,
      },
    ],
    []
  );

  // Memoized filtered workouts
  const filteredWorkouts = useMemo(() => {
    if (activeFilter === "all") return workouts.filter((w) => w.featured);
    return workouts.filter(
      (workout) => workout.category === activeFilter && workout.featured
    );
  }, [activeFilter]);

  // Debug logging
  useEffect(() => {
    console.log("FeaturedWorkouts Debug:", {
      totalWorkouts: workouts.length,
      featuredWorkouts: workouts.filter((w) => w.featured).length,
      activeFilter,
      filteredWorkoutsCount: filteredWorkouts.length,
      featuredWorkoutTitles: workouts
        .filter((w) => w.featured)
        .map((w) => w.title),
    });
  }, [activeFilter, filteredWorkouts.length]);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Memoized navigation handler
  const handleNavigation = useCallback(
    (page) => {
      console.log("Navigation clicked:", page);
      if (routing && routing.navigateTo) {
        routing.navigateTo(page);
      } else {
        window.location.hash = `#${page}`;
      }
    },
    [routing]
  );

  // Memoized video click handler
  const handleVideoClick = useCallback(
    (workout) => {
      console.log("Video clicked:", workout.title);
      try {
        // Check if user can access the video
        const access = videoAccessService.canAccessVideo(workout);

        if (!access.canAccess && access.reason === "upgrade_required") {
          // Navigate to subscription page for premium content
          if (routing && routing.navigateTo) {
            routing.navigateTo("subscription");
          } else {
            window.location.hash = "#subscription";
          }
        } else {
          // Navigate to video page with workout ID
          if (routing && routing.navigateTo) {
            routing.navigateTo("video", { id: workout.id });
          } else {
            window.location.hash = `#video?id=${workout.id}`;
          }
        }
      } catch (error) {
        console.error("Error handling video click:", error);
        // Fallback to video page
        if (routing && routing.navigateTo) {
          routing.navigateTo("video", { id: workout.id });
        } else {
          window.location.hash = `#video?id=${workout.id}`;
        }
      }
    },
    [routing]
  );

  // Memoized filter handler
  const handleFilterChange = useCallback((filter) => {
    console.log("Filter changed to:", filter);
    setActiveFilter(filter);
  }, []);

  // Memoized image load handler
  const handleImageLoad = useCallback((workoutId) => {
    setImageLoadStates((prev) => ({
      ...prev,
      [workoutId]: true,
    }));
  }, []);

  // Simplified workout card component
  const WorkoutCard = useCallback(
    ({ workout, index }) => {
      let access = { canAccess: true, reason: "free_video" };

      try {
        access = videoAccessService.canAccessVideo(workout);
      } catch (error) {
        console.error("Error checking video access:", error);
        access = { canAccess: true, reason: "error_fallback" };
      }

      return (
        <div
          className="group relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 hover:border-purple-300 cursor-pointer"
          onClick={() => handleVideoClick(workout)}
        >
          <div className="aspect-video overflow-hidden bg-gray-200 relative">
            <img
              src={workout.thumbnail}
              alt={workout.title}
              className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
              loading="lazy"
              onLoad={() => handleImageLoad(workout.id)}
            />

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="bg-white/90 text-purple-600 rounded-full p-4 transform transition-all duration-300 group-hover:scale-110 shadow-lg">
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            {/* Category badge */}
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-600/90 text-white">
                {workout.category}
              </span>
            </div>

            {/* Premium badge */}
            {workout.requiresPayment && (
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-600 text-white">
                  PREMIUM
                </span>
              </div>
            )}

            {/* Access status badge */}
            {!access.canAccess && (
              <div className="absolute bottom-3 left-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
                  🔒 LOCKED
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-200">
              {workout.title}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              with{" "}
              <span className="font-medium text-purple-600">
                {workout.instructor}
              </span>
            </p>
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {workout.duration}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                  {workout.level}
                </span>
              </div>
              <div className="text-purple-600">
                {access.canAccess ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    },
    [handleImageLoad, handleVideoClick]
  );

  return (
    <section
      ref={sectionRef}
      id="workouts"
      className="py-16 relative overflow-hidden bg-gradient-to-br from-gray-50 to-white"
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end mb-12">
          <div className="mb-8 lg:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">
              Featured Workouts
            </h2>
            <p className="text-gray-600 max-w-2xl text-lg">
              Discover our most popular workout videos, carefully selected to
              help you achieve your fitness goals.
            </p>
          </div>
          <button
            onClick={() => handleNavigation("featured")}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50 shadow-lg hover:shadow-xl"
          >
            View All Workouts
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleFilterChange(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                activeFilter === category.id
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {category.name}
              <span className="ml-1 text-xs opacity-75">
                ({category.count})
              </span>
            </button>
          ))}
        </div>

        {/* Workouts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkouts.map((workout, index) => (
            <WorkoutCard key={workout.id} workout={workout} index={index} />
          ))}
        </div>

        {/* Empty State */}
        {filteredWorkouts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No workouts found
            </h3>
            <p className="text-gray-500">
              Try selecting a different category to see more workout options.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedWorkouts;
