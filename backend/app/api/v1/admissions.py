from fastapi import APIRouter, Depends, status
from datetime import datetime
from app.db.schemas import ApplicationFormData
from app.dependencies import get_current_user
from app.db.models import Student

router = APIRouter()

@router.get("/")
async def get_admissions_info():
    """Info endpoint about admissions in the simplified system."""
    return {
        "message": "Admissions are now handled externally", 
        "info": "The system has been simplified to focus on career recommendations",
        "available_endpoints": {
            "submit_application_form": "POST /api/v1/admissions/application-form"
        },
        "note": "Application forms are logged for external processing"
    }

@router.get("/me")
async def get_my_admissions(current_user: Student = Depends(get_current_user)):
    """Placeholder for user admissions."""
    return {
        "message": "No admissions data in simplified system",
        "student_id": current_user.id,
        "note": "Use the application form to submit applications for external processing"
    }

@router.post("/application-form", status_code=status.HTTP_201_CREATED)
async def submit_application_form(
    form_data: ApplicationFormData,
    current_user: Student = Depends(get_current_user),
):
    """
    Submit application form with comprehensive student data.
    This endpoint receives the complete application form and logs it to console.
    """
    print("=== APPLICATION FORM SUBMISSION ===")
    print(f"Student ID: {current_user.id}")
    print(f"Student Name: {current_user.first_name} {current_user.last_name}")
    print(f"Student Email: {current_user.email}")
    print("\n=== FORM DATA ===")
    
    # Convert form data to dict and print in a readable format
    form_dict = form_data.model_dump()
    
    # Personal Information
    print("\n--- Personal Information ---")
    personal_fields = ['firstName', 'lastName', 'fatherName', 'cnic', 'dateOfBirth', 
                      'gender', 'religion', 'nationality', 'maritalStatus', 'bloodGroup']
    for field in personal_fields:
        if form_dict.get(field):
            print(f"{field}: {form_dict[field]}")
    
    # Contact Information
    print("\n--- Contact Information ---")
    contact_fields = ['email', 'phoneNumber', 'whatsappNumber', 'permanentAddress', 
                     'mailingAddress', 'city', 'province', 'postalCode']
    for field in contact_fields:
        if form_dict.get(field):
            print(f"{field}: {form_dict[field]}")
    
    # Family Information
    print("\n--- Family Information ---")
    family_fields = ['fatherOccupation', 'fatherIncome', 'motherName', 'motherOccupation',
                    'guardianName', 'guardianRelation', 'guardianContact']
    for field in family_fields:
        if form_dict.get(field):
            print(f"{field}: {form_dict[field]}")
    
    # Academic Information - Matric
    print("\n--- Academic Information (Matric/O-Levels) ---")
    matric_fields = ['matricBoard', 'matricYear', 'matricRollNumber', 'matricTotalMarks',
                    'matricObtainedMarks', 'matricPercentage', 'matricSubjects']
    for field in matric_fields:
        if form_dict.get(field):
            print(f"{field}: {form_dict[field]}")
    
    # Academic Information - Inter
    print("\n--- Academic Information (Inter/A-Levels) ---")
    inter_fields = ['interBoard', 'interYear', 'interRollNumber', 'interTotalMarks',
                   'interObtainedMarks', 'interPercentage', 'interSubjects', 'interGroup']
    for field in inter_fields:
        if form_dict.get(field):
            print(f"{field}: {form_dict[field]}")
    
    # Program Preferences
    print("\n--- Program Preferences ---")
    program_fields = ['preferredProgram1', 'preferredProgram2', 'preferredProgram3',
                     'campusPreference', 'shiftPreference']
    for field in program_fields:
        if form_dict.get(field):
            print(f"{field}: {form_dict[field]}")
    
    # Additional Information
    print("\n--- Additional Information ---")
    additional_fields = ['extracurricular', 'achievements', 'workExperience', 'personalStatement']
    for field in additional_fields:
        if form_dict.get(field):
            print(f"{field}: {form_dict[field]}")
    
    # Emergency Contact
    print("\n--- Emergency Contact ---")
    emergency_fields = ['emergencyContactName', 'emergencyContactRelation', 'emergencyContactPhone']
    for field in emergency_fields:
        if form_dict.get(field):
            print(f"{field}: {form_dict[field]}")
    
    # Special Categories and Preferences
    print("\n--- Special Categories & Preferences ---")
    special_fields = ['specialCategory', 'disability', 'hafizQuran', 
                     'hostelRequired', 'transportRequired', 'scholarshipRequired']
    for field in special_fields:
        if form_dict.get(field) is not None:
            print(f"{field}: {form_dict[field]}")
    
    print("\n=== END FORM SUBMISSION ===\n")
    
    return {
        "message": "Application form submitted successfully",
        "student_id": current_user.id,
        "timestamp": datetime.now().isoformat(),
        "form_fields_count": len([v for v in form_dict.values() if v is not None and v != ""])
    }
