import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    avatar: "https://randomuser.me/api/portraits/women/11.jpg",
    role: "Lost 30 lbs in 6 months",
    content:
      "These workout videos completely transformed my life. The instructors are motivating and the routines are challenging but achievable. I've never felt better!",
    rating: 5,
    category: "weight-loss",
    verified: true
  },
  {
    id: 2,
    name: "Arjun Patel",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    role: "Yoga enthusiast",
    content:
      "The yoga sessions are fantastic! They've helped me improve my flexibility and reduce stress. I look forward to my practice every morning.",
    rating: 5,
    category: "yoga",
    verified: true
  },
  {
    id: 3,
    name: "Anjali Singh",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    role: "Fitness beginner",
    content:
      "As someone new to fitness, I was intimidated at first, but the beginner videos are perfect. Clear instructions and modifications for all levels.",
    rating: 4,
    category: "beginner",
    verified: true
  },
  {
    id: 4,
    name: "Rahul Verma",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    role: "Strength training",
    content:
      "The strength training programs are incredible. I've gained 15 pounds of muscle and feel stronger than ever. The progressive overload approach really works!",
    rating: 5,
    category: "strength",
    verified: true
  },
  {
    id: 5,
    name: "Meera Reddy",
    avatar: "https://randomuser.me/api/portraits/women/23.jpg",
    role: "Cardio lover",
    content:
      "The HIIT workouts are intense but so effective! I've improved my endurance dramatically and love the variety of cardio options available.",
    rating: 5,
    category: "cardio",
    verified: true
  },
  {
    id: 6,
    name: "Vikram Malhotra",
    avatar: "https://randomuser.me/api/portraits/men/89.jpg",
    role: "Recovery focused",
    content:
      "The recovery and mobility sessions have been a game-changer for my joint health. I can now work out more consistently without pain.",
    rating: 4,
    category: "recovery",
    verified: true
  }
];

const Testimonials = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // Memoized categories
  const categories = useMemo(() => [
    { id: 'all', name: 'All Stories', count: testimonials.length },
    { id: 'weight-loss', name: 'Weight Loss', count: testimonials.filter(t => t.category === 'weight-loss').length },
    { id: 'strength', name: 'Strength', count: testimonials.filter(t => t.category === 'strength').length },
    { id: 'cardio', name: 'Cardio', count: testimonials.filter(t => t.category === 'cardio').length },
    { id: 'yoga', name: 'Yoga', count: testimonials.filter(t => t.category === 'yoga').length },
    { id: 'beginner', name: 'Beginner', count: testimonials.filter(t => t.category === 'beginner').length },
    { id: 'recovery', name: 'Recovery', count: testimonials.filter(t => t.category === 'recovery').length }
  ], []);

  // Memoized filtered testimonials
  const filteredTestimonials = useMemo(() => {
    if (activeCategory === 'all') return testimonials;
    return testimonials.filter(testimonial => testimonial.category === activeCategory);
  }, [activeCategory]);

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

  // Memoized star rendering function
  const renderStars = useCallback((rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400" : "text-gray-600"
        } transition-colors duration-200`}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  }, []);

  // Memoized category filter handler
  const handleCategoryChange = useCallback((category) => {
    setActiveCategory(category);
  }, []);

  // Memoized testimonial card component
  const TestimonialCard = useCallback(({ testimonial, index }) => (
    <div
      className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-700 hover:border-purple-500/50 ${
        isVisible ? 'animate-fadeInUp' : 'opacity-0'
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start space-x-4 mb-4">
        <div className="relative">
          <img
            src={testimonial.avatar}
            alt={testimonial.name}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-purple-500/50"
            loading="lazy"
          />
          {testimonial.verified && (
            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-lg text-white">{testimonial.name}</h3>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
              {testimonial.category}
            </span>
          </div>
          <p className="text-purple-400 text-sm font-medium">{testimonial.role}</p>
        </div>
      </div>

      <blockquote className="text-gray-300 mb-4 italic leading-relaxed">
        "{testimonial.content}"
      </blockquote>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {renderStars(testimonial.rating)}
          <span className="text-sm text-gray-400 ml-2">{testimonial.rating}/5</span>
        </div>
        <div className="text-xs text-gray-500">
          Verified Member
        </div>
      </div>
    </div>
  ), [isVisible, renderStars]);

  return (
    <section 
      ref={sectionRef}
      id="testimonials" 
      className="py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-blue-900/10"></div>
      <div className="absolute top-0 left-0 w-full h-full opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
            Success Stories
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Hear from our community members who have transformed their bodies
            and lives with our workout videos.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                activeCategory === category.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              }`}
              aria-label={`Filter by ${category.name} (${category.count} stories)`}
            >
              {category.name}
              <span className="ml-1 text-xs opacity-75">({category.count})</span>
            </button>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTestimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
          ))}
        </div>

        {/* Empty State */}
        {filteredTestimonials.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No testimonials found</h3>
            <p className="text-gray-400">Try selecting a different category to see more success stories.</p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <button 
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg hover:shadow-xl"
            aria-label="Join our fitness community"
          >
            Join Our Community
          </button>
          <p className="text-gray-400 text-sm mt-4">
            Start your transformation journey today
          </p>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
