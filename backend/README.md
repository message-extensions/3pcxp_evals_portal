# 3PCxP Evals Portal - Backend

FastAPI backend for the centralized evaluation request management portal.

## Tech Stack

- **Framework:** FastAPI 0.104+ (Python 3.10+)
- **Server:** Uvicorn ASGI server
- **Authentication:** Microsoft Entra ID OAuth 2.0 with MSAL
- **Storage:** JSON files with atomic writes and automatic backups
- **Validation:** Pydantic v2 with type hints
- **Package Manager:** uv (modern Python package manager)

## Prerequisites

- Python 3.10 or higher
- [uv](https://github.com/astral-sh/uv) package manager
- Microsoft Entra ID app registration (see [SETUP.md](../SETUP.md))

## Quick Start with uv

### 1. Install uv

**Windows (PowerShell):**
```powershell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

**macOS/Linux:**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Or with pip:**
```bash
pip install uv
```

### 2. Create Virtual Environment and Install Dependencies

```bash
# Navigate to backend folder
cd backend

# Create virtual environment with Python 3.10+
uv venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install production dependencies
uv pip install -e .

# Install with development dependencies (recommended)
uv pip install -e ".[dev]"
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your Azure AD credentials
# Follow ../SETUP.md for Azure AD app registration
```

### 4. Run the Server

**Development mode (with auto-reload):**
```bash
uvicorn app.main:app --reload --port 8000
```

**Production mode:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

**Using uv run (recommended):**
```bash
# Development
uv run uvicorn app.main:app --reload --port 8000

# Production
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The application will be available at:
- **Frontend:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **OpenAPI Schema:** http://localhost:8000/openapi.json

## Development Workflow

### Install Dependencies

```bash
# Install new production dependency
uv pip install <package-name>

# Install new dev dependency
uv pip install --dev <package-name>

# Update pyproject.toml after manual installs
uv pip freeze > requirements.txt  # Optional: for Docker
```

### Code Quality

```bash
# Format code with black
uv run black app tests

# Sort imports with isort
uv run isort app tests

# Lint with ruff (faster alternative to flake8)
uv run ruff check app tests

# Type check with mypy
uv run mypy app

# Run all checks
uv run black app tests && uv run isort app tests && uv run ruff check app tests && uv run mypy app
```

### Testing

```bash
# Run all tests
uv run pytest

# Run with coverage report
uv run pytest --cov=app --cov-report=html

# Run specific test file
uv run pytest tests/test_api/test_auth.py -v

# Run with debug output
uv run pytest -s -vv

# Run only unit tests
uv run pytest -m unit

# Run only integration tests
uv run pytest -m integration

# Skip slow tests
uv run pytest -m "not slow"
```

### Docker

```bash
# Build and run with docker-compose
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f backend

# Rebuild after changes
docker-compose up --build --force-recreate

# Stop containers
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Settings from environment
│   │
│   ├── models/              # Pydantic models
│   │   ├── __init__.py
│   │   ├── request.py       # Request, RunLink models
│   │   └── user.py          # User, Session models
│   │
│   ├── api/                 # FastAPI route handlers
│   │   ├── __init__.py
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── requests.py      # Request CRUD endpoints
│   │   └── health.py        # Health check, metrics
│   │
│   ├── services/            # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py  # OAuth flow, MSAL
│   │   └── request_service.py # Request CRUD, validation
│   │
│   ├── storage/             # Data persistence
│   │   ├── __init__.py
│   │   ├── json_storage.py  # File-based storage
│   │   └── file_lock.py     # Atomic writes
│   │
│   ├── middleware/          # Custom middleware
│   │   ├── __init__.py
│   │   ├── auth_middleware.py # Session validation
│   │   └── logging_middleware.py # Request logging
│   │
│   └── utils/
│       ├── __init__.py
│       ├── logger.py        # Structured logging
│       └── validators.py    # Custom validators
│
├── tests/                   # Pytest test suite
│   ├── __init__.py
│   ├── conftest.py          # Shared fixtures
│   ├── test_api/
│   │   ├── test_auth.py
│   │   └── test_requests.py
│   ├── test_services/
│   │   └── test_request_service.py
│   └── test_storage/
│       └── test_json_storage.py
│
├── pyproject.toml           # Project configuration (uv)
├── requirements.txt         # Generated dependencies (for Docker)
├── .env.example             # Environment template
├── Dockerfile               # Backend container
├── docker-compose.yml       # Service orchestration
└── README.md                # This file
```

## API Endpoints

### Authentication
- `GET /api/auth/login` - Redirect to Microsoft login
- `GET /api/auth/callback` - OAuth callback handler
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Clear session

### Requests
- `GET /api/requests` - List all requests (with filters)
- `POST /api/requests` - Create new request
- `GET /api/requests/{id}` - Get request by ID
- `PUT /api/requests/{id}` - Update request
- `DELETE /api/requests/{id}` - Delete request
- `POST /api/requests/{id}/start` - Start evaluation
- `POST /api/requests/{id}/links` - Add run links
- `POST /api/requests/{id}/complete` - Mark as completed
- `GET /api/requests/search` - Search requests

### Health
- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics (optional)

## Environment Variables

See `.env.example` for all available configuration options:

**Required:**
- `AZURE_CLIENT_ID` - Azure AD app client ID
- `AZURE_CLIENT_SECRET` - Azure AD client secret
- `AZURE_TENANT_ID` - Azure AD tenant ID
- `SECRET_KEY` - Session encryption key

**Optional:**
- `AZURE_REDIRECT_URI` - OAuth callback URL (default: http://localhost:8000/api/auth/callback)
- `ALLOWED_ORIGINS` - CORS origins (default: http://localhost:8000)
- `DATA_DIR` - Storage directory (default: ./data)
- `LOG_LEVEL` - Logging level (default: INFO)

## Troubleshooting

### uv not found
```bash
# Make sure uv is in your PATH
# Restart your terminal after installation
uv --version
```

### Import errors
```bash
# Ensure virtual environment is activated
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Reinstall dependencies
uv pip install -e ".[dev]"
```

### Authentication errors
- Check Azure AD app configuration in ../SETUP.md
- Verify `.env` file has correct credentials
- Ensure redirect URI matches in both Azure Portal and `.env`

### Port already in use
```bash
# Find process using port 8000 (Windows)
netstat -ano | findstr :8000

# Kill process by PID
taskkill /PID <PID> /F

# Or use a different port
uvicorn app.main:app --reload --port 8001
```

## Learn More

- **FastAPI Documentation:** https://fastapi.tiangolo.com
- **uv Documentation:** https://github.com/astral-sh/uv
- **Pydantic Documentation:** https://docs.pydantic.dev
- **MSAL Python:** https://msal-python.readthedocs.io
- **Setup Guide:** ../SETUP.md
- **Integration Guide:** ../PHASE2_INTEGRATION.md
