import React, { useState, useEffect } from 'react';
import { galleryService } from './supabaseClient';
import './Gallery.css';

const Gallery = ({ onLogout }) => {
  const [photos, setPhotos] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [filterYear, setFilterYear] = useState('all');
  const [newPhoto, setNewPhoto] = useState({
    title: '',
    date: '',
    time: '',
    image: null,
    imageUrl: ''
  });

  // Load photos from Supabase on component mount
  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const data = await galleryService.getPhotos();
      setPhotos(data);
    } catch (error) {
      console.error('Error loading photos:', error);
      // Fallback to localStorage if Supabase fails
      const savedPhotos = localStorage.getItem('galleryPhotos');
      if (savedPhotos) {
        setPhotos(JSON.parse(savedPhotos));
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewPhoto({
          ...newPhoto,
          image: file,
          imageUrl: event.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (newPhoto.title && newPhoto.date && newPhoto.time && newPhoto.imageUrl) {
      try {
        const photoData = {
          title: newPhoto.title,
          photoDate: newPhoto.date,
          photoTime: newPhoto.time,
          imageData: newPhoto.imageUrl
        };
        
        const savedPhoto = await galleryService.addPhoto(photoData);
        
        // Add to local state
        const newPhotoForState = {
          id: savedPhoto.id,
          title: savedPhoto.title,
          date: savedPhoto.photo_date,
          time: savedPhoto.photo_time,
          imageUrl: savedPhoto.image_data,
          uploadedAt: savedPhoto.created_at
        };
        
        setPhotos([newPhotoForState, ...photos]);
        setNewPhoto({ title: '', date: '', time: '', image: null, imageUrl: '' });
        setShowAddForm(false);
      } catch (error) {
        console.error('Error adding photo:', error);
        // Fallback to localStorage
        const photoData = {
          id: Date.now(),
          title: newPhoto.title,
          date: newPhoto.date,
          time: newPhoto.time,
          imageUrl: newPhoto.imageUrl,
          uploadedAt: new Date().toISOString()
        };
        
        setPhotos([photoData, ...photos]);
        localStorage.setItem('galleryPhotos', JSON.stringify([photoData, ...photos]));
        setNewPhoto({ title: '', date: '', time: '', image: null, imageUrl: '' });
        setShowAddForm(false);
      }
    }
  };

  const handleDeletePhoto = async (id) => {
    try {
      await galleryService.deletePhoto(id);
      setPhotos(photos.filter(photo => photo.id !== id));
    } catch (error) {
      console.error('Error deleting photo:', error);
      // Fallback to localStorage
      const newPhotos = photos.filter(photo => photo.id !== id);
      setPhotos(newPhotos);
      localStorage.setItem('galleryPhotos', JSON.stringify(newPhotos));
    }
  };

  const getAvailableYears = () => {
    const years = photos.map(photo => new Date(photo.date).getFullYear());
    return [...new Set(years)].sort((a, b) => b - a);
  };

  const getSortedAndFilteredPhotos = () => {
    let filteredPhotos = photos;

    // Filter by year
    if (filterYear !== 'all') {
      filteredPhotos = photos.filter(photo => 
        new Date(photo.date).getFullYear() === parseInt(filterYear)
      );
    }

    // Sort photos
    return filteredPhotos.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.uploadedAt) - new Date(a.uploadedAt);
        case 'oldest':
          return new Date(a.uploadedAt) - new Date(b.uploadedAt);
        case 'dateNewest':
          return new Date(b.date) - new Date(a.date);
        case 'dateOldest':
          return new Date(a.date) - new Date(b.date);
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="gallery-container">
      <div className="romantic-bg"></div>

      {/* Header */}
      <header className="gallery-header">
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
          <button className="logout-button" onClick={onLogout}>
            🚪 Logout
          </button>
        )}
        <h1 className="gallery-title">Our Memory Gallery 📸</h1>
        <p className="gallery-subtitle">Capturing our beautiful moments together</p>
      </header>

      {/* Controls */}
      <section className="gallery-controls">
        <button 
          className="add-photo-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '❌ Cancel' : '📷 Add New Memory'}
        </button>

        <div className="filter-controls">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="newest">Newest Added</option>
            <option value="oldest">Oldest Added</option>
            <option value="dateNewest">Photo Date (Newest)</option>
            <option value="dateOldest">Photo Date (Oldest)</option>
            <option value="alphabetical">Alphabetical</option>
          </select>

          <select 
            value={filterYear} 
            onChange={(e) => setFilterYear(e.target.value)}
            className="year-select"
          >
            <option value="all">All Years</option>
            {getAvailableYears().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </section>

      {/* Add Photo Form */}
      {showAddForm && (
        <section className="add-photo-form">
          <form onSubmit={handleAddPhoto} className="photo-form">
            <h3>Add a New Memory 💕</h3>
            
            <div className="form-group">
              <label>Photo Title:</label>
              <input
                type="text"
                value={newPhoto.title}
                onChange={(e) => setNewPhoto({...newPhoto, title: e.target.value})}
                placeholder="Give this memory a beautiful title..."
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date:</label>
                <input
                  type="date"
                  value={newPhoto.date}
                  onChange={(e) => setNewPhoto({...newPhoto, date: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Time:</label>
                <input
                  type="time"
                  value={newPhoto.time}
                  onChange={(e) => setNewPhoto({...newPhoto, time: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Choose Photo:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="file-input"
                required
              />
            </div>

            {newPhoto.imageUrl && (
              <div className="preview-container">
                <img src={newPhoto.imageUrl} alt="Preview" className="image-preview" />
              </div>
            )}

            <button type="submit" className="submit-btn">
              💖 Add to Gallery
            </button>
          </form>
        </section>
      )}

      {/* Gallery Grid */}
      <section className="gallery-grid">
        {getSortedAndFilteredPhotos().length === 0 ? (
          <div className="empty-gallery">
            <div className="empty-icon">📷</div>
            <h3>No memories yet</h3>
            <p>Start adding your beautiful moments together!</p>
          </div>
        ) : (
          getSortedAndFilteredPhotos().map(photo => (
            <div key={photo.id} className="photo-card">
              <div className="photo-image-container">
                <img src={photo.imageUrl} alt={photo.title} className="photo-image" />
                <button 
                  className="delete-btn"
                  onClick={() => handleDeletePhoto(photo.id)}
                >
                  🗑️
                </button>
              </div>
              <div className="photo-info">
                <h4 className="photo-title">{photo.title}</h4>
                <div className="photo-datetime">
                  <span className="photo-date">📅 {formatDate(photo.date)}</span>
                  <span className="photo-time">🕐 {photo.time}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Stats */}
      <section className="gallery-stats">
        <div className="stat-item">
          <span className="stat-number">{photos.length}</span>
          <span className="stat-label">Total Memories</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{getAvailableYears().length}</span>
          <span className="stat-label">Years Captured</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">∞</span>
          <span className="stat-label">Love Shared</span>
        </div>
      </section>
    </div>
  );
};

export default Gallery;
