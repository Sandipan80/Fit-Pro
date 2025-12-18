import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const NotFoundPage = ({ routing }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar routing={routing} />
      
      <div className="flex-grow flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-purple-600">404</h1>
          <div className="h-2 w-20 bg-purple-600 mx-auto my-6"></div>
          <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-8">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={() => routing.goBack()} 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors mr-4"
          >
            Go Back
          </button>
          
          <button 
            onClick={() => routing.navigateTo('home')} 
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Go to Homepage
          </button>
        </div>
        
        <div className="mt-12">
          <p className="text-gray-500">Popular pages you might be looking for:</p>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <button 
              onClick={() => routing.navigateTo('featured')}
              className="text-purple-600 hover:text-purple-800 hover:underline"
            >
              Workout Videos
            </button>
            <button 
              onClick={() => routing.navigateTo('categories')}
              className="text-purple-600 hover:text-purple-800 hover:underline"
            >
              Categories
            </button>
            <button 
              onClick={() => routing.navigateTo('subscription')}
              className="text-purple-600 hover:text-purple-800 hover:underline"
            >
              Subscription Plans
            </button>
            <button 
              onClick={() => routing.navigateTo('bmi-calculator')}
              className="text-purple-600 hover:text-purple-800 hover:underline"
            >
              BMI Calculator
            </button>
          </div>
        </div>
      </div>
      
      <Footer routing={routing} />
    </div>
  );
};

export default NotFoundPage; 