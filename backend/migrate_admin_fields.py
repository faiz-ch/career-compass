import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.db.models import Base
import os

async def migrate_admin_fields():
    """Add admin fields to existing database"""
    # Get database URL from environment
    database_url = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./career_compass.db")
    
    # Create engine
    engine = create_async_engine(database_url, echo=True)
    
    try:
        # Create tables (this will add new columns if they don't exist)
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        print("✅ Admin fields added to database successfully!")
        
    except Exception as e:
        print(f"❌ Error adding admin fields: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate_admin_fields())
