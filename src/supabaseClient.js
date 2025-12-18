// Cloudinary Storage Client
// Using Cloudinary for image hosting and metadata storage

const CLOUDINARY_CONFIG = {
  cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || '',
  uploadPreset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || '',
  folder: '4girlfriend-gallery'
};

export const galleryService = {
  // Gallery Photos - cached in localStorage, backed by Cloudinary
  async getPhotos() {
    try {
      // Check localStorage cache first
      const cached = localStorage.getItem('cloudinary_photos_cache');
      if (cached) {
        console.log('Loaded from localStorage cache');
        return JSON.parse(cached);
      }

      // No cache - try fetching from Cloudinary
      if (!CLOUDINARY_CONFIG.cloudName) {
        return [];
      }

      console.log('Fetching from Cloudinary...');
      const response = await fetch(
        `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/list/${CLOUDINARY_CONFIG.folder}.json`
      );
      
      if (!response.ok) {
        console.error('Cloudinary fetch failed. Enable "Resource list" in Settings → Security');
        return [];
      }

      const data = await response.json();
      const photos = data.resources.map(resource => ({
        id: resource.public_id,
        title: resource.context?.custom?.title || 'Untitled',
        date: resource.context?.custom?.date || '',
        time: resource.context?.custom?.time || '',
        imageUrl: `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${resource.public_id}.${resource.format}`,
        uploadedAt: resource.created_at
      }));

      const sorted = photos.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
      
      // Cache it
      localStorage.setItem('cloudinary_photos_cache', JSON.stringify(sorted));
      console.log('Cached to localStorage');
      
      return sorted;
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  },

  async addPhoto(photoData) {
    try {
      if (!CLOUDINARY_CONFIG.cloudName || !CLOUDINARY_CONFIG.uploadPreset) {
        throw new Error('Cloudinary not configured. Check your environment variables.');
      }

      console.log('Uploading to Cloudinary...');
      
      // Create form data
      const formData = new FormData();
      formData.append('file', photoData.imageData);
      formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
      formData.append('folder', CLOUDINARY_CONFIG.folder);
      
      // Add metadata as context
      const context = `title=${encodeURIComponent(photoData.title)}|date=${photoData.photoDate}|time=${photoData.photoTime}`;
      formData.append('context', context);

      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Upload failed: ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Upload successful:', result);

      const newPhoto = {
        id: result.public_id,
        title: photoData.title,
        date: photoData.photoDate,
        time: photoData.photoTime,
        imageUrl: result.secure_url,
        uploadedAt: result.created_at
      };

      // Add to localStorage cache
      const photos = await this.getPhotos();
    // Remove from localStorage cache
    const photos = await this.getPhotos();
    const filtered = photos.filter(p => p.id !== photoId);
    localStorage.setItem('cloudinary_photos_cache', JSON.stringify(filtered));
    
    console.log('Removed from cache. Still exists on Cloudinary.');
    return true;nc deletePhoto(photoId) {
    try {
      // Note: Deleting from Cloudinary requires authenticated API calls
      // For now, we'll just remove from display
      // To implement deletion, you'd need to set up a backend or use Cloudinary's signed deletion
      console.warn('Photo deletion not implemented yet. Contact admin to remove photos from Cloudinary dashboard.');
      alert('Photo deletion requires admin access. Please remove manually from Cloudinary dashboard.');
      return false;
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }
};

export const authService = {
  async checkAuth(username, password) {
    const validCredentials = {
      username: atob('RGFuaWFs'), 
      password: atob('QWxiaW5h')  
    };
    return (username === validCredentials.username && 
            password === validCredentials.password);
  }
};
