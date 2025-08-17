import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.db.models import Base, StudentCareer
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

async def add_student_career_table():
    """Add the new student_careers table without affecting existing data."""
    engine = create_async_engine(DATABASE_URL, echo=True)
    
    print("🔄 Starting safe database migration to add student_careers table...")
    
    async with engine.begin() as conn:
        # Check if the table already exists
        result = await conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = 'student_careers'
        """))
        
        existing_table = result.fetchone()
        
        if existing_table:
            print("⚠️ student_careers table already exists. Skipping creation.")
        else:
            print("📥 Creating student_careers table...")
            
            # Create only the StudentCareer table
            await conn.run_sync(StudentCareer.__table__.create)
            
            print("✅ student_careers table created successfully!")
    
    await engine.dispose()
    print("✅ Safe migration completed!")
    print("\n📋 New table schema:")
    print("   - student_careers table: id, student_id, career_id, assigned_at, status, notes")
    print("   - Includes unique constraint on (student_id, career_id)")
    print("\n💡 Usage:")
    print("   - Use this table to assign specific careers to students")
    print("   - Existing student_career_recommendations table still handles AI recommendations")
    print("   - The new relationship allows: student.assigned_careers and career.student_assignments")

if __name__ == "__main__":
    asyncio.run(add_student_career_table())
