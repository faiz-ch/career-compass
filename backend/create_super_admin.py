import asyncio
from app.db.session import get_async_session
from app.db.models import Student
from app.core.security import get_password_hash
from sqlalchemy import select

async def create_super_admin():
    async for session in get_async_session():
        try:
            # Check if super admin exists
            result = await session.execute(
                select(Student).where(Student.email == "superadmin@test.com")
            )
            existing_admin = result.scalar_one_or_none()
            
            if not existing_admin:
                # Create super admin
                super_admin = Student(
                    first_name="Super",
                    last_name="Admin",
                    email="superadmin@test.com",
                    hashed_password=get_password_hash("admin123"),
                    is_admin="yes",
                    admin_level="super_admin"
                )
                session.add(super_admin)
                await session.commit()
                print("✅ Super Admin created!")
                print("Email: superadmin@test.com")
                print("Password: admin123")
                print("This is your first admin - use this to create more admins!")
            else:
                print("✅ Super Admin already exists")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            await session.close()

if __name__ == "__main__":
    asyncio.run(create_super_admin())
