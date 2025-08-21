from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, JSON, Float, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    roll_number = Column(String(32), unique=True, nullable=True, index=True)
    first_name = Column(String(64), nullable=False)
    last_name = Column(String(64), nullable=False)
    email = Column(String(128), unique=True, nullable=False, index=True)
    hashed_password = Column(String(256), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Career(Base):
    __tablename__ = "careers"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(128), nullable=False)
    description = Column(Text, nullable=True)
    required_skills = Column(JSON, nullable=True)  # JSON array of skills
    programs = Column(JSON, nullable=True)  # JSON array of programs
    created_at = Column(DateTime, default=datetime.utcnow)


class InterviewResult(Base):
    __tablename__ = "interview_results"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, unique=True)
    technical_skills = Column(JSON, nullable=True)  # JSON array of technical skills
    soft_skills = Column(JSON, nullable=True)  # JSON array of soft skills
    learning_style = Column(Text, nullable=True)
    career_interests = Column(JSON, nullable=True)  # JSON array of career interests
    confidence_level = Column(String(32), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class StudentCareerRecommendation(Base):
    __tablename__ = "student_career_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    career_id = Column(Integer, ForeignKey("careers.id"), nullable=False, index=True)
    match_reason = Column(Text, nullable=True)
    confidence_score = Column(Float, nullable=True)
    learning_path = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("student_id", "career_id", name="uq_student_career_recommendation"),
    )


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, unique=True, index=True)
    data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
