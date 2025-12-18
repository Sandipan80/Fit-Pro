import { useCallback, useMemo } from "react";

const Pricing = ({ routing }) => {
  // Memoized pricing plans for better performance
  const pricingPlans = useMemo(() => [
    {
      name: "Free",
      price: "0",
      billing: "forever",
      features: [
        "Access to 10+ workout videos",
        "Basic progress tracking",
        "Mobile access",
        "SD video quality",
      ],
      cta: "Start Free",
      popular: false,
      color: "gray",
      icon: "🎯"
    },
    {
      name: "Premium",
      price: "999",
      billing: "per month",
      features: [
        "Unlimited access to all videos",
        "Custom workout plans",
        "Advanced progress tracking",
        "HD video quality",
        "Offline downloads",
        "No ads",
      ],
      cta: "Start 7-Day Free Trial",
      popular: true,
      color: "purple",
      icon: "⭐"
    },
    {
      name: "Family",
      price: "1499",
      billing: "per month",
      features: [
        "Everything in Premium",
        "Up to 5 profiles",
        "Family progress tracking",
        "Shared achievements",
        "Priority support",
      ],
      cta: "Start 7-Day Free Trial",
      popular: false,
      color: "blue",
      icon: "👨‍👩‍👧‍👦"
    },
  ], []);

  // Optimized navigation handler with useCallback
  const handleNavigation = useCallback((page) => {
    if (routing && routing.navigateTo) {
      routing.navigateTo(page);
    } else {
      window.location.hash = `#${page}`;
    }
  }, [routing]);

  // Memoized plan card component for better performance
  const PlanCard = useCallback(({ plan, index }) => (
    <div
      className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:scale-105 card-hover ${
        plan.popular
          ? "ring-2 ring-purple-500 transform scale-105 md:scale-110 relative"
          : ""
      }`}
      role="article"
      aria-label={`${plan.name} pricing plan`}
    >
      {plan.popular && (
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-center py-2 font-medium">
          ⭐ Most Popular
        </div>
      )}

      <div className="p-8">
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-2">{plan.icon}</span>
          <h3 className="text-2xl font-bold">{plan.name}</h3>
        </div>
        
        <div className="mb-6">
          <span className="text-4xl font-bold text-gray-900">₹{plan.price}</span>
          <span className="text-gray-500"> / {plan.billing}</span>
        </div>

        <ul className="space-y-3 mb-8" role="list">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start">
              <svg
                className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={() => handleNavigation("subscription")}
          className={`w-full py-3 px-4 rounded-lg font-bold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 ${
            plan.popular
              ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white focus:ring-purple-500 hover:scale-105 active:scale-95"
              : "bg-gray-100 hover:bg-gray-200 text-gray-800 focus:ring-gray-500 hover:scale-105 active:scale-95"
          }`}
          aria-label={`Subscribe to ${plan.name} plan`}
        >
          {plan.cta}
        </button>
      </div>
    </div>
  ), [handleNavigation]);

  return (
    <section id="pricing" className="py-16 bg-gradient-to-br from-gray-50 to-gray-100" role="region" aria-label="Pricing plans">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Choose the plan that fits your fitness goals. All plans include
            access to our mobile app and new videos every week.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto" role="list" aria-label="Available pricing plans">
          {pricingPlans.map((plan, index) => (
            <PlanCard key={index} plan={plan} index={index} />
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 text-lg">
            All plans come with a 100% satisfaction guarantee. Cancel anytime.
          </p>
          <div className="mt-4 flex justify-center space-x-6">
            <button
              onClick={() => handleNavigation("contact")}
              className="text-purple-600 hover:text-purple-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded"
              aria-label="Contact us for pricing questions"
            >
              Need help choosing?
            </button>
            <button
              onClick={() => handleNavigation("about")}
              className="text-gray-600 hover:text-gray-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded"
              aria-label="Learn more about our plans"
            >
              Learn more
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
