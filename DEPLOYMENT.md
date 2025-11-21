# Deployment Guide - Azure App Service with GitHub Actions

This guide covers automated CI/CD deployment to Azure App Service using GitHub Actions.

## Overview

The deployment pipeline automatically:
1. ✅ Runs tests on every push to `main`
2. 🐳 Builds the application
3. 🚀 Deploys to Azure App Service
4. ⚙️ Configures environment variables
5. 🏥 Performs health checks

## Prerequisites

### 1. Azure Resources

- **Azure Subscription** with permissions to create resources
- **Resource Group** (or create a new one)
- **App Service Plan** (Basic B1 or higher recommended)
- **App Service** (Python 3.11 Linux runtime)

### 2. Azure AD App Registration

You need an Azure AD app registration for OAuth authentication:

1. Go to [Azure Portal](https://portal.azure.com) → **Azure Active Directory** → **App registrations**
2. Create or use existing app registration
3. Note down:
   - **Client ID** (Application ID)
   - **Client Secret** (create one if needed)
   - **Tenant ID** (or use `common` for multi-tenant)

## Step 1: Create Azure App Service

### Option A: Azure Portal (GUI)

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **Create a resource** → **Web App**
3. Configure:
   - **Subscription:** Your subscription
   - **Resource Group:** Create new or use existing
   - **Name:** `<your-app-name>` (must be globally unique)
   - **Publish:** Code
   - **Runtime stack:** Python 3.11
   - **Operating System:** Linux
   - **Region:** Choose closest to your users
   - **Pricing plan:** Basic B1 or higher
4. Click **Review + Create** → **Create**

### Option B: Azure CLI (Scripted)

```bash
# Variables
RESOURCE_GROUP="evals-portal-rg"
APP_SERVICE_PLAN="evals-portal-plan"
APP_NAME="<your-globally-unique-name>"
LOCATION="eastus"

# Login to Azure
az login

# Create resource group
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

# Create App Service Plan (B1 tier)
az appservice plan create \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --name $APP_NAME \
  --runtime "PYTHON:3.11"

# Enable logging
az webapp log config \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --docker-container-logging filesystem \
  --level information

# Show app URL
echo "App URL: https://$APP_NAME.azurewebsites.net"
```

## Step 2: Download Publish Profile

The publish profile contains credentials for deployment.

### ⚠️ Enable Basic Authentication First

If you see "Basic authentication is disabled" when trying to download, you need to enable it:

**Azure Portal Method (Step-by-Step with Screenshot):**
1. Go to your App Service in Azure Portal
2. Navigate to **Settings** → **Configuration** → **General settings** tab
3. Scroll down to **Platform settings** section
4. You'll see two checkboxes (both unchecked by default):
   - ☑️ **SCM Basic Auth Publishing Credentials** - Check this box
   - ☑️ **FTP Basic Auth Publishing Credentials** - Check this box
5. Click **Apply** button at the bottom left
6. Click **Continue** to confirm
7. Wait ~30 seconds for the changes to apply
8. Now go back to your App Service **Overview** page

**Azure CLI Method:**
```bash
# Enable basic authentication for SCM (deployment)
az resource update \
  --resource-group $RESOURCE_GROUP \
  --name scm \
  --resource-type basicPublishingCredentialsPolicies \
  --parent sites/$APP_NAME \
  --set properties.allow=true

# Enable basic authentication for FTP
az resource update \
  --resource-group $RESOURCE_GROUP \
  --name ftp \
  --resource-type basicPublishingCredentialsPolicies \
  --parent sites/$APP_NAME \
  --set properties.allow=true
```

### Now Download Publish Profile

**Azure Portal Method:**
1. Go to your App Service in Azure Portal
2. Click **Get publish profile** (top toolbar)
3. Save the downloaded `.PublishSettings` XML file
4. Open the file and copy **entire XML content**

**Azure CLI Method:**
```bash
az webapp deployment list-publishing-profiles \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --xml
```

Copy the entire output (XML).

### Alternative: Use Deployment Center (Recommended for Production)

Instead of publish profile, you can use Azure's built-in GitHub integration:

1. Azure Portal → Your App Service → **Deployment Center**
2. Select **GitHub** as source
3. Authorize Azure to access your GitHub account
4. Select: Organization → Repository → Branch (`main`)
5. Azure will automatically create a GitHub Actions workflow
6. Click **Save**

**Benefits:**
- No need to manage publish profiles
- Automatic workflow creation
- Integrated with Azure's deployment engine
- More secure (uses OpenID Connect)

## Step 3: Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each:

| Secret Name | Value | Example |
|-------------|-------|---------|
| `AZURE_WEBAPP_NAME` | Your App Service name | `evals-portal-prod` |
| `AZURE_WEBAPP_PUBLISH_PROFILE` | Entire XML from publish profile | `<publishData>...</publishData>` |
| `AZURE_CLIENT_ID` | Azure AD Client ID | `12345678-1234-...` |
| `AZURE_CLIENT_SECRET` | Azure AD Client Secret | `abc123...` |
| `AZURE_TENANT_ID` | Tenant ID or `common` | `common` |
| `SECRET_KEY` | Random 32-byte key (see below) | `X7v9pQ...` |
| `ADMIN_USERS` | Comma-separated admin emails | `admin1@example.com,admin2@example.com` |

### Generate SECRET_KEY:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Step 4: Update Azure AD Redirect URI

Your Azure AD app needs to know the production callback URL.

1. Go to [Azure Portal](https://portal.azure.com) → **Azure Active Directory** → **App registrations**
2. Select your app registration
3. Go to **Authentication** → **Platform configurations** → **Web**
4. Click **Add URI**
5. Add: `https://<your-app-name>.azurewebsites.net/api/auth/callback`
6. Click **Save**

Example: `https://evals-portal-prod.azurewebsites.net/api/auth/callback`

## Step 5: Deploy

### Automatic Deployment (Recommended)

Simply push to the `main` branch:

```bash
git add .
git commit -m "Deploy to Azure"
git push origin main
```

GitHub Actions will automatically:
1. Run tests
2. Build application
3. Deploy to Azure
4. Configure environment variables
5. Run health checks

**Monitor deployment:**
- GitHub → Your repository → **Actions** tab
- Click on the running workflow to see live logs

### Manual Deployment Trigger

You can also trigger deployment manually:

1. Go to GitHub → Your repository → **Actions**
2. Select **Deploy to Azure App Service** workflow
3. Click **Run workflow** → **Run workflow**

## Step 6: Verify Deployment

### Health Check

Visit your health endpoint:
```
https://<your-app-name>.azurewebsites.net/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-22T10:30:00Z",
  "version": "2.0.0"
}
```

### API Documentation

Visit Swagger UI:
```
https://<your-app-name>.azurewebsites.net/docs
```

### Application

Visit your app:
```
https://<your-app-name>.azurewebsites.net
```

You should see the login page and be able to authenticate with Microsoft.

## Step 7: Monitor and Troubleshoot

### View Logs in Azure Portal

1. Go to your App Service in Azure Portal
2. Navigate to **Monitoring** → **Log stream**
3. View real-time logs

### View Logs with Azure CLI

```bash
# Tail logs
az webapp log tail \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP

# Download logs
az webapp log download \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --log-file logs.zip
```

### Common Issues

#### Deployment Failed

**Check GitHub Actions logs:**
1. GitHub → Actions → Failed workflow
2. Expand each step to see error details

**Common causes:**
- Missing or incorrect secrets
- Azure publish profile expired (regenerate)
- Insufficient Azure permissions
- Basic authentication disabled (see Step 2)

#### "Basic authentication is disabled"

**Problem:** Can't download publish profile from Azure Portal.

**Solution:**
1. Go to App Service → **Settings** → **Configuration** → **General settings** tab
2. Scroll to **Platform settings** section
3. Check both boxes:
   - ☑️ **SCM Basic Auth Publishing Credentials**
   - ☑️ **FTP Basic Auth Publishing Credentials**
4. Click **Apply** at the bottom
5. Click **Continue** to confirm
6. Wait 30 seconds, then try downloading publish profile again

**Or use Azure CLI:**
```bash
az resource update --resource-group $RESOURCE_GROUP \
  --name scm --resource-type basicPublishingCredentialsPolicies \
  --parent sites/$APP_NAME --set properties.allow=true
```

**Alternative:** Use Deployment Center with GitHub integration instead (more secure).

#### Application Not Starting

**Check application logs:**
```bash
az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP
```

**Common causes:**
- Missing environment variables
- Invalid Azure AD credentials
- Port binding issues (should use port 8000)

#### Authentication Not Working

**Verify:**
1. Azure AD redirect URI matches production URL exactly
2. All required secrets are set in GitHub
3. `AZURE_TENANT_ID` is set to `common` for multi-tenant

**Test:**
```bash
# Check environment variables are set
az webapp config appsettings list \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP
```

#### Health Check Failing

**Check:**
1. Application is running: `az webapp show --name $APP_NAME --resource-group $RESOURCE_GROUP`
2. Startup command is correct (should be `./startup.sh`)
3. Dependencies installed successfully (check logs)

## Environment Variables Reference

All environment variables are automatically configured by GitHub Actions, but you can verify/update them:

```bash
# List all settings
az webapp config appsettings list \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP

# Set individual setting
az webapp config appsettings set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings ADMIN_USERS="new@example.com"
```

### Required Settings

| Variable | Purpose | Example |
|----------|---------|---------|
| `AZURE_CLIENT_ID` | Azure AD authentication | `12345678-1234-...` |
| `AZURE_CLIENT_SECRET` | Azure AD secret | `abc123...` |
| `AZURE_TENANT_ID` | Tenant or `common` | `common` |
| `AZURE_REDIRECT_URI` | OAuth callback URL | `https://app.azurewebsites.net/api/auth/callback` |
| `SECRET_KEY` | Session encryption | Random 32-byte key |
| `ADMIN_USERS` | Admin email addresses | `admin@example.com` |
| `ENVIRONMENT` | Environment name | `production` |
| `ALLOWED_ORIGINS` | CORS origins | `https://app.azurewebsites.net` |

### Optional Settings

| Variable | Default | Purpose |
|----------|---------|---------|
| `LOG_LEVEL` | `INFO` | Logging verbosity (`DEBUG`, `INFO`, `WARNING`, `ERROR`) |
| `ENABLE_API_DOCS` | `true` | Enable Swagger/ReDoc documentation |
| `SESSION_LIFETIME_HOURS` | `24` | Session expiration time |
| `BACKUP_ENABLED` | `true` | Enable automatic backups |

## Scaling and Performance

### Scale Up (Vertical)

Upgrade to a better pricing tier:

```bash
az appservice plan update \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --sku S1  # Standard tier
```

### Scale Out (Horizontal)

Add more instances:

```bash
az appservice plan update \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --number-of-workers 3
```

### Auto-Scale (Production)

Configure auto-scaling based on metrics (requires Standard tier or higher):

1. Azure Portal → App Service Plan → **Scale out (App Service plan)**
2. Enable custom autoscale
3. Set rules based on CPU/Memory/HTTP queue

## Data Persistence

The current JSON file storage is suitable for development and small deployments. For production:

### Current Setup (JSON Files)

- Files stored in `/app/data` directory
- **⚠️ Warning:** Files are lost when container restarts
- Use Azure File Share for persistence (see below)

### Azure File Share (Recommended for JSON)

Mount persistent storage:

```bash
# Create storage account
az storage account create \
  --name evalsportalstorage \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard_LRS

# Create file share
az storage share create \
  --name data \
  --account-name evalsportalstorage

# Mount to App Service
az webapp config storage-account add \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --custom-id DataVolume \
  --storage-type AzureFiles \
  --share-name data \
  --account-name evalsportalstorage \
  --mount-path /app/data \
  --access-key $(az storage account keys list \
    --resource-group $RESOURCE_GROUP \
    --account-name evalsportalstorage \
    --query '[0].value' -o tsv)
```

### Future: PostgreSQL (Phase 3)

For production scale, migrate to Azure Database for PostgreSQL:

```bash
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name evals-portal-db \
  --location $LOCATION \
  --admin-user dbadmin \
  --admin-password <strong-password> \
  --sku-name Standard_B1ms \
  --version 14
```

## Security Best Practices

### 1. HTTPS Only

Force HTTPS (should be default):

```bash
az webapp update \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --https-only true
```

### 2. Managed Identity (Advanced)

Use Managed Identity instead of client secrets:

```bash
# Enable system-assigned identity
az webapp identity assign \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP

# Grant permissions to Key Vault, etc.
```

### 3. Key Vault Integration

Store secrets in Azure Key Vault:

```bash
# Create Key Vault
az keyvault create \
  --name evals-portal-kv \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION

# Store secrets
az keyvault secret set \
  --vault-name evals-portal-kv \
  --name AzureClientSecret \
  --value "<your-secret>"

# Reference in App Service
# Use @Microsoft.KeyVault(SecretUri=...) syntax
```

### 4. Network Restrictions

Restrict access to Azure IPs only (optional):

```bash
az webapp config access-restriction add \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --rule-name AllowAzure \
  --action Allow \
  --ip-address AzureCloud \
  --priority 100
```

## Cost Optimization

### Pricing Tiers

| Tier | Price/month | Features | Recommended For |
|------|-------------|----------|-----------------|
| **Free F1** | Free | 60 min/day | Testing only |
| **Basic B1** | ~$13 | Custom domains, SSL | Development |
| **Standard S1** | ~$70 | Auto-scale, slots | Small production |
| **Premium P1v3** | ~$100+ | Better performance | Large production |

**Recommendation:** Start with **Basic B1**, upgrade as needed.

### Stop During Off-Hours

Save costs by stopping during non-business hours (automation required):

```bash
# Stop
az webapp stop --name $APP_NAME --resource-group $RESOURCE_GROUP

# Start
az webapp start --name $APP_NAME --resource-group $RESOURCE_GROUP
```

## Backup and Disaster Recovery

### Manual Backup

```bash
# Backup app configuration
az webapp config backup create \
  --resource-group $RESOURCE_GROUP \
  --webapp-name $APP_NAME \
  --container-url "<storage-sas-url>" \
  --backup-name manual-backup-$(date +%Y%m%d)
```

### Automated Backups

Configure in Azure Portal:
1. App Service → **Backups**
2. Configure storage account
3. Set schedule (daily/weekly)

## Rollback Strategy

### Redeploy Previous Version

```bash
# List deployment history
az webapp deployment list \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP

# Redeploy specific version
az webapp deployment source sync \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP
```

### GitHub Actions Rollback

1. Find successful previous workflow run
2. Click **Re-run all jobs**

### Deployment Slots (Standard tier+)

Use staging slots for zero-downtime deployments:

```bash
# Create staging slot
az webapp deployment slot create \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --slot staging

# Deploy to staging
# Test staging: https://<app-name>-staging.azurewebsites.net

# Swap to production
az webapp deployment slot swap \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --slot staging \
  --target-slot production
```

## Monitoring and Alerts

### Application Insights (Recommended)

```bash
# Create Application Insights
az monitor app-insights component create \
  --app evals-portal-insights \
  --location $LOCATION \
  --resource-group $RESOURCE_GROUP \
  --application-type web

# Get instrumentation key
INSTRUMENTATION_KEY=$(az monitor app-insights component show \
  --app evals-portal-insights \
  --resource-group $RESOURCE_GROUP \
  --query instrumentationKey -o tsv)

# Configure App Service
az webapp config appsettings set \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY=$INSTRUMENTATION_KEY
```

### Set Up Alerts

Create alerts for:
- High CPU usage
- High memory usage
- HTTP 5xx errors
- Response time > 2s

Azure Portal → App Service → **Alerts** → **New alert rule**

## Next Steps

1. ✅ Complete initial deployment
2. ✅ Verify authentication works
3. ✅ Test admin features
4. 📊 Set up monitoring (Application Insights)
5. 🔒 Review security settings
6. 💾 Configure persistent storage (Azure File Share)
7. 📧 Plan Phase 3: Database migration

## Support and Troubleshooting

### Useful Commands

```bash
# View app settings
az webapp config appsettings list --name $APP_NAME --resource-group $RESOURCE_GROUP

# Restart app
az webapp restart --name $APP_NAME --resource-group $RESOURCE_GROUP

# View deployment history
az webapp deployment list --name $APP_NAME --resource-group $RESOURCE_GROUP

# Stream logs
az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP

# SSH into container (Advanced)
az webapp ssh --name $APP_NAME --resource-group $RESOURCE_GROUP
```

### Resources

- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [GitHub Actions for Azure](https://github.com/Azure/actions)
- [Azure CLI Reference](https://docs.microsoft.com/en-us/cli/azure/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

---

**Questions or Issues?**
- Check GitHub Actions logs for deployment errors
- Review Azure App Service logs for runtime issues
- Verify all secrets are correctly configured
- Test health endpoint: `https://<app-name>.azurewebsites.net/health`
