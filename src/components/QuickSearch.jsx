import { useState, useEffect, useRef } from 'react';

const QuickSearch = ({ routing, isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const searchOptions = [
    { id: 'home', label: 'Home', path: 'home', icon: '🏠' },
    { id: 'featured', label: 'Featured Workouts', path: 'featured', icon: '💪' },
    { id: 'categories', label: 'Workout Categories', path: 'categories', icon: '📂' },
    { id: 'profile', label: 'User Profile', path: 'profile', icon: '👤' },
    { id: 'nutrition', label: 'Nutrition Tracker', path: 'nutrition', icon: '🥗' },
    { id: 'protein', label: 'Protein Tracker', path: 'protein', icon: '🥩' },
    { id: 'track', label: 'Track Progress', path: 'track', icon: '📊' },
    { id: 'analytics', label: 'Workout Analytics', path: 'analytics', icon: '📈' },
    { id: 'bmi-calculator', label: 'BMI Calculator', path: 'bmi-calculator', icon: '🧮' },
    { id: 'chatbot', label: 'Fitness Assistant', path: 'chatbot', icon: '🤖' },
    { id: 'about', label: 'About Us', path: 'about', icon: 'ℹ️' },
    { id: 'contact', label: 'Contact Us', path: 'contact', icon: '📞' },
  ];

  const filteredOptions = searchOptions.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[selectedIndex]) {
          handleSelect(filteredOptions[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  const handleSelect = (option) => {
    if (routing?.navigateTo) {
      routing.navigateTo(option.path);
    }
    onClose();
    setSearchTerm('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <button
                key={option.id}
                onClick={() => handleSelect(option)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  index === selectedIndex ? 'bg-purple-50 border-r-2 border-purple-500' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{option.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-500">/{option.path}</div>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-gray-500">
              No results found for "{searchTerm}"
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Use ↑↓ to navigate, Enter to select</span>
            <span>Esc to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickSearch; 