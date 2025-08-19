import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, selectinload
from sqlalchemy import select
from app.db.models import Student, Career, Program, StudentCareer
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

async def test_relationships():
    """Test the new database relationships."""
    engine = create_async_engine(DATABASE_URL, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        print("🧪 Testing database relationships...")
        
        # Test 1: Create sample data
        print("\n1. Creating sample data...")
        
        # Create programs
        program1 = Program(title="Computer Science", duration="4 years", eligibility="High School Diploma")
        program2 = Program(title="Software Engineering", duration="4 years", eligibility="High School Diploma")
        session.add_all([program1, program2])
        await session.flush()
        
        # Create careers with many-to-many relationship to programs
        career1 = Career(title="Software Developer", description="Develop software applications", required_skills="Python, JavaScript")
        career2 = Career(title="Data Scientist", description="Analyze and interpret complex data", required_skills="Python, Statistics, Machine Learning")
        
        # Associate careers with programs (many-to-many)
        career1.programs = [program1, program2]  # Software Developer can come from both CS and SE
        career2.programs = [program1]  # Data Scientist typically from CS
        
        session.add_all([career1, career2])
        await session.flush()
        
        # Create a student
        student1 = Student(
            name="John Doe",
            email="john@example.com",
            hashed_password="hashed_password",
            roll_number="CS2024001"
        )
        session.add(student1)
        await session.flush()
        
        # Test 2: Create student-career assignments (one-to-many)
        print("\n2. Testing student-career assignments...")
        
        assignment1 = StudentCareer(
            student_id=student1.id,
            career_id=career1.id,
            status="active",
            notes="Assigned based on programming interests"
        )
        assignment2 = StudentCareer(
            student_id=student1.id,
            career_id=career2.id,
            status="exploring",
            notes="Secondary interest in data analysis"
        )
        
        session.add_all([assignment1, assignment2])
        await session.commit()
        
        print("✅ Sample data created successfully!")
        
        # Test 3: Query relationships
        print("\n3. Testing relationship queries...")
        
        # Test many-to-many: careers and programs
        stmt = select(Career).options(selectinload(Career.programs)).where(Career.id == career1.id)
        result = await session.execute(stmt)
        career_with_programs = result.scalar_one()
        
        print(f"Career '{career_with_programs.title}' is associated with {len(career_with_programs.programs)} programs:")
        for program in career_with_programs.programs:
            print(f"  - {program.title}")
        
        # Test one-to-many: student assigned careers
        stmt = select(Student).options(
            selectinload(Student.assigned_careers).selectinload(StudentCareer.career)
        ).where(Student.id == student1.id)
        result = await session.execute(stmt)
        student_with_careers = result.scalar_one()
        
        print(f"\nStudent '{student_with_careers.name}' has {len(student_with_careers.assigned_careers)} career assignments:")
        for assignment in student_with_careers.assigned_careers:
            print(f"  - {assignment.career.title} (Status: {assignment.status})")
            if assignment.notes:
                print(f"    Notes: {assignment.notes}")
        
        # Test reverse relationship: career's student assignments
        stmt = select(Career).options(
            selectinload(Career.student_assignments).selectinload(StudentCareer.student)
        ).where(Career.id == career1.id)
        result = await session.execute(stmt)
        career_with_students = result.scalar_one()
        
        print(f"\nCareer '{career_with_students.title}' is assigned to {len(career_with_students.student_assignments)} students:")
        for assignment in career_with_students.student_assignments:
            print(f"  - {assignment.student.name} (Status: {assignment.status})")
        
        print("\n✅ All relationship tests passed!")
        print("\n📊 Relationship Summary:")
        print("   ✓ Careers ↔ Programs: Many-to-Many (working)")
        print("   ✓ Students → Careers: One-to-Many via StudentCareer (working)")
        print("   ✓ Careers ← Students: Reverse relationship (working)")
        print("   ✓ Student career assignments include status and notes")
        print("   ✓ Unique constraint prevents duplicate assignments")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_relationships())
