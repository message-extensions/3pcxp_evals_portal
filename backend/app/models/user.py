"""Pydantic models for user and authentication."""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class User(BaseModel):
    """User model with information from Microsoft Entra."""
    oid: str = Field(..., description="Object ID from Azure AD (unique user identifier)")
    name: str = Field(..., description="Display name of the user")
    email: Optional[str] = Field(None, description="Email address of the user")
    
    class Config:
        json_schema_extra = {
            "example": {
                "oid": "12345678-1234-1234-1234-123456789abc",
                "name": "John Doe",
                "email": "john.doe@company.com"
            }
        }


class Session(BaseModel):
    """Session model for storing user session data."""
    session_id: str
    user: User
    created_at: datetime
    expires_at: datetime
