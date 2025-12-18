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
      console.error('No GitHub token configured');
      return;
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
      if (GITHUB_CONFIG.gistId) {
        // Update existing gist
        const response = await fetch(`https://api.github.com/gists/${GITHUB_CONFIG.gistId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `token ${GITHUB_CONFIG.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(gistData)
        });
        
        if (!response.ok) throw new Error(`Failed to update gist: ${response.statusText}`);
      } else {
        // Create new gist
        const response = await fetch('https://api.github.com/gists', {
          method: 'POST',
          headers: {
            'Authorization': `token ${GITHUB_CONFIG.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(gistData)
        });
        
        if (!response.ok) throw new Error(`Failed to create gist: ${response.statusText}`);
        const gist = await response.json();
        console.log('Created new gist! Add this to GitHub secrets as REACT_APP_GIST_ID:', gist.id);
      }
    } catch (error) {
      console.error('Gist sync error:', error);
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
