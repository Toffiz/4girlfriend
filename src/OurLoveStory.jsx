import React, { useState, useEffect } from 'react';
import './OurLoveStory.css';

const OurLoveStory = ({ onLogout }) => {
  const [timeData, setTimeData] = useState({});
  const [currentQuote, setCurrentQuote] = useState(0);
  const [showHearts, setShowHearts] = useState(false);

  // Calculate time together since Jan 27, 2023
  useEffect(() => {
    const startDate = new Date('2023-01-27');
    
    const updateTime = () => {
      const now = new Date();
      const timeDiff = now - startDate;
      
      const years = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365.25));
      const months = Math.floor((timeDiff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));
      const days = Math.floor((timeDiff % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      
      setTimeData({ years, months, days, hours, minutes, seconds });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000); // Update every second for timer effect
    return () => clearInterval(interval);
  }, []);

  // Calculate birthday countdowns
  const calculateBirthdayCountdown = (month, day, name) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    let birthday = new Date(currentYear, month - 1, day); // month is 0-indexed
    
    // If birthday already passed this year, calculate for next year
    if (birthday < now) {
      birthday = new Date(currentYear + 1, month - 1, day);
    }
    
    const timeDiff = birthday - now;
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { name, days, hours, minutes, date: birthday };
  };

  const danielBirthday = calculateBirthdayCountdown(11, 2, "Daniel's Birthday"); // Nov 2
  const albinaBirthday = calculateBirthdayCountdown(12, 24, "Albina's Birthday"); // Dec 24

  // Love quotes rotation
  const loveQuotes = [
    "Every moment with you feels like a beautiful dream 💕",
    "You are my sunshine on the cloudiest days ☀️",
    "In your eyes, I found my home 🏡",
    "You make my heart skip a beat every single day 💓",
    "Together we create our own little paradise 🌸",
    "You are my favorite notification 📱💖",
    "Love you to the moon and back 🌙✨"
  ];

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % loveQuotes.length);
    }, 4000);
    return () => clearInterval(quoteInterval);
  }, [loveQuotes.length]);

  // Generate floating hearts - optimized
  useEffect(() => {
    const heartInterval = setInterval(() => {
      setShowHearts(true);
      setTimeout(() => setShowHearts(false), 2000); // Reduced duration
    }, 8000); // Increased interval for better performance
    return () => clearInterval(heartInterval);
  }, []);

  const milestones = [
    { date: "January 27, 2023", event: "Our beautiful journey began 💕", icon: "🌟" },
    { date: "February 14, 2023", event: "First Valentine's Day together 💝", icon: "💕" },
    { date: "Today", event: "Still falling in love with you every day 💖", icon: "🌹" }
  ];

  return (
    <div className="love-story-container">
      {/* Floating Hearts - Optimized */}
      {showHearts && (
        <div className="floating-hearts">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="floating-heart" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 1}s`,
              fontSize: `${1.2 + Math.random() * 0.8}rem`
            }}>
              💖
            </div>
          ))}
        </div>
      )}

      {/* Background */}
      <div className="romantic-bg"></div>

      {/* Header */}
      <header className="love-header">
        <button 
          className="back-button"
          onClick={() => {
            window.history.pushState({}, '', '/');
            window.dispatchEvent(new PopStateEvent('popstate'));
          }}
        >
          🌸 Back to Garden
        </button>
        {onLogout && (
          <button 
            className="logout-button"
            onClick={onLogout}
          >
            🚪 Logout
          </button>
        )}
        <h1 className="love-title">Our Love Story 💕</h1>
        <p className="love-date">Since January 27, 2023</p>
      </header>

      {/* Time Counter */}
      <section className="time-counter">
        <h2 className="counter-title">We've been together for:</h2>
        <div className="time-grid">
          <div className="time-box">
            <div className="time-number">{timeData.years || 0}</div>
            <div className="time-label">Years</div>
          </div>
          <div className="time-box">
            <div className="time-number">{timeData.months || 0}</div>
            <div className="time-label">Months</div>
          </div>
          <div className="time-box">
            <div className="time-number">{timeData.days || 0}</div>
            <div className="time-label">Days</div>
          </div>
          <div className="time-box">
            <div className="time-number">{timeData.hours || 0}</div>
            <div className="time-label">Hours</div>
          </div>
          <div className="time-box">
            <div className="time-number">{timeData.minutes || 0}</div>
            <div className="time-label">Minutes</div>
          </div>
          <div className="time-box timer-seconds">
            <div className="time-number">{timeData.seconds || 0}</div>
            <div className="time-label">Seconds</div>
          </div>
        </div>
      </section>

      {/* Birthday Countdown */}
      <section className="birthday-countdown">
        <h2 className="section-title">Upcoming Birthdays 🎂</h2>
        <div className="birthday-grid">
          <div className="birthday-card">
            <div className="birthday-icon">🎉</div>
            <div className="birthday-name">{danielBirthday.name}</div>
            <div className="birthday-date">November 2nd</div>
            <div className="birthday-countdown-time">
              <span className="countdown-number">{danielBirthday.days}</span> days
              <span className="countdown-number">{danielBirthday.hours}</span> hours
              <span className="countdown-number">{danielBirthday.minutes}</span> minutes
            </div>
          </div>
          <div className="birthday-card">
            <div className="birthday-icon">🎂</div>
            <div className="birthday-name">{albinaBirthday.name}</div>
            <div className="birthday-date">December 24th</div>
            <div className="birthday-countdown-time">
              <span className="countdown-number">{albinaBirthday.days}</span> days
              <span className="countdown-number">{albinaBirthday.hours}</span> hours
              <span className="countdown-number">{albinaBirthday.minutes}</span> minutes
            </div>
          </div>
        </div>
      </section>

      {/* Love Quote */}
      <section className="love-quote-section">
        <div className="quote-container">
          <p className="love-quote">{loveQuotes[currentQuote]}</p>
        </div>
      </section>

      {/* Milestones */}
      <section className="milestones-section">
        <h2 className="section-title">Our Beautiful Milestones 🌟</h2>
        <div className="milestones-grid">
          {milestones.map((milestone, index) => (
            <div key={index} className="milestone-card">
              <div className="milestone-icon">{milestone.icon}</div>
              <div className="milestone-date">{milestone.date}</div>
              <div className="milestone-event">{milestone.event}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Love Stats */}
      <section className="love-stats">
        <h2 className="section-title">Our Love in Numbers 📊💕</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💏</div>
            <div className="stat-number">∞</div>
            <div className="stat-label">Kisses</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🤗</div>
            <div className="stat-number">∞</div>
            <div className="stat-label">Hugs</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">😂</div>
            <div className="stat-number">∞</div>
            <div className="stat-label">Laughs</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💕</div>
            <div className="stat-number">∞</div>
            <div className="stat-label">Love</div>
          </div>
        </div>
      </section>

      {/* Memory Gallery Placeholder */}
      <section className="memory-gallery">
        <h2 className="section-title">Our Beautiful Memories 📸✨</h2>
        <div className="photo-grid">
          <div className="photo-placeholder">
            <span>📷</span>
            <p>Add your favorite photo here! 💕</p>
          </div>
          <div className="photo-placeholder">
            <span>📷</span>
            <p>Another sweet memory 🥰</p>
          </div>
          <div className="photo-placeholder">
            <span>📷</span>
            <p>Perfect moment captured 💖</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="love-footer">
        <p>Made with 💖 for the most beautiful girl in the world</p>
        <div className="footer-hearts">💕 💖 💕 💖 💕</div>
      </footer>
    </div>
  );
};

export default OurLoveStory;
