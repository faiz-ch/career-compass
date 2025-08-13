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
