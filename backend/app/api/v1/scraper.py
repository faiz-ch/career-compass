from fastapi import APIRouter, HTTPException, Query
from app.services.result_scraper import fetch_bise_result_data
import json

router = APIRouter()

@router.get("/scrape-result/",
    summary="Scrape BISE Lahore result by roll number",
    description="Scrapes student academic results from the BISE Lahore official website using a provided roll number.",
    response_description="A JSON object containing the scraped result data.",
)
async def scrape_bise_lahore_result(
    roll_number: str = Query(..., description="The roll number of the student."),
    exam_type: str = Query("2", description="The exam type value: 2=Part-2 Annual, 1=Part-1 Annual, 0=Supplementary"),
    year: str = Query("2024", description="The year of the exam.")
):
    """
    An endpoint to scrape student result data from the BISE Lahore website.
    
    - **roll_number**: The student's unique roll number.
    - **exam_type**: The exam type ("2" for Part-2 Annual, "1" for Part-1 Annual, "0" for Supplementary)
    - **year**: The year the exam was conducted.
    """
    try:
        result_data = fetch_bise_result_data(roll_number, exam_type, year)
        
        if result_data:
            return {
                "success": True,
                "data": result_data,
                "roll_number": roll_number,
                "exam_type": exam_type,
                "year": year
            }
        else:
            raise HTTPException(
                status_code=404,
                detail=f"Could not find or parse the result for roll number {roll_number}."
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )

