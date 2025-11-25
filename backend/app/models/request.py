"""Pydantic models for evaluation requests."""
from datetime import datetime, timezone
from typing import List, Literal, Optional
from enum import Enum
from pydantic import BaseModel, Field, field_validator, HttpUrl


class Priority(str, Enum):
    """Priority levels for evaluation requests."""
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class UpdateEntry(BaseModel):
    """Model for an update history entry."""
    notes: str = Field(..., max_length=1000, description="Update notes")
    updated_by: str = Field(..., description="Person who made the update")
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="When this update was made")
    links_added: int = Field(0, description="Number of links added in this update")
    
    class Config:
        json_schema_extra = {
            "example": {
                "notes": "Updated based on new requirements",
                "updated_by": "John Doe",
                "updated_at": "2025-11-24T15:30:00Z",
                "links_added": 2
            }
        }


class RunLink(BaseModel):
    """Model for a run link with optional notes."""
    url: str = Field(..., description="URL to the evaluation run")
    notes: Optional[str] = Field(None, max_length=500, description="Optional notes about this run")
    added_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="When this link was added")
    
    @field_validator('url')
    @classmethod
    def validate_url(cls, v: str) -> str:
        """Validate URL format."""
        if not v.startswith(('http://', 'https://')):
            raise ValueError('URL must start with http:// or https://')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "url": "https://example.com/run/12345",
                "notes": "Initial baseline run",
                "added_at": "2025-11-21T10:30:00Z"
            }
        }


class RequestBase(BaseModel):
    """Base model for request data."""
    purpose: Literal["RAI check", "Flight review", "GPT-5 migration", "Ad-hoc"] = Field(
        ..., description="Purpose of the evaluation"
    )
    purpose_reason: Optional[str] = Field(
        None, max_length=500, description="Required reason if purpose is Ad-hoc"
    )
    agent_type: Literal["DA", "FCC", "OAI Apps SDK"] = Field(
        ..., description="Type of agent: Declarative Agent, Federated Copilot Connector, or OAI Apps SDK"
    )
    agents: List[str] = Field(
        ..., min_length=1, description="List of selected agents"
    )
    query_set: str = Field(..., description="Query set to use for evaluation")
    query_set_details: Optional[str] = Field(
        None, max_length=500, description="Details if using custom query set"
    )
    control_config: str = Field(..., description="Control configuration")
    treatment_config: str = Field(..., description="Treatment configuration")
    notes: Optional[str] = Field(None, max_length=2000, description="Additional notes")
    priority: Priority = Field(Priority.MEDIUM, description="Priority level (Low, Medium, High)")
    on_behalf_of: Optional[str] = Field(None, max_length=200, description="Name of person this request is submitted on behalf of")
    
    @field_validator('purpose_reason')
    @classmethod
    def validate_purpose_reason(cls, v: Optional[str], info) -> Optional[str]:
        """Validate that purpose_reason is provided for Ad-hoc requests."""
        if info.data.get('purpose') == 'Ad-hoc' and not v:
            raise ValueError('purpose_reason is required for Ad-hoc requests')
        return v
    
    @field_validator('query_set_details')
    @classmethod
    def validate_query_set_details(cls, v: Optional[str], info) -> Optional[str]:
        """Validate that query_set_details is provided for Others query set."""
        if info.data.get('query_set') == 'Others' and not v:
            raise ValueError('query_set_details is required for Others query set')
        return v


class RequestCreate(RequestBase):
    """Model for creating a new request (submitter added by backend)."""
    pass


class RequestUpdate(BaseModel):
    """Model for updating an existing request."""
    purpose: Optional[Literal["RAI check", "Flight review", "GPT-5 migration", "Ad-hoc"]] = None
    purpose_reason: Optional[str] = Field(None, max_length=500)
    agent_type: Optional[Literal["DA", "FCC", "OAI Apps SDK"]] = None
    agents: Optional[List[str]] = Field(None, min_length=1)
    query_set: Optional[str] = None
    query_set_details: Optional[str] = Field(None, max_length=500)
    control_config: Optional[str] = None
    treatment_config: Optional[str] = None
    notes: Optional[str] = Field(None, max_length=2000)
    priority: Optional[Priority] = None
    on_behalf_of: Optional[str] = Field(None, max_length=200)


class Request(RequestBase):
    """Complete request model with all fields."""
    id: str = Field(..., description="Unique request identifier")
    submitter: str = Field(..., description="Name of the person who submitted the request")
    submitted_at: datetime = Field(..., description="When the request was submitted")
    status: Literal["pending", "in_progress", "completed"] = Field(
        ..., description="Current status of the request"
    )
    executor: Optional[str] = Field(None, description="Person executing the evaluation")
    started_at: Optional[datetime] = Field(None, description="When execution started")
    completed_at: Optional[datetime] = Field(None, description="When execution completed")
    run_links: List[RunLink] = Field(default_factory=list, description="List of run links")
    update_history: List[UpdateEntry] = Field(default_factory=list, description="History of updates made to this request")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "req_1732194823_abc123",
                "purpose": "Flight review",
                "purpose_reason": None,
                "agent_type": "DA",
                "agents": ["GitHub Mock", "GitHub"],
                "query_set": "Default",
                "query_set_details": None,
                "control_config": "Current Prod",
                "treatment_config": "Others",
                "notes": "Testing OpenAPI agents",
                "priority": "Medium",
                "submitter": "John Doe",
                "submitted_at": "2025-11-21T10:20:00Z",
                "status": "pending",
                "executor": None,
                "started_at": None,
                "completed_at": None,
                "run_links": []
            }
        }


class StartEvaluation(BaseModel):
    """Model for starting an evaluation."""
    run_links: List[RunLink] = Field(..., min_length=1, max_length=10)


class AddRunLinks(BaseModel):
    """Model for adding run links to an in-progress or completed evaluation."""
    run_links: List[RunLink] = Field(default_factory=list, max_length=10, description="Run links to add (optional if update_notes provided)")
    update_notes: Optional[str] = Field(None, max_length=1000, description="Notes about this update")
    
    @field_validator('update_notes')
    @classmethod
    def validate_at_least_one_field(cls, v, info):
        """Validate that either run_links or update_notes is provided."""
        run_links = info.data.get('run_links', [])
        if not run_links and not v:
            raise ValueError('Either run_links or update_notes must be provided')
        return v
