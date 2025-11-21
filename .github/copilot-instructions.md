# 3PCxP Evals Portal - AI Agent Instructions

## Project Overview
This is a centralized evaluation request management portal for the M365 Core IDC Copilot Extensibility Platform Team. The portal tracks evaluation requests through three states: Pending → In Progress → Completed.

**Current State:** Greenfield project - implementation starting from PRD only  
**Target:** Phase 1 MVP - vanilla HTML/CSS/JS with in-memory storage and export/import functionality

## Architecture & Tech Stack

### MVP Constraints (Phase 1)
- **No frameworks:** Pure HTML5, CSS3, ES6+ JavaScript only
- **No build tools:** Direct browser execution, no bundlers
- **No backend (yet):** In-memory state with localStorage backup + JSON export/import
- **Offline-capable:** Zero external dependencies for core functionality

### File Structure (Per PRD Section 8.2)
```
evals-portal/
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

No build system - open `index.html` directly in browser or use simple HTTP server:
```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node
npx http-server -p 8000

# Then open http://localhost:8000
```

## Common Pitfalls to Avoid

1. **Don't use localStorage as primary storage** - It's a backup. Primary is in-memory state. Always provide export/import.
2. **Don't mutate state directly** - Use state.updateRequest(), state.addRequest() methods
3. **Don't forget conditional field validation** - Required status changes based on other field values
4. **Don't hard-code agent lists** - Extract to constants/config for Phase 2 backend integration
5. **Unified view not tabs** - PRD 3.2 recommends all 3 sections visible simultaneously with scroll

## Future Architecture Notes (Phase 2+)

Phase 2 will add:
- Backend API (RESTful) for CRUD operations
- Database (PostgreSQL/MongoDB per PRD 8.3)
- SSO authentication
- Email/Slack notifications

Keep Phase 1 code modular - isolate state management in `state.js` so backend swap is straightforward (replace in-memory array with API calls).
