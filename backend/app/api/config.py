"""Configuration API endpoints."""
from fastapi import APIRouter
from typing import Dict, List, Any

router = APIRouter(prefix="/api/config", tags=["config"])


# Configuration data (moved from frontend)
CONFIG_DATA = {
    "purposes": [
        "RAI check",
        "Flight review",
        "GPT-5 migration",
        "Ad-hoc"
    ],
    "agent_types": [
        {"value": "DA", "label": "Declarative Agent"},
        {"value": "FCC", "label": "Federated Copilot Connector"},
        {"value": "OAI Apps SDK", "label": "OAI Apps SDK"}
    ],
    "agent_hierarchy": {
        "DA": {
            "Message Extensions": ["Mock MEs", "Jira Cloud"],
            "OpenAPI": ["GitHub Mock", "KYC Mock", "GitHub", "IDEAS", "KYC"],
            "Remote MCP": ["Monday.com", "Connect", "Sales UAT"],
            "Instructions++": ["Hugo", "Vantage Rewards", "Sales Genie", "IT Helpdesk", "Adobe Express"]
        },
        "FCC": ["Notion", "Canva", "HubSpot", "Linear", "Google Calendar", "Google Contacts", "Intercom"],
        "OAI Apps SDK": ["Others"]
    },
    "query_sets": [
        "Default",
        "Others"
    ],
    "configs": {
        "control": [
            "Current Prod",
            "Others"
        ],
        "treatment": [
            "Current Prod",
            "Others"
        ]
    },
    "priority_levels": [
        {"value": "Low", "label": "Low"},
        {"value": "Medium", "label": "Medium"},
        {"value": "High", "label": "High"}
    ]
}


@router.get("")
async def get_config() -> Dict[str, Any]:
    """
    Get all configuration data for the portal.
    
    Returns:
        Configuration including purposes, agent types, agents, query sets, and configs.
    """
    return CONFIG_DATA


@router.get("/purposes")
async def get_purposes() -> List[str]:
    """Get available evaluation purposes."""
    return CONFIG_DATA["purposes"]


@router.get("/agent-types")
async def get_agent_types() -> List[Dict[str, str]]:
    """Get available agent types."""
    return CONFIG_DATA["agent_types"]


@router.get("/agents")
async def get_agents() -> Dict[str, Any]:
    """Get agent hierarchy."""
    return CONFIG_DATA["agent_hierarchy"]


@router.get("/query-sets")
async def get_query_sets() -> List[str]:
    """Get available query sets."""
    return CONFIG_DATA["query_sets"]


@router.get("/configs")
async def get_configs() -> Dict[str, List[str]]:
    """Get available control and treatment configurations."""
    return CONFIG_DATA["configs"]


@router.get("/priority-levels")
async def get_priority_levels() -> List[Dict[str, str]]:
    """Get available priority levels."""
    return CONFIG_DATA["priority_levels"]
