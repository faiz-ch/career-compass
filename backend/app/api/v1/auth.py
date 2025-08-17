from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_async_session
from app.db.models import Student
from app.db.schemas import StudentCreate, StudentRead, Token, UserLogin
from app.core.security import get_password_hash, verify_password, create_access_token
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/register", response_model=StudentRead, status_code=status.HTTP_201_CREATED)
async def register(
    student: StudentCreate,
    session: AsyncSession = Depends(get_async_session)
):
    """Register a new student."""
    try:
        # Check if student already exists by email
        result = await session.execute(
            select(Student).where(Student.email == student.email)
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new student with hashed password
        hashed_password = get_password_hash(student.password)
        db_student = Student(
            first_name=student.first_name,
            last_name=student.last_name,
            email=student.email,
            roll_number=student.roll_number,  # Optional, can be None
            hashed_password=hashed_password
        )
        
        session.add(db_student)
        await session.commit()
        await session.refresh(db_student)
        
        logger.info(f"New student registered: {student.email}")
        
        # Return the student data directly since our model now matches the schema
        return db_student
        
    except HTTPException:
        await session.rollback()
        raise
    except Exception as e:
        await session.rollback()
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed. Please try again."
        )

@router.post("/login", response_model=Token)
async def login(
    user_credentials: UserLogin,
    session: AsyncSession = Depends(get_async_session)
):
    """Login and return JWT token."""
    try:
        # Find student by email
        result = await session.execute(
            select(Student).where(Student.email == user_credentials.email)
        )
        student = result.scalar_one_or_none()
        
        if not student or not verify_password(user_credentials.password, student.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create access token
        access_token = create_access_token(data={"sub": str(student.id)})
        
        logger.info(f"Student logged in: {student.email}")
        return {"access_token": access_token, "token_type": "bearer"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed. Please try again."
        ) 