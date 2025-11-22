"""Authentication API endpoints."""
import secrets
from fastapi import APIRouter, Response, Request, HTTPException, status
from fastapi.responses import RedirectResponse
from app.services.auth_service import auth_service
from app.models.user import User
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/login")
async def login(request: Request, response: Response):
    """Initiate OAuth 2.0 login flow."""
    # Generate session ID
    session_id = secrets.token_urlsafe(32)
    
    # Get authorization URL from MSAL
    auth_url = await auth_service.get_auth_url(session_id)
    
    # Set session cookie
    response = RedirectResponse(auth_url)
    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        secure=request.url.scheme == "https",  # HTTPS only in production
        samesite="lax",
        max_age=86400  # 24 hours
    )
    
    logger.info("Redirecting to Microsoft login")
    return response


@router.get("/callback")
async def callback(code: str, state: str, request: Request):
    """Handle OAuth 2.0 callback from Microsoft."""
    # Verify session ID from cookie matches state parameter (CSRF protection)
    session_id = request.cookies.get("session_id")
    
    if not session_id or session_id != state:
        logger.warning("Invalid state parameter in OAuth callback")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid state parameter"
        )
    
    try:
        # Exchange authorization code for access token and get user info
        user = await auth_service.handle_callback(code, state)
        
        # Create session
        await auth_service.create_session(session_id, user)
        
        # Redirect to frontend
        logger.info(f"User {user.name} logged in successfully")
        return RedirectResponse("/")
    
    except ValueError as e:
        logger.error(f"OAuth callback error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )


@router.get("/me", response_model=User)
async def get_current_user(request: Request):
    """Get current authenticated user."""
    session_id = request.cookies.get("session_id")
    user = await auth_service.get_current_user(session_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    return user


@router.post("/logout")
async def logout(request: Request, response: Response):
    """Logout current user."""
    session_id = request.cookies.get("session_id")
    
    if session_id:
        await auth_service.delete_session(session_id)
    
    # Clear session cookie
    response.delete_cookie("session_id")
    
    logger.info("User logged out")
    return {"message": "Logged out successfully"}
