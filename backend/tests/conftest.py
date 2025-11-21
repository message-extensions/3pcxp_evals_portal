"""Pytest configuration and shared fixtures."""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.auth_service import auth_service
from app.models.user import User


@pytest.fixture
def client():
    """FastAPI test client."""
    return TestClient(app)


@pytest.fixture
def mock_user():
    """Mock authenticated user."""
    return User(
        oid="test-oid-12345",
        name="Test User",
        email="test.user@example.com"
    )


@pytest.fixture
def authenticated_client(client, mock_user):
    """Test client with authenticated session."""
    # Create session
    session_id = "test-session-12345"
    auth_service.create_session(session_id, mock_user)
    
    # Set cookie in client
    client.cookies.set("session_id", session_id)
    
    yield client
    
    # Cleanup
    auth_service.delete_session(session_id)


@pytest.fixture
def sample_request_data():
    """Sample request creation data."""
    return {
        "purpose": "Flight review",
        "agent_type": "DA",
        "agents": ["GitHub Mock", "GitHub"],
        "query_set": "Default",
        "control_config": "Control v1",
        "treatment_config": "Treatment v2",
        "notes": "Test evaluation request",
        "high_priority": False
    }
