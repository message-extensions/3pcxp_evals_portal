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


def test_delete_request(admin_client, sample_request_data):
    """Test deleting a request (admin only)."""
    # Create request (as admin)
    create_response = admin_client.post(
        "/api/requests",
        json=sample_request_data
    )
    request_id = create_response.json()["id"]
    
    # Delete request (requires admin)
    response = admin_client.delete(f"/api/requests/{request_id}")
    assert response.status_code == 204
    
    # Verify deletion
    get_response = admin_client.get(f"/api/requests/{request_id}")
    assert get_response.status_code == 404


def test_delete_request_non_admin(authenticated_client, sample_request_data):
    """Test that non-admin users cannot delete requests."""
    # Create request
    create_response = authenticated_client.post(
        "/api/requests",
        json=sample_request_data
    )
    request_id = create_response.json()["id"]
    
    # Try to delete as non-admin (should fail)
    response = authenticated_client.delete(f"/api/requests/{request_id}")
    assert response.status_code == 403
    assert "Admin privileges required" in response.json()["detail"]


def test_add_run_links_to_completed_evaluation(authenticated_client, sample_request_data):
    """Test that run links can be added to completed evaluations (added Nov 2025)."""
    # Create and complete a request
    create_response = authenticated_client.post(
        "/api/requests",
        json=sample_request_data
    )
    request_id = create_response.json()["id"]
    
    # Start and complete
    start_data = {"run_links": [{"url": "https://example.com/run1"}]}
    authenticated_client.post(f"/api/requests/{request_id}/start", json=start_data)
    authenticated_client.post(f"/api/requests/{request_id}/complete")
    
    # Add run links to completed evaluation (new feature)
    add_links_data = {
        "run_links": [{"url": "https://example.com/additional-run"}],
        "update_notes": "Adding post-analysis results"
    }
    response = authenticated_client.post(
        f"/api/requests/{request_id}/links",
        json=add_links_data
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"  # Status should remain completed
    assert len(data["run_links"]) == 2  # Original + new link


def test_create_request_with_on_behalf_of(authenticated_client, sample_request_data):
    """Test creating request with on_behalf_of field (added Nov 2025)."""
    sample_request_data["on_behalf_of"] = "John Smith"
    
    response = authenticated_client.post(
        "/api/requests",
        json=sample_request_data
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["on_behalf_of"] == "John Smith"


def test_create_request_with_oai_apps_sdk(authenticated_client):
    """Test creating request with OAI Apps SDK agent type (added Nov 2025)."""
    request_data = {
        "purpose": "Flight review",
        "agent_type": "OAI Apps SDK",
        "agents": ["Custom Agent 1", "Custom Agent 2"],
        "query_set": "Default",
        "control_config": "Current Prod",
        "treatment_config": "Current Prod"
    }
    
    response = authenticated_client.post(
        "/api/requests",
        json=request_data
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["agent_type"] == "OAI Apps SDK"
    assert data["agents"] == ["Custom Agent 1", "Custom Agent 2"]


def test_update_with_only_notes(authenticated_client, sample_request_data):
    """Test that updates can be submitted with only notes (no links required)."""
    # Create and start a request
    create_response = authenticated_client.post(
        "/api/requests",
        json=sample_request_data
    )
    request_id = create_response.json()["id"]
    
    # Start evaluation
    start_data = {"run_links": [{"url": "https://example.com/run1"}]}
    authenticated_client.post(f"/api/requests/{request_id}/start", json=start_data)
    
    # Update with only notes (no run_links)
    update_data = {
        "run_links": [],
        "update_notes": "Updated analysis parameters based on new requirements"
    }
    response = authenticated_client.post(
        f"/api/requests/{request_id}/links",
        json=update_data
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "in_progress"
    assert len(data["run_links"]) == 1  # Still has original link, no new links added
    
    # Verify update history was created
    assert "update_history" in data
    assert len(data["update_history"]) == 1
    assert data["update_history"][0]["notes"] == "Updated analysis parameters based on new requirements"
    assert data["update_history"][0]["updated_by"] == "Test User"
    assert data["update_history"][0]["links_added"] == 0


def test_update_requires_notes_or_links(authenticated_client, sample_request_data):
    """Test that updates require at least notes or links (not both empty)."""
    # Create and start a request
    create_response = authenticated_client.post(
        "/api/requests",
        json=sample_request_data
    )
    request_id = create_response.json()["id"]
    
    # Start evaluation
    start_data = {"run_links": [{"url": "https://example.com/run1"}]}
    authenticated_client.post(f"/api/requests/{request_id}/start", json=start_data)
    
    # Try to update with neither notes nor links (should fail)
    update_data = {
        "run_links": [],
        "update_notes": ""
    }
    response = authenticated_client.post(
        f"/api/requests/{request_id}/links",
        json=update_data
    )
    
    assert response.status_code == 422  # Validation error


def test_update_with_notes_and_links(authenticated_client, sample_request_data):
    """Test that updates work correctly with both notes and links."""
    # Create and start a request
    create_response = authenticated_client.post(
        "/api/requests",
        json=sample_request_data
    )
    request_id = create_response.json()["id"]
    
    # Start evaluation
    start_data = {"run_links": [{"url": "https://example.com/run1"}]}
    authenticated_client.post(f"/api/requests/{request_id}/start", json=start_data)
    
    # Update with both notes and links
    update_data = {
        "run_links": [
            {"url": "https://example.com/run2", "notes": "Second iteration"},
            {"url": "https://example.com/run3"}
        ],
        "update_notes": "Added two more test runs with updated configuration"
    }
    response = authenticated_client.post(
        f"/api/requests/{request_id}/links",
        json=update_data
    )
    
    assert response.status_code == 200
    data = response.json()
    assert len(data["run_links"]) == 3  # Original + 2 new links
    
    # Verify update history
    assert len(data["update_history"]) == 1
    assert data["update_history"][0]["notes"] == "Added two more test runs with updated configuration"
    assert data["update_history"][0]["links_added"] == 2
    assert data["update_history"][0]["updated_by"] == "Test User"
