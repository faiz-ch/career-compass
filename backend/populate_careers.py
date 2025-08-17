#!/usr/bin/env python3
"""
Script to populate Pinecone index with sample career data for testing.
Run this script to add sample careers to your vector database.
"""

import os
import json
from dotenv import load_dotenv
from app.pinecone.pineconeSetup import connect_pinecone

load_dotenv()

def create_career_vector(career_text: str) -> list:
    """Create a simple vector for career text."""
    # Simple hash-based vector creation (same as in career_recommendation.py)
    vector = [0.0] * 384
    for i, char in enumerate(career_text.lower()):
        if i >= 384:
            break
        vector[i % 384] += ord(char) / 1000.0
    
    # Normalize the vector
    import math
    magnitude = math.sqrt(sum(x * x for x in vector))
    if magnitude > 0:
        vector = [x / magnitude for x in vector]
    
    return vector

def populate_careers():
    """Populate Pinecone index with sample career data."""
    try:
        # Sample career data
        careers = [
            {
                "id": "software_engineer",
                "title": "Software Engineer",
                "description": "Develop software applications and systems using programming languages and frameworks",
                "required_skills": "Programming, Problem Solving, Teamwork, Communication, System Design"
            },
            {
                "id": "data_scientist",
                "title": "Data Scientist",
                "description": "Analyze complex data sets to help organizations make informed decisions",
                "required_skills": "Statistics, Programming, Machine Learning, Data Analysis, Communication"
            },
            {
                "id": "product_manager",
                "title": "Product Manager",
                "description": "Lead product development from conception to launch, working with cross-functional teams",
                "required_skills": "Leadership, Communication, Strategic Thinking, User Research, Project Management"
            },
            {
                "id": "ux_designer",
                "title": "UX Designer",
                "description": "Design user experiences that are intuitive, accessible, and enjoyable",
                "required_skills": "Design Thinking, User Research, Prototyping, Visual Design, Communication"
            },
            {
                "id": "cybersecurity_analyst",
                "title": "Cybersecurity Analyst",
                "description": "Protect organizations from digital threats and ensure data security",
                "required_skills": "Security Analysis, Network Security, Incident Response, Problem Solving, Attention to Detail"
            },
            {
                "id": "marketing_manager",
                "title": "Marketing Manager",
                "description": "Develop and execute marketing strategies to promote products and services",
                "required_skills": "Strategic Planning, Communication, Creativity, Data Analysis, Leadership"
            },
            {
                "id": "financial_analyst",
                "title": "Financial Analyst",
                "description": "Analyze financial data to help organizations make investment and business decisions",
                "required_skills": "Financial Analysis, Excel, Attention to Detail, Communication, Problem Solving"
            },
            {
                "id": "human_resources_manager",
                "title": "Human Resources Manager",
                "description": "Manage employee relations, recruitment, and organizational development",
                "required_skills": "Communication, Leadership, Problem Solving, Interpersonal Skills, Organization"
            },
            {
                "id": "sales_manager",
                "title": "Sales Manager",
                "description": "Lead sales teams and develop strategies to meet revenue targets",
                "required_skills": "Leadership, Communication, Negotiation, Relationship Building, Strategic Thinking"
            },
            {
                "id": "research_scientist",
                "title": "Research Scientist",
                "description": "Conduct research to advance knowledge in various scientific fields",
                "required_skills": "Research Methods, Critical Thinking, Problem Solving, Communication, Attention to Detail"
            }
        ]
        
        # Connect to Pinecone
        index = connect_pinecone("career-compass")
        
        # Prepare vectors for upsert
        vectors_to_upsert = []
        for career in careers:
            # Create vector from career description and skills
            career_text = f"{career['title']} {career['description']} {career['required_skills']}"
            vector = create_career_vector(career_text)
            
            vectors_to_upsert.append({
                "id": career["id"],
                "values": vector,
                "metadata": {
                    "title": career["title"],
                    "description": career["description"],
                    "required_skills": career["required_skills"]
                }
            })
        
        # Upsert vectors to Pinecone
        print(f"Upserting {len(vectors_to_upsert)} careers to Pinecone...")
        index.upsert(vectors=vectors_to_upsert)
        
        print("✅ Successfully populated Pinecone index with sample career data!")
        print(f"Added {len(careers)} careers:")
        for career in careers:
            print(f"  - {career['title']}")
            
    except Exception as e:
        print(f"❌ Error populating careers: {str(e)}")
        print("Make sure your PINECONE_API_KEY is set in the .env file")

if __name__ == "__main__":
    populate_careers() 