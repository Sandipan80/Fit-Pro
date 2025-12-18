import { useEffect, useState } from "react";
import { auth } from "./components/firebase";
import { onAuthStateChanged } from "firebase/auth";
import HomePage from "./pages/HomePage";
import FeaturedVideosPage from "./pages/FeaturedVideosPage";
import SingleVideoPage from "./pages/SingleVideoPage";
import UserProfilePage from "./pages/UserProfilePage";
import SubscriptionPage from "./pages/SubscriptionPage";
import ContactPage from "./pages/ContactPage";
import CategoriesPage from "./pages/CategoriesPage";
import WorkoutsPage from "./pages/WorkoutsPage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import BMICalculatorPage from "./pages/BMICalculatorPage";
import ChatbotPage from "./pages/ChatbotPage";
import TrackProgressPage from "./pages/TrackProgressPage";
import NutritionPage from "./pages/NutritionPage";
import ProteinTrackerPage from "./pages/ProteinTrackerPage";
import WorkoutAnalyticsPage from "./pages/WorkoutAnalyticsPage";
import BodyAnalysisPage from "./pages/BodyAnalysisPage";
import ChatButton from "./components/ChatButton";
import NotFoundPage from "./pages/NotFoundPage";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";
import KeyboardNavigation from "./components/KeyboardNavigation";
import QuickSearch from "./components/QuickSearch";
import { TrackingProvider } from "./context/TrackingContext";
import { PaymentSyncProvider } from "./context/PaymentSyncContext";
import { trackPageView } from "./services/trackingService";

// Add a global hashchange logger for debugging
window.addEventListener("hashchange", () => {
  console.log("[GLOBAL HASHCHANGE]", window.location.hash, new Error().stack);
});

// Define all available routes and their corresponding components
const routes = {
  home: { component: HomePage, title: "Home", requiresAuth: false },
  featured: {
    component: FeaturedVideosPage,
    title: "Featured Workouts",
    requiresAuth: false,
  },
  workoutsPage: {
    component: WorkoutsPage,
    title: "Workouts",
    requiresAuth: false,
  },
  video: {
    component: SingleVideoPage,
    title: "Workout Video",
    requiresAuth: false,
  },
  singleVideo: {
    component: SingleVideoPage,
    title: "Workout Video",
    requiresAuth: false,
  },
  profile: {
    component: UserProfilePage,
    title: "User Profile",
    requiresAuth: true,
  },
  subscription: {
    component: SubscriptionPage,
    title: "Subscription Plans",
    requiresAuth: false,
  },
  contact: { component: ContactPage, title: "Contact Us", requiresAuth: false },
  categories: {
    component: CategoriesPage,
    title: "Workout Categories",
    requiresAuth: false,
  },
  about: { component: AboutPage, title: "About Us", requiresAuth: false },
  login: { component: LoginPage, title: "Login", requiresAuth: false },
  signup: { component: SignupPage, title: "Sign Up", requiresAuth: false },
  "bmi-calculator": {
    component: BMICalculatorPage,
    title: "BMI Calculator",
    requiresAuth: false,
  },
  chatbot: {
    component: ChatbotPage,
    title: "Fitness Assistant",
    requiresAuth: false,
  },
  track: {
    component: TrackProgressPage,
    title: "Track Progress",
    requiresAuth: true,
  },
  nutrition: {
    component: NutritionPage,
    title: "Nutrition Tracker",
    requiresAuth: true,
  },
  protein: {
    component: ProteinTrackerPage,
    title: "Protein Tracker",
    requiresAuth: true,
  },
  analytics: {
    component: WorkoutAnalyticsPage,
    title: "Workout Analytics",
    requiresAuth: true,
  },
  "body-analysis": {
    component: BodyAnalysisPage,
    title: "Body Analysis",
    requiresAuth: false,
  },
};

function App() {
  // Get initial page from URL hash or default to home
  const getInitialPage = () => {
    const fullHash = window.location.hash.replace("#", "");
    const [hash, paramsString] = fullHash.split("?");
    
    // Check if the hash is a valid route
    if (routes[hash]) {
      return hash;
    }
    // Special handling for protein route
    if (hash === "protein" || hash === "protein-tracker") {
      return "protein";
    }
    // If no hash or invalid hash, default to home
    return "home";
  };

  const [currentPage, setCurrentPage] = useState(null);
  const [pageParams, setPageParams] = useState({});
  const [pageHistory, setPageHistory] = useState([getInitialPage()]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [intendedDestination, setIntendedDestination] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [initialPageSet, setInitialPageSet] = useState(false);
  const [originalHash, setOriginalHash] = useState(window.location.hash);
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [pageError, setPageError] = useState(null);

  // Navigation function that can be used programmatically
  const navigateTo = (page, params = {}, addToHistory = true) => {
    if (routes[page]) {
      const route = routes[page];

      // Check if page requires authentication
      if (route.requiresAuth && !isAuthenticated) {
        setIntendedDestination(page);
        window.location.hash = "#login";
        setCurrentPage("login");
        return;
      }

      // Encode parameters in the hash for persistence
      const paramsString = Object.keys(params).length > 0 ? `?${new URLSearchParams(params).toString()}` : '';
      const hash = `#${page}${paramsString}`;
      
      // Always update the hash to match the page
      window.location.hash = hash;
      setCurrentPage(page);
      setPageParams(params);
      setPageError(null);

      if (addToHistory) {
        setPageHistory((prev) => [...prev, page]);
      }

      window.scrollTo(0, 0);
      document.title = `FitPro - ${route.title}`;

      // Save the page to localStorage for refresh recovery
      localStorage.setItem("lastVisitedPage", page);
      if (Object.keys(params).length > 0) {
        localStorage.setItem("lastPageParams", JSON.stringify(params));
      }

      // Track page view
      try {
        trackPageView(page, { params });
      } catch (error) {
        console.warn("Failed to track page view:", error);
      }
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const wasAuthenticated = isAuthenticated;
      const isNowAuthenticated = !!user;

      setIsAuthenticated(isNowAuthenticated);
      setIsLoading(false);
      setAuthLoaded(true);

      // Initialize sync service when user logs in
      if (!wasAuthenticated && isNowAuthenticated && user) {
        try {
          // Import syncService dynamically to avoid circular dependencies
          const { default: syncService } = await import("./utils/syncService");
          if (syncService && typeof syncService.initialize === "function") {
            await syncService.initialize();
          }
        } catch (error) {
          console.warn("Failed to initialize sync service:", error);
        }
      }

      // If user just logged in and there's an intended destination, redirect there
      if (!wasAuthenticated && isNowAuthenticated && intendedDestination) {
        navigateTo(intendedDestination);
        setIntendedDestination(null);
      }
      // If user just logged in and is on login/signup page, redirect to home
      else if (!wasAuthenticated && isNowAuthenticated) {
        const currentHash = window.location.hash.replace("#", "");
        if (currentHash === "login" || currentHash === "signup") {
          navigateTo("home");
        }
      }
    });
    return () => unsubscribe();
  }, [isAuthenticated, intendedDestination]);

  // Initialize page on auth load
  useEffect(() => {
    if (authLoaded && !initialPageSet) {
      const fullHash = window.location.hash.replace("#", "");
      const [hash, paramsString] = fullHash.split("?");
      const savedPage = localStorage.getItem("lastVisitedPage");
      let pageToSet;

      // Parse parameters from URL if available
      let urlParams = {};
      if (paramsString) {
        try {
          urlParams = Object.fromEntries(new URLSearchParams(paramsString));
        } catch (error) {
          console.warn("Failed to parse URL parameters:", error);
        }
      }

      // If we have a saved page and the current hash doesn't match a valid route
      if (
        savedPage &&
        !routes[hash] &&
        hash !== "protein" &&
        hash !== "protein-tracker"
      ) {
        pageToSet = savedPage;
        // Update the hash to match the saved page
        window.location.hash = `#${savedPage}`;
      } else {
        // Use the hash or default to home
        pageToSet = getInitialPage();
      }

      // Restore parameters from localStorage if available, or use URL parameters
      const savedParams = localStorage.getItem("lastPageParams");
      if (Object.keys(urlParams).length > 0) {
        setPageParams(urlParams);
        localStorage.setItem("lastPageParams", JSON.stringify(urlParams));
      } else if (savedParams) {
        try {
          const params = JSON.parse(savedParams);
          setPageParams(params);
        } catch (error) {
          console.warn("Failed to restore page parameters:", error);
        }
      }

      setCurrentPage(pageToSet);
      setInitialPageSet(true);
    }
  }, [authLoaded, initialPageSet]);

  // Handle hash changes
  useEffect(() => {
    const handleHashChange = () => {
      if (isLoading || !authLoaded || !initialPageSet) {
        return;
      }

      const fullHash = window.location.hash;
      const [pageHash, paramsString] = fullHash.replace("#", "").split("?");
      
      // Parse parameters from URL
      let params = {};
      if (paramsString) {
        try {
          params = Object.fromEntries(new URLSearchParams(paramsString));
        } catch (error) {
          console.warn("Failed to parse URL parameters:", error);
        }
      }

      if (routes[pageHash]) {
        setCurrentPage(pageHash);
        setPageParams(params);
        localStorage.setItem("lastVisitedPage", pageHash);
        if (Object.keys(params).length > 0) {
          localStorage.setItem("lastPageParams", JSON.stringify(params));
        }
      } else if (pageHash === "protein" || pageHash === "protein-tracker") {
        setCurrentPage("protein");
        setPageParams(params);
        localStorage.setItem("lastVisitedPage", "protein");
      } else if (pageHash === "") {
        setCurrentPage("home");
        setPageParams({});
        localStorage.setItem("lastVisitedPage", "home");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [isLoading, authLoaded, initialPageSet]);

  // Listen for data-nav clicks for backward compatibility
  useEffect(() => {
    const handleNavigation = (e) => {
      const navTarget = e.target.getAttribute("data-nav");
      const paramData = e.target.getAttribute("data-params");

      if (!navTarget) return;

      // Prevent default if it's a link
      if (e.target.tagName === "A") {
        e.preventDefault();
      }

      // Parse optional parameters if provided
      const params = paramData ? JSON.parse(paramData) : {};

      navigateTo(navTarget, params);
    };

    document.addEventListener("click", handleNavigation);

    return () => {
      document.removeEventListener("click", handleNavigation);
    };
  }, []);

  // Handle back navigation
  const goBack = () => {
    if (pageHistory.length > 1) {
      // Remove current page from history
      const newHistory = [...pageHistory];
      newHistory.pop();

      // Get previous page
      const previousPage = newHistory[newHistory.length - 1];

      // Update URL without triggering another hashchange
      window.location.hash = `#${previousPage}`;

      // Update state
      setCurrentPage(previousPage);
      setPageHistory(newHistory);

      // Update document title
      if (routes[previousPage]) {
        document.title = `FitPro - ${routes[previousPage].title}`;
      }
    }
  };

  // Handle page errors
  const handlePageError = (error) => {
    console.error("Page error:", error);
    setPageError(error);
  };

  // Render the appropriate component based on currentPage
  const renderPage = () => {
    if (isLoading || !currentPage) {
      return <LoadingSpinner fullScreen text="Loading FitPro..." />;
    }

    if (pageError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Page Error</h2>
            <p className="text-gray-600 mb-4">
              There was an error loading this page. Please try again.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setPageError(null);
                  window.location.reload();
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={() => {
                  setPageError(null);
                  navigateTo("home");
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Create the routing context to pass to pages
    const routingContext = {
      currentPage,
      navigateTo,
      goBack,
      params: pageParams,
      isAuthenticated,
      isLoading,
    };

    // Render the component with routing context
    const PageComponent = routes[currentPage]?.component || NotFoundPage;

    return (
      <ErrorBoundary routing={routingContext} onError={handlePageError}>
        <PageComponent routing={routingContext} />
      </ErrorBoundary>
    );
  };

  return (
    <TrackingProvider>
      <PaymentSyncProvider>
        <div>
          <KeyboardNavigation
            routing={{ navigateTo, goBack }}
            onQuickSearch={() => setQuickSearchOpen(true)}
          />
          <QuickSearch
            routing={{ navigateTo }}
            isOpen={quickSearchOpen}
            onClose={() => setQuickSearchOpen(false)}
          />
          {renderPage()}
          <ChatButton />
        </div>
      </PaymentSyncProvider>
    </TrackingProvider>
  );
}

export default App;
