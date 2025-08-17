from fastapi import APIRouter, HTTPException, Query
from app.services.result_scraper import BISELahoreResultScraper
import json

router = APIRouter()

@router.get("/scrape-result/",
    summary="Scrape BISE Lahore result by roll number",
    description="Scrapes student academic results from the BISE Lahore official website using a provided roll number.",
    response_description="A JSON object containing the scraped result data.",
)
async def scrape_bise_lahore_result(
    roll_number: str = Query(..., description="The roll number of the student."),
    exam_type: str = Query("Part-II (ANNUAL)", description="The type of exam (e.g., \"Part-II (ANNUAL)\", \"Supplementary\")."),
    year: str = Query("2024", description="The year of the exam."),
    result_type: str = Query("Matric", description="The type of result (\"Matric\" or \"Intermediate\").")
):
    """
    An endpoint to scrape student result data from the BISE Lahore website.
    
    - **roll_number**: The student's unique roll number.
    - **exam_type**: The session of the examination.
    - **year**: The year the exam was conducted.
    - **result_type**: The level of education (Matric or Intermediate).
    """
    try:
        scraper = BISELahoreResultScraper(headless=True)
        result = scraper.search_result(roll_number, exam_type, year, result_type)
        scraper.close_driver()
        
        if result and result.get("success"):
            return result
        else:
            raise HTTPException(
                status_code=404,
                detail=f"Could not find or parse the result for roll number {roll_number}. Error: {result.get('error', 'Unknown error')}"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )

