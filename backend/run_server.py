#!/usr/bin/env python3
"""
Career Compass Backend Server
Run this script to start the FastAPI server with proper CORS configuration
"""

import uvicorn
import os
from pathlib import Path

def main():
    """Start the FastAPI server with optimal settings"""
    
    # Get the directory where this script is located
    current_dir = Path(__file__).parent
    
    # Change to the backend directory
    os.chdir(current_dir)
    
    print("🚀 Starting Career Compass Backend Server...")
    print("📍 Server will be available at: http://localhost:8000")
    print("📚 API documentation at: http://localhost:8000/docs")
    print("🌍 CORS enabled for frontend at: http://localhost:5173")
    print("-" * 50)
    
    # Start the server with proper configuration
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",  # Allow external connections
        port=8000,
        reload=True,     # Enable auto-reload on file changes
        log_level="info",
        access_log=True,
        # Additional CORS-friendly settings
        headers=[
            ("Access-Control-Allow-Origin", "*"),
            ("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS"),
            ("Access-Control-Allow-Headers", "*"),
        ]
    )

if __name__ == "__main__":
    main()
