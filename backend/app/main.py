from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import create_async_engine
from app.db.models import Base
from app.db.session import DATABASE_URL
import asyncio

app = FastAPI(title="Career Compass API", version="1.0.0")

# CORS setup - Allow all origins for development
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"  # Allow all origins for development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],  # Expose all headers
)

async def create_tables():
    """Create database tables if they don't exist."""
    try:
        engine = create_async_engine(DATABASE_URL, echo=True)
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        await engine.dispose()
        print("✅ Database tables created/verified successfully!")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")

@app.on_event("startup")
async def startup_event():
    """Run startup tasks."""
    print("🚀 Starting Career Compass Backend API...")
    await create_tables()
    print("✅ Backend startup completed successfully!")

# Import and include routers
from app.api.v1 import auth
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
from app.api.v1 import students
app.include_router(students.router, prefix="/api/v1/students", tags=["students"])
from app.api.v1 import programs
app.include_router(programs.router, prefix="/api/v1/programs", tags=["programs"])
from app.api.v1 import careers
app.include_router(careers.router, prefix="/api/v1/careers", tags=["careers"])
from app.api.v1 import admissions
app.include_router(admissions.router, prefix="/api/v1/admissions", tags=["admissions"])
from app.api.v1 import ai
app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"])
from app.api.v1 import scraper
app.include_router(scraper.router, prefix="/api/v1/scraper", tags=["scraper"])
from app.api.v1 import applications
app.include_router(applications.router, prefix="/api/v1/applications", tags=["applications"])
from app.api.v1 import admin
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])

@app.get("/")
def root():
    return {"message": "Career Compass Backend API"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Backend server is running"}

@app.options("/{full_path:path}")
def options_handler(request: Request, full_path: str):
    """Handle OPTIONS requests for CORS preflight"""
    return JSONResponse(
        content={"message": "CORS preflight handled"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Credentials": "true",
        }
    )
