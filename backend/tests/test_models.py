"""Tests for Pydantic models and data validation."""

import json
from pathlib import Path
import pytest
from app.models.request import Request, RequestCreate, RunLink


class TestRequestModelValidation:
    """Test Request model validation and field handling."""
    
    def test_request_loads_without_optional_fields(self):
        """Test that Request model loads with minimal required fields (pre-Nov 2025 format)."""
        old_json = {
            "id": "req_test_123",
            "purpose": "Flight review",
            "purpose_reason": None,
            "agent_type": "DA",
            "agents": ["GitHub", "KYC"],
            "query_set": "Default",
            "query_set_details": None,
            "control_config": "Current Prod",
            "treatment_config": "Current Prod",
            "notes": None,
            "priority": "Low",
            "submitter": "Test User",
            "submitted_at": "2025-11-21T10:00:00Z",
            "status": "pending",
            "executor": None,
            "started_at": None,
            "completed_at": None,
            "run_links": []
        }
        
        # Should load successfully with new optional fields defaulting to None
        request = Request(**old_json)
        assert request.on_behalf_of is None
        assert request.agent_type == "DA"
        assert request.submitter == "Test User"
    
    def test_request_with_run_links(self):
        """Test that run_links load correctly with all fields."""
        json_data = {
            "id": "req_test_456",
            "purpose": "RAI check",
            "purpose_reason": None,
            "agent_type": "FCC",
            "agents": ["Copilot"],
            "query_set": "Default",
            "query_set_details": None,
            "control_config": "Current Prod",
            "treatment_config": "Current Prod",
            "notes": None,
            "priority": "Medium",
            "submitter": "Test User",
            "submitted_at": "2025-11-21T10:00:00Z",
            "status": "in_progress",
            "executor": "Executor User",
            "started_at": "2025-11-21T10:10:00Z",
            "completed_at": None,
            "run_links": [
                {
                    "url": "https://example.com/run1",
                    "notes": "Test run",
                    "added_at": "2025-11-21T10:10:00Z"
                }
            ]
        }
        
        request = Request(**json_data)
        assert len(request.run_links) == 1
        assert request.run_links[0].url == "https://example.com/run1"
        assert request.run_links[0].notes == "Test run"


class TestOAIAppsSDKAgentType:
    """Test OAI Apps SDK agent type (added Nov 2025)."""
    
    def test_request_create_with_oai_apps_sdk(self):
        """Test that RequestCreate accepts OAI Apps SDK agent type."""
        new_request = RequestCreate(
            purpose="Ad-hoc",
            purpose_reason="Testing new agent type",
            agent_type="OAI Apps SDK",
            agents=["Others"],
            query_set="Default",
            control_config="Current Prod",
            treatment_config="Current Prod"
        )
        
        assert new_request.agent_type == "OAI Apps SDK"
        assert "Others" in new_request.agents
    
    def test_oai_apps_sdk_in_completed_request(self):
        """Test that OAI Apps SDK works in completed requests."""
        request = Request(
            id="req_oai_test",
            purpose="Flight review",
            agent_type="OAI Apps SDK",
            agents=["Custom Agent 1", "Custom Agent 2"],
            query_set="Default",
            control_config="Current Prod",
            treatment_config="Current Prod",
            submitter="Test User",
            submitted_at="2025-11-24T10:00:00Z",
            status="completed",
            executor="Test Executor",
            started_at="2025-11-24T10:05:00Z",
            completed_at="2025-11-24T11:00:00Z",
            run_links=[]
        )
        
        assert request.agent_type == "OAI Apps SDK"
        assert request.status == "completed"


class TestOnBehalfOfField:
    """Test on_behalf_of field (added Nov 2025)."""
    
    def test_request_create_with_on_behalf_of(self):
        """Test that RequestCreate accepts on_behalf_of field."""
        new_request = RequestCreate(
            purpose="Flight review",
            agent_type="DA",
            agents=["GitHub"],
            query_set="Default",
            control_config="Current Prod",
            treatment_config="Current Prod",
            on_behalf_of="Jane Doe"
        )
        
        assert new_request.on_behalf_of == "Jane Doe"
    
    def test_request_create_without_on_behalf_of(self):
        """Test that RequestCreate works without on_behalf_of (defaults to None)."""
        new_request = RequestCreate(
            purpose="GPT-5 migration",
            agent_type="FCC",
            agents=["Copilot"],
            query_set="Default",
            control_config="Current Prod",
            treatment_config="Current Prod"
        )
        
        assert new_request.on_behalf_of is None
    
    def test_on_behalf_of_max_length(self):
        """Test that on_behalf_of enforces max length of 200 chars."""
        with pytest.raises(ValueError):
            RequestCreate(
                purpose="Flight review",
                agent_type="DA",
                agents=["GitHub"],
                query_set="Default",
                control_config="Current Prod",
                treatment_config="Current Prod",
                on_behalf_of="x" * 201  # Exceeds max length
            )


class TestRunLinkModel:
    """Test RunLink model validation."""
    
    def test_run_link_url_validation(self):
        """Test that RunLink validates URL format."""
        # Valid HTTP URL
        link = RunLink(url="http://example.com/run", added_at="2025-11-24T10:00:00Z")
        assert link.url == "http://example.com/run"
        
        # Valid HTTPS URL
        link = RunLink(url="https://example.com/run", added_at="2025-11-24T10:00:00Z")
        assert link.url == "https://example.com/run"
        
        # Invalid URL (no protocol)
        with pytest.raises(ValueError, match="URL must start with http"):
            RunLink(url="example.com/run", added_at="2025-11-24T10:00:00Z")
    
    def test_run_link_with_notes(self):
        """Test RunLink with optional notes field."""
        link = RunLink(
            url="https://example.com/run",
            notes="This is a test run with specific configuration",
            added_at="2025-11-24T10:00:00Z"
        )
        assert link.notes == "This is a test run with specific configuration"
    
    def test_run_link_without_notes(self):
        """Test RunLink without notes (defaults to None)."""
        link = RunLink(url="https://example.com/run", added_at="2025-11-24T10:00:00Z")
        assert link.notes is None


class TestExistingDataCompatibility:
    """Test that existing JSON data loads correctly (critical for deployments)."""
    
    def test_existing_json_file_loads(self):
        """Test that existing JSON files in data/requests/ load correctly."""
        data_dir = Path(__file__).parent.parent / "data" / "requests"
        
        if not data_dir.exists():
            pytest.skip("No data/requests directory found")
        
        json_files = list(data_dir.glob("*.json"))
        
        if not json_files:
            pytest.skip("No existing JSON files to test")
        
        # Try loading all JSON files
        for json_file in json_files:
            with open(json_file, 'r') as f:
                data = json.load(f)
            
            # Should load successfully even without new fields
            request = Request(**data)
            assert request.id is not None
            assert request.submitter is not None
            # on_behalf_of should default to None if not present
            assert hasattr(request, 'on_behalf_of')
    
    def test_legacy_format_without_new_fields(self):
        """Test that legacy request format (before Nov 2025) works."""
        legacy_request = {
            "id": "req_legacy_001",
            "purpose": "RAI check",
            "agent_type": "DA",  # Only DA and FCC existed before
            "agents": ["GitHub", "KYC"],
            "query_set": "Default",
            "control_config": "Current Prod",
            "treatment_config": "Current Prod",
            "priority": "Medium",
            "submitter": "Legacy User",
            "submitted_at": "2025-10-01T10:00:00Z",
            "status": "completed",
            "executor": "Legacy Executor",
            "started_at": "2025-10-01T10:05:00Z",
            "completed_at": "2025-10-01T11:00:00Z",
            "run_links": [
                {
                    "url": "https://example.com/legacy-run",
                    "added_at": "2025-10-01T10:05:00Z"
                }
            ]
            # Note: No on_behalf_of, no purpose_reason, no query_set_details, no notes
        }
        
        # Should load without errors
        request = Request(**legacy_request)
        assert request.id == "req_legacy_001"
        assert request.on_behalf_of is None  # Should default to None
        assert request.purpose_reason is None
        assert request.notes is None


class TestPriorityValidation:
    """Test priority field validation."""
    
    def test_valid_priorities(self):
        """Test that all valid priority values work."""
        for priority in ["Low", "Medium", "High"]:
            request = RequestCreate(
                purpose="Flight review",
                agent_type="DA",
                agents=["GitHub"],
                query_set="Default",
                control_config="Current Prod",
                treatment_config="Current Prod",
                priority=priority
            )
            assert request.priority == priority
    
    def test_priority_defaults_to_medium(self):
        """Test that priority defaults to Medium when not specified."""
        request = RequestCreate(
            purpose="Flight review",
            agent_type="DA",
            agents=["GitHub"],
            query_set="Default",
            control_config="Current Prod",
            treatment_config="Current Prod"
        )
        assert request.priority == "Medium"


class TestPurposeValidation:
    """Test purpose field validation."""
    
    def test_adhoc_purpose_requires_reason(self):
        """Test that Ad-hoc purpose requires purpose_reason."""
        with pytest.raises(ValueError, match="purpose_reason is required"):
            RequestCreate(
                purpose="Ad-hoc",
                purpose_reason=None,  # Missing required reason
                agent_type="DA",
                agents=["GitHub"],
                query_set="Default",
                control_config="Current Prod",
                treatment_config="Current Prod"
            )
    
    def test_adhoc_purpose_with_reason(self):
        """Test that Ad-hoc purpose works with reason provided."""
        request = RequestCreate(
            purpose="Ad-hoc",
            purpose_reason="Testing custom scenario",
            agent_type="DA",
            agents=["GitHub"],
            query_set="Default",
            control_config="Current Prod",
            treatment_config="Current Prod"
        )
        assert request.purpose == "Ad-hoc"
        assert request.purpose_reason == "Testing custom scenario"
    
    def test_non_adhoc_purposes_work_without_reason(self):
        """Test that non-Ad-hoc purposes don't require reason."""
        for purpose in ["RAI check", "Flight review", "GPT-5 migration"]:
            request = RequestCreate(
                purpose=purpose,
                agent_type="DA",
                agents=["GitHub"],
                query_set="Default",
                control_config="Current Prod",
                treatment_config="Current Prod"
            )
            assert request.purpose == purpose
            assert request.purpose_reason is None
