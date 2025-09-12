# Placeholder for LLM service integration (OpenAI, HuggingFace, etc.) # backend/app/services/llm.py
import os
import json
from typing import List, Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models import InterviewResult
from datetime import datetime

load_dotenv()

class LLMService:
    def __init__(self):
        self._llm = None
    
    def _get_llm(self):
        """Lazy initialization of the LLM."""
        if self._llm is None:
            api_key = os.getenv("GOOGLE_API_KEY")
            if not api_key or api_key == "your-gemini-api-key-here":
                raise ValueError("GOOGLE_API_KEY environment variable is required. Please set it in your .env file.")
            
            self._llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                google_api_key=api_key,
                temperature=0.7,
                max_tokens=1000
            )
        return self._llm

    async def generate_interview_questions(self, interests: str) -> List[str]:
        """Generate custom AI questions based on student interests."""
        try:
            llm = self._get_llm()
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
            chain = prompt | llm
            response = await chain.ainvoke({"interests": interests})
            questions = response.content.strip().split('\n')
            return [q.strip() for q in questions if q.strip()]
        except Exception as e:
            print(f"Error generating questions: {str(e)}")
            # Return fallback questions
            return [
                "What motivates you to learn new things?",
                "How do you prefer to work - alone or in teams?",
                "What kind of problems do you enjoy solving?",
                "How do you handle challenges and setbacks?",
                "What are your long-term career goals?"
            ]

    async def infer_skills_from_responses(self, interests: str, responses: List[str]) -> Dict[str, Any]:
        """Analyze student responses and infer technical and soft skills."""
        try:
            llm = self._get_llm()
            combined_responses = "\n".join([f"Response {i+1}: {response}" for i, response in enumerate(responses)])
            prompt = ChatPromptTemplate.from_messages([
                ("system", """You are an expert career analyst. Analyze student responses and identify:
                1. Technical skills (programming, analysis, design, etc.)
                2. Soft skills (leadership, communication, problem-solving, etc.)
                3. Learning preferences (visual, hands-on, theoretical, etc.)
                4. Career interests and motivations
                
                Return a JSON object with this structure:
                {{
                    \"technical_skills\": [\"skill1\", \"skill2\"],
                    \"soft_skills\": [\"skill1\", \"skill2\"], 
                    \"learning_style\": \"description\",
                    \"career_interests\": [\"interest1\", \"interest2\"],
                    \"confidence_level\": \"high/medium/low\"
                }}"""),
                ("human", """Student's initial interests: {interests}
                
                Student's interview responses:
                {responses}""")
            ])
            chain = prompt | llm
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
            except json.JSONDecodeError as e:
                print(f"JSON parsing error: {str(e)}")
                print(f"Raw response: {response.content}")
                # Fallback if JSON parsing fails
                return {
                    "technical_skills": ["problem-solving"],
                    "soft_skills": ["communication"],
                    "learning_style": "mixed",
                    "career_interests": ["technology"],
                    "confidence_level": "medium"
                }
        except Exception as e:
            print(f"Error analyzing responses: {str(e)}")
            # Return fallback analysis
            return {
                "technical_skills": ["problem-solving"],
                "soft_skills": ["communication"],
                "learning_style": "mixed",
                "career_interests": ["technology"],
                "confidence_level": "medium"
            }

    async def generate_dynamic_question(
        self, 
        interests: str, 
        previous_questions: list, 
        previous_responses: list,
        current_question_number: int,
        total_questions: int = 8
    ) -> dict:
        """Generate a dynamic question based on user's previous answers."""
        try:
            llm = self._get_llm()
            
            # Build context from previous Q&A
            qa_context = ""
            for i, (q, r) in enumerate(zip(previous_questions, previous_responses)):
                qa_context += f"Q{i+1}: {q}\nA{i+1}: {r}\n\n"
            
            prompt = ChatPromptTemplate.from_messages([
                ("system", """You are analyzing the skills of a Pakistani college student based on their interests. Your job is to understand what skills they might have related to their interests - not to give career advice.

                How to ask questions:
                1. Use simple English that Pakistani college students understand
                2. Ask questions that connect to their interests they mentioned
                3. Build on their previous answers to find out more about their abilities
                4. Think about what Pakistani students actually do in college (assignments, presentations, group work)
                5. Ask about real experiences they might have had related to their interests
                6. Find out how they learned about their interests and what they did
                7. Questions should be 15-20 words and easy to understand
                8. Be friendly like talking to a junior
                9. For the last question, ask something that wraps up their skills

                Based on their interests, explore:
                - What they have actually done related to their interests (projects, assignments, activities)
                - How they learned about this interest (online, books, friends, family)
                - What they are good at when doing things related to their interests
                - Any problems they solved or challenges they faced in this area
                - If they helped others or worked with classmates on anything related
                - What tools, apps, or methods they used for their interests
                - How they practice or improve in areas they are interested in
                - What comes naturally to them in their area of interest

                Return a JSON object with this structure:
                {{
                    "question": "The next question to ask",
                    "is_final_question": true/false
                }}"""),
                ("human", """Student's initial interests: {interests}

Previous Q&A:
{qa_context}

Current question number: {current_question_number} of {total_questions}

Generate the next question:""")
            ])
            
            chain = prompt | llm
            response = await chain.ainvoke({
                "interests": interests,
                "qa_context": qa_context,
                "current_question_number": current_question_number,
                "total_questions": total_questions
            })
            
            try:
                content = response.content.strip()
                if content.startswith("```json"):
                    content = content[7:-3]
                elif content.startswith("```"):
                    content = content[3:-3]
                
                result = json.loads(content)
                return result
            except json.JSONDecodeError as json_err:
                print(f"JSON parsing error: {str(json_err)}")
                print(f"Raw response: {response.content}")
                raise ValueError(f"Failed to parse AI response: {str(json_err)}")
        except Exception as e:
            print(f"Error generating dynamic question: {str(e)}")
            # Raise the complete error instead of using fallback
            raise e

    async def generate_initial_question(self, interests: str) -> dict:
        """Generate the first question based on user's interests."""
        try:
            llm = self._get_llm()
            prompt = ChatPromptTemplate.from_messages([
                ("system", """You are an expert career counselor starting a dynamic interview. 
                Based on the student's initial interests, generate the first question. 

                Guidelines:
                1. Be warm and welcoming.  
                2. Use short, simple English (max 20 words).  
                3. Ask only **one clear question with some example recommendation so that user can understand more effectively**.  
                4. Focus on understanding their motivation behind the stated interest.  
                5. Avoid difficult or technical words.  

                Return a JSON object with this structure:
                {{
                    "question": "The first question to ask",
                    "is_final_question": false
                }}"""),
                ("human", "Student's initial interests: {interests}")
            ])
            chain = prompt | llm
            response = await chain.ainvoke({"interests": interests})
            try:
                content = response.content.strip()
                if content.startswith("```json"):
                    content = content[7:-3]
                elif content.startswith("```"):
                    content = content[3:-3]
                result = json.loads(content)
                return result
            except json.JSONDecodeError as json_err:
                print(f"JSON parsing error: {str(json_err)}")
                print(f"Raw response: {response.content}")
                raise ValueError(f"Failed to parse AI response: {str(json_err)}")
        except Exception as e:
            print(f"Error generating initial question: {str(e)}")
            # Raise the complete error instead of using fallback
            raise e

    async def save_interview_result(
        self, 
        session: AsyncSession, 
        student_id: int, 
        analysis: Dict[str, Any]
    ) -> None:
        """Save or update interview result for a student."""
        try:
            # Check if result already exists
            result = await session.execute(
                select(InterviewResult).where(InterviewResult.student_id == student_id)
            )
            existing_result = result.scalar_one_or_none()
            
            if existing_result:
                # Update existing result with JSON fields
                existing_result.technical_skills = analysis["technical_skills"]
                existing_result.soft_skills = analysis["soft_skills"]
                existing_result.learning_style = analysis["learning_style"]
                existing_result.career_interests = analysis["career_interests"]
                existing_result.confidence_level = analysis["confidence_level"]
                existing_result.updated_at = datetime.utcnow()
            else:
                # Create new result with JSON fields
                new_result = InterviewResult(
                    student_id=student_id,
                    technical_skills=analysis["technical_skills"],
                    soft_skills=analysis["soft_skills"],
                    learning_style=analysis["learning_style"],
                    career_interests=analysis["career_interests"],
                    confidence_level=analysis["confidence_level"]
                )
                session.add(new_result)
            
            await session.commit()
        except Exception as e:
            await session.rollback()
            raise e

# Global instance
llm_service = LLMService() 