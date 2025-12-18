import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const AboutPage = ({ routing }) => {
  // Check if user is authenticated
  const isAuthenticated = routing?.isAuthenticated || false;

  // Handle navigation with routing context
  const handleNavigation = (page) => {
    if (routing && routing.navigateTo) {
      routing.navigateTo(page);
    } else {
      window.location.hash = `#${page}`;
    }
  };

  const teamMembers = [
    {
      name: "Sarah Johnson",
      position: "Founder & CEO",
      bio: "Former professional athlete with a passion for making fitness accessible to everyone.",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    },
    {
      name: "Michael Chen",
      position: "Head of Content",
      bio: "Certified personal trainer with 10+ years of experience creating effective workout programs.",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    },
    {
      name: "Alicia Rodriguez",
      position: "Lead Fitness Instructor",
      bio: "Specializes in HIIT, yoga, and strength training with a focus on proper form and technique.",
      image:
        "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    },
    {
      name: "David Kim",
      position: "Chief Technology Officer",
      bio: "Tech enthusiast building innovative solutions to make your fitness journey seamless.",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    },
    {
      name: "Emma Wilson",
      position: "Nutrition Specialist",
      bio: "Registered dietitian helping members achieve their goals through balanced nutrition.",
      image:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    },
    {
      name: "James Taylor",
      position: "Head of User Experience",
      bio: "Dedicated to creating an engaging platform that keeps you motivated and coming back.",
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    },
  ];

  const milestones = [
    {
      year: "2018",
      title: "The Beginning",
      description:
        "FitHub began as a small collection of workout videos filmed in a single studio.",
    },
    {
      year: "2019",
      title: "Growing Community",
      description:
        "Reached our first 10,000 members and expanded our content to include 15 instructors.",
    },
    {
      year: "2020",
      title: "Digital Expansion",
      description:
        "Launched our mobile app and began offering live classes during the global pandemic.",
    },
    {
      year: "2021",
      title: "New Features",
      description:
        "Introduced nutrition guidance, workout plans, and progress tracking tools.",
    },
    {
      year: "2022",
      title: "Global Reach",
      description:
        "Expanded to serve members in over 50 countries with content in multiple languages.",
    },
    {
      year: "2023",
      title: "Today",
      description:
        "Over 1 million members and 1,000+ workouts across all fitness levels and categories.",
    },
  ];

  const values = [
    {
      title: "Accessibility",
      description:
        "We believe fitness should be accessible to everyone, regardless of their background or current fitness level.",
      icon: (
        <svg
          className="w-8 h-8 text-purple-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          ></path>
        </svg>
      ),
    },
    {
      title: "Community",
      description:
        "We foster a supportive community where members encourage each other to achieve their fitness goals.",
      icon: (
        <svg
          className="w-8 h-8 text-purple-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          ></path>
        </svg>
      ),
    },
    {
      title: "Excellence",
      description:
        "We are committed to providing the highest quality content and user experience possible.",
      icon: (
        <svg
          className="w-8 h-8 text-purple-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          ></path>
        </svg>
      ),
    },
    {
      title: "Innovation",
      description:
        "We continuously evolve our platform to incorporate the latest fitness science and technology.",
      icon: (
        <svg
          className="w-8 h-8 text-purple-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          ></path>
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar routing={routing} />

      <main>
        {/* Hero Section */}
        <section className="relative bg-purple-700 text-white py-24">
          <div className="absolute inset-0 bg-black opacity-30"></div>
          <div className="relative container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Mission</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              To make fitness accessible, enjoyable, and sustainable for
              everyone, everywhere, at any time.
            </p>
          </div>
        </section>

        {/* About Us Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">About FitPro</h2>
                <p className="text-lg text-gray-700 mb-6">
                  At FitPro, we believe that fitness should be accessible to
                  everyone, regardless of their schedule, location, or
                  experience level. Founded in 2018, we've grown from a small
                  collection of workout videos to a comprehensive fitness
                  platform with over one million members worldwide.
                </p>
                <p className="text-lg text-gray-700 mb-6">
                  Our team of certified fitness professionals creates content
                  that spans all workout types, from high-intensity interval
                  training to meditation, ensuring that there's something for
                  everyone at every stage of their fitness journey.
                </p>
                <p className="text-lg text-gray-700">
                  We're more than just a workout platform—we're a community of
                  individuals committed to living healthier, more active lives.
                  Whether you're just starting out or looking to take your
                  fitness to the next level, FitHub is here to support you every
                  step of the way.
                </p>
              </div>
              <div className="relative">
                <div className="aspect-video overflow-hidden rounded-lg shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80"
                    alt="People working out"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-purple-600 rounded-full flex items-center justify-center text-white text-center p-4">
                  <div>
                    <div className="text-2xl font-bold">1M+</div>
                    <div className="text-sm">Active Members</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                These principles guide everything we do at FitHub.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm p-8 text-center"
                >
                  <div className="flex justify-center mb-4">{value.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                The passionate people behind FitHub dedicated to helping you
                achieve your fitness goals.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  <div className="h-64 overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-1">
                      {member.name}
                    </h3>
                    <p className="text-purple-600 font-medium mb-3">
                      {member.position}
                    </p>
                    <p className="text-gray-600">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline/Milestones Section */}
        <section className="py-16 bg-purple-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Journey</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                From humble beginnings to a global fitness platform.
              </p>
            </div>

            <div className="relative max-w-4xl mx-auto">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-purple-200"></div>

              {/* Timeline items */}
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className={`relative flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
                  >
                    <div className="flex-1"></div>

                    {/* Dot on timeline */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-purple-600 border-4 border-purple-100 z-10"></div>

                    {/* Content */}
                    <div className="flex-1">
                      <div
                        className={`bg-white rounded-lg shadow-sm p-6 mx-4 ${index % 2 === 0 ? "text-right" : "text-left"}`}
                      >
                        <span className="inline-block text-sm font-bold text-white bg-purple-600 rounded-full px-3 py-1 mb-2">
                          {milestone.year}
                        </span>
                        <h3 className="text-xl font-semibold mb-2">
                          {milestone.title}
                        </h3>
                        <p className="text-gray-600">{milestone.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">1,000+</div>
                <div className="text-xl opacity-90">Workout Videos</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">50+</div>
                <div className="text-xl opacity-90">Expert Instructors</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">12</div>
                <div className="text-xl opacity-90">Workout Categories</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">4.8/5</div>
                <div className="text-xl opacity-90">Average Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Start Your Fitness Journey?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Join our community today and discover the perfect workouts for
              your fitness goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() =>
                  handleNavigation(isAuthenticated ? "track" : "signup")
                }
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                {isAuthenticated ? "Track Progress" : "Sign Up Free"}
              </button>
              <button
                onClick={() => handleNavigation("featured")}
                className="bg-white hover:bg-gray-100 text-purple-600 border border-purple-600 px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Explore Workouts
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer routing={routing} />
    </div>
  );
};

export default AboutPage;
