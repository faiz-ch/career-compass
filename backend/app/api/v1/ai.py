# backend/app/api/v1/ai.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.db.session import get_async_session
from app.dependencies import get_current_user
from app.db.models import Student, InterviewResult, Career, StudentCareerRecommendation
from app.db.schemas import InterviewResultRead
from app.services.llm import llm_service
from app.services.career_recommendation import career_recommendation_service
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

class CareerRecommendationRequest(BaseModel):
    interview_analysis: Dict[str, Any]

class CareerRecommendationResponse(BaseModel):
    recommended_careers: List[Dict[str, Any]]

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

@router.post("/career/recommendations", response_model=CareerRecommendationResponse)
async def get_career_recommendations(
    request: CareerRecommendationRequest,
    current_user: Student = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    """Get career recommendations based on interview analysis."""
    try:
        # Save interview results to database
        await llm_service.save_interview_result(
            session, 
            current_user.id, 
            request.interview_analysis
        )
        
        # Get career recommendations
        recommended_careers = await career_recommendation_service.get_career_recommendations(
            request.interview_analysis
        )
        
        # Store career recommendations in the database (idempotent upsert)
        await store_career_recommendations(session, current_user.id, recommended_careers)
        
        return CareerRecommendationResponse(recommended_careers=recommended_careers)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get career recommendations: {str(e)}"
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
        
        # Return interview result with JSON fields
        return InterviewResultRead(
            id=interview_result.id,
            student_id=interview_result.student_id,
            technical_skills=interview_result.technical_skills or [],
            soft_skills=interview_result.soft_skills or [],
            learning_style=interview_result.learning_style,
            career_interests=interview_result.career_interests or [],
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


async def store_career_recommendations(
    session: AsyncSession, 
    student_id: int, 
    recommended_careers: List[Dict[str, Any]]
):
    """Store career recommendations in the database and link to the student.

    This ensures stable, repeatable recommendations by caching them per student.
    """
    try:
        # First, clear any existing recommendations for this student to override old ones
        await session.execute(
            delete(StudentCareerRecommendation).where(
                StudentCareerRecommendation.student_id == student_id
            )
        )
        await session.flush()

        for career_data in recommended_careers:
            career_title = career_data.get('title', '') or ''
            # Skip invalid entries without a valid title
            if not isinstance(career_title, str) or not career_title.strip():
                continue
            career_description = career_data.get('description', '') or ''
            required_skills = career_data.get('required_skills', []) or []
            programs = career_data.get('programs', []) or []
            match_reason = career_data.get('match_reason', '') or ''
            confidence_score = career_data.get('confidence_score', 0.0) or 0.0
            learning_path = career_data.get('learning_path', '') or ''

            # Find or create Career by exact title
            career_stmt = select(Career).where(Career.title == career_title)
            career_result = await session.execute(career_stmt)
            career = career_result.scalar_one_or_none()

            if not career:
                career = Career(
                    title=career_title,
                    description=career_description,
                    required_skills=required_skills if isinstance(required_skills, list) else [required_skills] if required_skills else [],
                    programs=programs if isinstance(programs, list) else []
                )
                session.add(career)
                # Ensure career.id is available for FK references
                await session.flush()
                await session.flush()

            # Create StudentCareerRecommendation link
            rec = StudentCareerRecommendation(
                student_id=student_id,
                career_id=career.id,
                match_reason=match_reason,
                confidence_score=confidence_score,
                learning_path=learning_path,
            )
            session.add(rec)

        await session.commit()
        print(f"Successfully stored/updated {len(recommended_careers)} career recommendations for student {student_id}")
        
    except Exception as e:
        await session.rollback()
        print(f"Error storing career recommendations: {str(e)}")
        raise
