from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS setup (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include routers
from app.api.v1 import auth
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
from app.api.v1 import students
app.include_router(students.router, prefix="/api/v1/students", tags=["students"])
from app.api.v1 import programs
app.include_router(programs.router, prefix="/api/v1/programs", tags=["programs"])
from app.api.v1 import careers
app.include_router(careers.router, prefix="/api/v1/careers", tags=["careers"])
from app.api.v1 import admissions
app.include_router(admissions.router, prefix="/api/v1/admissions", tags=["admissions"])
from app.api.v1 import ai
app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"])

@app.get("/")
def root():
    return {"message": "Career Compass Backend API"} 