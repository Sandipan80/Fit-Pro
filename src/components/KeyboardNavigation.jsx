import { useEffect } from 'react';

const KeyboardNavigation = ({ routing, onQuickSearch }) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only handle keyboard shortcuts when not typing in input fields
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      // Ctrl/Cmd + K: Quick search/navigation
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        if (onQuickSearch) {
          onQuickSearch();
        }
      }

      // Escape: Go back or close modals
      if (event.key === 'Escape') {
        event.preventDefault();
        if (routing?.goBack) {
          routing.goBack();
        }
      }

      // Alt + H: Go to home
      if (event.altKey && event.key === 'h') {
        event.preventDefault();
        if (routing?.navigateTo) {
          routing.navigateTo('home');
        }
      }

      // Alt + P: Go to profile
      if (event.altKey && event.key === 'p') {
        event.preventDefault();
        if (routing?.navigateTo) {
          routing.navigateTo('profile');
        }
      }

      // Alt + W: Go to workouts
      if (event.altKey && event.key === 'w') {
        event.preventDefault();
        if (routing?.navigateTo) {
          routing.navigateTo('featured');
        }
      }

      // Alt + N: Go to nutrition
      if (event.altKey && event.key === 'n') {
        event.preventDefault();
        if (routing?.navigateTo) {
          routing.navigateTo('nutrition');
        }
      }

      // Alt + T: Go to track progress
      if (event.altKey && event.key === 't') {
        event.preventDefault();
        if (routing?.navigateTo) {
          routing.navigateTo('track');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [routing, onQuickSearch]);

  // This component doesn't render anything, it just handles keyboard events
  return null;
};

export default KeyboardNavigation; 