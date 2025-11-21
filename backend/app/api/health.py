"""Health check and metrics endpoints."""
from fastapi import APIRouter
from datetime import datetime
from app.config import settings

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": settings.environment,
        "version": "2.0.0"
    }


@router.get("/metrics")
async def metrics():
    """Basic metrics endpoint (placeholder for Prometheus)."""
    if not settings.enable_metrics:
        return {"message": "Metrics disabled"}
    
    # TODO: Integrate Prometheus metrics
    return {
        "uptime": "TODO",
        "requests_total": "TODO",
        "active_sessions": "TODO"
    }
