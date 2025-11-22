"""Main FastAPI application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
from app.config import settings
from app.api import auth, requests, health, config
from app.utils.logger import get_logger

logger = get_logger(__name__)

# Create FastAPI app
app = FastAPI(
    title="3PCxP Evals Portal API",
    description="Evaluation request management system for M365 Core IDC Copilot Extensibility Platform Team",
    version="2.0.0",
    docs_url="/docs" if settings.enable_api_docs else None,
    redoc_url="/redoc" if settings.enable_api_docs else None
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router)
app.include_router(requests.router)
app.include_router(health.router)
app.include_router(config.router)

# Mount frontend static files
# Try multiple possible locations for the frontend directory
possible_frontend_paths = [
    Path(__file__).parent.parent.parent / "frontend",  # Local development
    Path(__file__).parent.parent / "frontend",          # Deployment package (app/ and frontend/ at same level)
    Path("/home/site/wwwroot/frontend"),                 # Azure App Service absolute path
]

frontend_dir = None
for path in possible_frontend_paths:
    if path.exists():
        frontend_dir = path
        break

if frontend_dir and frontend_dir.exists():
    # Mount assets only if directory exists
    assets_dir = frontend_dir / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")
    
    # Mount CSS and JS
    app.mount("/css", StaticFiles(directory=str(frontend_dir / "css")), name="css")
    app.mount("/js", StaticFiles(directory=str(frontend_dir / "js")), name="js")
    
    @app.get("/")
    async def serve_frontend():
        """Serve frontend index.html."""
        return FileResponse(str(frontend_dir / "index.html"))
    
    logger.info(f"Frontend static files mounted from: {frontend_dir}")
else:
    logger.warning(f"Frontend directory not found. Tried: {[str(p) for p in possible_frontend_paths]}")


@app.on_event("startup")
async def startup_event():
    """Application startup tasks."""
    logger.info(f"Starting 3PCxP Evals Portal API v2.0.0")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Data directory: {settings.data_dir}")
    logger.info(f"API docs: {'enabled' if settings.enable_api_docs else 'disabled'}")


@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown tasks."""
    logger.info("Shutting down 3PCxP Evals Portal API")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.reload,
        log_level=settings.log_level.lower()
    )
