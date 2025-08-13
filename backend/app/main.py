from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import create_async_engine
from app.db.models import Base
from app.db.session import DATABASE_URL
import asyncio

app = FastAPI()

# CORS setup (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    await create_tables()

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

@app.get("/")
def root():
    return {"message": "Career Compass Backend API"} 
