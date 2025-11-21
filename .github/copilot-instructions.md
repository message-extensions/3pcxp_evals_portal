# 3PCxP Evals Portal - AI Agent Instructions

## Project Overview
This is a centralized evaluation request management portal for the M365 Core IDC Copilot Extensibility Platform Team. The portal tracks evaluation requests through three states: Pending → In Progress → Completed.

**Phase 1 Status:** ✅ Complete - Vanilla frontend with localStorage
**Current Phase:** Phase 2 - FastAPI backend + Microsoft Entra OAuth 2.0
**Target:** Production-ready system with authenticated backend API and JSON file storage

## Architecture & Tech Stack

### Phase 1 Constraints (Completed)
- **No frameworks:** Pure HTML5, CSS3, ES6+ JavaScript only
- **No build tools:** Direct browser execution, no bundlers
- **No backend:** In-memory state with localStorage backup + JSON export/import
- **Offline-capable:** Zero external dependencies for core functionality

### Phase 2 Architecture (Current)

**Backend Stack:**
- **Framework:** FastAPI 0.104+ (Python 3.10+) with async/await
- **Server:** Uvicorn ASGI server
- **Authentication:** Microsoft Entra ID OAuth 2.0 with MSAL Python
- **Storage:** JSON files (one file per request) in `data/requests/` folder
- **File Operations:** Atomic writes with temporary file + rename pattern
- **Validation:** Pydantic v2 models with type hints
- **Configuration:** python-dotenv for environment management
- **API Docs:** Auto-generated OpenAPI/Swagger UI
- **Logging:** Structured JSON logging

**Frontend Modifications:**
- Same vanilla HTML/CSS/JS (no framework changes)
- New `api.js` module for backend communication
- New `auth.js` module for OAuth flow
- Modified `state.js` to use API calls instead of localStorage
- Session-based authentication with HTTP-only cookies

**Key Principles:**
- **Type Safety:** Full type hints in Python, Pydantic models for validation
- **Async Everything:** All I/O operations use async/await
- **Separation of Concerns:** Layered architecture (API → Service → Storage)
- **Fail-Safe Storage:** Atomic file writes prevent data corruption
- **Security First:** OAuth 2.0 with PKCE, HTTP-only cookies, CORS configuration
- **Clean Code:** Follow PEP 8, use Black formatter, isort for imports
- **Testability:** Dependency injection, pytest fixtures

### Phase 1 File Structure (Baseline)
```
frontend/
├── index.html              # Single-page application
├── css/
│   ├── main.css           # Global styles, layout, typography
│   ├── form.css           # Request submission form styles
│   ├── dashboard.css      # Table/card layouts for 3 sections
│   └── modal.css          # Execution/update modal styles
├── js/
│   ├── app.js             # Entry point, initialization
│   ├── state.js           # State management, CRUD operations
│   ├── form.js            # Form validation, conditional fields
│   ├── dashboard.js       # Render 3 sections, sorting, filtering
│   ├── modal.js           # Execution & update modal lifecycle
│   └── utils.js           # Date formatting, ID generation
└── assets/icons/          # SVG icons for status badges
```

### Phase 2 Complete Project Structure
```
evals-portal/
├── frontend/                      # Phase 1 code (mostly unchanged)
│   ├── index.html
│   ├── css/                       # All CSS files unchanged
│   ├── js/
│   │   ├── app.js                 # Modified: check auth on load
│   │   ├── state.js               # Modified: API calls instead of localStorage
│   │   ├── api.js                 # NEW: API client wrapper
│   │   ├── auth.js                # NEW: Auth flow handling
│   │   ├── form.js                # Modified: read-only user fields
│   │   ├── dashboard.js           # Unchanged
│   │   ├── modal.js               # Modified: read-only user fields
│   │   └── utils.js               # Unchanged
│   └── assets/
│
├── backend/                       # NEW: FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py               # FastAPI app, CORS, middleware setup
│   │   ├── config.py             # Settings from environment variables
│   │   │
│   │   ├── models/               # Pydantic models
│   │   │   ├── __init__.py
│   │   │   ├── request.py        # Request, RunLink models
│   │   │   └── user.py           # User, Session models
│   │   │
│   │   ├── api/                  # FastAPI route handlers
│   │   │   ├── __init__.py
│   │   │   ├── auth.py           # /auth/login, /auth/callback, /auth/me, /auth/logout
│   │   │   ├── requests.py       # /requests/* CRUD endpoints
│   │   │   └── health.py         # /health, /metrics
│   │   │
│   │   ├── services/             # Business logic (no FastAPI dependencies)
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py   # OAuth flow, MSAL integration
│   │   │   └── request_service.py # Request CRUD, validation
│   │   │
│   │   ├── storage/              # Data persistence layer
│   │   │   ├── __init__.py
│   │   │   ├── json_storage.py   # File-based storage with locking
│   │   │   └── file_lock.py      # Atomic write operations
│   │   │
│   │   ├── middleware/           # Custom middleware
│   │   │   ├── __init__.py
│   │   │   ├── auth_middleware.py # Session validation
│   │   │   └── logging_middleware.py # Request/response logging
│   │   │
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── logger.py         # Structured logging setup
│   │       └── validators.py     # Custom Pydantic validators
│   │
│   ├── requirements.txt          # Python dependencies
│   └── Dockerfile                # Backend container image
│
├── data/                          # JSON storage (gitignored except structure)
│   ├── requests/                 # One JSON file per request
│   │   └── .gitkeep
│   ├── backups/                  # Automatic backups on write
│   │   └── .gitkeep
│   └── index.json                # Fast lookup: {"request_ids": [...]}
│
├── tests/                         # Pytest test suite
│   ├── __init__.py
│   ├── conftest.py               # Shared fixtures, test client
│   ├── test_api/
│   │   ├── test_auth.py          # Authentication endpoint tests
│   │   └── test_requests.py      # Request CRUD tests
│   ├── test_services/
│   │   └── test_request_service.py
│   └── test_storage/
│       └── test_json_storage.py
│
├── docker-compose.yml            # Dev environment orchestration
├── .env.example                  # Environment variable template
├── .gitignore
├── README.md
└── SETUP.md                      # Phase 2 setup instructions
```

## Core Domain Model

### Request Object Schema (PRD Section 4.2)
```javascript
{
  id: "unique_id",
  purpose: "RAI check" | "Flight review" | "GPT-5 migration" | "Ad-hoc",
  purposeReason: string,  // Required if purpose === "Ad-hoc"
  agentType: "DA" | "FCC",
  agents: ["agent1", "agent2"],  // Multi-select from hierarchical tree
  querySet: "Default" | "Others",
  querySetDetails: string,  // Required if querySet === "Others"
  controlConfig: string,
  treatmentConfig: string,
  notes: string,
  submitter: string,
  submittedAt: ISO8601,
  status: "pending" | "in_progress" | "completed",
  executor: string,
  startedAt: ISO8601,
  completedAt: ISO8601,
  runLinks: [{url: string, notes: string, addedAt: ISO8601}]
}
```

## Critical Implementation Patterns

### 1. Hierarchical Agent Selection (PRD 1.2)
Multi-select dropdown with two levels:
- **Level 1:** DA vs FCC
- **Level 2 (DA only):** Categories (Message Extensions, OpenAPI, Remote MCP, Instructions++)
  - Message Extensions: Mock MEs, Jira Cloud
  - OpenAPI: GitHub Mock, KYC Mock, GitHub, IDEAS, KYC
  - Remote MCP: Monday.com, Connect, Sales UAT
  - Instructions++: Hugo, Vantage Rewards, Sales Genie, IT Helpdesk, Adobe Express

**Implementation:** Use checkboxes in nested `<details>`/`<summary>` or custom tree component. Display selected as removable chips.

### 2. Conditional Form Fields (PRD 1.1, 1.3, 1.4)
Three conditional patterns:
- Purpose === "Ad-hoc" → show `purposeReason` textarea (required)
- QuerySet === "Others" → show `querySetDetails` textarea (required)
- Control/Treatment === "Others" → show text input (required)

**Pattern:** Use `data-depends-on` attributes and event listeners to toggle `required` and `hidden` states dynamically.

### 3. State Persistence Strategy
```javascript
// state.js - Dual persistence approach
const state = {
  requests: [],
  save() {
    localStorage.setItem('evalsPortal', JSON.stringify(this.requests));
  },
  load() {
    const data = localStorage.getItem('evalsPortal');
    this.requests = data ? JSON.parse(data) : [];
  },
  exportJSON() {
    const blob = new Blob([JSON.stringify(this.requests, null, 2)], 
                          {type: 'application/json'});
    // Trigger download
  },
  importJSON(file) {
    // Parse and validate, then merge/replace requests
  }
};
```

### 4. Dashboard Rendering (3 Sections)
Each section (Pending/In Progress/Completed) renders same base data with different filters:
```javascript
// dashboard.js
function renderSection(status) {
  const filtered = state.requests.filter(r => r.status === status);
  const sorted = sortBy(filtered, currentSort);
  return filtered.map(req => createRow(req, status)).join('');
}
```

**Column visibility per section:**
- Pending: Type, Agent(s), Purpose, Submitter, Submitted At, Actions (Pick/Start)
- In Progress: + Executor, Run Links, Started At, Actions (Update, Mark Complete)
- Completed: + Completed At, Duration

### 5. Modal Lifecycle (PRD 2.4, 2.5)
```javascript
// modal.js
function showExecutionModal(requestId) {
  const modal = document.getElementById('execution-modal');
  modal.dataset.requestId = requestId;
  // Populate with request details (read-only preview)
  // Show executor name, run link inputs (min 1, max 10)
  modal.showModal(); // Use native <dialog> element
}

function submitExecution() {
  const requestId = modal.dataset.requestId;
  state.updateRequest(requestId, {
    status: 'in_progress',
    executor: form.executor.value,
    startedAt: new Date().toISOString(),
    runLinks: collectLinks()
  });
  modal.close();
  renderDashboard();
}
```

## Design System (PRD 6.2)

### Color Palette
```css
:root {
  --primary: #0078D4;      /* Actions, links */
  --success: #107C10;      /* Completed status */
  --warning: #FF8C00;      /* In progress */
  --neutral: #605E5C;      /* Pending */
  --danger: #D13438;       /* Errors */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F3F2F1;
}
```

### Spacing System
```css
:root {
  --space-1: 8px;   /* Base unit */
  --space-2: 16px;  /* Component padding */
  --space-3: 24px;  /* Section margins */
  --space-4: 32px;  /* Page margins */
}
```

## Key Workflows (PRD Section 7)

### Submit Request → Start → Update → Complete
1. **Submit:** Validate required fields, generate ID, set status='pending', submittedAt=now
2. **Start:** Open execution modal, collect executor + links, status='in_progress', startedAt=now
3. **Update:** Append new links/notes to `runLinks` array (never remove existing)
4. **Complete:** Confirmation dialog, status='completed', completedAt=now, calculate duration

## Testing Focus Areas (PRD 9.2)

Critical test scenarios:
- Multi-select agents across different categories (Message Extensions + OpenAPI)
- Conditional field validation (ad-hoc purpose, custom query set, custom configs)
- Multiple run links (1-10 links per evaluation)
- Export → clear → import → verify data integrity
- Sort/filter/search with 100+ requests (performance)
- Browser refresh preserves localStorage

## Development Commands

### Phase 1 (Frontend Only)
```bash
# Serve frontend directly
cd frontend
python -m http.server 8000
# Open http://localhost:8000
```

### Phase 2 (Full Stack)

**Backend Setup:**
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Azure AD credentials

# Run backend
cd backend
uvicorn app.main:app --reload --port 8000
# API docs: http://localhost:8000/docs
```

**Frontend (served by FastAPI):**
```bash
# Backend serves frontend static files
# Open http://localhost:8000
```

**Docker Development:**
```bash
# Build and run with docker-compose
docker-compose up --build

# Rebuild after changes
docker-compose up --build --force-recreate

# View logs
docker-compose logs -f backend

# Stop
docker-compose down
```

**Testing:**
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_api/test_auth.py -v

# Run with debug output
pytest -s -vv
```

## Phase 2 Critical Implementation Patterns

### 1. FastAPI Project Structure

**Layered Architecture:**
```
API Layer (app/api/)        → HTTP request/response, route definitions
    ↓
Service Layer (app/services/) → Business logic, orchestration
    ↓
Storage Layer (app/storage/)  → Data persistence, file I/O
```

**Dependency Injection Pattern:**
```python
# app/api/requests.py
from fastapi import Depends
from app.services.request_service import RequestService
from app.services.auth_service import get_current_user

@router.post("/requests")
async def create_request(
    request: RequestCreate,
    current_user: User = Depends(get_current_user),
    service: RequestService = Depends()
):
    request.submitter = current_user.name  # Auto-populate from auth
    return await service.create_request(request)
```

### 2. JSON File Storage Pattern

**Atomic Write Operation:**
```python
# app/storage/json_storage.py
import json
import os
from pathlib import Path
import fcntl  # File locking

class JSONStorage:
    async def save_request(self, request: dict) -> None:
        request_id = request["id"]
        file_path = self.data_dir / "requests" / f"{request_id}.json"
        temp_path = file_path.with_suffix(".tmp")
        
        # Write to temporary file first
        async with aiofiles.open(temp_path, 'w') as f:
            await f.write(json.dumps(request, indent=2))
        
        # Atomic rename (POSIX guarantee)
        os.replace(temp_path, file_path)
        
        # Update index
        await self._update_index(request_id)
        
        # Create backup
        await self._backup(file_path)
```

**Index Management:**
```python
# data/index.json structure
{
  "request_ids": [
    "req_1732194823_abc123",
    "req_1732194830_def456"
  ],
  "last_updated": "2025-11-21T10:30:00Z"
}

# Fast retrieval without scanning directory
async def list_all_requests(self) -> List[str]:
    index = await self._read_index()
    return index["request_ids"]
```

### 3. Microsoft Entra OAuth 2.0 Flow

**Authentication Service:**
```python
# app/services/auth_service.py
from msal import ConfidentialClientApplication
import secrets

class AuthService:
    def __init__(self, config: Settings):
        self.msal_app = ConfidentialClientApplication(
            client_id=config.azure_client_id,
            client_credential=config.azure_client_secret,
            authority=config.azure_authority
        )
    
    async def get_auth_url(self, session_id: str) -> str:
        """Generate Microsoft login URL with PKCE"""
        code_verifier = secrets.token_urlsafe(32)
        # Store verifier in session for callback
        await self.store_verifier(session_id, code_verifier)
        
        auth_url = self.msal_app.get_authorization_request_url(
            scopes=["User.Read", "email", "openid", "profile"],
            redirect_uri=config.azure_redirect_uri,
            state=session_id  # CSRF protection
        )
        return auth_url
    
    async def handle_callback(self, code: str, session_id: str) -> User:
        """Exchange auth code for access token"""
        code_verifier = await self.get_verifier(session_id)
        
        result = self.msal_app.acquire_token_by_authorization_code(
            code=code,
            scopes=["User.Read"],
            redirect_uri=config.azure_redirect_uri,
            code_verifier=code_verifier
        )
        
        if "error" in result:
            raise AuthenticationError(result["error_description"])
        
        # Extract user info from ID token
        id_token = result["id_token_claims"]
        user = User(
            oid=id_token["oid"],
            name=id_token.get("name"),
            email=id_token.get("email") or id_token.get("preferred_username")
        )
        
        return user
```

**API Endpoints:**
```python
# app/api/auth.py
from fastapi import APIRouter, Response, Request, Depends
from starlette.responses import RedirectResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.get("/login")
async def login(request: Request, response: Response):
    session_id = secrets.token_urlsafe(32)
    auth_url = await auth_service.get_auth_url(session_id)
    
    # Set session cookie
    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        secure=True,  # HTTPS only in production
        samesite="lax"
    )
    
    return RedirectResponse(auth_url)

@router.get("/callback")
async def callback(code: str, state: str, request: Request):
    session_id = request.cookies.get("session_id")
    
    if session_id != state:
        raise HTTPException(400, "Invalid state parameter")
    
    user = await auth_service.handle_callback(code, session_id)
    
    # Store user in session
    await session_store.set(session_id, user.dict())
    
    return RedirectResponse("/")

@router.get("/me")
async def get_current_user(user: User = Depends(get_current_user)):
    return user

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("session_id")
    return {"message": "Logged out successfully"}
```

### 4. Frontend API Integration

**API Client (api.js):**
```javascript
// frontend/js/api.js
class APIClient {
  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      credentials: 'include',  // Send cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (response.status === 401) {
      // Not authenticated - redirect to login
      window.location.href = '/api/auth/login';
      return;
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Request failed');
    }

    return response.json();
  }

  // Request endpoints
  async getRequests() {
    return this.request('/requests');
  }

  async createRequest(data) {
    return this.request('/requests', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateRequest(id, data) {
    return this.request(`/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async startEvaluation(id, data) {
    return this.request(`/requests/${id}/start`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Auth endpoints
  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }
}

const api = new APIClient();
```

**Modified State Management (state.js):**
```javascript
// frontend/js/state.js
const state = {
  requests: [],
  currentUser: null,
  currentSort: { field: 'submittedAt', direction: 'desc' },
  searchQuery: '',

  // Initialize - check auth and load data
  async init() {
    try {
      this.currentUser = await api.getCurrentUser();
      await this.loadRequests();
    } catch (error) {
      console.error('Initialization failed:', error);
      // Will redirect to login via API client
    }
  },

  async loadRequests() {
    this.requests = await api.getRequests();
  },

  async addRequest(requestData) {
    // submitter auto-populated by backend from current user
    const request = await api.createRequest(requestData);
    this.requests.push(request);
    return request;
  },

  async startEvaluation(id, executor, runLinks) {
    // executor auto-populated by backend from current user
    const updated = await api.startEvaluation(id, { runLinks });
    const index = this.requests.findIndex(r => r.id === id);
    if (index !== -1) {
      this.requests[index] = updated;
    }
    return updated;
  },

  // No more localStorage, export, import methods
};
```

### 5. Pydantic Models

**Request Models:**
```python
# app/models/request.py
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Literal
from datetime import datetime

class RunLink(BaseModel):
    url: str = Field(..., pattern=r'^https?://')
    notes: Optional[str] = None
    added_at: datetime = Field(default_factory=datetime.utcnow)

class RequestBase(BaseModel):
    purpose: Literal["RAI check", "Flight review", "GPT-5 migration", "Ad-hoc"]
    purpose_reason: Optional[str] = None
    agent_type: Literal["DA", "FCC"]
    agents: List[str] = Field(..., min_items=1)
    query_set: str
    query_set_details: Optional[str] = None
    control_config: str
    treatment_config: str
    notes: Optional[str] = Field(None, max_length=2000)
    high_priority: bool = False
    
    @field_validator('purpose_reason')
    def validate_purpose_reason(cls, v, info):
        if info.data.get('purpose') == 'Ad-hoc' and not v:
            raise ValueError('purpose_reason required for Ad-hoc requests')
        return v

class RequestCreate(RequestBase):
    pass  # submitter added by backend

class Request(RequestBase):
    id: str
    submitter: str
    submitted_at: datetime
    status: Literal["pending", "in_progress", "completed"]
    executor: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    run_links: List[RunLink] = Field(default_factory=list)
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "req_1732194823_abc123",
                "purpose": "Flight review",
                "agent_type": "DA",
                "agents": ["GitHub Mock", "GitHub"],
                "submitter": "John Doe",
                "status": "pending"
            }
        }
```

### 6. Configuration Management

**Settings (config.py):**
```python
# app/config.py
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Azure AD
    azure_client_id: str
    azure_client_secret: str
    azure_tenant_id: str
    azure_redirect_uri: str = "http://localhost:8000/api/auth/callback"
    
    @property
    def azure_authority(self) -> str:
        return f"https://login.microsoftonline.com/{self.azure_tenant_id}"
    
    # Application
    secret_key: str
    environment: str = "development"
    allowed_origins: List[str] = ["http://localhost:8000"]
    
    # Storage
    data_dir: str = "./data"
    backup_enabled: bool = True
    backup_retention_days: int = 30
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    reload: bool = True
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
```

### 7. Error Handling

**Custom Exceptions:**
```python
# app/utils/exceptions.py
from fastapi import HTTPException, status

class AuthenticationError(HTTPException):
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail
        )

class NotFoundError(HTTPException):
    def __init__(self, resource: str, id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource} with id '{id}' not found"
        )

class ValidationError(HTTPException):
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail
        )
```

## Common Pitfalls to Avoid

### Phase 1 Pitfalls:
1. **Don't use localStorage as primary storage** - It's a backup. Primary is in-memory state. Always provide export/import.
2. **Don't mutate state directly** - Use state.updateRequest(), state.addRequest() methods
3. **Don't forget conditional field validation** - Required status changes based on other field values
4. **Don't hard-code agent lists** - Extract to constants/config for Phase 2 backend integration
5. **Unified view not tabs** - PRD 3.2 recommends all 3 sections visible simultaneously with scroll

### Phase 2 Pitfalls:
1. **Never commit .env file** - Always use .env.example with placeholders
2. **Don't store secrets in code** - Use environment variables exclusively
3. **Don't forget async/await** - All I/O operations must be async in FastAPI
4. **Don't trust user input** - Always validate with Pydantic models
5. **Don't skip atomic writes** - Use temp file + rename pattern for JSON storage
6. **Don't bypass authentication** - All API endpoints except /auth/* must check current user
7. **Don't mutate request objects** - Pydantic models are immutable; use .copy(update={...})
8. **Don't hardcode file paths** - Use Path objects and settings.data_dir
9. **Don't forget CORS credentials** - Must set allow_credentials=True for cookies
10. **Don't expose internal errors** - Return user-friendly messages, log details

## Migration Path from Phase 1 to Phase 2

### Frontend Changes (Minimal)
1. **Move files:** Copy Phase 1 code to `frontend/` folder
2. **Add api.js:** Create API client wrapper
3. **Add auth.js:** Add authentication checking
4. **Modify state.js:** Replace localStorage with API calls
5. **Modify app.js:** Add auth check on initialization
6. **Modify form.js:** Make submitter field read-only, pre-populate from user
7. **Modify modal.js:** Make executor field read-only, pre-populate from user
8. **Remove:** Export/import buttons (backend handles persistence)

### Backend Implementation (New)
1. **Setup FastAPI project:** Create layered architecture
2. **Implement OAuth:** Microsoft Entra integration with MSAL
3. **Create storage layer:** JSON file operations with atomic writes
4. **Define Pydantic models:** Request, User, RunLink schemas
5. **Build API endpoints:** RESTful routes for CRUD + auth
6. **Add middleware:** Session validation, logging
7. **Write tests:** pytest suite for all endpoints
8. **Configure Docker:** Containerize for deployment

### Data Migration
1. **Export Phase 1 data:** Use existing export feature
2. **Import to Phase 2:** POST each request to `/api/requests` endpoint
3. **Verify:** Check `data/requests/` folder contains JSON files
4. **Validate:** Use Phase 2 dashboard to confirm all data loaded

## Future Enhancements (Phase 3+)

Phase 3:
- Database migration (PostgreSQL for production scale)
- WebSocket for real-time updates
- Email notifications via Microsoft Graph API
- Advanced analytics dashboard
- Role-based access control (admin, executor, viewer)

Phase 4:
- Redis caching layer
- API rate limiting
- Comprehensive audit logging
- SLA tracking and alerts
- Bulk operations support

```bash
# .env.example
# Copy to .env and fill in your values

# ===== Azure AD / Microsoft Entra =====
AZURE_CLIENT_ID=your-client-id-from-azure-portal
AZURE_CLIENT_SECRET=your-client-secret-value
AZURE_TENANT_ID=your-tenant-id
AZURE_REDIRECT_URI=http://localhost:8000/api/auth/callback
AZURE_SCOPE=User.Read email openid profile

# ===== Application Security =====
SECRET_KEY=generate-with-secrets-token-urlsafe-32
ENVIRONMENT=development  # development | staging | production

# ===== CORS Configuration =====
ALLOWED_ORIGINS=http://localhost:8000,http://127.0.0.1:8000

# ===== Storage Configuration =====
DATA_DIR=./data
BACKUP_ENABLED=true
BACKUP_RETENTION_DAYS=30

# ===== Server Configuration =====
HOST=0.0.0.0
PORT=8000
RELOAD=true  # Auto-reload on code changes (dev only)
LOG_LEVEL=INFO  # DEBUG | INFO | WARNING | ERROR

# ===== Feature Flags =====
ENABLE_API_DOCS=true  # Swagger UI at /docs
ENABLE_METRICS=true   # Prometheus metrics at /metrics
```

## Quick Reference

### API Endpoints

**Authentication:**
- `GET /api/auth/login` - Redirect to Microsoft login
- `GET /api/auth/callback` - OAuth callback handler
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Clear session

**Requests:**
- `GET /api/requests` - List all requests (with filtering)
- `POST /api/requests` - Create new request (submitter auto-populated)
- `GET /api/requests/{id}` - Get request by ID
- `PUT /api/requests/{id}` - Update request
- `DELETE /api/requests/{id}` - Delete request
- `POST /api/requests/{id}/start` - Start evaluation (executor auto-populated)
- `POST /api/requests/{id}/links` - Add run links
- `POST /api/requests/{id}/complete` - Mark as completed

**Health:**
- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics

### File Storage Structure

```
data/
├── requests/
│   ├── req_1732194823_abc123.json
│   ├── req_1732194830_def456.json
│   └── ...
├── backups/
│   ├── 2025-11-21/
│   │   ├── req_1732194823_abc123.json
│   │   └── ...
│   └── ...
└── index.json
```

**index.json:**
```json
{
  "request_ids": [
    "req_1732194823_abc123",
    "req_1732194830_def456"
  ],
  "last_updated": "2025-11-21T10:30:00Z",
  "count": 2
}
```

**Request file (req_xxx.json):**
```json
{
  "id": "req_1732194823_abc123",
  "purpose": "Flight review",
  "agent_type": "DA",
  "agents": ["GitHub Mock", "GitHub"],
  "submitter": "John Doe",
  "status": "pending",
  "submitted_at": "2025-11-21T10:20:23Z",
  ...
}
```
