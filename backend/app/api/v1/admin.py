from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func, and_
from typing import List
from datetime import datetime
from app.db.session import get_async_session
from app.db.models import Student, Career, Program, Application, InterviewResult
from app.db.schemas import StudentRead, CareerRead, AdminLogin, Token, UserStats, AdminCreate
from app.core.security import create_access_token, verify_password, get_password_hash
from app.dependencies import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Simple admin check function
def check_admin(current_user: Student = Depends(get_current_user)):
    if current_user.is_admin != "yes":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

def check_super_admin(current_user: Student = Depends(get_current_user)):
    if current_user.admin_level != "super_admin":
        raise HTTPException(status_code=403, detail="Super admin access required")
    return current_user

# ==================== ADMIN REGISTRATION ====================
@router.post("/register", response_model=StudentRead)
async def register_admin(
    admin_data: AdminCreate,
    current_admin: Student = Depends(check_super_admin),  # Only super admin can create new admins
    session: AsyncSession = Depends(get_async_session)
):
    """Register a new admin (only super admin can do this)"""
    try:
        # Check if email already exists
        result = await session.execute(
            select(Student).where(Student.email == admin_data.email)
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )
        
        # Create new admin
        hashed_password = get_password_hash(admin_data.password)
        new_admin = Student(
            first_name=admin_data.first_name,
            last_name=admin_data.last_name,
            email=admin_data.email,
            hashed_password=hashed_password,
            is_admin="yes",
            admin_level=admin_data.admin_level
        )
        
        session.add(new_admin)
        await session.commit()
        await session.refresh(new_admin)
        
        logger.info(f"New admin registered: {admin_data.email}")
        return new_admin
        
    except HTTPException:
        await session.rollback()
        raise
    except Exception as e:
        await session.rollback()
        logger.error(f"Admin registration error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Admin registration failed"
        )

# ==================== ADMIN LOGIN ====================
@router.post("/login", response_model=Token)
async def admin_login(
    admin_credentials: AdminLogin,
    session: AsyncSession = Depends(get_async_session)
):
    """Admin login"""
    # Find user by email
    result = await session.execute(
        select(Student).where(Student.email == admin_credentials.email)
    )
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(admin_credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if user.is_admin != "yes":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Create token
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

# ==================== USER MANAGEMENT ====================
@router.get("/users", response_model=List[StudentRead])
async def get_all_users(
    current_admin: Student = Depends(check_admin),
    session: AsyncSession = Depends(get_async_session)
):
    """Get all students (not admins)"""
    result = await session.execute(
        select(Student).where(Student.is_admin == "no")
    )
    students = result.scalars().all()
    return students

@router.get("/users/stats", response_model=UserStats)
async def get_user_stats(
    current_admin: Student = Depends(check_admin),
    session: AsyncSession = Depends(get_async_session)
):
    """Get user statistics"""
    # Total users
    total_result = await session.execute(
        select(func.count(Student.id)).where(Student.is_admin == "no")
    )
    total_users = total_result.scalar()
    
    # New users today
    today = datetime.utcnow().date()
    today_result = await session.execute(
        select(func.count(Student.id)).where(
            and_(
                func.date(Student.created_at) == today,
                Student.is_admin == "no"
            )
        )
    )
    new_users_today = today_result.scalar()
    
    return UserStats(
        total_users=total_users,
        new_users_today=new_users_today
    )

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    current_admin: Student = Depends(check_admin),
    session: AsyncSession = Depends(get_async_session)
):
    """Delete a user"""
    # Find user
    result = await session.execute(
        select(Student).where(Student.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete related data first
    await session.execute(
        delete(InterviewResult).where(InterviewResult.student_id == user_id)
    )
    await session.execute(
        delete(Application).where(Application.student_id == user_id)
    )
    
    # Delete user
    await session.delete(user)
    await session.commit()
    
    return {"message": "User deleted successfully"}

# ==================== CAREER MANAGEMENT ====================
@router.get("/careers", response_model=List[CareerRead])
async def get_all_careers(
    current_admin: Student = Depends(check_admin),
    session: AsyncSession = Depends(get_async_session)
):
    """Get all careers"""
    result = await session.execute(select(Career))
    careers = result.scalars().all()
    return careers

@router.delete("/careers/{career_id}")
async def delete_career(
    career_id: int,
    current_admin: Student = Depends(check_admin),
    session: AsyncSession = Depends(get_async_session)
):
    """Delete a career"""
    result = await session.execute(
        select(Career).where(Career.id == career_id)
    )
    career = result.scalar_one_or_none()
    
    if not career:
        raise HTTPException(status_code=404, detail="Career not found")
    
    await session.delete(career)
    await session.commit()
    
    return {"message": "Career deleted successfully"}

# ==================== PROGRAM MANAGEMENT ====================
@router.get("/programs", response_model=List[dict])
async def get_all_programs(
    current_admin: Student = Depends(check_admin),
    session: AsyncSession = Depends(get_async_session)
):
    """Get all programs"""
    result = await session.execute(select(Program))
    programs = result.scalars().all()
    
    # Convert to dict format for frontend
    program_list = []
    for program in programs:
        program_list.append({
            "id": program.id,
            "name": program.name,
            "data": program.data,
            "created_at": program.created_at
        })
    
    return program_list

@router.delete("/programs/{program_id}")
async def delete_program(
    program_id: int,
    current_admin: Student = Depends(check_admin),
    session: AsyncSession = Depends(get_async_session)
):
    """Delete a program"""
    result = await session.execute(
        select(Program).where(Program.id == program_id)
    )
    program = result.scalar_one_or_none()
    
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    
    await session.delete(program)
    await session.commit()
    
    return {"message": "Program deleted successfully"}
