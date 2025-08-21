from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List, Any, Dict
from datetime import datetime

class StudentBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    roll_number: Optional[str] = None

class StudentCreate(StudentBase):
    password: str

class StudentRead(StudentBase):
    id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Program schema for JSON storage in Career (simplified to only title)
class Program(BaseModel):
    title: str

# Career schemas with programs as JSON
class CareerBase(BaseModel):
    title: str
    description: Optional[str] = None
    required_skills: Optional[List[str]] = None
    programs: Optional[List[str]] = None  # List of program titles

class CareerCreate(CareerBase):
    pass

class CareerUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[List[str]] = None
    programs: Optional[List[str]] = None  # List of program titles

class CareerRead(CareerBase):
    id: int
    created_at: datetime
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
    learning_style: str  # Now supports longer text (Text field in database)
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


class ApplicationFormData(BaseModel):
    # Personal Information
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    fatherName: Optional[str] = None
    cnic: Optional[str] = None
    dateOfBirth: Optional[str] = None
    gender: Optional[str] = None
    religion: Optional[str] = None
    nationality: Optional[str] = None
    maritalStatus: Optional[str] = None
    bloodGroup: Optional[str] = None
    
    # Contact Information
    email: Optional[str] = None
    phoneNumber: Optional[str] = None
    whatsappNumber: Optional[str] = None
    permanentAddress: Optional[str] = None
    mailingAddress: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    postalCode: Optional[str] = None
    
    # Family Information
    fatherOccupation: Optional[str] = None
    fatherIncome: Optional[str] = None
    motherName: Optional[str] = None
    motherOccupation: Optional[str] = None
    guardianName: Optional[str] = None
    guardianRelation: Optional[str] = None
    guardianContact: Optional[str] = None
    
    # Academic Information - Matric/O-Levels
    matricBoard: Optional[str] = None
    matricYear: Optional[str] = None
    matricRollNumber: Optional[str] = None
    matricTotalMarks: Optional[str] = None
    matricObtainedMarks: Optional[str] = None
    matricPercentage: Optional[str] = None
    matricSubjects: Optional[str] = None
    
    # Academic Information - Inter/A-Levels
    interBoard: Optional[str] = None
    interYear: Optional[str] = None
    interRollNumber: Optional[str] = None
    interTotalMarks: Optional[str] = None
    interObtainedMarks: Optional[str] = None
    interPercentage: Optional[str] = None
    interSubjects: Optional[str] = None
    interGroup: Optional[str] = None
    
    # Program Preferences
    preferredProgram1: Optional[str] = None
    preferredProgram2: Optional[str] = None
    preferredProgram3: Optional[str] = None
    campusPreference: Optional[str] = None
    shiftPreference: Optional[str] = None
    
    # Additional Information
    extracurricular: Optional[str] = None
    achievements: Optional[str] = None
    workExperience: Optional[str] = None
    personalStatement: Optional[str] = None
    
    # Emergency Contact
    emergencyContactName: Optional[str] = None
    emergencyContactRelation: Optional[str] = None
    emergencyContactPhone: Optional[str] = None
    
    # Special Categories
    specialCategory: Optional[str] = None
    disability: Optional[str] = None
    hafizQuran: Optional[bool] = False
    
    # Preferences
    hostelRequired: Optional[bool] = False
    transportRequired: Optional[bool] = False
    scholarshipRequired: Optional[bool] = False


class ApplicationRead(BaseModel):
    id: int
    student_id: int
    data: Dict[str, Any]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
