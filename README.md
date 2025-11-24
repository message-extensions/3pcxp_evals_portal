# 3PCxP Evals Portal

Centralized evaluation request management system for the **M365 Core IDC Copilot Extensibility Platform Team**.

## 📚 Documentation

- **[Quick Reference](QUICK_REFERENCE.md)** - Commands, URLs, common tasks
- **[Deployment Guide](DEPLOYMENT.md)** - Azure deployment with GitHub Actions CI/CD
- **[Product Requirements](PRD.md)** - Detailed requirements and architecture
- **[Testing Guide](TESTING.md)** - Test strategy and guidelines

## Overview

The 3PCxP Evals Portal is a web-based application for managing evaluation requests through a three-state workflow:

**Pending → In Progress → Completed**

Users can submit evaluation requests, team members can execute them, and all stakeholders can track progress in real-time.

## Project Status

- ✅ **Phase 1 Complete:** Vanilla frontend with localStorage (MVP)
- ✅ **Phase 2 Complete:** FastAPI backend + Microsoft Entra OAuth 2.0 + Admin RBAC + 3-tier priority
- 📋 **Phase 3 Planned:** PostgreSQL database, WebSocket updates, email notifications

## Key Features

- 🔐 **Microsoft Entra OAuth 2.0** - Multi-tenant authentication (personal + work/school accounts)
- 👥 **Admin RBAC** - Role-based access control with admin privileges
- 🎯 **3-Tier Priority System** - Low/Medium/High priority with automatic sorting
- 📊 **Server-Side Configuration** - Centralized config management via API
- 🗂️ **Request Management** - Full CRUD with status tracking
- 📤 **Import/Export** - JSON-based data portability (admin only)
- 🔍 **Search & Filter** - Real-time search across all fields
- 📱 **Responsive UI** - Modal-based workflows with rich previews

## Tech Stack

### Frontend
- **Pure HTML5/CSS3/JavaScript** - No frameworks, zero build step
- **Vanilla ES6+** - Modern JavaScript without dependencies
- **Fluent Design** - Microsoft design system inspired

### Backend
- **Framework:** FastAPI 0.104+ (Python 3.11+)
- **Server:** Uvicorn ASGI server
- **Authentication:** Microsoft Entra ID OAuth 2.0 with MSAL Python
- **Storage:** JSON file-based with atomic writes
- **Validation:** Pydantic v2 models with type safety
- **Package Manager:** uv (modern, fast Python package installer)
- **Testing:** pytest with async fixtures
- **Containerization:** Docker + docker-compose
- **Deployment:** Azure App Service with GitHub Actions CI/CD

## Quick Start

### Prerequisites
- Python 3.11+
- [uv](https://github.com/astral-sh/uv) package manager
- Microsoft Azure account (for OAuth)
- Docker (optional)

### Local Development

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd 3pcxp_evals_portal
   ```

2. **Install uv**
   ```powershell
   # Windows PowerShell
   powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
   ```

3. **Setup backend**
   ```bash
   cd backend
   uv venv
   .venv\Scripts\activate  # Windows
   uv pip install -e ".[dev]"
   ```

4. **Configure environment**
   ```bash
   copy .env.example .env
   # Edit .env with your Azure AD credentials
   ```

5. **Run application**
   ```bash
   # Using convenience script
   start-dev.bat
   
   # Or manually
   uv run uvicorn app.main:app --reload --port 8000
   ```

6. **Open browser**
   ```
   http://localhost:8000
   ```

### Azure AD Setup

#### 1. Create App Registration

1. Go to [Azure Portal](https://portal.azure.com) → **Azure Active Directory** → **App registrations** → **New registration**
2. Configure:
   - **Name:** `3PCxP Evals Portal`
   - **Supported account types:** `Accounts in any organizational directory and personal Microsoft accounts`
   - **Redirect URI (Web):** `http://localhost:8000/api/auth/callback` (dev) or `https://your-app.azurewebsites.net/api/auth/callback` (prod)
3. Click **Register**

#### 2. Create Client Secret

1. Go to **Certificates & secrets** → **Client secrets** → **New client secret**
2. Copy the secret **Value** immediately (you won't see it again)

#### 3. Configure API Permissions

1. Go to **API permissions** → **Add a permission** → **Microsoft Graph** → **Delegated permissions**
2. Add: `User.Read`, `email`, `openid`, `profile`
3. Click **Grant admin consent**

#### 4. Update `.env`

```bash
AZURE_CLIENT_ID=<your-client-id>
AZURE_CLIENT_SECRET=<your-client-secret>
AZURE_TENANT_ID=common  # Multi-tenant (personal + work/school)
AZURE_REDIRECT_URI=http://localhost:8000/api/auth/callback

# Generate secret key
SECRET_KEY=<run: python -c "import secrets; print(secrets.token_urlsafe(32))">

# Admin users (comma-separated emails)
ADMIN_USERS=tezansahu@microsoft.com,sivinnak@microsoft.com
```

### Production Data Persistence (Azure File Share)

Azure App Service replaces everything in `/home/site/wwwroot` on each deployment. To keep evaluation requests, backups, and sessions between releases:

1. **Create Azure Storage Account + File Share** (e.g., `evals-data`)
2. **Mount the share** in App Service → Configuration → Path mappings (mount path `/home/data`)
3. **Set `DATA_DIR=/home/data`** in App settings so the JSON storage layer writes to the mounted share

Full walkthrough: [Azure Manual Configuration → Persist Request Data](AZURE_MANUAL_CONFIG.md#3-persist-request-data-with-azure-file-share-recommended)

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
│   ├── Dockerfile                 # Backend container
│   ├── start-dev.bat              # Dev server launcher
│   └── start-prod.bat             # Production launcher
│
├── data/                          # JSON storage (gitignored)
│   ├── requests/                  # Request files
│   ├── backups/                   # Automatic backups
│   └── index.json                 # Fast lookup index
│
├── .github/workflows/             # CI/CD
│   └── azure-deploy.yml           # Azure deployment workflow
├── docker-compose.yml             # Container orchestration
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
  "priority": "Medium",
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
  "email": "john.doe@example.com",
  "is_admin": false
}
```

## Deployment

### Azure App Service Deployment

The project includes automated CI/CD with GitHub Actions that deploys to Azure App Service on every push to `main`.

#### Prerequisites

1. **Azure App Service** created with:
   - Runtime: Python 3.11
   - OS: Linux
   - Plan: Basic or higher (Standard recommended)

2. **GitHub Secrets** configured in repository settings:
   ```
   AZURE_WEBAPP_NAME=<your-app-service-name>
   AZURE_WEBAPP_PUBLISH_PROFILE=<download-from-azure>
   AZURE_CLIENT_ID=<your-azure-ad-client-id>
   AZURE_CLIENT_SECRET=<your-azure-ad-client-secret>
   AZURE_TENANT_ID=common
   SECRET_KEY=<generate-random-32-byte-key>
   ADMIN_USERS=<comma-separated-admin-emails>
   ```

#### Setup Steps

1. **Create Azure App Service**
   ```bash
   az webapp create \
     --resource-group <your-rg> \
     --plan <your-plan> \
     --name <your-app-name> \
     --runtime "PYTHON:3.11"
   ```

2. **Download Publish Profile**
   - Azure Portal → App Service → Download publish profile
   - Copy entire XML content

3. **Configure GitHub Secrets**
   - Go to repository → Settings → Secrets and variables → Actions
   - Add each secret listed above

4. **Update Azure AD Redirect URI**
   - Azure Portal → App Registrations → Your app → Authentication
   - Add redirect URI: `https://<your-app-name>.azurewebsites.net/api/auth/callback`

5. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to Azure"
   git push origin main
   ```

GitHub Actions will automatically:
- Run tests
- Build Docker image
- Deploy to Azure App Service
- Run health checks

**Monitor deployment:** Check Actions tab in GitHub repository

#### Manual Deployment (Alternative)

Using Docker:
```bash
# Build image
docker build -t evals-portal ./backend

# Run container
docker run -p 8000:8000 \
  -e AZURE_CLIENT_ID=<id> \
  -e AZURE_CLIENT_SECRET=<secret> \
  -e SECRET_KEY=<key> \
  evals-portal
```

Using Azure CLI:
```bash
az webapp up \
  --name <your-app-name> \
  --runtime "PYTHON:3.11" \
  --sku B1
```

### Environment Variables (Production)

Set these in Azure App Service → Configuration → Application settings:

| Variable | Value | Required |
|----------|-------|----------|
| `AZURE_CLIENT_ID` | Azure AD Client ID | ✅ |
| `AZURE_CLIENT_SECRET` | Azure AD Client Secret | ✅ |
| `AZURE_TENANT_ID` | `common` (multi-tenant) | ✅ |
| `AZURE_REDIRECT_URI` | `https://<app>.azurewebsites.net/api/auth/callback` | ✅ |
| `SECRET_KEY` | Random 32-byte key | ✅ |
| `ADMIN_USERS` | `email1@example.com,email2@example.com` | ✅ |
| `ENVIRONMENT` | `production` | ✅ |
| `ALLOWED_ORIGINS` | `https://<app>.azurewebsites.net` | ✅ |
| `LOG_LEVEL` | `INFO` or `WARNING` | ❌ |
| `ENABLE_API_DOCS` | `true` or `false` | ❌ |

### Health Monitoring

- **Health endpoint:** `https://<app>.azurewebsites.net/health`
- **Logs:** Azure Portal → App Service → Log stream
- **Metrics:** Azure Portal → App Service → Metrics

## Configuration

Key environment variables (see `.env.example` for all options):

- **`AZURE_CLIENT_ID`** - Azure AD application client ID
- **`AZURE_CLIENT_SECRET`** - Azure AD client secret
- **`AZURE_TENANT_ID`** - Tenant ID or `common` for multi-tenant
- **`AZURE_REDIRECT_URI`** - OAuth callback URL
- **`SECRET_KEY`** - Application secret (generate with `secrets.token_urlsafe(32)`)
- **`ADMIN_USERS`** - Comma-separated admin email addresses
- **`ENVIRONMENT`** - `development` or `production`
- **`ALLOWED_ORIGINS`** - CORS allowed origins (comma-separated)
- **`DATA_DIR`** - Data storage directory (default: `./data`)
- **`LOG_LEVEL`** - Logging level (`DEBUG`, `INFO`, `WARNING`, `ERROR`)

## Troubleshooting

### Common Issues

**"Invalid redirect URI"**
- Ensure Azure redirect URI matches environment exactly
- Development: `http://localhost:8000/api/auth/callback`
- Production: `https://<your-app>.azurewebsites.net/api/auth/callback`

**"Not authenticated"**
- Check Azure AD app permissions are granted (admin consent)
- Verify session cookie is being set (check browser dev tools)
- Clear browser cookies and try again

**"Request failed"**
- Check backend is running: visit `/health` endpoint
- Review backend logs for errors
- Verify CORS `ALLOWED_ORIGINS` includes your frontend URL

**"Selected user account does not exist in tenant"**
- Set `AZURE_TENANT_ID=common` for multi-tenant support
- Supports both personal (@gmail.com) and work/school (@microsoft.com) accounts

**Deployment Issues**
- Check GitHub Actions logs for build errors
- Verify all secrets are set in GitHub repository settings
- Check Azure App Service logs in Azure Portal

For detailed troubleshooting, see deployment logs and application logs.

## Development

### Run Tests

```bash
cd backend
uv run pytest

# With coverage
uv run pytest --cov=app --cov-report=html
```

### Run with Docker Compose

```bash
docker-compose up --build

# Or detached
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### View Logs

```bash
# Backend logs in terminal
# Adjust log level in .env: LOG_LEVEL=DEBUG

# Docker logs
docker-compose logs -f

# Azure logs
az webapp log tail --name <your-app-name> --resource-group <your-rg>
```

### API Documentation

Interactive API docs (when running):
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## Architecture

### Layered Design

```
Frontend (Vanilla JS)
    ↓
API Layer (FastAPI routes)
    ↓
Service Layer (Business logic)
    ↓
Storage Layer (JSON files)
```

### Key Principles

- **Type Safety:** Full type hints, Pydantic validation
- **Async Everything:** All I/O operations use async/await
- **Fail-Safe Storage:** Atomic file writes prevent corruption
- **Security First:** OAuth 2.0, HTTP-only cookies, CORS
- **Separation of Concerns:** Layered architecture
- **Testability:** Dependency injection, pytest fixtures

## API Endpoints

### Authentication
- `GET /api/auth/login` - Initiate OAuth flow
- `GET /api/auth/callback` - OAuth callback
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Requests (CRUD)
- `GET /api/requests` - List all requests
- `POST /api/requests` - Create request (submitter auto-populated)
- `GET /api/requests/{id}` - Get request
- `PUT /api/requests/{id}` - Update request
- `DELETE /api/requests/{id}` - Delete request (admin only)

### Request Workflow
- `POST /api/requests/{id}/start` - Start evaluation (executor auto-populated)
- `POST /api/requests/{id}/links` - Add run links
- `POST /api/requests/{id}/complete` - Complete evaluation

### Admin Operations
- `PUT /api/requests/{id}/priority` - Update priority (admin only)
- `GET /api/requests/export/json` - Export all requests (admin only)
- `POST /api/requests/import/json` - Import requests (admin only)

### Configuration
- `GET /api/config` - Get all configuration data
- `GET /api/config/purposes` - Get available purposes
- `GET /api/config/agents` - Get agent hierarchy
- `GET /api/config/priority-levels` - Get priority levels

### Health
- `GET /health` - Health check
- `GET /metrics` - Metrics (Prometheus-compatible)

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes and test (`pytest`)
4. Commit changes (`git commit -m 'feat: add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open Pull Request

## Support

For issues or questions:
- Check `/docs` endpoint for API documentation
- Review backend logs for errors
- Check Azure Portal for deployment issues
- See [PRD.md](PRD.md) for detailed requirements

---

**Current Version:** 2.0.0 (Phase 2 Complete)  
**Last Updated:** November 2025  
**Deployment:** Automated via GitHub Actions
