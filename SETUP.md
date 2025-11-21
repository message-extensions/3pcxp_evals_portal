# 3PCxP Evals Portal - Setup Guide

## Phase 2 Backend Setup

This guide covers setting up the FastAPI backend with Microsoft Entra OAuth 2.0 authentication.

## Prerequisites

- Python 3.10 or higher
- [uv](https://github.com/astral-sh/uv) - Modern Python package manager
- Microsoft Azure account with admin access
- Docker (optional, for containerized deployment)

## Step 1: Azure AD / Microsoft Entra Configuration

### 1.1 Create App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations** → **New registration**
3. Fill in the details:
   - **Name:** `3PCxP Evals Portal`
   - **Supported account types:** 
     - **Recommended:** `Accounts in any organizational directory and personal Microsoft accounts`
     - This allows sign-in with both work/school accounts (@microsoft.com) AND personal accounts (@gmail.com)
   - **Redirect URI:** 
     - Type: Web
     - Value: `http://localhost:8000/api/auth/callback`
4. Click **Register**

### 1.2 Configure Authentication

1. In your app registration, go to **Authentication**
2. Under **Implicit grant and hybrid flows**, check:
   - ✅ ID tokens (used for implicit and hybrid flows)
3. Click **Save**

### 1.3 Create Client Secret

1. Go to **Certificates & secrets** → **Client secrets** → **New client secret**
2. Add description: `3PCxP Evals Portal Secret`
3. Set expiration: 24 months (recommended)
4. Click **Add**
5. **IMPORTANT:** Copy the secret **Value** immediately - you won't see it again

### 1.4 Configure API Permissions

1. Go to **API permissions** → **Add a permission**
2. Select **Microsoft Graph** → **Delegated permissions**
3. Add the following permissions:
   - `User.Read` - Read user profile
   - `email` - View user's email address
   - `openid` - Sign in and read user profile
   - `profile` - View user's basic profile
4. Click **Add permissions**
5. Click **Grant admin consent for [Your Organization]** (requires admin)

### 1.5 Collect Configuration Values

You'll need these values for the `.env` file:

- **Client ID (Application ID):** Found on the app overview page
- **Client Secret:** The value you copied in step 1.3
- **Tenant ID (Directory ID):** Found on the app overview page

## Step 2: Local Development Setup

### 2.1 Install uv Package Manager

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

Verify installation:
```bash
uv --version
```

### 2.2 Navigate to Backend

```bash
cd c:\src\Analysis\Internal Tools\3pcxp_evals_portal\backend
```

### 2.3 Create Virtual Environment

```bash
# Create virtual environment with Python 3.10+
uv venv

# Activate (Windows)
.venv\Scripts\activate

# Activate (macOS/Linux)
source .venv/bin/activate

# Verify activation (should show .venv path)
where python  # Windows
which python  # macOS/Linux
```

### 2.4 Install Dependencies

```bash
# Install production dependencies
uv pip install -e .

# Install with development tools (recommended)
uv pip install -e ".[dev]"
```

### 2.5 Configure Environment Variables

```bash
# Copy example file (.env.example is now in backend/ folder)
copy .env.example .env
```

Edit `.env` with your values:

```bash
# ===== Azure AD / Microsoft Entra =====
AZURE_CLIENT_ID=<your-client-id-from-step-1.5>
AZURE_CLIENT_SECRET=<your-client-secret-from-step-1.5>
# For multi-tenant (personal + work/school accounts): use 'common'
# For single-tenant (one org only): use your tenant ID from step 1.5
AZURE_TENANT_ID=common
AZURE_REDIRECT_URI=http://localhost:8000/api/auth/callback
AZURE_SCOPE=User.Read email  # openid/profile added automatically by MSAL

# ===== Application Security =====
# Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"
SECRET_KEY=<generate-a-random-32-byte-key>
ENVIRONMENT=development

# ===== CORS Configuration =====
ALLOWED_ORIGINS=http://localhost:8000,http://127.0.0.1:8000

# ===== Storage Configuration =====
DATA_DIR=./data
BACKUP_ENABLED=true
BACKUP_RETENTION_DAYS=30

# ===== Server Configuration =====
HOST=0.0.0.0
PORT=8000
RELOAD=true
LOG_LEVEL=INFO

# ===== Feature Flags =====
ENABLE_API_DOCS=true
ENABLE_METRICS=true
```

**Generate SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 2.6 Initialize Data Directories

The directories should already exist in the project root, but verify:

```bash
# From project root (one level up from backend/)
cd ..
mkdir data\requests
mkdir data\backups
cd backend
```

## Step 3: Run the Application

### Option A: Development Server (Recommended)

**Using convenience script (Windows):**
```bash
# From backend directory
start-dev.bat
```

**Or manually with uv:**
```bash
# From backend directory
uv run uvicorn app.main:app --reload --port 8000
```

**Or with activated virtual environment:**
```bash
# Ensure virtual environment is activated
uvicorn app.main:app --reload --port 8000
```

### Option B: Production Server

**Using convenience script (Windows):**
```bash
# From backend directory
start-prod.bat
```

**Or manually:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Option C: Docker Compose

```bash
# From backend directory (docker-compose.yml is now here)
docker-compose up --build

# Or in detached mode
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop
docker-compose down
```

## Step 4: Verify Installation

1. **Health Check:** http://localhost:8000/health
2. **API Documentation:** http://localhost:8000/docs
3. **Frontend:** http://localhost:8000
4. **Test Login:** Click any action → should redirect to Microsoft login

## Step 5: Test Authentication Flow

1. Open http://localhost:8000
2. Try to create a request (will trigger auth)
3. Redirects to Microsoft login
4. Sign in with your organization account
5. Consent to permissions (first time only)
6. Redirected back to portal
7. Your name should appear in the UI

## Troubleshooting

### Issue: "Invalid redirect URI" error

**Solution:** Ensure redirect URI in Azure matches exactly:
- Azure Portal: `http://localhost:8000/api/auth/callback`
- `.env`: `AZURE_REDIRECT_URI=http://localhost:8000/api/auth/callback`

### Issue: "AADSTS7000215: Invalid client secret"

**Solution:** 
- Regenerate client secret in Azure Portal
- Update `AZURE_CLIENT_SECRET` in `.env`
- Ensure no extra spaces in the value

### Issue: "Insufficient privileges to complete the operation"

**Solution:**
- Admin consent required for API permissions
- Ask Azure AD admin to grant consent
- Or use personal Microsoft account for testing

### Issue: Backend not found / 404 errors

**Solution:**
- Verify backend is running: http://localhost:8000/health
- Check CORS settings in `.env`
- Clear browser cache and cookies

### Issue: Session expires immediately

**Solution:**
- Check system clock is correct
- Verify `SESSION_LIFETIME_HOURS` in `.env`
- Clear browser cookies

### Issue: "Selected user account does not exist in tenant"

**Error:** `Selected user account does not exist in tenant 'Default Directory' and cannot access the application...`

**Root Cause:** Trying to sign in with a work/school account when app is configured for single-tenant (personal account tenant only).

**Solution:**
1. **Option A - Multi-Tenant (Recommended):**
   - Set `AZURE_TENANT_ID=common` in `.env`
   - Restart backend server
   - Allows both personal accounts (@gmail.com) AND work/school accounts (@microsoft.com)

2. **Option B - Single-Tenant:**
   - Use only the account type that matches your app registration tenant
   - If app is in personal tenant → use personal account only
   - If app is in organization tenant → use work account only

3. **Option C - Guest User:**
   - Add your work account as a guest user in your personal tenant
   - Or vice versa
   - Go to Azure Portal → Azure AD → Users → Invite guest user

## Development Workflow

### Start Development Server

```bash
# Terminal 1: Backend
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

Frontend is served by the backend at http://localhost:8000

### View Logs

```bash
# Backend logs are in terminal
# Adjust log level in .env: LOG_LEVEL=DEBUG
```

### Test API Endpoints

Use the interactive API documentation:
- http://localhost:8000/docs (Swagger UI)
- http://localhost:8000/redoc (ReDoc)

### Inspect Data

```bash
# View all requests
dir data\requests

# View specific request
type data\requests\req_1732194823_abc123.json

# View index
type data\index.json
```

## Production Deployment Checklist

- [ ] Change `ENVIRONMENT=production` in `.env`
- [ ] Set `RELOAD=false`
- [ ] Use strong `SECRET_KEY` (32+ bytes)
- [ ] Update `AZURE_REDIRECT_URI` to production URL
- [ ] Update `ALLOWED_ORIGINS` to production domains
- [ ] Set `LOG_LEVEL=WARNING` or `ERROR`
- [ ] Use HTTPS for redirect URI
- [ ] Set up automatic backups for `data/` directory
- [ ] Configure reverse proxy (nginx, Caddy)
- [ ] Set up monitoring (health checks, metrics)
- [ ] Replace in-memory sessions with Redis
- [ ] Set up database migration from JSON files

## Next Steps

- **Testing:** Run `pytest` in `backend/` directory
- **Frontend:** See `frontend/js/api.js` for API integration
- **Database Migration:** Phase 3 - migrate to PostgreSQL
- **Advanced Features:** WebSocket real-time updates, email notifications

## Support

For issues or questions:
- Check logs in terminal
- Review Azure AD app configuration
- Verify environment variables
- Check API documentation at `/docs`
