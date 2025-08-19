from fastapi import APIRouter, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any
from app.db.session import get_async_session
from app.db.models import Career
from fastapi import Depends

router = APIRouter()

@router.get("/")
async def get_programs_info():
    """Info endpoint about program management in the simplified system."""
    return {
        "message": "Programs are now managed as JSON data within Career objects",
        "info": "To manage programs, use the /careers endpoints and include programs in the JSON field",
        "endpoints": {
            "list_all_programs": "GET /api/v1/programs/all",
            "careers_endpoint": "GET /api/v1/careers/"
        }
    }

@router.get("/all")
async def get_all_programs_from_careers(session: AsyncSession = Depends(get_async_session)):
    """Get all programs from all careers (flattened view)."""
    result = await session.execute(select(Career))
    careers = result.scalars().all()
    
    all_programs = []
    for career in careers:
        if career.programs:  # If career has programs JSON
            for program in career.programs:
                program_with_career = {
                    **program,
                    "career_id": career.id,
                    "career_title": career.title
                }
                all_programs.append(program_with_career)
    
    return {
        "programs": all_programs,
        "total_count": len(all_programs),
        "message": "Programs extracted from all careers"
    }
