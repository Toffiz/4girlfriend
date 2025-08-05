import React, { useState, useEffect } from 'react';
import FlowerGarden from './FlowerGarden';
import OurLoveStory from './OurLoveStory';
import Login from './Login';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated (from localStorage)
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

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

  const handleLogin = (success) => {
    if (success) {
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    setCurrentPage('home');
  };

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      {currentPage === 'home' ? <FlowerGarden onLogout={handleLogout} /> : <OurLoveStory onLogout={handleLogout} />}
    </div>
  );
}

export default App;
