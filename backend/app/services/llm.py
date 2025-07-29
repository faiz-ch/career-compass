# Placeholder for LLM service integration (OpenAI, HuggingFace, etc.) # backend/app/services/llm.py
import os
import json
from typing import List, Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage, SystemMessage
from langchain.prompts import ChatPromptTemplate
from dotenv import load_dotenv

load_dotenv()

class LLMService:
    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY environment variable is required")
        
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=api_key,
            temperature=0.7,
            max_tokens=1000
        )
    
    async def generate_interview_questions(self, interests: str) -> List[str]:
        """Generate custom AI questions based on student interests."""
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert career counselor. Based on a student's interests, 
            generate 5-7 thoughtful, open-ended questions to better understand their:
            1. Learning style and preferences
            2. Motivation and goals  
            3. Problem-solving approach
            4. Communication style
            5. Technical aptitude
            
            Questions should be conversational and help reveal both technical and soft skills.
            Return only the questions, one per line, without numbering."""),
            ("human", "Student interests: {interests}")
        ])
        
        chain = prompt | self.llm
        response = await chain.ainvoke({"interests": interests})
        
        questions = response.content.strip().split('\n')
        return [q.strip() for q in questions if q.strip()]
    
    async def infer_skills_from_responses(self, interests: str, responses: List[str]) -> Dict[str, Any]:
        """Analyze student responses and infer technical and soft skills."""
        
        combined_responses = "\n".join([f"Response {i+1}: {response}" for i, response in enumerate(responses)])
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert career analyst. Analyze student responses and identify:
            1. Technical skills (programming, analysis, design, etc.)
            2. Soft skills (leadership, communication, problem-solving, etc.)
            3. Learning preferences (visual, hands-on, theoretical, etc.)
            4. Career interests and motivations
            
            Return a JSON object with this structure:
            {
                "technical_skills": ["skill1", "skill2"],
                "soft_skills": ["skill1", "skill2"], 
                "learning_style": "description",
                "career_interests": ["interest1", "interest2"],
                "confidence_level": "high/medium/low"
            }"""),
            ("human", """Student's initial interests: {interests}
            
            Student's interview responses:
            {responses}""")
        ])
        
        chain = prompt | self.llm
        response = await chain.ainvoke({
            "interests": interests,
            "responses": combined_responses
        })
        
        try:
            # Extract JSON from response
            content = response.content.strip()
            if content.startswith("```json"):
                content = content[7:-3]  # Remove ```json and ```
            elif content.startswith("```"):
                content = content[3:-3]  # Remove ``` and ```
            
            result = json.loads(content)
            return result
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return {
                "technical_skills": [],
                "soft_skills": [],
                "learning_style": "mixed",
                "career_interests": [],
                "confidence_level": "medium"
            }
    
    async def rank_programs_for_career(self, career: str, programs: List[Dict], student_skills: Dict) -> List[Dict]:
        """Rank university programs based on career and student skills."""
        
        programs_text = "\n".join([
            f"Program {i+1}: {p.get('degree_title', '')} at {p.get('university_name', '')} - {p.get('eligibility', '')}"
            for i, p in enumerate(programs)
        ])
        
        skills_text = f"Technical: {', '.join(student_skills.get('technical_skills', []))}\nSoft: {', '.join(student_skills.get('soft_skills', []))}"
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert university counselor. Rank programs from 1-10 (1 being best match) based on:
            1. Alignment with career goal
            2. Match with student's technical skills
            3. Match with student's soft skills
            4. Program quality and reputation
            
            Return a JSON array with this structure:
            [
                {"program_id": 1, "rank": 1, "reason": "explanation"},
                {"program_id": 2, "rank": 2, "reason": "explanation"}
            ]"""),
            ("human", """Career Goal: {career}
            
            Student Skills:
            {skills}
            
            Available Programs:
            {programs}""")
        ])
        
        chain = prompt | self.llm
        response = await chain.ainvoke({
            "career": career,
            "skills": skills_text,
            "programs": programs_text
        })
        
        try:
            content = response.content.strip()
            if content.startswith("```json"):
                content = content[7:-3]
            elif content.startswith("```"):
                content = content[3:-3]
            
            result = json.loads(content)
            return result
        except json.JSONDecodeError:
            # Fallback ranking
            return [{"program_id": i+1, "rank": i+1, "reason": "Default ranking"} for i in range(len(programs))]

# Global instance
llm_service = LLMService()