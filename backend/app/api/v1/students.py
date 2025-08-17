from fastapi import APIRouter, Depends, HTTPException, status
from app.db.schemas import StudentRead
from app.db.models import Student
from app.dependencies import get_current_user
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update
from app.db.session import get_async_session
from typing import List
from sqlalchemy import select

router = APIRouter()

@router.get("/me", response_model=StudentRead)
async def get_my_profile(current_user: Student = Depends(get_current_user)):
    """Get the current authenticated student's profile."""
    return current_user

@router.patch("/me", response_model=StudentRead)
async def update_my_profile(
    update_data: dict,
    current_user: Student = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    """Update the current authenticated student's profile."""
    # Only update fields that exist in the simplified Student model
    allowed_fields = {'first_name', 'last_name', 'email', 'roll_number'}
    update_values = {k: v for k, v in update_data.items() if k in allowed_fields and v is not None}
    
    if not update_values:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    stmt = (
        update(Student)
        .where(Student.id == current_user.id)
        .values(**update_values)
        .execution_options(synchronize_session="fetch")
    )
    await session.execute(stmt)
    await session.commit()
    # Refresh and return updated user
    await session.refresh(current_user)
    return current_user

@router.get("/{student_id}", response_model=StudentRead)
async def get_student_by_id(student_id: int, session: AsyncSession = Depends(get_async_session)):
    """Get a student by ID (admin/future use)."""
    student = await session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.get("/", response_model=List[StudentRead])
async def list_students(session: AsyncSession = Depends(get_async_session)):
    """List all students (admin/future use)."""
    result = await session.execute(select(Student))
    students = result.scalars().all()
    return students

@router.get("/me/info")
async def get_my_info(
    current_user: Student = Depends(get_current_user)
):
    """Get additional info about the current student in the simplified system."""
    return {
        "message": "Career assignments are now handled through AI recommendations",
        "student_id": current_user.id,
        "note": "Use the AI interview system to get career recommendations",
        "available_endpoints": {
            "ai_interview": "/api/v1/ai/interview/",
            "career_recommendations": "/api/v1/careers/recommended/me"
        }
    }
