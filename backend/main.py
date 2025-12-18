# FastAPI Backend with Cloudinary
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import cloudinary
import cloudinary.uploader
import cloudinary.api
import base64

from secure_config import CLOUDINARY_CONFIG, AUTH_USERNAME, AUTH_PASSWORD

app = FastAPI(title="4girlfriend API")

# Configure Cloudinary
cloudinary.config(
    cloud_name=CLOUDINARY_CONFIG['cloud_name'],
    api_key=CLOUDINARY_CONFIG['api_key'],
    api_secret=CLOUDINARY_CONFIG['api_secret']
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class PhotoUpload(BaseModel):
    title: str
    photoDate: str
    photoTime: str
    imageData: str

class LoginRequest(BaseModel):
    username: str
    password: str

@app.get("/")
async def root():
    return {"status": "running"}

@app.get("/api/photos")
async def get_photos():
    try:
        result = cloudinary.api.resources(
            type="upload",
            prefix="4girlfriend-gallery/",
            max_results=500,
            context=True
        )
        
        photos = []
        for resource in result.get('resources', []):
            context = resource.get('context', {}).get('custom', {})
            photos.append({
                'id': resource['public_id'],
                'title': context.get('title', 'Untitled'),
                'date': context.get('date', ''),
                'time': context.get('time', ''),
                'imageUrl': resource['secure_url'],
                'uploadedAt': resource['created_at']
            })
        
        return photos
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/photos")
async def upload_photo(photo: PhotoUpload):
    try:
        result = cloudinary.uploader.upload(
            photo.imageData,
            folder="4girlfriend-gallery",
            context=f"title={photo.title}|date={photo.photoDate}|time={photo.photoTime}"
        )
        
        return {
            'id': result['public_id'],
            'title': photo.title,
            'date': photo.photoDate,
            'time': photo.photoTime,
            'imageUrl': result['secure_url'],
            'uploadedAt': result['created_at']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/photos/{photo_id:path}")
async def delete_photo(photo_id: str):
    try:
        result = cloudinary.uploader.destroy(photo_id)
        return {"success": result.get('result') == 'ok'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/login")
async def login(request: LoginRequest):
    username_match = request.username == base64.b64decode(AUTH_USERNAME).decode()
    password_match = request.password == base64.b64decode(AUTH_PASSWORD).decode()
    
    if username_match and password_match:
        return {"success": True}
    return {"success": False}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
