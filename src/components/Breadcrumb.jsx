import React from 'react';

const Breadcrumb = ({ routing, items = [] }) => {
  const defaultItems = [
    { label: 'Home', path: 'home' },
    ...items
  ];

  const handleClick = (path) => {
    if (routing?.navigateTo) {
      routing.navigateTo(path);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 py-3 px-4">
      <div className="container mx-auto">
        <ol className="flex items-center space-x-2 text-sm">
          {defaultItems.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <svg className="w-4 h-4 text-gray-400 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              )}
              {index === defaultItems.length - 1 ? (
                <span className="text-gray-900 font-medium">{item.label}</span>
              ) : (
                <button
                  onClick={() => handleClick(item.path)}
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumb; 