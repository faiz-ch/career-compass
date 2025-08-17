import asyncio
import asyncpg
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env')

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

async def fix_roll_number_constraint():
    """Make roll_number column nullable."""
    
    # Parse the DATABASE_URL to get connection info
    # postgresql+asyncpg://career-user:User123@localhost:5432/career-compass-db
    # becomes postgresql://career-user:User123@localhost:5432/career-compass-db
    db_url = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
    
    try:
        conn = await asyncpg.connect(db_url)
        
        print("Connected to database...")
        
        # Check current constraint
        result = await conn.fetch("""
            SELECT column_name, is_nullable, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'students' AND column_name = 'roll_number';
        """)
        
        print(f"Current roll_number column info: {result}")
        
        if result and result[0]['is_nullable'] == 'NO':
            print("Making roll_number column nullable...")
            await conn.execute("ALTER TABLE students ALTER COLUMN roll_number DROP NOT NULL;")
            print("✅ Successfully made roll_number column nullable!")
        else:
            print("✅ roll_number column is already nullable!")
            
        await conn.close()
        
    except Exception as e:
        print(f"❌ Error fixing roll_number constraint: {e}")

if __name__ == "__main__":
    asyncio.run(fix_roll_number_constraint())
