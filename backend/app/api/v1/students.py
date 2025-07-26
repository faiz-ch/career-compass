from fastapi import APIRouter, Depends, HTTPException, status
from app.db.schemas import StudentRead, StudentBase
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
    update_data: StudentBase,
    current_user: Student = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    """Update the current authenticated student's profile."""
    stmt = (
        update(Student)
        .where(Student.id == current_user.id)
        .values(
            name=update_data.name,
            hobbies=update_data.hobbies,
            interests=update_data.interests
        )
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