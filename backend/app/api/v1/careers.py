from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from typing import List
from app.db.session import get_async_session
from app.db.models import Career, Student
from app.db.schemas import CareerCreate, CareerRead, CareerUpdate
from app.dependencies import get_current_user

router = APIRouter()

@router.post("/", response_model=CareerRead, status_code=status.HTTP_201_CREATED)
async def create_career(career: CareerCreate, session: AsyncSession = Depends(get_async_session)):
    # Create the career with JSON fields
    career_data = career.model_dump()
    db_career = Career(**career_data)
    session.add(db_career)
    await session.commit()
    await session.refresh(db_career)
    return db_career

@router.get("/{career_id}", response_model=CareerRead)
async def get_career(career_id: int, session: AsyncSession = Depends(get_async_session)):
    career = await session.get(Career, career_id)
    if not career:
        raise HTTPException(status_code=404, detail="Career not found")
    return career

@router.get("/", response_model=List[CareerRead])
async def list_careers(session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(Career))
    careers = result.scalars().all()
    return careers

@router.patch("/{career_id}", response_model=CareerRead)
async def update_career(career_id: int, update_data: CareerUpdate, session: AsyncSession = Depends(get_async_session)):
    career = await session.get(Career, career_id)
    
    if not career:
        raise HTTPException(status_code=404, detail="Career not found")
    
    # Update career fields
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(career, field, value)
    
    await session.commit()
    await session.refresh(career)
    return career

@router.get("/recommended/me", response_model=List[CareerRead])
async def get_my_recommended_careers(
    current_user: Student = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    """Get careers recommended for the current user by checking stored recommendations."""
    # For now, return all careers since we simplified the structure
    # In a production app, you'd store user-specific recommendations somehow
    result = await session.execute(select(Career))
    careers = result.scalars().all()
    return careers

@router.delete("/{career_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_career(career_id: int, session: AsyncSession = Depends(get_async_session)):
    career = await session.get(Career, career_id)
    if not career:
        raise HTTPException(status_code=404, detail="Career not found")
    
    await session.delete(career)
    await session.commit()
    return None
