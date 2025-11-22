"""Pytest configuration and shared fixtures."""
import pytest
import asyncio
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
    """Mock authenticated user (non-admin)."""
    return User(
        oid="test-oid-12345",
        name="Test User",
        email="test.user@example.com",
        is_admin=False
    )


@pytest.fixture
def mock_admin_user():
    """Mock authenticated admin user."""
    return User(
        oid="admin-oid-12345",
        name="Admin User",
        email="admin@example.com",
        is_admin=True
    )


@pytest.fixture
def authenticated_client(client, mock_user):
    """Test client with authenticated session (non-admin)."""
    # Create session using asyncio.run for sync fixture
    session_id = "test-session-12345"
    asyncio.run(auth_service.create_session(session_id, mock_user))
    
    # Set cookie in client
    client.cookies.set("session_id", session_id)
    
    yield client
    
    # Cleanup
    asyncio.run(auth_service.delete_session(session_id))


@pytest.fixture
def admin_client(client, mock_admin_user):
    """Test client with authenticated admin session."""
    # Create session using asyncio.run for sync fixture
    session_id = "admin-session-12345"
    asyncio.run(auth_service.create_session(session_id, mock_admin_user))
    
    # Set cookie in client
    client.cookies.set("session_id", session_id)
    
    yield client
    
    # Cleanup
    asyncio.run(auth_service.delete_session(session_id))


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
        "priority": "Medium"
    }