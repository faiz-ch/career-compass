# Career Compass Backend

A FastAPI-based backend for the Career Compass application, providing authentication, student management, career recommendations, and university program matching.

## Features

- **Authentication**: JWT-based user registration and login
- **Student Management**: Profile creation and management
- **Career Recommendations**: AI-powered career matching
- **Program Matching**: University program recommendations
- **Admission Management**: Application tracking and status updates

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
poetry install
```

### 2. Database Setup

#### Option A: Using PostgreSQL (Recommended)

1. **Install PostgreSQL** if you haven't already
2. **Create a database**:
   ```sql
   CREATE DATABASE career_compass_db;
   ```
3. **Set environment variables**:
   ```bash
   export DATABASE_URL="postgresql+asyncpg://username:password@localhost:5432/career_compass_db"
   export SECRET_KEY="your-secret-key-here"
   ```

#### Option B: Using SQLite (Development)

1. **Set environment variables**:
   ```bash
   export DATABASE_URL="sqlite+aiosqlite:///./career_compass.db"
   export SECRET_KEY="your-secret-key-here"
   ```

### 3. Create Database Tables

```bash
python create_tables.py
```

### 4. Run the Application

```bash
poetry run uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new student
- `POST /api/v1/auth/login` - Login and get JWT token

### Students
- `GET /api/v1/students/me` - Get current student profile
- `PATCH /api/v1/students/me` - Update current student profile

### Programs
- `GET /api/v1/programs/` - List all programs
- `POST /api/v1/programs/` - Create a new program
- `GET /api/v1/programs/{id}` - Get program by ID

### Careers
- `GET /api/v1/careers/` - List all careers
- `POST /api/v1/careers/` - Create a new career
- `GET /api/v1/careers/{id}` - Get career by ID

### Admissions
- `POST /api/v1/admissions/` - Apply for admission
- `GET /api/v1/admissions/me` - Get current student's admissions

## Environment Variables

- `DATABASE_URL`: Database connection string
- `SECRET_KEY`: JWT secret key for token generation
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time (default: 30)

## Development

### Running Tests
```bash
poetry run pytest
```

### Code Formatting
```bash
poetry run black .
poetry run isort .
```

## Project Structure

```
backend/
├── app/
│   ├── api/v1/          # API routes
│   ├── core/            # Core configuration
│   ├── db/              # Database models and schemas
│   ├── services/        # Business logic
│   └── main.py          # FastAPI application
├── tests/               # Test files
├── create_tables.py     # Database initialization
└── pyproject.toml       # Poetry configuration
``` 