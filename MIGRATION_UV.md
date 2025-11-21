# Migration to uv Package Manager

## Changes Made

This document summarizes the migration from traditional pip-based Python package management to **uv**, a modern, ultra-fast Python package manager written in Rust.

## What Changed?

### 1. Project Structure Reorganization

**Backend-related files moved inside `backend/` folder:**
- ✅ `.env.example` moved from root → `backend/.env.example`
- ✅ `docker-compose.yml` moved from root → `backend/docker-compose.yml`
- ✅ `tests/` folder moved from root → `backend/tests/`

**Benefits:**
- Better separation of concerns
- Cleaner root directory
- Backend can be deployed independently
- Easier to navigate

### 2. Package Management Migration

**Old approach (pip + requirements.txt):**
```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

**New approach (uv + pyproject.toml):**
```bash
uv venv
.venv\Scripts\activate
uv pip install -e ".[dev]"
```

### 3. New Files Created

#### `backend/pyproject.toml` ⭐ NEW
Modern Python project configuration following PEP 518/621 standards:
- Project metadata (name, version, description)
- Dependencies with version constraints
- Optional dev dependencies (testing, linting)
- Tool configurations (pytest, black, isort, mypy, ruff)

**Key sections:**
```toml
[project]
dependencies = [...]  # Production dependencies

[project.optional-dependencies]
dev = [...]  # Development tools

[tool.pytest.ini_options]  # Test configuration
[tool.black]  # Code formatter settings
[tool.mypy]   # Type checker settings
[tool.ruff]   # Fast linter settings
```

#### `backend/start-dev.bat` ⭐ NEW
Convenience script for starting development server:
- Checks for `.env` file
- Creates virtual environment if needed
- Installs dependencies
- Starts server with auto-reload

**Usage:**
```bash
cd backend
start-dev.bat
```

#### `backend/start-prod.bat` ⭐ NEW
Convenience script for production server:
- Validates environment setup
- Starts server with 4 workers
- Production-optimized settings

**Usage:**
```bash
cd backend
start-prod.bat
```

#### `backend/README.md` ⭐ NEW
Comprehensive backend-specific documentation:
- Installation with uv
- Development workflow
- Testing guide
- Docker usage
- API endpoints
- Troubleshooting

### 4. Updated Files

#### `backend/Dockerfile`
**Before:**
```dockerfile
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
```

**After:**
```dockerfile
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.cargo/bin:$PATH"
COPY pyproject.toml .
RUN uv pip install --system .
```

**Benefits:**
- 10-100x faster dependency installation
- Better dependency resolution
- Single source of truth (pyproject.toml)

#### `backend/docker-compose.yml`
**Updated paths:**
```yaml
build:
  context: .  # Changed from ./backend
volumes:
  - ./app:/app/app:ro
  - ../data:/app/data  # Relative to backend/
  - ../frontend:/app/frontend:ro  # Relative to backend/
```

#### `SETUP.md`
**Added uv installation section:**
```bash
# Windows PowerShell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Updated setup steps:**
- Step 2.1: Install uv
- Step 2.3: `uv venv` instead of `python -m venv`
- Step 2.4: `uv pip install -e ".[dev]"` instead of `pip install -r requirements.txt`
- Step 3: Use `start-dev.bat` or `uv run uvicorn`

#### `README.md`
**Updated quick start:**
- Prerequisites include uv
- Installation uses `uv venv` and `uv pip install`
- Run instructions use `start-dev.bat` or `uv run uvicorn`
- Testing uses `uv run pytest`

#### `PHASE2_INTEGRATION.md`
**Updated project structure** to reflect:
- Backend files reorganization
- New uv-related files
- Moved tests, .env.example, docker-compose.yml

### 5. Removed Files

#### `start.bat` ❌ DELETED
Old Phase 1 launcher that started simple HTTP server. No longer needed as we have proper backend startup scripts (`start-dev.bat`, `start-prod.bat`).

## Why uv?

### Speed Comparison

| Operation | pip | uv | Speedup |
|-----------|-----|-----|---------|
| Install from scratch | ~60s | ~2s | **30x faster** |
| Install from cache | ~15s | ~0.5s | **30x faster** |
| Dependency resolution | ~10s | ~0.1s | **100x faster** |

### Additional Benefits

1. **Better dependency resolution:** Finds compatible versions faster and more reliably
2. **Lock files:** Can generate lock files for reproducible builds
3. **Modern standards:** Uses pyproject.toml (PEP 621) instead of requirements.txt
4. **Tool configuration:** Centralized config for all dev tools in pyproject.toml
5. **Cache efficiency:** Smart caching reduces disk usage
6. **Error messages:** Clearer error messages for dependency conflicts

## Migration Checklist

If you're updating an existing local setup:

- [ ] Install uv: `pip install uv` or use installer
- [ ] Navigate to backend folder: `cd backend`
- [ ] Remove old virtual environment: `rmdir /s .venv` (if exists)
- [ ] Create new virtual environment: `uv venv`
- [ ] Activate: `.venv\Scripts\activate`
- [ ] Install dependencies: `uv pip install -e ".[dev]"`
- [ ] Copy .env: `copy .env.example .env` (configure Azure credentials)
- [ ] Test server: `start-dev.bat` or `uvicorn app.main:app --reload`
- [ ] Verify: Open http://localhost:8000

## Docker Users

No changes required! Docker builds automatically use uv in the Dockerfile. Just rebuild:

```bash
cd backend
docker-compose up --build
```

## Common Commands

### Old (pip)
```bash
# Create venv
python -m venv venv

# Install dependencies
pip install -r requirements.txt

# Install dev dependencies
pip install -r requirements-dev.txt

# Run tests
pytest

# Run server
uvicorn app.main:app --reload
```

### New (uv)
```bash
# Create venv
uv venv

# Install all dependencies (prod + dev)
uv pip install -e ".[dev]"

# Install only production
uv pip install -e .

# Run tests
uv run pytest

# Run server
uv run uvicorn app.main:app --reload

# Or use convenience scripts
start-dev.bat    # Development
start-prod.bat   # Production
```

## FAQ

### Q: Do I need to install Python separately?
**A:** Yes, uv requires Python 3.10+ to be installed. It manages packages, not Python versions.

### Q: Can I still use pip?
**A:** Yes! uv is mostly compatible with pip commands. `uv pip install` works like `pip install` but faster.

### Q: What about requirements.txt?
**A:** Still generated (see `backend/requirements.txt`) for Docker compatibility, but `pyproject.toml` is the source of truth.

### Q: How do I add a new dependency?
**A:** 
```bash
# Add to pyproject.toml [project.dependencies] section
# Then run:
uv pip install -e ".[dev]"

# Or install directly:
uv pip install <package-name>
# Then manually add to pyproject.toml
```

### Q: How do I update dependencies?
**A:**
```bash
# Update all packages
uv pip install -e ".[dev]" --upgrade

# Regenerate requirements.txt for Docker
uv pip compile pyproject.toml -o requirements.txt
```

### Q: Is uv production-ready?
**A:** Yes! Used by companies like Anthropic, Ruff, Prefect. Maintained by Astral (creators of Ruff linter).

## Resources

- **uv Documentation:** https://github.com/astral-sh/uv
- **PEP 621 (pyproject.toml):** https://peps.python.org/pep-0621/
- **FastAPI + uv Guide:** https://fastapi.tiangolo.com/deployment/docker/#alternative-with-uv
- **Ruff Linter:** https://github.com/astral-sh/ruff (by same team)

## Rollback (If Needed)

If you need to revert to old setup:

```bash
# Use old requirements.txt (still maintained)
python -m venv venv
venv\Scripts\activate
pip install -r backend/requirements.txt

# Run server old way
cd backend
uvicorn app.main:app --reload
```

But we recommend staying with uv for better performance and modern tooling! 🚀
