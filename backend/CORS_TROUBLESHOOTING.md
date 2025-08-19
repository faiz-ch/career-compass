# CORS Troubleshooting Guide

## Issue: CORS Policy Error
If you're seeing this error:
```
Access to fetch at 'http://localhost:8000/api/v1/careers/recommended/me' from origin 'http://localhost:5173' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solutions

### 1. Use the Custom Server Runner (Recommended)
```bash
cd backend
python run_server.py
```
This starts the server with optimized CORS settings.

### 2. Manual Uvicorn Command with CORS Headers
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Install Dependencies
Make sure all dependencies are installed:
```bash
cd backend
pip install -r requirements.txt
```

### 4. Verify Server is Running
- Check: http://localhost:8000/ (should show API message)
- Check: http://localhost:8000/health (should show healthy status)
- Check: http://localhost:8000/docs (FastAPI documentation)

### 5. Browser Developer Tools Check
In your browser's Network tab:
1. Look for OPTIONS preflight requests
2. Check response headers for Access-Control-* headers
3. Verify the request URL is correct

### 6. Frontend Configuration Check
Ensure your frontend is running on: http://localhost:5173

### 7. Alternative CORS Configuration
If issues persist, you can temporarily disable CORS in your browser for development:

**Chrome/Edge:**
```bash
chrome.exe --user-data-dir="C:/temp" --disable-web-security --disable-features=VizDisplayCompositor
```

**⚠️ WARNING: Only use this for development, never in production!**

## Common Issues

### Issue: Server not responding
- Make sure you're in the backend directory when running commands
- Check if port 8000 is already in use
- Try a different port: `--port 8001`

### Issue: Import errors
- Ensure virtual environment is activated
- Install missing dependencies: `pip install fastapi uvicorn`

### Issue: Database connection errors
- Check your database configuration
- Ensure database is running and accessible

## Testing CORS Manually
```bash
curl -X OPTIONS http://localhost:8000/api/v1/careers/recommended/me \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: authorization,content-type" \
  -v
```

Expected response should include CORS headers:
- Access-Control-Allow-Origin: *
- Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
- Access-Control-Allow-Headers: *
