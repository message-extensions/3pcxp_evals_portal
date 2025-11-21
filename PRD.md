# 3PCxP Evals Portal - Product Requirements Document

**Version:** 1.0  
**Last Updated:** November 21, 2025  
**Owner:** Tezan Sahu

---

## Executive Summary

The Evals Portal is a centralized platform designed to streamline the submission, tracking, and management of evaluation requests for AI-agent capabilities and features across the 3PCxP team. The portal addresses the current challenge of managing multiple concurrent evaluation requests with varying configurations, agents, and requirements by providing transparency into platform load and creating a standardized workflow for evaluation execution.

---

## Problem Statement

Currently, the evals platform faces several challenges:

- **Request Overload:** Too many evaluation requests with diverse requirements make tracking difficult
- **Lack of Visibility:** Stakeholders cannot see current platform load or understand wait times
- **Knowledge Silos:** Evaluation execution knowledge is concentrated with a single SME
- **Unclear Prioritization:** No systematic way to manage and prioritize incoming requests
- **Poor Documentation:** Evaluation configurations and results are not centrally tracked

---

## Goals & Success Metrics

### Primary Goals
1. Centralize all evaluation request submissions through a single portal
2. Provide real-time visibility into evaluation pipeline status (Pending, In Progress, Completed)
3. Enable team scaling by creating a standardized process that multiple team members can execute
4. Reduce turnaround time for evaluation requests through better workload management

### Success Metrics
- 100% of evaluation requests submitted through the portal within 30 days of launch
- Reduction in average evaluation turnaround time by 30%
- At least 3 team members trained and actively running evaluations within 60 days
- 90% user satisfaction score for portal usability

---

## User Personas

### Primary Users

**1. Request Submitters (Feature Crews)**
- Need to request evaluations for their features/agents
- Want visibility into when their evaluation will be completed
- Need to understand platform capacity constraints

**2. Evaluation Executors (Evals Team)**
- Need to see all pending requests with full context
- Want to track multiple concurrent evaluation runs
- Need to document results and share with stakeholders

**3. Stakeholders (Product/Engineering Leadership)**
- Need visibility into evaluation pipeline health
- Want to understand resource allocation and bottlenecks

---

## Functional Requirements

### 1. Request Submission Form

#### 1.1 Purpose Field
- **Type:** Single-select dropdown (required)
- **Options:**
  - RAI check
  - Flight review
  - GPT-5 migration
  - Ad-hoc (triggers additional text field)
- **Validation:** If "Ad-hoc" selected, "Reason" text field becomes required
- **UI:** Dropdown with clear labels, help text explaining each option

#### 1.2 Agent/Feature Selection
- **Type:** Multi-select hierarchical dropdown (required)
- **First Level Options:**
  - Declarative Agents (DAs)
  - Federated Copilot Connectors (FCCs)
  
**If "Declarative Agents" selected, show second-level categories:**

- **Message Extensions (MEs)**
  - Mock MEs
  - Jira Cloud
  
- **OpenAPI**
  - GitHub Mock
  - KYC Mock
  - GitHub
  - IDEAS
  - KYC
  
- **Remote MCP**
  - Monday.com
  - Connect
  - Sales UAT
  
- **Instructions++**
  - Hugo
  - Vantage Rewards
  - Sales Genie
  - IT Helpdesk
  - Adobe Express

**UI Specifications:**
- Allow selection of multiple agents across different categories
- Display selected items as removable tags/chips
- Include search functionality for quick agent lookup
- Show count of selected agents

#### 1.3 Query Set
- **Type:** Single-select with custom input (required)
- **Options:**
  - Default (selected by default)
  - Others (triggers text input field)
- **Validation:** If "Others" selected, text input becomes required
- **UI:** Radio buttons or dropdown with conditional text area

#### 1.4 Experiment Configuration
Two identical configuration sections: **Control** and **Treatment**

**For Each Configuration:**
- **Type:** Single-select with custom input (required)
- **Options:**
  - Current Prod (default)
  - Others (triggers text input field)
- **Validation:** If "Others" selected, text input becomes required
- **UI:** 
  - Side-by-side layout for Control and Treatment
  - Text areas support multi-line input for complex configurations
  - Placeholder text guides users on expected format
  - Help tooltip explaining how to specify flags/variants

#### 1.5 Notes
- **Type:** Multi-line text area (optional)
- **Character Limit:** 2000 characters
- **UI:** Expandable text area with character counter

#### 1.6 Submitter
- **Type:** Text input (required)
- **Validation:** Non-empty string
- **UI:** Pre-populate with logged-in user if authentication exists

#### 1.7 Form Actions
- **Submit Button:** Validates all required fields, shows success confirmation
- **Clear/Reset Button:** Clears all form fields with confirmation dialog
- **Save as Draft:** (Future enhancement) Save incomplete forms

---

### 2. Dashboard Views

#### 2.1 Pending Requests Section

**Display Columns:**
- Type (DA/FCC) - with visual badge/icon
- Agent(s) - truncated list with hover tooltip showing all
- Purpose - with color coding (e.g., RAI = red, Flight Review = blue)
- Submitter - name or identifier
- Submitted At - relative time (e.g., "2 hours ago") with absolute timestamp on hover
- Actions - "Pick/Start" button

**Features:**
- Sortable columns (default: newest first)
- Filterable by Type, Purpose, Submitter
- Search functionality across all fields
- Displays count of pending requests
- Empty state message when no pending requests

**Actions:**
- **Pick/Start Button:** Opens execution modal (see 2.4)

#### 2.2 In Progress Section

**Display Columns:**
- All columns from Pending Requests
- Executor - person running the evaluation
- Run Links - clickable links with icons, open in new tab
- Started At - timestamp
- Actions - "Update" and "Mark Complete" buttons

**Features:**
- Same sorting, filtering, and search as Pending
- Displays count of in-progress evaluations
- Visual indicator of platform load (e.g., progress bar)
- Estimated completion dates (future enhancement)

**Actions:**
- **Update Button:** Opens modal to add more links/notes
- **Mark Complete Button:** Moves to Completed section with confirmation

#### 2.3 Completed Section

**Display Columns:**
- All columns from In Progress
- Completed At - timestamp
- Duration - time from start to completion

**Features:**
- Sortable and filterable
- Export to CSV/Excel functionality
- Archive old records (> 90 days) option
- Link to detailed view with all run artifacts

**Historical Analytics (Future Enhancement):**
- Average turnaround time by purpose/agent type
- Executor performance metrics
- Volume trends over time

#### 2.4 Execution Modal (Triggered by "Pick/Start")

**Fields:**
- **Executor Name:** Text input (required)
- **Run Link:** URL input (required)
- **Run Notes:** Text area (optional, 500 char limit)
- **Additional Links Section:**
  - "+" button to add more link+note pairs
  - "-" button to remove link+note pairs
  - Support minimum 1, maximum 10 links

**Actions:**
- **Start Evaluation:** Validates inputs, moves request to In Progress
- **Cancel:** Closes modal without changes

#### 2.5 Update Modal (Triggered by "Update" on In Progress items)

**Fields:**
- Shows existing executor, links, and notes (read-only)
- **Add New Link:** URL input
- **Add New Notes:** Text area
- Ability to edit existing notes (not remove original data)

**Actions:**
- **Save Updates:** Adds new information to the evaluation
- **Cancel:** Closes without saving

---

### 3. Navigation & Layout

#### 3.1 Primary Navigation
- **Dashboard** (default view) - shows all three sections
- **Submit Request** - opens submission form
- **Analytics** (future) - reporting and insights

#### 3.2 Dashboard Layout Options
- **Tab-based:** Separate tabs for Pending, In Progress, Completed
- **Accordion:** Collapsible sections on single page
- **Unified View:** All sections visible simultaneously with scroll

**Recommendation:** Unified view with section anchors for quick navigation

#### 3.3 Responsive Design
- Desktop-first design (primary use case)
- Tablet support for viewing dashboards
- Mobile: Read-only dashboard view

---

### 4. Data Persistence & Storage

#### 4.1 Storage Approach
**Phase 1 (MVP):** Browser-based persistent storage using in-memory state with manual backup
- All data stored in application memory during session
- Export/import functionality for data backup
- Warning to users about data persistence limitations

**Phase 2 (Production):** Backend database integration
- RESTful API for CRUD operations
- User authentication and authorization
- Audit logging for all actions

#### 4.2 Data Model

**Request Object:**
```json
{
  "id": "unique_id",
  "purpose": "string",
  "purposeReason": "string (if ad-hoc)",
  "agentType": "DA | FCC",
  "agents": ["array of selected agents"],
  "querySet": "string",
  "querySetDetails": "string (if Others)",
  "controlConfig": "string",
  "treatmentConfig": "string",
  "notes": "string",
  "submitter": "string",
  "submittedAt": "ISO timestamp",
  "status": "pending | in_progress | completed",
  "executor": "string (nullable)",
  "startedAt": "ISO timestamp (nullable)",
  "completedAt": "ISO timestamp (nullable)",
  "runLinks": [
    {
      "url": "string",
      "notes": "string",
      "addedAt": "ISO timestamp"
    }
  ]
}
```

---

## Non-Functional Requirements

### 5.1 Performance
- Page load time: < 2 seconds
- Form submission response: < 500ms
- Dashboard refresh: < 1 second
- Support up to 500 concurrent requests without performance degradation

### 5.2 Usability
- Intuitive UI requiring no training for basic operations
- Keyboard navigation support
- Clear error messages with actionable guidance
- Confirmation dialogs for destructive actions

### 5.3 Accessibility
- WCAG 2.1 Level AA compliance
- Screen reader compatible
- Keyboard-only navigation support
- Sufficient color contrast ratios (4.5:1 minimum)

### 5.4 Browser Compatibility
- Chrome (latest 2 versions)
- Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

### 5.5 Security (Phase 2)
- Role-based access control
- HTTPS only
- Input sanitization to prevent XSS
- CSRF protection
- Audit logging of all actions

---

## User Interface Specifications

### 6.1 Design Principles
- **Clean & Modern:** Minimal design with ample whitespace
- **Intuitive:** Self-explanatory UI elements with contextual help
- **Professional:** Suitable for enterprise environment
- **Responsive:** Adapts to different screen sizes
- **Consistent:** Unified visual language across all views

### 6.2 Visual Design Guidelines

**Color Palette:**
- Primary: Blue (#0078D4) - for primary actions, links
- Success: Green (#107C10) - for completed status
- Warning: Orange (#FF8C00) - for in-progress status
- Neutral: Gray (#605E5C) - for pending status
- Danger: Red (#D13438) - for errors, deletions
- Background: White (#FFFFFF) / Light Gray (#F3F2F1)

**Typography:**
- Primary Font: Segoe UI, system-ui, sans-serif
- Heading Sizes: 24px, 20px, 16px
- Body: 14px
- Small: 12px

**Spacing:**
- Base unit: 8px
- Component padding: 16px
- Section margins: 24px
- Page margins: 32px

**Components:**
- Buttons: Rounded corners (4px), 36px height
- Inputs: 1px border, 4px rounded corners, 36px height
- Cards: 8px rounded corners, subtle shadow
- Modals: Centered, max-width 600px, overlay with 60% opacity

### 6.3 Key UI Components

**Status Badges:**
- Pending: Gray circle icon
- In Progress: Orange rotating icon
- Completed: Green checkmark icon

**Action Buttons:**
- Primary: Solid background, white text
- Secondary: Outline style, colored border
- Icon Buttons: Minimal style for repeated actions

**Data Tables:**
- Alternating row colors for readability
- Hover state on rows
- Fixed header on scroll
- Column sorting indicators

**Forms:**
- Inline validation with immediate feedback
- Required field indicators (asterisk)
- Help text below inputs
- Error messages in red with icons

---

## User Workflows

### 7.1 Submit New Evaluation Request

1. User clicks "Submit Request" in navigation
2. Form loads with all fields visible
3. User selects Purpose (if Ad-hoc, additional field appears)
4. User selects Agent type and specific agents (multi-select)
5. User selects or specifies Query Set
6. User configures Control and Treatment settings
7. User optionally adds Notes
8. User confirms/enters Submitter name
9. User clicks Submit
10. System validates all required fields
11. Success message displays
12. Request appears in Pending dashboard
13. Form resets for new submission

### 7.2 Start Evaluation Execution

1. Executor views Pending Requests dashboard
2. Executor clicks "Pick/Start" on a request
3. Modal opens showing request details
4. Executor enters their name
5. Executor adds run link and optional notes
6. Executor can add additional links using "+" button
7. Executor clicks "Start Evaluation"
8. Request moves to In Progress section
9. Executor receives confirmation

### 7.3 Update Running Evaluation

1. Executor views In Progress dashboard
2. Executor clicks "Update" on their evaluation
3. Modal shows existing information (read-only)
4. Executor adds new links and/or notes
5. Executor clicks "Save Updates"
6. New information appends to evaluation record
7. Dashboard refreshes with updated data

### 7.4 Complete Evaluation

1. Executor clicks "Mark Complete" on in-progress evaluation
2. Confirmation dialog appears
3. Executor confirms completion
4. Request moves to Completed section
5. Completion timestamp recorded
6. Submitter notification (future enhancement)

---

## Implementation Phases

### Phase 1: MVP (Weeks 1-3)
**Goal:** Core functionality with in-memory storage

**Features:**
- Request submission form (all required fields)
- Dashboard with 3 sections (Pending, In Progress, Completed)
- Pick/Start, Update, and Mark Complete workflows
- Basic filtering and sorting
- Export/import data functionality
- Manual data backup mechanism

**Deliverables:**
- Fully functional HTML/CSS/JS application
- User documentation
- Demo video

### Phase 2: Backend Integration & Authentication (Weeks 4-6)
**Goal:** Production-ready backend with Microsoft Entra OAuth 2.0

**Architecture:**
- **Backend Framework:** FastAPI (Python 3.10+)
- **Storage:** JSON files in dedicated data folder
- **Authentication:** Microsoft Entra ID (Azure AD) OAuth 2.0
- **API Design:** RESTful endpoints with OpenAPI documentation
- **Deployment:** Docker containerized application

**Core Features:**
- FastAPI backend with auto-generated OpenAPI docs
- JSON file-based storage (one file per request)
- Microsoft SSO integration (OAuth 2.0 + PKCE flow)
- Auto-populate submitter/executor from authenticated user
- Session management with secure HTTP-only cookies
- CORS configuration for frontend-backend communication
- Structured logging and error handling
- Health check and metrics endpoints

**Authentication Flow:**
1. User redirects to Microsoft Entra login page
2. User authenticates with Microsoft credentials
3. Backend receives authorization code
4. Backend exchanges code for access token
5. Backend validates token and extracts user info (name, email)
6. Backend creates session and returns to frontend
7. Frontend stores session, displays username
8. Submitter/Executor fields pre-populated and read-only

**Data Storage Strategy:**
- Each request stored as `data/requests/{request_id}.json`
- Index file `data/index.json` maintains list of all request IDs
- Atomic file writes with temporary file + rename pattern
- File locking for concurrent access safety
- Automatic backup on every write to `data/backups/`

**Technical Details:**
- Python 3.10+ with type hints and Pydantic models
- FastAPI with async/await for high concurrency
- MSAL (Microsoft Authentication Library) for OAuth
- Uvicorn ASGI server
- Structured project layout following FastAPI best practices

### Phase 3: Enhanced Features (Weeks 7-9)
**Goal:** Advanced functionality and user experience improvements

**Features:**
- Real-time updates with WebSocket connections
- Advanced filtering with saved filter presets
- Bulk operations (bulk assign, bulk complete)
- Email notifications via Microsoft Graph API
- Audit logging for compliance
- Export to Excel with formatting
- Data retention policies and archival

### Phase 4: Analytics & Scale (Weeks 10-12)
**Goal:** Analytics, reporting, and performance optimization

**Features:**
- Historical analytics dashboard
- Performance metrics by executor and agent type
- SLA tracking and breach alerts
- Capacity planning tools
- Database migration (PostgreSQL for scale)
- Caching layer (Redis) for performance
- API rate limiting
- Comprehensive testing suite (pytest, coverage >80%)

### Phase 4: Advanced Analytics (Weeks 9-12)
**Goal:** Insights and optimization

**Features:**
- Historical analytics dashboard
- Performance metrics by executor
- Bottleneck identification
- Capacity planning tools
- Automated reporting
- SLA tracking

---

## Technical Architecture

### 8.1 Phase 1 (MVP) Technology Stack
- **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Styling:** Custom CSS with CSS Grid and Flexbox
- **State Management:** JavaScript objects with in-memory storage
- **Data Persistence:** Export to JSON file, import from JSON
- **Icons:** Font Awesome or SVG icons
- **No external dependencies** for core functionality (offline-capable)

### 8.2 Phase 2 Technology Stack

**Backend:**
- **Framework:** FastAPI 0.104+ (Python 3.10+)
- **ASGI Server:** Uvicorn with auto-reload in development
- **Authentication:** MSAL (Microsoft Authentication Library) for Python
- **Data Storage:** JSON files with file-based locking
- **API Documentation:** Auto-generated OpenAPI (Swagger UI)
- **Validation:** Pydantic v2 for request/response models
- **Configuration:** python-dotenv for environment variables
- **Logging:** Python logging with structured JSON output

**Frontend (No Changes):**
- Same vanilla HTML/CSS/JS stack
- API client added to `js/api.js` for backend communication
- Session management added to `js/auth.js`
- No framework dependencies maintained

**DevOps:**
- **Containerization:** Docker + Docker Compose
- **Development:** Hot reload for both frontend and backend
- **Environment Management:** .env files for local config
- **Version Control:** Git with .gitignore for secrets

### 8.3 Phase 2 Project Structure
```
evals-portal/
├── frontend/                      # Phase 1 frontend (unchanged)
│   ├── index.html
│   ├── css/
│   │   ├── main.css
│   │   ├── form.css
│   │   ├── dashboard.css
│   │   └── modal.css
│   ├── js/
│   │   ├── app.js
│   │   ├── state.js               # Modified to use API
│   │   ├── api.js                 # NEW: API client
│   │   ├── auth.js                # NEW: Auth handling
│   │   ├── form.js
│   │   ├── dashboard.js
│   │   ├── modal.js
│   │   └── utils.js
│   └── assets/
│       └── icons/
│
├── backend/                       # NEW: FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py               # FastAPI app initialization
│   │   ├── config.py             # Configuration & settings
│   │   ├── models/               # Pydantic models
│   │   │   ├── __init__.py
│   │   │   ├── request.py        # Request model
│   │   │   └── user.py           # User model
│   │   ├── api/                  # API route handlers
│   │   │   ├── __init__.py
│   │   │   ├── auth.py           # Authentication endpoints
│   │   │   ├── requests.py       # Request CRUD endpoints
│   │   │   └── health.py         # Health check endpoints
│   │   ├── services/             # Business logic layer
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py   # OAuth 2.0 logic
│   │   │   └── request_service.py # Request operations
│   │   ├── storage/              # Data persistence layer
│   │   │   ├── __init__.py
│   │   │   ├── json_storage.py   # JSON file operations
│   │   │   └── file_lock.py      # File locking utilities
│   │   ├── middleware/           # Custom middleware
│   │   │   ├── __init__.py
│   │   │   ├── auth_middleware.py
│   │   │   └── logging_middleware.py
│   │   └── utils/                # Helper utilities
│   │       ├── __init__.py
│   │       ├── logger.py         # Logging setup
│   │       └── validators.py     # Custom validators
│   ├── requirements.txt          # Python dependencies
│   └── Dockerfile                # Backend container
│
├── data/                          # NEW: JSON storage
│   ├── requests/                 # Request JSON files
│   │   └── .gitkeep
│   ├── backups/                  # Automatic backups
│   │   └── .gitkeep
│   └── index.json                # Request index
│
├── tests/                         # NEW: Test suite
│   ├── __init__.py
│   ├── conftest.py               # Pytest fixtures
│   ├── test_api/                 # API endpoint tests
│   ├── test_services/            # Service layer tests
│   └── test_storage/             # Storage layer tests
│
├── docker-compose.yml            # Container orchestration
├── .env.example                  # Environment template
├── .gitignore
├── README.md
└── SETUP.md                      # NEW: Setup instructions
```

### 8.4 Key Backend Modules (Phase 2)

**State Management (state.js):**
- Centralized application state
- CRUD operations for requests
- State persistence to localStorage as backup
- Export/import functionality

**Form Handler (form.js):**
- Form validation logic
- Dynamic field visibility (conditional fields)
- Multi-select agent handling
- Submission processing

**Dashboard Renderer (dashboard.js):**
- Render Pending, In Progress, Completed sections
- Sorting and filtering logic
- Search functionality
- Table generation

**Modal Manager (modal.js):**
- Execution modal creation
- Update modal creation
- Modal lifecycle management

---

## Testing Strategy

### 9.1 Testing Scope

**Unit Testing:**
- Form validation functions
- State management operations
- Data transformation utilities
- Filtering and sorting logic

**Integration Testing:**
- Complete user workflows (submit → start → update → complete)
- Data persistence across sessions
- Export/import functionality

**UI Testing:**
- Cross-browser compatibility
- Responsive design on different screen sizes
- Keyboard navigation
- Accessibility compliance

**User Acceptance Testing:**
- Feature crew members submit requests
- Eval team members execute workflows
- Feedback collection and iteration

### 9.2 Test Cases

**Critical Test Cases:**
1. Submit request with all required fields
2. Submit request with ad-hoc purpose (conditional field)
3. Submit request with custom query set
4. Submit request with custom experiment configs
5. Multi-select agents across different categories
6. Start evaluation with single run link
7. Start evaluation with multiple run links
8. Update in-progress evaluation
9. Mark evaluation as complete
10. Filter/sort dashboard sections
11. Search across all fields
12. Export data to JSON
13. Import data from JSON
14. Browser refresh preserves state
15. Handle large datasets (100+ requests)

---

## Migration & Rollout Plan

### 10.1 Pre-Launch
- Conduct demo sessions with feature crews
- Train eval team members on portal usage
- Create quick-start guide and video tutorial
- Set up feedback collection mechanism

### 10.2 Launch
- **Week 1:** Soft launch with eval team only
- **Week 2:** Open to 3PCxP feature crews with announcement
- **Week 3:** Mandatory adoption, deprecate old process
- **Week 4:** Collect feedback and iterate

### 10.3 Success Criteria for Rollout
- 80% of eval requests submitted through portal in Week 2
- 100% adoption by Week 3
- Zero critical bugs reported
- Average user satisfaction score > 4/5

---

## Open Questions & Decisions Needed

1. **Authentication:** Should we integrate SSO in Phase 1 or wait for Phase 3?
2. **Notifications:** Email, Slack, or Teams integration priority?
3. **Data Retention:** How long should completed evaluations be kept?
4. **Permissions:** Should submitters be able to edit their pending requests?
5. **Priority Levels:** Should requests have priority levels (P0, P1, P2)?
6. **Capacity Limits:** Should we set max concurrent evaluations per executor?
7. **SLA Definition:** What are target turnaround times by request type?

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Low adoption by feature crews | High | Medium | Conduct training sessions, make portal mandatory |
| Data loss with in-memory storage | High | Medium | Implement export/import, frequent backups, move to backend quickly |
| Performance issues with large datasets | Medium | Low | Pagination, lazy loading, virtualized lists |
| UI complexity overwhelms users | Medium | Low | User testing, iterative simplification |
| Browser compatibility issues | Low | Low | Cross-browser testing, fallback designs |
| Executor burnout from visible load | Medium | Medium | Load balancing features, team capacity planning |

---

## Success Metrics & KPIs

### Short-term (First 30 Days)
- 100% of evaluation requests submitted through portal
- Average submission time < 3 minutes
- Zero data loss incidents
- User satisfaction score ≥ 4/5

### Medium-term (90 Days)
- 30% reduction in average evaluation turnaround time
- 3+ trained executors actively running evaluations
- 90% of requests started within 48 hours
- < 5% requests requiring clarification after submission

### Long-term (6 Months)
- Predictable evaluation capacity planning
- Self-service analytics for stakeholders
- Automated reporting to leadership
- Evaluation process documentation fully maintained

---

## Appendix

### A. Microsoft Entra OAuth 2.0 Setup Guide

#### A.1 Azure Portal Configuration

**Step 1: Register Application in Azure Portal**
1. Navigate to [Azure Portal](https://portal.azure.com)
2. Go to "Azure Active Directory" → "App registrations" → "New registration"
3. Fill in application details:
   - **Name:** `3PCxP Evals Portal`
   - **Supported account types:** `Accounts in this organizational directory only (Single tenant)`
   - **Redirect URI:** Select `Web` platform
   - **Redirect URI Value:** `http://localhost:8000/api/auth/callback` (development)
   - For production: `https://your-domain.com/api/auth/callback`
4. Click "Register"
5. **Save the following values from Overview page:**
   - Application (client) ID → `AZURE_CLIENT_ID`
   - Directory (tenant) ID → `AZURE_TENANT_ID`

**Step 2: Create Client Secret**
1. In your app registration, go to "Certificates & secrets"
2. Click "New client secret"
3. Add description: `Backend API Secret`
4. Set expiration: `24 months` (recommended)
5. Click "Add"
6. **Copy the secret VALUE immediately** → `AZURE_CLIENT_SECRET`
7. ⚠️ Secret value shown only once - save it securely

**Step 3: Configure API Permissions**
1. Go to "API permissions" → "Add a permission"
2. Select "Microsoft Graph" → "Delegated permissions"
3. Add the following permissions:
   - `User.Read` - Read user profile (required)
   - `email` - Access user's email address
   - `openid` - OpenID Connect sign-in
   - `profile` - View user's basic profile
4. Click "Add permissions"
5. Click "Grant admin consent for [Your Organization]" (requires admin)
6. Verify all permissions show "Granted for [Your Organization]"

**Step 4: Configure Authentication**
1. Go to "Authentication" in left menu
2. Under "Platform configurations" → "Web" section:
   - Verify redirect URI: `http://localhost:8000/api/auth/callback`
   - Add additional redirect URI for production if needed
3. Under "Implicit grant and hybrid flows":
   - ✅ Check "ID tokens" (for OpenID Connect)
4. Under "Advanced settings":
   - Set "Allow public client flows" to **No**
5. Click "Save"

**Step 5: Configure Token Configuration (Optional)**
1. Go to "Token configuration"
2. Add optional claims:
   - Click "Add optional claim"
   - Select "ID" token type
   - Add claims: `email`, `family_name`, `given_name`
3. Click "Add"

#### A.2 Backend Environment Configuration

Create `.env` file in project root:

```bash
# Azure AD / Entra ID Configuration
AZURE_CLIENT_ID=<your-application-client-id>
AZURE_CLIENT_SECRET=<your-client-secret-value>
AZURE_TENANT_ID=<your-tenant-id>
AZURE_AUTHORITY=https://login.microsoftonline.com/<your-tenant-id>
AZURE_REDIRECT_URI=http://localhost:8000/api/auth/callback
AZURE_SCOPE=User.Read email openid profile

# Application Configuration
SECRET_KEY=<generate-random-secret-key-for-sessions>
ENVIRONMENT=development
ALLOWED_ORIGINS=http://localhost:8000,http://127.0.0.1:8000

# Storage Configuration
DATA_DIR=./data
BACKUP_ENABLED=true
BACKUP_RETENTION_DAYS=30

# Server Configuration
HOST=0.0.0.0
PORT=8000
RELOAD=true
LOG_LEVEL=INFO
```

**Generate SECRET_KEY:**
```python
import secrets
print(secrets.token_urlsafe(32))
```

#### A.3 Authentication Flow Implementation

**Backend OAuth Flow (backend/app/services/auth_service.py):**

1. **Initiate Login (`/api/auth/login`):**
   - Generate PKCE code verifier and challenge
   - Store code verifier in session
   - Construct authorization URL with Microsoft Entra
   - Redirect user to Microsoft login page

2. **Handle Callback (`/api/auth/callback`):**
   - Receive authorization code from Microsoft
   - Retrieve PKCE code verifier from session
   - Exchange authorization code for access token
   - Validate access token and decode JWT
   - Extract user information (name, email, oid)
   - Create user session with HTTP-only cookie
   - Redirect to frontend dashboard

3. **Check Authentication (`/api/auth/me`):**
   - Validate session cookie
   - Return current user information
   - Frontend uses this to pre-populate forms

4. **Logout (`/api/auth/logout`):**
   - Clear session cookie
   - Optionally redirect to Microsoft logout endpoint

**Frontend Integration (frontend/js/auth.js):**

```javascript
// Check if user is authenticated on page load
async function checkAuth() {
  const response = await fetch('/api/auth/me', {
    credentials: 'include'  // Include session cookie
  });
  
  if (response.ok) {
    const user = await response.json();
    return user;  // { name: "John Doe", email: "john@company.com" }
  }
  
  // Not authenticated - redirect to login
  window.location.href = '/api/auth/login';
}

// Pre-populate form fields with authenticated user
function populateUserFields(user) {
  const submitterField = document.getElementById('submitter');
  submitterField.value = user.name;
  submitterField.readOnly = true;
  
  const executorField = document.getElementById('executorName');
  if (executorField) {
    executorField.value = user.name;
    executorField.readOnly = true;
  }
}
```

#### A.4 Security Best Practices

1. **Never commit secrets to Git:**
   - Add `.env` to `.gitignore`
   - Provide `.env.example` with placeholder values
   - Use Azure Key Vault in production

2. **Session Security:**
   - HTTP-only cookies prevent XSS attacks
   - Secure flag in production (HTTPS only)
   - SameSite=Lax to prevent CSRF
   - Session expiration (24 hours recommended)

3. **Token Validation:**
   - Validate JWT signature using Microsoft public keys
   - Check token expiration (`exp` claim)
   - Verify audience (`aud`) matches your client ID
   - Verify issuer (`iss`) matches Microsoft Entra

4. **CORS Configuration:**
   - Whitelist only your frontend domain
   - Allow credentials for cookie-based auth
   - Restrict methods to required ones (GET, POST, PUT, DELETE)

#### A.5 Testing Authentication

**Manual Testing Steps:**
1. Start backend: `uvicorn app.main:app --reload --port 8000`
2. Open browser: `http://localhost:8000`
3. Click login → redirects to Microsoft login page
4. Enter Microsoft credentials
5. Consent to permissions (first time only)
6. Redirected back to dashboard
7. Verify username displayed in UI
8. Open form → verify submitter field pre-populated and read-only
9. Test logout → clears session
10. Verify protected endpoints return 401 when not authenticated

**Automated Testing (pytest):**
```python
# tests/test_api/test_auth.py
def test_protected_endpoint_requires_auth(client):
    response = client.get("/api/requests")
    assert response.status_code == 401

def test_auth_me_with_valid_session(client, authenticated_user):
    response = client.get("/api/auth/me")
    assert response.status_code == 200
    assert response.json()["name"] == "Test User"
```

#### A.6 Troubleshooting

**Issue:** Redirect URI mismatch error
- **Solution:** Ensure redirect URI in Azure portal exactly matches backend configuration
- Check for trailing slashes, http vs https, port numbers

**Issue:** Insufficient permissions error
- **Solution:** Admin must grant consent in Azure portal
- Go to API permissions → Grant admin consent

**Issue:** Token validation fails
- **Solution:** Check system clock synchronization
- Verify tenant ID and client ID match Azure portal
- Ensure Microsoft public keys are accessible

**Issue:** CORS errors in browser
- **Solution:** Add frontend origin to ALLOWED_ORIGINS
- Enable credentials in CORS configuration

### B. Glossary
- **DA:** Declarative Agent
- **FCC:** Federated Copilot Connector
- **ME:** Message Extension
- **RAI:** Responsible AI
- **MCP:** Model Context Protocol
- **3PCxP:** M365 Core IDC Copilot Extensibility Platform Team
- **MSAL:** Microsoft Authentication Library
- **PKCE:** Proof Key for Code Exchange (OAuth security enhancement)
- **JWT:** JSON Web Token
- **OID:** Object ID (unique user identifier in Azure AD)



---

**Document History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Nov 21, 2025 | Tezan Sahu | Initial draft |

---

*This PRD is a living document and will be updated based on feedback and implementation learnings.*