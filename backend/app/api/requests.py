"""Request management API endpoints."""
from typing import List, Optional
from fastapi import APIRouter, Request, HTTPException, status, Depends
from fastapi.responses import JSONResponse, StreamingResponse
import json
from io import BytesIO
from app.models.request import (
    Request as EvalRequest, RequestCreate, RequestUpdate,
    StartEvaluation, AddRunLinks, Priority
)
from app.models.user import User
from app.services.request_service import request_service
from app.services.auth_service import auth_service
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/requests", tags=["requests"])


async def get_current_user(request: Request) -> User:
    """Dependency to get current authenticated user."""
    session_id = request.cookies.get("session_id")
    user = auth_service.get_current_user(session_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    return user


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to require admin privileges."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user


@router.get("", response_model=List[EvalRequest])
async def list_requests(
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """List all evaluation requests, optionally filtered by status."""
    requests = await request_service.list_requests(status=status_filter)
    logger.info(f"User {current_user.name} listed {len(requests)} requests")
    return requests


@router.post("", response_model=EvalRequest, status_code=status.HTTP_201_CREATED)
async def create_request(
    request_data: RequestCreate,
    current_user: User = Depends(get_current_user)
):
    """Create new evaluation request."""
    request = await request_service.create_request(request_data, current_user)
    logger.info(f"User {current_user.name} created request {request.id}")
    return request


@router.get("/{request_id}", response_model=EvalRequest)
async def get_request(
    request_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get evaluation request by ID."""
    request = await request_service.get_request(request_id)
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Request with id '{request_id}' not found"
        )
    
    return request


@router.put("/{request_id}", response_model=EvalRequest)
async def update_request(
    request_id: str,
    update_data: RequestUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update evaluation request."""
    try:
        request = await request_service.update_request(request_id, update_data, current_user)
        
        if not request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Request with id '{request_id}' not found"
            )
        
        logger.info(f"User {current_user.name} updated request {request_id}")
        return request
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_request(
    request_id: str,
    admin_user: User = Depends(require_admin)
):
    """Delete evaluation request (admin only)."""
    success = await request_service.delete_request(request_id, admin_user)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Request with id '{request_id}' not found"
        )
    
    logger.info(f"Admin {admin_user.name} deleted request {request_id}")


@router.post("/{request_id}/start", response_model=EvalRequest)
async def start_evaluation(
    request_id: str,
    start_data: StartEvaluation,
    current_user: User = Depends(get_current_user)
):
    """Start evaluation (move to in_progress status)."""
    try:
        request = await request_service.start_evaluation(request_id, start_data, current_user)
        
        if not request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Request with id '{request_id}' not found"
            )
        
        logger.info(f"User {current_user.name} started evaluation {request_id}")
        return request
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )


@router.post("/{request_id}/links", response_model=EvalRequest)
async def add_run_links(
    request_id: str,
    links_data: AddRunLinks,
    current_user: User = Depends(get_current_user)
):
    """Add run links to in-progress evaluation."""
    try:
        request = await request_service.add_run_links(request_id, links_data, current_user)
        
        if not request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Request with id '{request_id}' not found"
            )
        
        logger.info(f"User {current_user.name} added run links to {request_id}")
        return request
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )


@router.post("/{request_id}/complete", response_model=EvalRequest)
async def complete_evaluation(
    request_id: str,
    current_user: User = Depends(get_current_user)
):
    """Mark evaluation as completed."""
    try:
        request = await request_service.complete_evaluation(request_id, current_user)
        
        if not request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Request with id '{request_id}' not found"
            )
        
        logger.info(f"User {current_user.name} completed evaluation {request_id}")
        return request
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )


@router.get("/search/{query}", response_model=List[EvalRequest])
async def search_requests(
    query: str,
    current_user: User = Depends(get_current_user)
):
    """Search evaluation requests."""
    requests = await request_service.search_requests(query)
    logger.info(f"User {current_user.name} searched for '{query}', found {len(requests)} results")
    return requests


# ===== Admin-Only Endpoints =====

@router.put("/{request_id}/priority", response_model=EvalRequest)
async def update_priority(
    request_id: str,
    priority: Priority,
    admin_user: User = Depends(require_admin)
):
    """Update request priority (admin only)."""
    request = await request_service.update_priority(request_id, priority, admin_user)
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Request with id '{request_id}' not found"
        )
    
    logger.info(f"Admin {admin_user.name} updated priority of {request_id} to {priority.value}")
    return request


@router.get("/export/json")
async def export_requests(
    admin_user: User = Depends(require_admin)
):
    """Export all requests as JSON file (admin only)."""
    requests = await request_service.list_requests(sort_by_priority=False)
    
    # Convert to dict for JSON serialization
    requests_data = [req.model_dump(mode='json') for req in requests]
    
    # Create JSON file in memory
    json_data = json.dumps(requests_data, indent=2, default=str)
    buffer = BytesIO(json_data.encode('utf-8'))
    
    logger.info(f"Admin {admin_user.name} exported {len(requests)} requests")
    
    return StreamingResponse(
        buffer,
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=evals_requests_export.json"}
    )


@router.post("/import/json", status_code=status.HTTP_201_CREATED)
async def import_requests(
    requests_data: List[EvalRequest],
    admin_user: User = Depends(require_admin)
):
    """Import requests from JSON (admin only)."""
    imported_count = 0
    errors = []
    
    for req_data in requests_data:
        try:
            # Save each request
            await request_service.storage.save_request(req_data)
            imported_count += 1
        except Exception as e:
            errors.append({
                "id": req_data.id,
                "error": str(e)
            })
    
    logger.info(f"Admin {admin_user.name} imported {imported_count} requests ({len(errors)} errors)")
    
    return {
        "imported": imported_count,
        "errors": errors,
        "total": len(requests_data)
    }
