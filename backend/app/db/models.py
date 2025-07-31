from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Float
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from sqlalchemy.orm import relationship

Base = declarative_base()

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    roll_number = Column(String(32), unique=True, nullable=False, index=True)
    name = Column(String(128), nullable=False)
    email = Column(String(128), unique=True, nullable=False, index=True)
    hashed_password = Column(String(256), nullable=False)
    hobbies = Column(Text, nullable=True)
    interests = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Program(Base):
    __tablename__ = "programs"

    id = Column(Integer, primary_key=True, index=True)
    degree_title = Column(String(128), nullable=False)
    university_name = Column(String(128), nullable=False)
    eligibility = Column(Text, nullable=True)
    location = Column(String(128), nullable=True)
    duration = Column(String(64), nullable=True)
    fee = Column(Float, nullable=True)

    admissions = relationship("Admission", back_populates="program")

class Career(Base):
    __tablename__ = "careers"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(128), nullable=False)
    description = Column(Text, nullable=True)
    required_skills = Column(Text, nullable=True)  # Comma-separated or JSON

class Admission(Base):
    __tablename__ = "admissions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    program_id = Column(Integer, ForeignKey("programs.id"), nullable=False)
    status = Column(String(32), default="pending")
    applied_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student")
    program = relationship("Program", back_populates="admissions") 

class InterviewResult(Base):
    __tablename__ = "interview_results"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, unique=True)
    technical_skills = Column(Text, nullable=True)  # JSON string
    soft_skills = Column(Text, nullable=True)  # JSON string
    learning_style = Column(Text, nullable=True)
    career_interests = Column(Text, nullable=True)  # JSON string
    confidence_level = Column(String(32), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("Student")
