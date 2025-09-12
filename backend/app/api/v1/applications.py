from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import httpx

from app.db.session import get_async_session
from app.db.models import Application, Student
from app.dependencies import get_current_user

router = APIRouter()

@router.get("/forward")
async def forward_application(
    current_user: Student = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    """Forward current student's application to external API"""
    # Get user's application
    stmt = select(Application).where(Application.student_id == current_user.id)
    result = await session.execute(stmt)
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(status_code=404, detail="No application found")
    
    # Send to external API
    async with httpx.AsyncClient() as client:
        response = await client.post("http://localhost:8001/applications", json=application.data)
    
    if response.status_code not in [200, 201]:
        raise HTTPException(status_code=502, detail="External API error")
    
    return {"message": "Application forwarded successfully", "status": "success"}