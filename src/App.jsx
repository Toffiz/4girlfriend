import React, { useState, useEffect } from 'react';
import FlowerGarden from './FlowerGarden';
import OurLoveStory from './OurLoveStory';
import Gallery from './Gallery';
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
    const basename = '/4girlfriend';
    const path = window.location.pathname.replace(basename, '') || '/';
    
    if (path === '/our-love-story') {
      setCurrentPage('love-story');
    } else if (path === '/gallery') {
      setCurrentPage('gallery');
    } else {
      setCurrentPage('home');
    }

    // Listen for navigation
    const handleNavigation = () => {
      const path = window.location.pathname.replace(basename, '') || '/';
      if (path === '/our-love-story') {
        setCurrentPage('love-story');
      } else if (path === '/gallery') {
        setCurrentPage('gallery');
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  // Update URL when page changes
  useEffect(() => {
    const basename = '/4girlfriend';
    if (currentPage === 'love-story' && window.location.pathname !== basename + '/our-love-story') {
      window.history.pushState({}, '', basename + '/our-love-story');
    } else if (currentPage === 'gallery' && window.location.pathname !== basename + '/gallery') {
      window.history.pushState({}, '', basename + '/gallery');
    } else if (currentPage === 'home' && window.location.pathname !== basename) {
      window.history.pushState({}, '', basename);
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
      {currentPage === 'home' && <FlowerGarden onLogout={handleLogout} />}
      {currentPage === 'love-story' && <OurLoveStory onLogout={handleLogout} />}
      {currentPage === 'gallery' && <Gallery onLogout={handleLogout} />}
    </div>
  );
}

export default App;
