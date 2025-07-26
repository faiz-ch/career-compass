from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from typing import List
from app.db.session import get_async_session
from app.db.models import Admission
from app.db.schemas import AdmissionCreate, AdmissionRead
from app.dependencies import get_current_user
from app.db.models import Student

router = APIRouter()

@router.post("/", response_model=AdmissionRead, status_code=status.HTTP_201_CREATED)
async def apply_for_admission(
    admission: AdmissionCreate,
    current_user: Student = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    # Only allow the current user to apply for themselves
    if admission.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot apply for another student.")
    db_admission = Admission(**admission.dict())
    session.add(db_admission)
    await session.commit()
    await session.refresh(db_admission)
    return db_admission

@router.get("/me", response_model=List[AdmissionRead])
async def list_my_admissions(
    current_user: Student = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    result = await session.execute(select(Admission).where(Admission.student_id == current_user.id))
    admissions = result.scalars().all()
    return admissions

@router.get("/{admission_id}", response_model=AdmissionRead)
async def get_admission_by_id(
    admission_id: int,
    current_user: Student = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    admission = await session.get(Admission, admission_id)
    if not admission:
        raise HTTPException(status_code=404, detail="Admission not found")
    if admission.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this admission.")
    return admission

@router.patch("/{admission_id}", response_model=AdmissionRead)
async def update_admission_status(
    admission_id: int,
    status_update: dict,
    session: AsyncSession = Depends(get_async_session)
):
    # For admin/future use: update status
    stmt = (
        update(Admission)
        .where(Admission.id == admission_id)
        .values(**status_update)
        .execution_options(synchronize_session="fetch")
    )
    await session.execute(stmt)
    await session.commit()
    admission = await session.get(Admission, admission_id)
    if not admission:
        raise HTTPException(status_code=404, detail="Admission not found")
    return admission

@router.delete("/{admission_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_admission(
    admission_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    stmt = delete(Admission).where(Admission.id == admission_id)
    await session.execute(stmt)
    await session.commit()
    return None 