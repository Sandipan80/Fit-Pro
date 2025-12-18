import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useTracking } from '../context/TrackingContext';

const BMICalculatorPage = ({ routing }) => {
  const { trackPageView, trackMetric, trackButtonClick } = useTracking();
  const [metrics, setMetrics] = useState(true); // true for metric (kg/cm), false for imperial (lb/in)
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState(null);
  const [bmiCategory, setBmiCategory] = useState('');
  
  // Track page view on component mount
  useEffect(() => {
    trackPageView('bmi-calculator', {
      feature: 'bmi_calculator',
      measurementSystem: metrics ? 'metric' : 'imperial'
    });
  }, []);
  
  // Track measurement system change
  const handleSystemChange = (isMetric) => {
    trackButtonClick(isMetric ? 'metric_system' : 'imperial_system', {
      feature: 'bmi_calculator',
      previousSystem: metrics ? 'metric' : 'imperial',
      newSystem: isMetric ? 'metric' : 'imperial'
    });
    
    setMetrics(isMetric);
    reset();
  };
  
  const calculateBMI = (e) => {
    e.preventDefault();
    
    if (!height || !weight) {
      alert('Please enter both height and weight');
      return;
    }
    
    let bmiValue;
    
    if (metrics) {
      // Metric formula: weight (kg) / [height (m)]²
      const heightInMeters = height / 100;
      bmiValue = weight / (heightInMeters * heightInMeters);
    } else {
      // Imperial formula: (weight (lb) * 703) / [height (in)]²
      bmiValue = (weight * 703) / (height * height);
    }
    
    // Round to 1 decimal place
    bmiValue = Math.round(bmiValue * 10) / 10;
    
    setBmi(bmiValue);
    const category = getBmiCategory(bmiValue);
    setBmiCategory(category);
    
    // Track BMI calculation
    trackMetric('bmi_calculation', {
      bmi: bmiValue,
      category,
      height,
      weight,
      system: metrics ? 'metric' : 'imperial'
    });
  };
  
  const getBmiCategory = (bmi) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obesity';
  };
  
  const getCategoryColor = (category) => {
    switch (category) {
      case 'Underweight':
        return 'text-blue-600';
      case 'Normal weight':
        return 'text-green-600';
      case 'Overweight':
        return 'text-orange-600';
      case 'Obesity':
        return 'text-red-600';
      default:
        return '';
    }
  };
  
  const reset = () => {
    // Track reset action if there was previously a calculation
    if (bmi !== null) {
      trackButtonClick('reset_bmi', {
        feature: 'bmi_calculator',
        previousBmi: bmi,
        previousCategory: bmiCategory
      });
    }
    
    setHeight('');
    setWeight('');
    setBmi(null);
    setBmiCategory('');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar routing={routing} />
      
      <main className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">BMI Calculator</h1>
              <p className="text-lg text-gray-600">Calculate your Body Mass Index to check if your weight is healthy for your height</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="mb-6 flex justify-center">
                  <div className="inline-flex rounded-md shadow-sm">
                    <button
                      type="button"
                      className={`py-2 px-4 text-sm font-medium rounded-l-lg ${
                        metrics ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => handleSystemChange(true)}
                    >
                      Metric (kg/cm)
                    </button>
                    <button
                      type="button"
                      className={`py-2 px-4 text-sm font-medium rounded-r-lg ${
                        !metrics ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => handleSystemChange(false)}
                    >
                      Imperial (lb/in)
                    </button>
                  </div>
                </div>
                
                <form onSubmit={calculateBMI}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Height {metrics ? '(cm)' : '(inches)'}
                      </label>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder={metrics ? 'e.g. 175' : 'e.g. 69'}
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight {metrics ? '(kg)' : '(lb)'}
                      </label>
                      <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder={metrics ? 'e.g. 70' : 'e.g. 154'}
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                    <button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                      Calculate BMI
                    </button>
                    <button
                      type="button"
                      onClick={reset}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </form>
                
                {bmi !== null && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Your BMI Result</h3>
                      <div className="text-5xl font-bold mb-4">{bmi}</div>
                      <p className={`text-xl font-medium ${getCategoryColor(bmiCategory)}`}>
                        {bmiCategory}
                      </p>
                      
                      <div className="mt-6 bg-gray-100 rounded-lg p-4">
                        <p className="text-gray-700">
                          A healthy BMI range is between 18.5 and 24.9. This is a general guide as BMI doesn't 
                          differentiate between muscle and fat, and doesn't consider factors like age, sex, ethnicity, 
                          and muscle mass.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">BMI Categories</h3>
                  <div className="overflow-hidden bg-white border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BMI Range</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Below 18.5</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">Underweight</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">18.5 - 24.9</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">Normal weight</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">25.0 - 29.9</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">Overweight</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">30.0 and above</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">Obesity</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-10 bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 md:p-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">What is BMI?</h3>
                <p className="text-gray-700 mb-4">
                  Body Mass Index (BMI) is a simple calculation using a person's height and weight. The formula is BMI = kg/m² where kg is a person's weight in kilograms and m² is their height in meters squared.
                </p>
                <p className="text-gray-700 mb-4">
                  BMI is a useful measure of overweight and obesity. It is used to screen for weight categories that may lead to health problems but it is not diagnostic of the body fatness or health of an individual.
                </p>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        BMI is a general guide only and is not a substitute for professional medical advice. Always consult with your doctor or healthcare provider for a proper assessment of your health.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer routing={routing} />
    </div>
  );
};

export default BMICalculatorPage; 