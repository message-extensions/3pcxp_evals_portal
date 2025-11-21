# 3PCxP Evals Portal

Centralized evaluation request management system for the **M365 Core IDC Copilot Extensibility Platform Team**.

## Overview

The 3PCxP Evals Portal is a web-based application for managing evaluation requests through a three-state workflow:

**Pending → In Progress → Completed**

Users can submit evaluation requests, team members can execute them, and all stakeholders can track progress in real-time.

## Project Status

- ✅ **Phase 1 Complete:** Vanilla frontend with localStorage (MVP)
- 🚧 **Phase 2 In Progress:** FastAPI backend + Microsoft Entra OAuth 2.0
- 📋 **Phase 3 Planned:** PostgreSQL database, WebSocket updates, email notifications

## Features

### Phase 1 (MVP)

- ✅ **Request Submission Form**
  - Multi-select hierarchical agent selection (DA/FCC)
  - Conditional fields based on user selections
  - Query set and experiment configuration options
  - Form validation and character counters

- ✅ **Dashboard with 3 Sections**
  - Pending Requests
  - In Progress Evaluations
  - Completed Evaluations

- ✅ **Workflow Management**
  - Pick/Start evaluations
  - Update running evaluations
  - Mark evaluations as complete
  - Multiple run links per evaluation (1-10)

- ✅ **Data Management**
  - In-memory state with localStorage backup
  - Export to JSON
  - Import from JSON
  - Search across all fields
  - Sort by any column

### Phase 2 (Current)
- ✅ FastAPI backend with async/await
- ✅ Microsoft Entra OAuth 2.0 authentication
- ✅ JSON file storage with atomic writes
- ✅ Pydantic validation models
- ✅ RESTful API endpoints
- ✅ Automatic backups
- ✅ Session management
- ✅ CORS configuration
- ✅ Docker containerization
- 🚧 Frontend API integration (in progress)

### Phase 3 (Planned)
- PostgreSQL database migration
- Real-time updates via WebSocket
- Email notifications (Microsoft Graph API)
- Advanced analytics dashboard
- Role-based access control
- Redis caching layer
- API rate limiting
- SLA tracking and alerts

## Tech Stack

### Frontend (Phase 1 - Unchanged)
- **No frameworks:** Pure HTML5, CSS3, ES6+ JavaScript
- **No build tools:** Direct browser execution
- **Offline-capable:** Zero external dependencies for core functionality

### Backend (Phase 2)
- **Framework:** FastAPI 0.104+ (Python 3.10+)
- **Server:** Uvicorn ASGI server
- **Authentication:** Microsoft Entra ID OAuth 2.0 with MSAL Python
- **Storage:** JSON files (one file per request)
- **Validation:** Pydantic v2 models
- **Package Manager:** uv (modern Python package manager)
- **Testing:** pytest with fixtures
- **Containerization:** Docker + docker-compose

## Quick Start

### Prerequisites
- Python 3.10+
- [uv](https://github.com/astral-sh/uv) package manager
- Microsoft Azure account (for OAuth)
- Docker (optional)

### Installation

1. **Install uv**
   ```powershell
   # Windows PowerShell
   powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
   ```

2. **Setup backend**
   ```bash
   cd backend
   uv venv
   .venv\Scripts\activate  # Windows
   uv pip install -e ".[dev]"
   ```

3. **Configure environment**
   ```bash
   copy .env.example .env
   # Edit .env with your Azure AD credentials
   ```

4. **Run application**
   ```bash
   # Using convenience script
   start-dev.bat
   
   # Or manually
   uv run uvicorn app.main:app --reload --port 8000
   ```

5. **Open browser**
   ```
   http://localhost:8000
   ```

For detailed setup instructions, see [SETUP.md](SETUP.md).

## Project Structure

```
3pcxp_evals_portal/
├── frontend/                      # Phase 1 vanilla frontend
│   ├── index.html                 # Single-page application
│   ├── css/                       # Stylesheets (main, form, dashboard, modal)
│   ├── js/                        # JavaScript modules
│   │   ├── app.js                 # Entry point
│   │   ├── state.js               # State management
│   │   ├── api.js                 # API client (Phase 2)
│   │   ├── form.js                # Form handling
│   │   ├── dashboard.js           # Dashboard rendering
│   │   ├── modal.js               # Modal lifecycle
│   │   └── utils.js               # Utilities
│   └── assets/                    # Icons, images
│
├── backend/                       # Phase 2 FastAPI backend
│   ├── app/
│   │   ├── main.py                # FastAPI application
│   │   ├── config.py              # Settings management
│   │   ├── models/                # Pydantic models
│   │   │   ├── request.py         # Request models
│   │   │   └── user.py            # User models
│   │   ├── api/                   # API route handlers
│   │   │   ├── auth.py            # Authentication endpoints
│   │   │   ├── requests.py        # Request CRUD endpoints
│   │   │   └── health.py          # Health checks
│   │   ├── services/              # Business logic
│   │   │   ├── auth_service.py    # OAuth flow
│   │   │   └── request_service.py # Request operations
│   │   ├── storage/               # Data persistence
│   │   │   └── json_storage.py    # JSON file storage
│   │   └── utils/                 # Utilities
│   │       └── logger.py          # Logging
│   ├── tests/                     # Pytest test suite
│   │   ├── conftest.py            # Shared fixtures
│   │   └── test_api/              # API endpoint tests
│   ├── pyproject.toml             # Project config (uv)
│   ├── requirements.txt           # Generated dependencies
│   ├── .env.example               # Environment template
│   ├── docker-compose.yml         # Container orchestration
│   ├── Dockerfile                 # Backend container
│   ├── start-dev.bat              # Dev server launcher
│   └── start-prod.bat             # Production launcher
│
├── data/                          # JSON storage (gitignored)
│   ├── requests/                  # Request files
│   ├── backups/                   # Automatic backups
│   └── index.json                 # Fast lookup index
│
├── .gitignore                     # Git ignore patterns
├── PRD.md                         # Product requirements
├── SETUP.md                       # Setup instructions
└── README.md                      # This file
```

## API Documentation

Once running, access interactive API documentation:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Key Endpoints

**Authentication:**
- `GET /api/auth/login` - Initiate OAuth flow
- `GET /api/auth/callback` - OAuth callback
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

**Requests:**
- `GET /api/requests` - List all requests
- `POST /api/requests` - Create request
- `GET /api/requests/{id}` - Get request
- `PUT /api/requests/{id}` - Update request
- `DELETE /api/requests/{id}` - Delete request
- `POST /api/requests/{id}/start` - Start evaluation
- `POST /api/requests/{id}/links` - Add run links
- `POST /api/requests/{id}/complete` - Complete evaluation

**Health:**
- `GET /health` - Health check
- `GET /metrics` - Metrics (Prometheus-compatible)

## Development

### Run Tests

```bash
cd backend
uv run pytest
```

With coverage:
```bash
uv run pytest --cov=app --cov-report=html
```

### Run with Docker

```bash
cd backend
docker-compose up --build
```

### View Logs

```bash
# Backend logs in terminal
# Adjust log level in .env: LOG_LEVEL=DEBUG

# Docker logs
docker-compose logs -f backend
```

## Data Model

### Request Object

```json
{
  "id": "req_1732194823_abc123",
  "purpose": "Flight review",
  "purpose_reason": null,
  "agent_type": "DA",
  "agents": ["GitHub Mock", "GitHub"],
  "query_set": "Default",
  "query_set_details": null,
  "control_config": "Control v1",
  "treatment_config": "Treatment v2",
  "notes": "Test evaluation",
  "high_priority": false,
  "submitter": "John Doe",
  "submitted_at": "2025-11-21T10:20:23Z",
  "status": "pending",
  "executor": null,
  "started_at": null,
  "completed_at": null,
  "run_links": []
}
```

### User Object

```json
{
  "oid": "azure-object-id",
  "name": "John Doe",
  "email": "john.doe@example.com"
}
```

## Configuration

See `.env.example` for all configuration options:

- **Azure AD:** Client ID, secret, tenant, redirect URI
- **Security:** Secret key, environment
- **CORS:** Allowed origins
- **Storage:** Data directory, backup settings
- **Server:** Host, port, log level
- **Features:** API docs, metrics

## Troubleshooting

### Common Issues

**"Invalid redirect URI"**
- Ensure Azure redirect URI matches `.env` exactly
- Format: `http://localhost:8000/api/auth/callback`

**"Not authenticated"**
- Check Azure AD app permissions are granted
- Verify session cookie is being set
- Clear browser cookies and try again

**"Request failed"**
- Check backend is running: http://localhost:8000/health
- Review backend logs for errors
- Verify CORS settings in `.env`

For more troubleshooting, see [SETUP.md](SETUP.md#troubleshooting).

## Architecture

See [PRD.md](PRD.md) for detailed architecture and design decisions.

Key principles:
- **Layered architecture:** API → Service → Storage
- **Async everything:** All I/O operations use async/await
- **Type safety:** Full type hints, Pydantic validation
- **Fail-safe storage:** Atomic file writes prevent corruption
- **Security first:** OAuth 2.0, HTTP-only cookies, CORS

## Support

For issues or questions:
- Check [SETUP.md](SETUP.md) for setup help
- Review [PRD.md](PRD.md) for requirements
- Check API docs at http://localhost:8000/docs
- Review backend logs for errors

---

**Current Version:** 2.0.0 (Phase 2)  
**Last Updated:** November 2024
