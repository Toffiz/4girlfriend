// GitHub Gist Storage Client
// Using GitHub Gist API for persistent photo storage

const GITHUB_CONFIG = {
  token: process.env.REACT_APP_GITHUB_TOKEN || '',
  gistId: process.env.REACT_APP_GIST_ID || '',
  filename: 'gallery-photos.json'
};

export const galleryService = {
  // Gallery Photos
  async getPhotos() {
    try {
      if (GITHUB_CONFIG.gistId && GITHUB_CONFIG.token) {
        const response = await fetch(`https://api.github.com/gists/${GITHUB_CONFIG.gistId}`, {
          headers: {
            'Authorization': `token ${GITHUB_CONFIG.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        if (response.ok) {
          const gist = await response.json();
          const content = gist.files[GITHUB_CONFIG.filename]?.content;
          if (content) {
            return JSON.parse(content);
          }
        }
      }
      return [];
    } catch (error) {
      console.error('GitHub Gist error:', error);
      return [];
    }
  },

  async addPhoto(photoData) {
    const photos = await this.getPhotos();
    const newPhoto = {
      id: Date.now(),
      title: photoData.title,
      date: photoData.photoDate,
      time: photoData.photoTime,
      imageUrl: photoData.imageData,
      uploadedAt: new Date().toISOString()
    };
    const updatedPhotos = [newPhoto, ...photos];
    await this.syncToGist(updatedPhotos);
    return newPhoto;
  },

  async deletePhoto(photoId) {
    const photos = await this.getPhotos();
    const filtered = photos.filter(photo => photo.id !== photoId);
    await this.syncToGist(filtered);
    return true;
  },

  async syncToGist(photos) {
    if (!GITHUB_CONFIG.token) {
      const error = 'No GitHub token configured';
      console.error(error);
      throw new Error(error);
    }

    const content = JSON.stringify(photos, null, 2);
    const gistData = {
      description: 'Gallery photos for 4girlfriend',
      public: false,
      files: {
        [GITHUB_CONFIG.filename]: {
          content: content
        }
      }
    };

    try {
      // Check if we have gist ID in localStorage (for when env var is empty)
      let gistId = GITHUB_CONFIG.gistId || localStorage.getItem('gistId');
      
      if (gistId) {
        // Update existing gist
        console.log('Updating gist:', gistId);
        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `token ${GITHUB_CONFIG.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(gistData)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to update gist: ${response.status} ${errorText}`);
        }
        console.log('✅ Gist updated successfully');
      } else {
        // Create new gist
        console.log('Creating new gist...');
        const response = await fetch('https://api.github.com/gists', {
          method: 'POST',
          headers: {
            'Authorization': `token ${GITHUB_CONFIG.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(gistData)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to create gist: ${response.status} ${errorText}`);
        }
        
        const gist = await response.json();
        console.log('✅ Gist created successfully!');
        console.log('🔑 GIST ID:', gist.id);
        console.log('📝 Add this to your .env file as REACT_APP_GIST_ID=' + gist.id);
        console.log('📝 And add it to GitHub secrets: REACT_APP_GIST_ID=' + gist.id);
        
        // Store in localStorage so we can use it immediately
        localStorage.setItem('gistId', gist.id);
        alert(`Gist created! ID: ${gist.id}\n\nAdd this to your .env file:\nREACT_APP_GIST_ID=${gist.id}`);
      }
    } catch (error) {
      console.error('❌ Gist sync error:', error);
      throw error;
    }
  },

  // Get current gist ID (from env or localStorage)
  getGistId() {
    return GITHUB_CONFIG.gistId || localStorage.getItem('gistId') || null;
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
