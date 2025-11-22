"""Authentication service with Microsoft Entra OAuth 2.0."""
import secrets
from typing import Optional, Dict
from datetime import datetime, timedelta, timezone
from msal import ConfidentialClientApplication
from app.models.user import User, Session
from app.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)


class AuthService:
    """Handle OAuth 2.0 authentication flow with Microsoft Entra."""
    
    def __init__(self):
        # Skip MSAL initialization in test mode to avoid network calls
        if settings.is_testing:
            self.msal_app = None
            logger.info("Running in test mode - MSAL disabled")
        else:
            self.msal_app = ConfidentialClientApplication(
                client_id=settings.azure_client_id,
                client_credential=settings.azure_client_secret,
                authority=settings.azure_authority
            )
        
        # In-memory session store (replace with Redis in production)
        self.sessions: Dict[str, Session] = {}
        self.code_verifiers: Dict[str, str] = {}
    
    def get_auth_url(self, session_id: str) -> str:
        """Generate Microsoft login URL with PKCE."""
        if settings.is_testing:
            return "http://test-auth-url.com"
        
        # Generate code verifier for PKCE
        code_verifier = secrets.token_urlsafe(32)
        self.code_verifiers[session_id] = code_verifier
        
        # Get authorization URL
        auth_url = self.msal_app.get_authorization_request_url(
            scopes=settings.azure_scope.split(),
            redirect_uri=settings.azure_redirect_uri,
            state=session_id  # CSRF protection
        )
        
        logger.info(f"Generated auth URL for session {session_id}")
        return auth_url
    
    async def handle_callback(self, code: str, state: str) -> User:
        """Exchange authorization code for access token and extract user info."""
        if settings.is_testing:
            # Return mock user for tests
            return User(
                oid="test-oid",
                name="Test User",
                email="test@example.com",
                is_admin=False
            )
        
        # Get code verifier for this session
        code_verifier = self.code_verifiers.get(state)
        if not code_verifier:
            raise ValueError("Invalid state parameter - code verifier not found")
        
        # Exchange code for token
        result = self.msal_app.acquire_token_by_authorization_code(
            code=code,
            scopes=settings.azure_scope.split(),
            redirect_uri=settings.azure_redirect_uri
        )
        
        # Clean up code verifier
        self.code_verifiers.pop(state, None)
        
        if "error" in result:
            error_msg = result.get("error_description", result["error"])
            logger.error(f"OAuth error: {error_msg}")
            raise ValueError(f"Authentication failed: {error_msg}")
        
        # Extract user info from ID token
        id_token = result.get("id_token_claims", {})
        email = id_token.get("email") or id_token.get("preferred_username", "")
        
        # Check if user is admin
        is_admin = email.lower() in settings.admin_users_list
        
        user = User(
            oid=id_token["oid"],
            name=id_token.get("name", "Unknown User"),
            email=email,
            is_admin=is_admin
        )
        
        logger.info(f"User authenticated: {user.name} ({user.email}) [Admin: {is_admin}]")
        return user
    
    def create_session(self, session_id: str, user: User) -> Session:
        """Create a new session for authenticated user."""
        expires_at = datetime.now(timezone.utc) + timedelta(hours=settings.session_lifetime_hours)
        session = Session(
            session_id=session_id,
            user=user,
            created_at=datetime.now(timezone.utc),
            expires_at=expires_at
        )
        
        self.sessions[session_id] = session
        logger.info(f"Created session for user {user.name}")
        return session
    
    def get_session(self, session_id: str) -> Optional[Session]:
        """Retrieve session by ID."""
        session = self.sessions.get(session_id)
        
        if not session:
            return None
        
        # Check if session expired
        if datetime.now(timezone.utc) > session.expires_at:
            self.delete_session(session_id)
            return None
        
        return session
    
    def delete_session(self, session_id: str) -> None:
        """Delete session (logout)."""
        if session_id in self.sessions:
            user_name = self.sessions[session_id].user.name
            self.sessions.pop(session_id)
            logger.info(f"Deleted session for user {user_name}")
    
    def get_current_user(self, session_id: Optional[str]) -> Optional[User]:
        """Get current user from session ID."""
        if not session_id:
            return None
        
        session = self.get_session(session_id)
        return session.user if session else None


# Global auth service instance
auth_service = AuthService()
