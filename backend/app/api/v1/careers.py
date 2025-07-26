from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from typing import List
from app.db.session import get_async_session
from app.db.models import Career
from app.db.schemas import CareerCreate, CareerRead

router = APIRouter()

@router.post("/", response_model=CareerRead, status_code=status.HTTP_201_CREATED)
async def create_career(career: CareerCreate, session: AsyncSession = Depends(get_async_session)):
    db_career = Career(**career.dict())
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
async def update_career(career_id: int, update_data: CareerCreate, session: AsyncSession = Depends(get_async_session)):
    stmt = (
        update(Career)
        .where(Career.id == career_id)
        .values(**update_data.dict())
        .execution_options(synchronize_session="fetch")
    )
    result = await session.execute(stmt)
    await session.commit()
    career = await session.get(Career, career_id)
    if not career:
        raise HTTPException(status_code=404, detail="Career not found")
    return career

@router.delete("/{career_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_career(career_id: int, session: AsyncSession = Depends(get_async_session)):
    stmt = delete(Career).where(Career.id == career_id)
    result = await session.execute(stmt)
    await session.commit()
    return None 