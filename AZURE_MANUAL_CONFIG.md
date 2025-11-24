# Azure App Service Manual Configuration

Since we're using publish profile authentication (not Service Principal), some settings need to be configured manually in Azure Portal. **This is a one-time setup.**

---

## ⚠️ Important: Local Development vs Production

**For Local Development (Windows/Mac):**
```bash
# Use uvicorn directly (works on all platforms)
uvicorn app.main:app --reload --port 8000
```

**Gunicorn is used (Linux-only, more robust for production)**
```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000
```
> **Note:** Gunicorn requires Unix-specific modules (fcntl) and won't run on Windows. This is expected and correct - you don't need to run it locally.

---

## 1. Configure Startup Command

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your App Service
3. Go to **Settings** → **Configuration** → **Stack settings**
4. Set **Startup Command**:
   ```
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000
   ```
5. Click **Save**

### What this does:

- `-w 4`: Run 4 worker processes (adjust based on CPU cores)
- `-k uvicorn.workers.UvicornWorker`: Use Uvicorn worker for async support
- `app.main:app`: Load the FastAPI app from `app/main.py`
- `--bind 0.0.0.0:8000`: Listen on all interfaces, port 8000

## 2. Configure Environment Variables

Go to **Settings** → **Environment variables** → **App settings** and add these variables:

### Required Settings

| Name | Value | Notes |
|------|-------|-------|
| `AZURE_CLIENT_ID` | `<your-azure-app-client-id>` | From GitHub Secrets |
| `AZURE_CLIENT_SECRET` | `<your-azure-app-client-secret>` | From GitHub Secrets |
| `AZURE_TENANT_ID` | `<your-azure-tenant-id>` | From GitHub Secrets |
| `AZURE_REDIRECT_URI` | `https://<app-name>.azurewebsites.net/api/auth/callback` | Replace `<app-name>` |
| `SECRET_KEY` | `<random-secret-key>` | From GitHub Secrets |
| `ADMIN_USERS` | `user@example.com,other@example.com` | Comma-separated emails |
| `ENVIRONMENT` | `production` | Set to production |
| `ALLOWED_ORIGINS` | `https://<app-name>.azurewebsites.net` | Replace `<app-name>` |

### Optional Settings

| Name | Value | Default | Notes |
|------|-------|---------|-------|
| `LOG_LEVEL` | `INFO` | `INFO` | DEBUG, INFO, WARNING, ERROR |
| `ENABLE_API_DOCS` | `true` | `true` | Enable /docs endpoint |

### Build Settings (Important!)

Add this to ensure dependencies are installed:

| Name | Value |
|------|-------|
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `true` |

Click **Save** after adding all settings.

## 3. Persist Request Data with Azure File Share (Recommended)

Without extra configuration, every deployment wipes the `data/` folder (Azure App Service replaces `/home/site/wwwroot`). Mount an **Azure File Share** so request/backups/session files survive redeployments.

### 3.1 Create Storage Account + File Share (one-time)

Use the Azure Portal or CLI (replace placeholders):

```powershell
# Create storage account (pick your own unique name and region)
az storage account create \
   --name <storage-account-name> \
   --resource-group <resource-group> \
   --location <region> \
   --sku Standard_LRS

# Create file share inside that storage account
az storage share create \
   --name evals-data \
   --account-name <storage-account-name>
```

### 3.2 Mount File Share to App Service

1. App Service → **Settings** → **Configuration** → **Path mappings**
2. Click **+ New Azure Storage Mount**
3. Fill in:
    - **Name:** `data-mount`
    - **Configuration options:** Basic
    - **Storage account:** select the one you just made
    - **Storage type:** Azure Files
    - **Share name:** `evals-data`
    - **Mount path:** `/home/data`
4. Save (App Service will restart)

### 3.3 Point the App to Mounted Storage

1. Still in **Configuration** → **Application settings**
2. Add/update: `DATA_DIR=/home/data`
3. Save and restart again

The JSON storage layer now reads/writes everything under `/home/data` (your mounted share), so deployments no longer wipe data.

### 3.4 Verify Persistence

1. Submit a test request in production
2. In Azure Portal → Storage account → **File shares** → `evals-data`
3. Confirm folders/files: `requests/`, `backups/`, `sessions/`, `index.json`
4. Trigger another deployment – the request stays ✅

> 💡 Tip: Use [Azure Storage Explorer](https://azure.microsoft.com/features/storage-explorer/) or `az storage file download` to pull backups locally.

---

## 4. Verify Configuration

After saving, the App Service will restart. Check:

1. **Health endpoint**: `https://<app-name>.azurewebsites.net/health`
2. **API docs**: `https://<app-name>.azurewebsites.net/docs`
3. **Frontend**: `https://<app-name>.azurewebsites.net/`

## 5. View Application Logs

To troubleshoot startup issues:

1. Go to **Monitoring** → **Log stream**
2. Or use **Diagnose and solve problems**
3. Or SSH into the container: **Development Tools** → **SSH**

## 6. Common Issues

### Issue: "ModuleNotFoundError"
**Solution**: Ensure `SCM_DO_BUILD_DURING_DEPLOYMENT=true` is set, then redeploy.

### Issue: "Application Error"
**Solution**: Check logs in **Log stream**. Usually missing environment variables.

### Issue: "Gunicorn not found"
**Solution**: Add `gunicorn` to `backend/requirements.txt`:
```txt
gunicorn==21.2.0
```

### Issue: "Import app.main failed"
**Solution**: Check that the deployment package has the correct structure:
```
deploy/
├── app/
│   ├── __init__.py
│   ├── main.py
│   └── ...
├── frontend/
├── pyproject.toml
└── requirements.txt
```

## Automation Alternative (Advanced)

If you want to automate settings configuration, you'll need to:

1. Create an Azure Service Principal
2. Add these GitHub Secrets:
   - `AZURE_CREDENTIALS` (Service Principal JSON)
3. Use `azure/login@v1` action before `azure/appservice-settings@v1`

See [Azure Login Action](https://github.com/Azure/login) for details.

For most use cases, manual configuration (one-time) is simpler and sufficient.
