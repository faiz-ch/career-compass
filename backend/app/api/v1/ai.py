# backend/app/api/v1/ai.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_async_session
from app.dependencies import get_current_user
from app.db.models import Student
from app.services.llm import llm_service
from pydantic import BaseModel
from typing import List, Dict, Any

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

class ProgramRankingRequest(BaseModel):
    career: str
    programs: List[Dict[str, Any]]
    student_skills: Dict[str, Any]

class ProgramRankingResponse(BaseModel):
    ranked_programs: List[Dict[str, Any]]

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
    current_user: Student = Depends(get_current_user)
):
    """Analyze interview responses and infer skills."""
    try:
        analysis = await llm_service.infer_skills_from_responses(
            request.interests, 
            request.responses
        )
        return SkillAnalysisResponse(**analysis)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze responses: {str(e)}"
        )

@router.post("/programs/rank", response_model=ProgramRankingResponse)
async def rank_programs_for_career(
    request: ProgramRankingRequest,
    current_user: Student = Depends(get_current_user)
):
    """Rank university programs based on career and student skills."""
    try:
        ranked_programs = await llm_service.rank_programs_for_career(
            request.career,
            request.programs,
            request.student_skills
        )
        return ProgramRankingResponse(ranked_programs=ranked_programs)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to rank programs: {str(e)}"
        )