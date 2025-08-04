import React, { useState, useEffect } from 'react';
import FlowerGarden from './FlowerGarden';
import OurLoveStory from './OurLoveStory';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    // Simple routing based on URL path
    const path = window.location.pathname;
    if (path === '/our-love-story') {
      setCurrentPage('love-story');
    } else {
      setCurrentPage('home');
    }

    // Listen for navigation
    const handleNavigation = () => {
      const path = window.location.pathname;
      if (path === '/our-love-story') {
        setCurrentPage('love-story');
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  // Update URL when page changes
  useEffect(() => {
    if (currentPage === 'love-story' && window.location.pathname !== '/our-love-story') {
      window.history.pushState({}, '', '/our-love-story');
    } else if (currentPage === 'home' && window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
  }, [currentPage]);

  return (
    <div className="App">
      {currentPage === 'home' ? <FlowerGarden /> : <OurLoveStory />}
    </div>
  );
}

export default App;
