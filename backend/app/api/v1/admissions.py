from fastapi import APIRouter, Depends, status, HTTPException
from datetime import datetime
from app.db.schemas import ApplicationFormData, ApplicationRead
from app.dependencies import get_current_user
from app.db.models import Student, Application
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_async_session
from sqlalchemy import select

router = APIRouter()

@router.get("/")
async def get_admissions_info():
    return {"message": "Admissions endpoints"}

@router.get("/me", response_model=ApplicationRead | dict)
async def get_my_admissions(
    current_user: Student = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    stmt = select(Application).where(Application.student_id == current_user.id)
    result = await session.execute(stmt)
    app_row = result.scalar_one_or_none()
    if not app_row:
        return {"has_application": False}
    return app_row

@router.post("/application-form", status_code=status.HTTP_201_CREATED)
async def submit_application_form(
    form_data: ApplicationFormData,
    current_user: Student = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    # Enforce one application per user
    exists_stmt = select(Application).where(Application.student_id == current_user.id)
    exists_result = await session.execute(exists_stmt)
    existing = exists_result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="You have already submitted an application")

    form_dict = form_data.model_dump(exclude_none=True)
    application = Application(student_id=current_user.id, data=form_dict)
    session.add(application)
    await session.commit()
    await session.refresh(application)

    return {"message": "Application form submitted successfully", "application_id": application.id}
