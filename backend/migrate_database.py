import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.db.models import Base
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

async def migrate_database():
    """Drop existing tables and recreate with new schema."""
    engine = create_async_engine(DATABASE_URL, echo=True)
    
    print("🔄 Starting database migration...")
    
    async with engine.begin() as conn:
        print("📤 Dropping existing tables...")
        await conn.run_sync(Base.metadata.drop_all)
        
        print("📥 Creating new tables with updated schema...")
        await conn.run_sync(Base.metadata.create_all)
    
    await engine.dispose()
    print("✅ Database migration completed successfully!")
    print("\n📋 New schema summary:")
    print("   - Programs table: id, title, duration, eligibility")
    print("   - Careers table: id, title, description, required_skills")
    print("   - career_programs table: many-to-many relationship between careers and programs")
    print("   - student_careers table: one-to-many relationship between students and careers")
    print("   - student_career_recommendations table: many-to-many recommendations relationship")

if __name__ == "__main__":
    asyncio.run(migrate_database())
