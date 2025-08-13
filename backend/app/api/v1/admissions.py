from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from typing import List
from datetime import datetime
from app.db.session import get_async_session
from app.db.models import Admission
from app.db.schemas import AdmissionCreate, AdmissionRead, ApplicationFormData
from app.dependencies import get_current_user
from app.db.models import Student

router = APIRouter()

@router.post("/", response_model=AdmissionRead, status_code=status.HTTP_201_CREATED)
async def apply_for_admission(
    admission: AdmissionCreate,
    current_user: Student = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    # Only allow the current user to apply for themselves
    if admission.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot apply for another student.")
    db_admission = Admission(**admission.dict())
    session.add(db_admission)
    await session.commit()
    await session.refresh(db_admission)
    return db_admission

@router.get("/me", response_model=List[AdmissionRead])
async def list_my_admissions(
    current_user: Student = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    result = await session.execute(select(Admission).where(Admission.student_id == current_user.id))
    admissions = result.scalars().all()
    return admissions

@router.get("/{admission_id}", response_model=AdmissionRead)
async def get_admission_by_id(
    admission_id: int,
    current_user: Student = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    admission = await session.get(Admission, admission_id)
    if not admission:
        raise HTTPException(status_code=404, detail="Admission not found")
    if admission.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this admission.")
    return admission

@router.patch("/{admission_id}", response_model=AdmissionRead)
async def update_admission_status(
    admission_id: int,
    status_update: dict,
    session: AsyncSession = Depends(get_async_session)
):
    # For admin/future use: update status
    stmt = (
        update(Admission)
        .where(Admission.id == admission_id)
        .values(**status_update)
        .execution_options(synchronize_session="fetch")
    )
    await session.execute(stmt)
    await session.commit()
    admission = await session.get(Admission, admission_id)
    if not admission:
        raise HTTPException(status_code=404, detail="Admission not found")
    return admission

@router.delete("/{admission_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_admission(
    admission_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    stmt = delete(Admission).where(Admission.id == admission_id)
    await session.execute(stmt)
    await session.commit()
    return None

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
    print(f"Student Name: {current_user.name}")
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
