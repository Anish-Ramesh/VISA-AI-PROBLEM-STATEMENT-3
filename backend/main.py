from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="Financial Data Health & Compliance System",
    description="Metadata-only regulatory compliance checking system.",
    version="0.1.0"
)

# CORS Setup - Allow All for Render/Demo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Open for Render deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# ... (existing code)

from api.endpoints import router as api_router
app.include_router(api_router, prefix="/api")

# Serve React static files (Production Config)
# Path relative to backend/main.py -> ../frontend/dist
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")

if os.path.exists(frontend_dist):
    # Mount assets folder (JS/CSS)
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    # Catch-all for React Router (Single Page App)
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        # 1. API requests are handled by the router strictly
        if full_path.startswith("api"):
            return {"error": "API Endpoint Not Found"}
            
        # 2. Serve specific file if it exists (e.g., favicon.ico, logo.png)
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
            
        # 3. Fallback to index.html for all other routes (SPA handling)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def read_root():
        return {"status": "backend-running", "message": "Frontend build not found. Run 'npm run build' in frontend/"}
