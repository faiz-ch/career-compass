import os
import json
from typing import List, Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from dotenv import load_dotenv
from app.pinecone.pineconeSetup import connect_pinecone

load_dotenv()

class CareerRecommendationService:
    def __init__(self):
        self._llm = None
        self._pinecone_index = None
    
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
    
    def _get_pinecone_index(self):
        """Lazy initialization of Pinecone index."""
        if self._pinecone_index is None:
            api_key = os.getenv("PINECONE_API_KEY")
            if not api_key:
                raise ValueError("PINECONE_API_KEY environment variable is required. Please set it in your .env file.")
            
            self._pinecone_index = connect_pinecone("career-compass")
        return self._pinecone_index

    async def get_career_recommendations(
        self, 
        interview_analysis: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Get career recommendations based on interview analysis."""
        try:
            # Step 1: Get top 10 careers from Pinecone vector database
            vector_careers = await self._get_vector_careers(interview_analysis)
            
            # Step 2: Use LLM to select and rank top 5 careers
            recommended_careers = await self._enhance_with_llm(
                interview_analysis, 
                vector_careers
            )
            
            return recommended_careers
            
        except Exception as e:
            print(f"Error getting career recommendations: {str(e)}")
            raise e

    async def _get_vector_careers(self, interview_analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get top 10 careers from Pinecone vector database."""
        try:
            index = self._get_pinecone_index()
            
            # Create a query vector based on interview analysis
            # For now, we'll use a simple approach - you might want to use sentence transformers
            # to create proper embeddings from the interview analysis
            query_vector = self._create_query_vector(interview_analysis)
            
            # Query Pinecone for similar careers
            results = index.query(
                vector=query_vector,
                top_k=10,
                include_metadata=True
            )
            
            careers = []
            for match in results.matches:
                careers.append({
                    "id": match.id,
                    "score": match.score,
                    "title": match.metadata.get("title", ""),
                    "description": match.metadata.get("description", ""),
                    "required_skills": match.metadata.get("required_skills", "")
                })
            
            return careers
            
        except Exception as e:
            print(f"Error querying Pinecone: {str(e)}")
            # Return some fallback careers if Pinecone fails
            return [
                {
                    "id": "software_engineer",
                    "score": 0.9,
                    "title": "Software Engineer",
                    "description": "Develop software applications and systems",
                    "required_skills": "Programming, Problem Solving, Teamwork"
                },
                {
                    "id": "data_scientist", 
                    "score": 0.8,
                    "title": "Data Scientist",
                    "description": "Analyze data to help organizations make decisions",
                    "required_skills": "Statistics, Programming, Machine Learning"
                }
            ]

    def _create_query_vector(self, interview_analysis: Dict[str, Any]) -> List[float]:
        """Create a query vector from interview analysis."""
        # For now, we'll create a simple vector based on the analysis
        # In production, you should use sentence transformers to create proper embeddings
        
        # Combine all text from interview analysis
        text_parts = []
        
        # Add technical skills
        if interview_analysis.get("technical_skills"):
            text_parts.extend(interview_analysis["technical_skills"])
        
        # Add soft skills
        if interview_analysis.get("soft_skills"):
            text_parts.extend(interview_analysis["soft_skills"])
        
        # Add learning style
        if interview_analysis.get("learning_style"):
            text_parts.append(interview_analysis["learning_style"])
        
        # Add career interests
        if interview_analysis.get("career_interests"):
            text_parts.extend(interview_analysis["career_interests"])
        
        # Create a simple hash-based vector (384 dimensions as per Pinecone setup)
        import hashlib
        combined_text = " ".join(text_parts).lower()
        
        # Create a deterministic vector based on the text
        vector = [0.0] * 384
        for i, char in enumerate(combined_text):
            if i >= 384:
                break
            # Use character code to influence vector values
            vector[i % 384] += ord(char) / 1000.0
        
        # Normalize the vector
        import math
        magnitude = math.sqrt(sum(x * x for x in vector))
        if magnitude > 0:
            vector = [x / magnitude for x in vector]
        
        return vector

    async def _enhance_with_llm(
        self, 
        interview_analysis: Dict[str, Any], 
        vector_careers: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Use LLM to select and rank top 5 careers from vector results."""
        try:
            llm = self._get_llm()
            
            # Prepare career data for LLM
            career_data = ""
            for i, career in enumerate(vector_careers):
                career_data += f"""
Career {i+1}: {career['title']}
Description: {career['description']}
Required Skills: {career['required_skills']}
Vector Score: {career['score']}
"""
            
            prompt = ChatPromptTemplate.from_messages([
                ("system", """You are an expert career counselor. Based on a student's interview analysis and a list of potential careers from a vector database, select the top 5 most suitable careers.

                Guidelines:
                1. Consider the student's technical skills, soft skills, learning style, and career interests
                2. Match careers to the student's profile and preferences
                3. Consider the vector similarity scores but don't rely solely on them
                4. Provide reasoning for each recommendation
                5. Rank careers from most suitable to least suitable

                Return a JSON object with this structure:
                {{
                    "recommended_careers": [
                        {{
                            "title": "Career Title",
                            "description": "Brief description",
                            "match_reason": "Why this career matches the student",
                            "confidence_score": 0.95,
                            "required_skills": ["skill1", "skill2"],
                            "learning_path": "Suggested learning path"
                        }}
                    ]
                }}"""),
                ("human", """Student Interview Analysis:
Technical Skills: {technical_skills}
Soft Skills: {soft_skills}
Learning Style: {learning_style}
Career Interests: {career_interests}
Confidence Level: {confidence_level}

Available Careers from Vector Database:
{career_data}

Select the top 5 most suitable careers:""")
            ])
            
            chain = prompt | llm
            response = await chain.ainvoke({
                "technical_skills": json.dumps(interview_analysis.get("technical_skills", [])),
                "soft_skills": json.dumps(interview_analysis.get("soft_skills", [])),
                "learning_style": interview_analysis.get("learning_style", ""),
                "career_interests": json.dumps(interview_analysis.get("career_interests", [])),
                "confidence_level": interview_analysis.get("confidence_level", ""),
                "career_data": career_data
            })
            
            try:
                content = response.content.strip()
                if content.startswith("```json"):
                    content = content[7:-3]
                elif content.startswith("```"):
                    content = content[3:-3]
                
                result = json.loads(content)
                return result.get("recommended_careers", [])
                
            except json.JSONDecodeError as json_err:
                print(f"JSON parsing error: {str(json_err)}")
                print(f"Raw response: {response.content}")
                raise ValueError(f"Failed to parse LLM response: {str(json_err)}")
                
        except Exception as e:
            print(f"Error enhancing with LLM: {str(e)}")
            raise e

# Global instance
career_recommendation_service = CareerRecommendationService() 