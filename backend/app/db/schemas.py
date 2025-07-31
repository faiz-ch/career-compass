from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime

class StudentBase(BaseModel):
    roll_number: str
    name: str
    email: EmailStr
    hobbies: Optional[str] = None
    interests: Optional[str] = None

class StudentCreate(StudentBase):
    password: str

class StudentRead(StudentBase):
    id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class ProgramBase(BaseModel):
    degree_title: str
    university_name: str
    eligibility: Optional[str] = None
    location: Optional[str] = None
    duration: Optional[str] = None
    fee: Optional[float] = None

class ProgramCreate(ProgramBase):
    pass

class ProgramRead(ProgramBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class CareerBase(BaseModel):
    title: str
    description: Optional[str] = None
    required_skills: Optional[str] = None

class CareerCreate(CareerBase):
    pass

class CareerRead(CareerBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class AdmissionBase(BaseModel):
    student_id: int
    program_id: int
    status: Optional[str] = "pending"

class AdmissionCreate(AdmissionBase):
    pass

class AdmissionRead(AdmissionBase):
    id: int
    applied_at: datetime
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class InterviewResultBase(BaseModel):
    technical_skills: List[str]
    soft_skills: List[str]
    learning_style: str
    career_interests: List[str]
    confidence_level: str

class InterviewResultCreate(InterviewResultBase):
    pass

class InterviewResultRead(InterviewResultBase):
    id: int
    student_id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
