// API Client for FastAPI Backend
// Direct PostgreSQL connection via FastAPI

// Backend configuration - encoded for security
const getApiConfig = () => {
  // Base64 encoded API URL for basic obfuscation
  const encodedLocalUrl = "aHR0cDovL2xvY2FsaG9zdDo4MDAwL2FwaQ=="  // http://localhost:8000/api
  return {
    local: atob(encodedLocalUrl),
    production: 'https://your-backend-url.com/api'  // Update when you deploy
  }
}

const API_BASE_URL = getApiConfig().local  // For local development
// const API_BASE_URL = getApiConfig().production  // For production

// Use backend database or localStorage fallback
const useBackend = false  // Set to true when backend is running

export const galleryService = {
  // Gallery Photos
  async getPhotos() {
    if (useBackend) {
      try {
        const response = await fetch(`${API_BASE_URL}/photos`)
        if (!response.ok) throw new Error('Failed to fetch photos')
        const photos = await response.json()
        
        // Convert backend format to frontend format
        return photos.map(photo => ({
          id: photo.id,
          title: photo.title,
          date: photo.photo_date,
          time: photo.photo_time,
          imageUrl: photo.image_data,
          uploadedAt: photo.created_at
        }))
      } catch (error) {
        console.error('Backend failed, using localStorage:', error)
        // Fallback to localStorage
      }
    }
    
    // localStorage fallback
    const saved = localStorage.getItem('galleryPhotos')
    return saved ? JSON.parse(saved) : []
  },

  async addPhoto(photoData) {
    if (useBackend) {
      try {
        const response = await fetch(`${API_BASE_URL}/photos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: photoData.title,
            photo_date: photoData.photoDate,
            photo_time: photoData.photoTime,
            image_data: photoData.imageData
          })
        })
        
        if (!response.ok) throw new Error('Failed to add photo')
        const photo = await response.json()
        
        // Convert backend format to frontend format
        return {
          id: photo.id,
          title: photo.title,
          date: photo.photo_date,
          time: photo.photo_time,
          imageUrl: photo.image_data,
          uploadedAt: photo.created_at
        }
      } catch (error) {
        console.error('Backend failed, using localStorage:', error)
        // Fallback to localStorage
      }
    }
    
    // localStorage fallback
    const photos = await this.getPhotos()
    const newPhoto = {
      id: Date.now(),
      title: photoData.title,
      date: photoData.photoDate,
      time: photoData.photoTime,
      imageUrl: photoData.imageData,
      uploadedAt: new Date().toISOString()
    }
    const updatedPhotos = [newPhoto, ...photos]
    localStorage.setItem('galleryPhotos', JSON.stringify(updatedPhotos))
    return newPhoto
  },

  async deletePhoto(photoId) {
    if (useBackend) {
      try {
        const response = await fetch(`${API_BASE_URL}/photos/${photoId}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) throw new Error('Failed to delete photo')
        return true
      } catch (error) {
        console.error('Backend failed, using localStorage:', error)
        // Fallback to localStorage
      }
    }
    
    // localStorage fallback
    const photos = await this.getPhotos()
    const filtered = photos.filter(photo => photo.id !== photoId)
    localStorage.setItem('galleryPhotos', JSON.stringify(filtered))
    return true
  }
}

// Auth service
export const authService = {
  async checkAuth(username, password) {
    if (useBackend) {
      try {
        const response = await fetch(`${API_BASE_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password })
        })
        
        if (!response.ok) throw new Error('Login request failed')
        const result = await response.json()
        return result.success
      } catch (error) {
        console.error('Backend auth failed, using local auth:', error)
        // Fallback to local auth
      }
    }
    
    // Local auth fallback
    const validCredentials = {
      username: atob('RGFuaWFs'), 
      password: atob('QWxiaW5h')  
    }
    
    return (username === validCredentials.username && 
            password === validCredentials.password)
  }
}

// Test backend connection
export const testBackendConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/test-connection`)
    const result = await response.json()
    return result.success
  } catch (error) {
    console.error('Backend connection test failed:', error)
    return false
  }
}
