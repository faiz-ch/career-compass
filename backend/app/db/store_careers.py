import json
import asyncio
from models import Career
from session import get_async_session
from sqlalchemy.ext.asyncio import AsyncSession


async def load_careers_from_json(json_file="app/db/career.json"):
    print("🔄 Starting to load careers from JSON...")

    # Load JSON
    with open(json_file, "r") as f:
        data = json.load(f)
    print(f"✅ Loaded {len(data)} careers from {json_file}")

    # Open async session
    async for db_session in get_async_session():
        if not isinstance(db_session, AsyncSession):
            raise TypeError("db_session must be an instance of AsyncSession")

        for idx, item in enumerate(data, start=1):
            print(f"📌 Processing career {idx}: {item.get('title')}")
            career = Career(
                title=item.get("title"),
                description=item.get("description"),
                required_skills=item.get("required_skills", []),
                programs=item.get("programs", [])
            )

          
            db_session.add(career)

        try:
            await db_session.commit()
            print("💾 All careers committed to the database successfully!")
        except Exception as e:
            await db_session.rollback()
            print(f"❌ Error while committing: {e}")
        finally:
            await db_session.close()
            print("🔒 Database session closed.")


if __name__ == "__main__":
    asyncio.run(load_careers_from_json())
