#!/usr/bin/env python3
"""
Script to populate SQL database with sample career data for testing.
Run this script to add sample careers to your PostgreSQL database.
"""

import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_async_session
from app.db.models import Career

async def populate_sql_careers():
    """Populate SQL database with sample career data."""
    try:
        # Sample career data (same as in populate_careers.py)
        careers = [
            {
                "title": "Software Engineer",
                "description": "Develop software applications and systems using programming languages and frameworks",
                "required_skills": "Programming, Problem Solving, Teamwork, Communication, System Design"
            },
            {
                "title": "Data Scientist",
                "description": "Analyze complex data sets to help organizations make informed decisions",
                "required_skills": "Statistics, Programming, Machine Learning, Data Analysis, Communication"
            },
            {
                "title": "Product Manager",
                "description": "Lead product development from conception to launch, working with cross-functional teams",
                "required_skills": "Leadership, Communication, Strategic Thinking, User Research, Project Management"
            },
            {
                "title": "UX Designer",
                "description": "Design user experiences that are intuitive, accessible, and enjoyable",
                "required_skills": "Design Thinking, User Research, Prototyping, Visual Design, Communication"
            },
            {
                "title": "Cybersecurity Analyst",
                "description": "Protect organizations from digital threats and ensure data security",
                "required_skills": "Security Analysis, Network Security, Incident Response, Problem Solving, Attention to Detail"
            },
            {
                "title": "Marketing Manager",
                "description": "Develop and execute marketing strategies to promote products and services",
                "required_skills": "Strategic Planning, Communication, Creativity, Data Analysis, Leadership"
            },
            {
                "title": "Financial Analyst",
                "description": "Analyze financial data to help organizations make investment and business decisions",
                "required_skills": "Financial Analysis, Excel, Attention to Detail, Communication, Problem Solving"
            },
            {
                "title": "Human Resources Manager",
                "description": "Manage employee relations, recruitment, and organizational development",
                "required_skills": "Communication, Leadership, Problem Solving, Interpersonal Skills, Organization"
            },
            {
                "title": "Sales Manager",
                "description": "Lead sales teams and develop strategies to meet revenue targets",
                "required_skills": "Leadership, Communication, Negotiation, Relationship Building, Strategic Thinking"
            },
            {
                "title": "Research Scientist",
                "description": "Conduct research to advance knowledge in various scientific fields",
                "required_skills": "Research Methods, Critical Thinking, Problem Solving, Communication, Attention to Detail"
            }
        ]
        
        # Get async session
        async with get_async_session() as session:
            # Check if careers already exist
            stmt = select(Career)
            result = await session.execute(stmt)
            existing_careers = result.scalars().all()
            
            if existing_careers:
                print(f"Found {len(existing_careers)} existing careers in database")
                print("Skipping population to avoid duplicates")
                return
            
            # Create career objects
            print(f"Creating {len(careers)} careers in database...")
            career_objects = []
            for career_data in careers:
                career = Career(**career_data)
                career_objects.append(career)
                session.add(career)
            
            # Commit the transaction
            await session.commit()
            
            print("✅ Successfully populated SQL database with sample career data!")
            print(f"Added {len(careers)} careers:")
            for career in careers:
                print(f"  - {career['title']}")
                
    except Exception as e:
        print(f"❌ Error populating careers: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(populate_sql_careers())
