"""Tests for request API endpoints."""
import pytest
from app.models.request import Request


def test_list_requests_unauthenticated(client):
    """Test that unauthenticated requests are rejected."""
    response = client.get("/api/requests")
    assert response.status_code == 401


def test_list_requests_authenticated(authenticated_client):
    """Test listing requests when authenticated."""
    response = authenticated_client.get("/api/requests")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_request(authenticated_client, sample_request_data):
    """Test creating a new request."""
    response = authenticated_client.post(
        "/api/requests",
        json=sample_request_data
    )
    
    assert response.status_code == 201
    data = response.json()
    
    # Verify response structure
    assert "id" in data
    assert data["purpose"] == sample_request_data["purpose"]
    assert data["agent_type"] == sample_request_data["agent_type"]
    assert data["agents"] == sample_request_data["agents"]
    assert data["status"] == "pending"
    assert data["submitter"] == "Test User"
    assert "submitted_at" in data


def test_get_request(authenticated_client, sample_request_data):
    """Test retrieving a specific request."""
    # Create request first
    create_response = authenticated_client.post(
        "/api/requests",
        json=sample_request_data
    )
    request_id = create_response.json()["id"]
    
    # Get request
    response = authenticated_client.get(f"/api/requests/{request_id}")
    assert response.status_code == 200
    
    data = response.json()
    assert data["id"] == request_id
    assert data["purpose"] == sample_request_data["purpose"]


def test_get_nonexistent_request(authenticated_client):
    """Test getting a request that doesn't exist."""
    response = authenticated_client.get("/api/requests/nonexistent-id")
    assert response.status_code == 404


def test_start_evaluation(authenticated_client, sample_request_data):
    """Test starting an evaluation."""
    # Create request
    create_response = authenticated_client.post(
        "/api/requests",
        json=sample_request_data
    )
    request_id = create_response.json()["id"]
    
    # Start evaluation
    start_data = {
        "run_links": [
            {"url": "https://example.com/run1", "notes": "Initial run"}
        ]
    }
    response = authenticated_client.post(
        f"/api/requests/{request_id}/start",
        json=start_data
    )
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["status"] == "in_progress"
    assert data["executor"] == "Test User"
    assert "started_at" in data
    assert len(data["run_links"]) == 1
    assert data["run_links"][0]["url"] == "https://example.com/run1"


def test_complete_evaluation(authenticated_client, sample_request_data):
    """Test completing an evaluation."""
    # Create and start request
    create_response = authenticated_client.post(
        "/api/requests",
        json=sample_request_data
    )
    request_id = create_response.json()["id"]
    
    start_data = {
        "run_links": [{"url": "https://example.com/run1"}]
    }
    authenticated_client.post(f"/api/requests/{request_id}/start", json=start_data)
    
    # Complete evaluation
    response = authenticated_client.post(f"/api/requests/{request_id}/complete")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["status"] == "completed"
    assert "completed_at" in data


def test_delete_request(authenticated_client, sample_request_data):
    """Test deleting a request."""
    # Create request
    create_response = authenticated_client.post(
        "/api/requests",
        json=sample_request_data
    )
    request_id = create_response.json()["id"]
    
    # Delete request
    response = authenticated_client.delete(f"/api/requests/{request_id}")
    assert response.status_code == 204
    
    # Verify deletion
    get_response = authenticated_client.get(f"/api/requests/{request_id}")
    assert get_response.status_code == 404
