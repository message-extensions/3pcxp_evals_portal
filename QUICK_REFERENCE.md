# 3PCxP Evals Portal - Quick Reference

## 📚 Documentation Index

| Document | Purpose | Use When |
|----------|---------|----------|
| **[README.md](README.md)** | Project overview, quick start, features | Getting started, understanding the project |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Azure deployment with GitHub Actions | Setting up CI/CD, deploying to production |
| **[PRD.md](PRD.md)** | Product requirements, architecture | Understanding business logic, design decisions |
| **[TESTING.md](TESTING.md)** | Test strategy and guidelines | Writing tests, running test suite |

## 🚀 Quick Commands

### Development

```bash
# Start development server
cd backend
.venv\Scripts\activate  # Windows
uv run uvicorn app.main:app --reload --port 8000

# Or use convenience script
start-dev.bat
```

### Docker

```bash
# Start with docker-compose (from project root)
docker-compose up --build

# Stop
docker-compose down
```

### Testing

```bash
cd backend
uv run pytest                              # Run all tests
uv run pytest --cov=app                    # With coverage
uv run pytest tests/test_api/test_auth.py  # Specific file
```

### Deployment

```bash
# Deploy to Azure (automatic via GitHub Actions)
git add .
git commit -m "Deploy changes"
git push origin main

# Monitor deployment
# Go to GitHub > Actions tab
```

## 🔧 Configuration Files

| File | Location | Purpose |
|------|----------|---------|
| `.env.example` | `/backend/` | Environment variable template |
| `.env` | `/backend/` | Your local environment (not in git) |
| `docker-compose.yml` | `/` | Docker orchestration |
| `pyproject.toml` | `/backend/` | Python project config (uv) |

## 🌐 Important URLs

### Local Development
- **Frontend:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health
- **ReDoc:** http://localhost:8000/redoc

### Production (replace `<app-name>`)
- **Frontend:** https://`<app-name>`.azurewebsites.net
- **API Docs:** https://`<app-name>`.azurewebsites.net/docs
- **Health Check:** https://`<app-name>`.azurewebsites.net/health

## 🔐 GitHub Secrets (Required for CI/CD)

Set these in: GitHub > Repository > Settings > Secrets and variables > Actions

| Secret | Get From | Example |
|--------|----------|---------|
| `AZURE_WEBAPP_NAME` | Your chosen app name | `evals-portal-prod` |
| `AZURE_WEBAPP_PUBLISH_PROFILE` | Azure Portal > App Service > Download | XML content |
| `AZURE_CLIENT_ID` | Azure AD App Registration | `12345-...` |
| `AZURE_CLIENT_SECRET` | Azure AD App Registration | `abc123...` |
| `AZURE_TENANT_ID` | `common` for multi-tenant | `common` |
| `SECRET_KEY` | Generate: `python -c "import secrets; print(secrets.token_urlsafe(32))"` | Random key |
| `ADMIN_USERS` | Your admin emails | `admin1@example.com,admin2@example.com` |

## 📋 Project Structure

```
3pcxp_evals_portal/
├── frontend/              # Vanilla HTML/CSS/JS
│   ├── index.html
│   ├── css/
│   └── js/
├── backend/               # FastAPI application
│   ├── app/
│   │   ├── main.py
│   │   ├── api/          # Route handlers
│   │   ├── models/       # Pydantic models
│   │   ├── services/     # Business logic
│   │   └── storage/      # Data persistence
│   ├── tests/
│   ├── pyproject.toml
│   └── .env.example      # Environment template
├── data/                  # JSON storage (gitignored)
│   ├── requests/
│   └── backups/
├── .github/workflows/     # CI/CD
│   └── azure-deploy.yml
├── docker-compose.yml
└── *.md                   # Documentation
```

## 🎯 Common Tasks

### First-Time Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd 3pcxp_evals_portal

# 2. Install uv
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# 3. Setup backend
cd backend
uv venv
.venv\Scripts\activate
uv pip install -e ".[dev]"

# 4. Configure (in backend/ directory)
copy .env.example .env
# Edit .env with your Azure AD credentials

# 5. Run
start-dev.bat
```

### Add New Admin User

```bash
# Update .env
ADMIN_USERS=existing@example.com,new@example.com

# Restart server
```

### Update Azure AD Redirect URI

When deploying to new environment:

1. Azure Portal > App Registrations > Your app > Authentication
2. Add URI: `https://<new-url>/api/auth/callback`
3. Save

### View Logs

```bash
# Local (in terminal where server runs)

# Azure
az webapp log tail --name <app-name> --resource-group <rg-name>

# Docker
docker-compose logs -f
```

### Rollback Deployment

```bash
# Option 1: Redeploy previous commit
git revert HEAD
git push origin main

# Option 2: Re-run previous successful GitHub Actions workflow
# GitHub > Actions > Select successful run > Re-run all jobs
```

## 🐛 Troubleshooting Quick Fixes

| Issue | Fix |
|-------|-----|
| "Invalid redirect URI" | Match Azure AD redirect URI exactly with environment |
| "Not authenticated" | Check Azure AD permissions granted (admin consent) |
| "Health check failed" | Verify app is running, check `/health` endpoint |
| "Deployment failed" | Check GitHub Actions logs, verify secrets are set |
| "Can't login" | Set `AZURE_TENANT_ID=common`, update Azure AD redirect URI |
| "Basic auth disabled" | App Service → Configuration → Enable Basic Auth Publishing Credentials |

## 📞 Support Resources

- **GitHub Actions Logs:** Repository > Actions tab
- **Azure Logs:** Portal > App Service > Log stream
- **API Docs:** `/docs` endpoint (Swagger UI)
- **Health Status:** `/health` endpoint

## 🔄 Workflow Overview

```
Code Change
    ↓
Git Push to main
    ↓
GitHub Actions Triggered
    ↓
Run Tests
    ↓
Build Application
    ↓
Deploy to Azure
    ↓
Configure Environment
    ↓
Health Check
    ↓
✅ Live in Production
```

## 📊 Phase Checklist

### ✅ Phase 1 (Complete)
- [x] Vanilla frontend
- [x] localStorage persistence
- [x] 3-state workflow

### ✅ Phase 2 (Complete)
- [x] FastAPI backend
- [x] Microsoft Entra OAuth 2.0
- [x] Admin RBAC
- [x] 3-tier priority system
- [x] Server-side configuration
- [x] Docker containerization
- [x] GitHub Actions CI/CD

### 📋 Phase 3 (Planned)
- [ ] PostgreSQL database
- [ ] WebSocket real-time updates
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Redis caching

---

**Version:** 2.0.0  
**Last Updated:** November 2025
