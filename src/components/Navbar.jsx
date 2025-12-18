import { useState, useEffect, useCallback, useMemo } from "react";

const Navbar = ({ routing }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState("home");

  // Check if user is authenticated
  const isAuthenticated = routing?.isAuthenticated || false;

  // Memoized menu items to prevent unnecessary re-renders
  const menuItems = useMemo(() => [
    { text: "Home", nav: "home", icon: "🏠" },
    { text: "Workouts", nav: "featured", icon: "💪" },
    { text: "Categories", nav: "categories", icon: "📂" },
    { text: "Track Progress", nav: "track", icon: "📊" },
    { text: "About", nav: "about", icon: "ℹ️" },
    { text: "Pricing", nav: "subscription", icon: "💰" },
    { text: "Contact", nav: "contact", icon: "📞" },
  ], []);

  const toolItems = useMemo(() => [
    { text: "BMI Calculator", nav: "bmi-calculator", icon: "🧮" },
    { text: "Body Analysis", nav: "body-analysis", icon: "📈" },
    { text: "Fitness Assistant", nav: "chatbot", icon: "🤖" },
  ], []);

  // Debug authentication state
  useEffect(() => {
    console.log("[Navbar] Authentication state changed:", {
      isAuthenticated,
      routingIsAuthenticated: routing?.isAuthenticated,
      routingObject: routing,
    });
  }, [isAuthenticated, routing?.isAuthenticated]);

  // Update active page based on URL hash
  useEffect(() => {
    const updateActivePage = () => {
      const hash = window.location.hash.replace("#", "") || "home";
      setActivePage(hash);
    };

    // Set initial active page
    updateActivePage();

    // Listen for hash changes
    window.addEventListener("hashchange", updateActivePage);

    return () => {
      window.removeEventListener("hashchange", updateActivePage);
    };
  }, []);

  // Optimized navigation handler with useCallback
  const handleNavigation = useCallback((page, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // If routing context is provided, use it
    if (routing && routing.navigateTo) {
      routing.navigateTo(page);
    }
    // Otherwise, use hash-based navigation for backward compatibility
    else {
      window.location.hash = `#${page}`;
    }
    
    // Close mobile menu if open
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [routing, isMenuOpen]);

  // Optimized mobile menu toggle
  const toggleMobileMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  // Memoized navigation link component for better performance
  const NavigationLink = useCallback(({ item, isActive, className = "", children }) => (
    <a
      href={`#${item.nav}`}
      onClick={(e) => handleNavigation(item.nav, e)}
      className={`transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${className} ${
        isActive
          ? "text-purple-400 font-medium"
          : "hover:text-purple-400 hover:scale-105"
      }`}
      aria-current={isActive ? "page" : undefined}
      role="menuitem"
    >
      {children}
    </a>
  ), [handleNavigation]);

  return (
    <nav className="bg-gray-900 text-white py-4 sticky top-0 z-50 shadow-lg" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <NavigationLink 
            item={{ nav: "home" }} 
            isActive={activePage === "home"}
            className="text-2xl font-bold text-purple-500 hover:text-purple-400 focus:text-purple-400"
          >
            FitPro
          </NavigationLink>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8" role="menubar">
          {menuItems.map((item, index) => (
            <NavigationLink
              key={index}
              item={item}
              isActive={activePage === item.nav}
              className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-800"
            >
              <span className="text-sm">{item.icon}</span>
              {item.text}
            </NavigationLink>
          ))}
          
          {/* Tools Dropdown */}
          <div className="relative group">
            <button 
              className="hover:text-purple-400 transition-all duration-200 flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-haspopup="true"
              aria-expanded="false"
            >
              🛠️ Tools
              <svg
                className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button>
            <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out z-50 border border-gray-200">
              {toolItems.map((item, index) => (
                <NavigationLink
                  key={index}
                  item={item}
                  isActive={activePage === item.nav}
                  className="block px-4 py-2 text-sm hover:bg-gray-100 text-gray-700"
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.text}
                </NavigationLink>
              ))}
            </div>
          </div>
        </div>

        {/* User Actions (Desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <NavigationLink
                item={{ nav: "profile" }}
                isActive={activePage === "profile"}
                className="p-2 rounded-full hover:bg-gray-800 transition-all duration-200"
                aria-label="User Profile"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
              </NavigationLink>
              <NavigationLink
                item={{ nav: "track" }}
                isActive={activePage === "track"}
                className="px-4 py-2 rounded-md transition-all duration-200 bg-purple-600 hover:bg-purple-700 text-white hover:scale-105 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                📊 Track Progress
              </NavigationLink>
            </>
          ) : (
            <>
              <NavigationLink
                item={{ nav: "login" }}
                isActive={activePage === "login"}
                className="text-gray-200 hover:text-white transition-all duration-200"
              >
                Log In
              </NavigationLink>
              <NavigationLink
                item={{ nav: "signup" }}
                isActive={activePage === "signup"}
                className="px-4 py-2 rounded-md transition-all duration-200 bg-purple-600 hover:bg-purple-700 text-white hover:scale-105 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Sign Up
              </NavigationLink>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 p-2 rounded-md hover:bg-gray-800 transition-all duration-200"
          onClick={toggleMobileMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          <svg
            className="w-6 h-6 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div 
          id="mobile-menu"
          className="md:hidden bg-gray-800 py-2 border-t border-gray-700 animate-slideDown"
          role="menu"
        >
          <div className="container mx-auto px-4 flex flex-col space-y-3">
            {menuItems.map((item, index) => (
              <NavigationLink
                key={index}
                item={item}
                isActive={activePage === item.nav}
                className="block py-3 px-4 rounded-md hover:bg-gray-700 transition-all duration-200"
              >
                <span className="mr-3">{item.icon}</span>
                {item.text}
              </NavigationLink>
            ))}
            
            <div className="py-2">
              <div className="font-medium text-gray-400 mb-2 px-4">🛠️ Tools</div>
              {toolItems.map((item, index) => (
                <NavigationLink
                  key={index}
                  item={item}
                  isActive={activePage === item.nav}
                  className="block py-2 pl-8 pr-4 rounded-md hover:bg-gray-700 transition-all duration-200"
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.text}
                </NavigationLink>
              ))}
            </div>
            
            <hr className="border-gray-700" />
            
            <NavigationLink
              item={{ nav: "profile" }}
              isActive={activePage === "profile"}
              className="block py-3 px-4 rounded-md hover:bg-gray-700 transition-all duration-200"
            >
              👤 My Profile
            </NavigationLink>
            
            <NavigationLink
              item={{ nav: "video" }}
              isActive={activePage === "video"}
              className="block py-3 px-4 rounded-md hover:bg-gray-700 transition-all duration-200"
            >
              🎥 Sample Video
            </NavigationLink>
            
            <div className="flex flex-col space-y-2 mt-2">
              {isAuthenticated ? (
                <NavigationLink
                  item={{ nav: "track" }}
                  isActive={activePage === "track"}
                  className="block py-3 text-center text-white rounded-md transition-all duration-200 bg-purple-600 hover:bg-purple-700 hover:scale-105"
                >
                  📊 Track Progress
                </NavigationLink>
              ) : (
                <>
                  <NavigationLink
                    item={{ nav: "login" }}
                    isActive={activePage === "login"}
                    className="block py-3 text-center text-white rounded-md transition-all duration-200 bg-gray-700 hover:bg-gray-600 hover:scale-105"
                  >
                    Log In
                  </NavigationLink>
                  <NavigationLink
                    item={{ nav: "signup" }}
                    isActive={activePage === "signup"}
                    className="block py-3 text-center text-white rounded-md transition-all duration-200 bg-purple-600 hover:bg-purple-700 hover:scale-105"
                  >
                    Sign Up
                  </NavigationLink>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
