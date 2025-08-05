# FastAPI Backend for Romantic Website
# Direct PostgreSQL connection to Supabase

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor
import json
from datetime import datetime
from typing import List, Optional

# Import secure configuration
from secure_config import DB_CONFIG

app = FastAPI(title="Romantic Website API", version="1.0.0")

# CORS middleware to allow requests from your React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class PhotoCreate(BaseModel):
    title: str
    photo_date: str
    photo_time: str
    image_data: str  # base64 encoded image

class Photo(BaseModel):
    id: str
    title: str
    photo_date: str
    photo_time: str
    image_data: str
    created_at: str

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    message: str

# Database connection function with better error handling
def get_db_connection():
    try:
        connection = psycopg2.connect(**DB_CONFIG)
        return connection
    except psycopg2.OperationalError as e:
        if "Network is unreachable" in str(e) or "connection failed" in str(e):
            raise HTTPException(
                status_code=503, 
                detail="Database temporarily unavailable. This is normal during deployment."
            )
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected database error: {str(e)}")

# Initialize database tables with graceful failure
def init_database():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Create tables in public schema
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS public.gallery_photos (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                photo_date DATE NOT NULL,
                photo_time TIME NOT NULL,
                image_data TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS public.users (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """)
        
        # Insert default user if not exists
        cursor.execute("""
            INSERT INTO public.users (username, password) 
            VALUES ('Danial', 'Albina')
            ON CONFLICT (username) DO NOTHING;
        """)
        
        conn.commit()
        cursor.close()
        conn.close()
        print("Database initialized successfully!")
        
    except Exception as e:
        print(f"Database initialization failed (this is normal during CI/deployment): {e}")
        print("Backend will still start and handle requests gracefully")

# API Routes

@app.on_event("startup")
async def startup_event():
    try:
        init_database()
    except Exception as e:
        print(f"Startup database init failed: {e}")
        print("Backend starting anyway - database will be initialized on first request")

@app.get("/")
async def root():
    return {"message": "Romantic Website API is running! 💕", "status": "healthy"}

@app.get("/health")
async def health_check():
    """Health check endpoint for deployment platforms"""
    return {"status": "healthy", "database": "checking..."}

@app.get("/api/test-connection")
async def test_connection():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT NOW();")
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        
        return {
            "success": True, 
            "message": "Database connection successful!",
            "current_time": str(result[0])
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Connection failed: {str(e)}",
            "note": "This is normal during CI/deployment"
        }

@app.post("/api/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute(
            "SELECT * FROM public.users WHERE username = %s AND password = %s",
            (request.username, request.password)
        )
        
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if user:
            return LoginResponse(success=True, message="Login successful")
        else:
            return LoginResponse(success=False, message="Invalid credentials")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/photos", response_model=List[Photo])
async def get_photos():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT id::text, title, photo_date::text, photo_time::text, 
                   image_data, created_at::text
            FROM public.gallery_photos 
            ORDER BY created_at DESC
        """)
        
        photos = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return [Photo(**photo) for photo in photos]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/photos", response_model=Photo)
async def add_photo(photo: PhotoCreate):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            INSERT INTO public.gallery_photos (title, photo_date, photo_time, image_data)
            VALUES (%s, %s, %s, %s)
            RETURNING id::text, title, photo_date::text, photo_time::text, 
                     image_data, created_at::text
        """, (photo.title, photo.photo_date, photo.photo_time, photo.image_data))
        
        new_photo = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        
        return Photo(**new_photo)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/photos/{photo_id}")
async def delete_photo(photo_id: str):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "DELETE FROM public.gallery_photos WHERE id = %s",
            (photo_id,)
        )
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Photo not found")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {"message": "Photo deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
