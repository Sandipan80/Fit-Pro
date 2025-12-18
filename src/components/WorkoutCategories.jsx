const categories = [
  {
    title: "Yoga",
    image:
      "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1026&q=80",
    description:
      "Find peace and flexibility with our yoga classes for all levels.",
    videosCount: 120,
  },
  {
    title: "HIIT & Cardio",
    image:
      "https://images.unsplash.com/photo-1434682881908-b43d0467b798?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1474&q=80",
    description:
      "Burn calories and improve cardio fitness with high-intensity workouts.",
    videosCount: 95,
  },
  {
    title: "Weight Loss",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    description:
      "Targeted workouts designed specifically for weight loss and toning.",
    videosCount: 85,
  },
  {
    title: "Beginner Friendly",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    description:
      "Start your fitness journey with beginner-friendly exercises and routines.",
    videosCount: 110,
  },
];

const WorkoutCategories = ({ routing }) => {
  // Handle navigation with routing context
  const handleNavigation = (page) => {
    if (routing && routing.navigateTo) {
      routing.navigateTo(page);
    } else {
      window.location.hash = `#${page}`;
    }
  };

  return (
    <section id="categories" className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Explore Workout Categories
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find the perfect workout type for your fitness goals and
            preferences. All videos are designed by certified fitness
            professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105 hover:shadow-lg"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2">{category.title}</h3>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-purple-600 font-medium">
                    {category.videosCount} videos
                  </span>
                  <button
                    onClick={() => handleNavigation("categories")}
                    className="text-purple-600 hover:text-purple-800 font-medium"
                  >
                    Explore →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkoutCategories;
