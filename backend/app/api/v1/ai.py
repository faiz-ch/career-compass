# backend/app/api/v1/ai.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_async_session
from app.dependencies import get_current_user
from app.db.models import Student, InterviewResult
from app.db.schemas import InterviewResultRead
from app.services.llm import llm_service
from pydantic import BaseModel
from typing import List, Dict, Any
import json

router = APIRouter()

class InterviewRequest(BaseModel):
    interests: str

class InterviewResponse(BaseModel):
    questions: List[str]

class SkillAnalysisRequest(BaseModel):
    interests: str
    responses: List[str]

class SkillAnalysisResponse(BaseModel):
    technical_skills: List[str]
    soft_skills: List[str]
    learning_style: str
    career_interests: List[str]
    confidence_level: str

class DynamicInterviewRequest(BaseModel):
    interests: str
    previous_questions: List[str] = []
    previous_responses: List[str] = []
    current_question_number: int = 1

class DynamicInterviewResponse(BaseModel):
    question: str
    is_final_question: bool

@router.post("/interview/questions", response_model=InterviewResponse)
async def generate_interview_questions(
    request: InterviewRequest,
    current_user: Student = Depends(get_current_user)
):
    """Generate AI-driven interview questions based on student interests."""
    try:
        questions = await llm_service.generate_interview_questions(request.interests)
        return InterviewResponse(questions=questions)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate questions: {str(e)}"
        )

@router.post("/interview/analyze", response_model=SkillAnalysisResponse)
async def analyze_interview_responses(
    request: SkillAnalysisRequest,
    current_user: Student = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    """Analyze interview responses and infer skills."""
    try:
        analysis = await llm_service.infer_skills_from_responses(
            request.interests,
            request.responses
        )
        
        # Save the result to database
        await llm_service.save_interview_result(session, current_user.id, analysis)
        
        return SkillAnalysisResponse(**analysis)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze interview: {str(e)}"
        )

@router.post("/interview/dynamic/start", response_model=DynamicInterviewResponse)
async def start_dynamic_interview(
    request: InterviewRequest,
    current_user: Student = Depends(get_current_user)
):
    """Start a dynamic interview with the first question."""
    try:
        result = await llm_service.generate_initial_question(request.interests)
        return DynamicInterviewResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start interview: {str(e)}"
        )

@router.post("/interview/dynamic/next", response_model=DynamicInterviewResponse)
async def get_next_dynamic_question(
    request: DynamicInterviewRequest,
    current_user: Student = Depends(get_current_user)
):
    """Get the next question based on previous responses."""
    try:
        result = await llm_service.generate_dynamic_question(
            request.interests,
            request.previous_questions,
            request.previous_responses,
            request.current_question_number
        )
        return DynamicInterviewResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate next question: {str(e)}"
        )

@router.get("/interview/result", response_model=InterviewResultRead)
async def get_interview_result(
    current_user: Student = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    """Get the saved interview result for the current user."""
    try:
        result = await session.execute(
            select(InterviewResult).where(InterviewResult.student_id == current_user.id)
        )
        interview_result = result.scalar_one_or_none()
        
        if not interview_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No interview result found"
            )
        
        # Convert JSON strings back to lists
        return InterviewResultRead(
            id=interview_result.id,
            student_id=interview_result.student_id,
            technical_skills=json.loads(interview_result.technical_skills),
            soft_skills=json.loads(interview_result.soft_skills),
            learning_style=interview_result.learning_style,
            career_interests=json.loads(interview_result.career_interests),
            confidence_level=interview_result.confidence_level,
            created_at=interview_result.created_at,
            updated_at=interview_result.updated_at
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve interview result: {str(e)}"
        )
