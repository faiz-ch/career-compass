import json
import asyncio
from typing import Any, Dict, List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.db.models import Program


async def load_programs_from_json(json_file: str = "app/db/programs_with_universities.json") -> None:
    """Load programs and their universities from JSON into the programs table.

    JSON format expected:
    [
      { "program": "Accounting", "universities": [ { ... }, ... ] },
      ...
    ]
    """
    print("🔄 Loading programs from:", json_file)

    with open(json_file, "r", encoding="utf-8") as f:
        data: List[Dict[str, Any]] = json.load(f)

    total = len(data)
    print(f"✅ Read {total} records from JSON")

    async for db_session in get_async_session():
        if not isinstance(db_session, AsyncSession):
            raise TypeError("db_session must be an instance of AsyncSession")

        inserted = 0
        updated = 0

        for idx, item in enumerate(data, start=1):
            program_name = item.get("program")
            universities = item.get("universities", [])

            if not isinstance(program_name, str) or not program_name.strip():
                print(f"⚠️  Skipping record {idx}: invalid program name")
                continue

            # Only store the universities array under 'universities' key
            payload: Dict[str, Any] = {"universities": universities if isinstance(universities, list) else []}

            # Upsert: update if exists, else insert
            existing_stmt = select(Program).where(Program.name == program_name)
            result = await db_session.execute(existing_stmt)
            existing: Program | None = result.scalar_one_or_none()

            if existing:
                existing.data = payload
                updated += 1
            else:
                db_session.add(Program(name=program_name, data=payload))
                inserted += 1

            if idx % 100 == 0 or idx == total:
                print(f"📦 Processing {idx}/{total} ... (inserted: {inserted}, updated: {updated})")

        try:
            await db_session.commit()
            print(f"💾 Done. Inserted: {inserted}, Updated: {updated}")
        except Exception as e:
            await db_session.rollback()
            print(f"❌ Error during commit: {e}")
        finally:
            await db_session.close()
            print("🔒 Database session closed.")


if __name__ == "__main__":
    asyncio.run(load_programs_from_json())


