# 3PCxP Evals Portal

A centralized evaluation request management portal for the M365 Core IDC Copilot Extensibility Platform Team.

## Overview

The Evals Portal streamlines the submission, tracking, and management of evaluation requests for AI-agent capabilities across the 3PCxP team. It provides a transparent view of platform load and creates a standardized workflow for evaluation execution.

## Features

### Phase 1 (MVP) - Current Implementation

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

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Edge, Firefox, or Safari - latest 2 versions)
- No build tools or dependencies required!

### Running Locally

**Option 1: Direct File Open**
Simply open `index.html` in your web browser.

**Option 2: Python HTTP Server**
```bash
python -m http.server 8000
# Navigate to http://localhost:8000
```

**Option 3: Node HTTP Server**
```bash
npx http-server -p 8000
# Navigate to http://localhost:8000
```

**Option 4: VS Code Live Server**
1. Install the "Live Server" extension
2. Right-click `index.html` and select "Open with Live Server"

## User Guide

### Submitting a Request

1. Click **"Submit Request"** in the navigation
2. Fill in required fields:
   - **Purpose**: Select from RAI check, Flight review, GPT-5 migration, or Ad-hoc
   - **Agent Type**: Choose DA (Declarative Agents) or FCC
   - **Agents**: Select one or more agents from the hierarchical list
   - **Query Set**: Default or custom
   - **Control/Treatment Config**: Specify experiment configurations
   - **Submitter**: Your name or email
3. Optionally add notes (up to 2000 characters)
4. Click **"Submit Request"**

### Starting an Evaluation

1. Go to **Dashboard** view
2. In the **Pending Requests** section, click **"Pick/Start"** on a request
3. Enter your name as the executor
4. Add run link(s) with optional notes
5. Click **"Start Evaluation"**

The request moves to **In Progress** section.

### Updating an Evaluation

1. In the **In Progress** section, click **"Update"** on your evaluation
2. Review existing links
3. Add new run links and notes
4. Click **"Save Updates"**

### Completing an Evaluation

1. In the **In Progress** section, click **"Mark Complete"**
2. Confirm the action

The request moves to **Completed** section with duration calculated.

### Searching and Filtering

- Use the **search box** to filter requests across all fields
- Click **column headers** to sort (ascending/descending)
- Search works across purpose, agents, submitter, executor, and notes

### Data Management

**Export Data:**
- Click **"Export Data"** button to download all requests as JSON
- Useful for backups or sharing with team

**Import Data:**
- Click **"Import Data"** and select a previously exported JSON file
- Existing data will be replaced (confirmation required)

## Keyboard Shortcuts

- `Ctrl/Cmd + K` - Focus search box
- `Ctrl/Cmd + N` - Navigate to Submit Request
- `Ctrl/Cmd + D` - Navigate to Dashboard
- `Escape` - Close open modal

## Data Persistence

### Storage Strategy

- **Primary**: In-memory state (fast, session-based)
- **Backup**: localStorage (survives browser refresh)
- **Export/Import**: Manual JSON files (for data portability)

### Important Notes

⚠️ **Data is stored in your browser's localStorage**
- Data persists across browser sessions
- Data is local to your browser on this computer
- Clearing browser data will delete all requests
- **Always export your data regularly** as a backup

⚠️ **Phase 1 Limitations**
- No server-side database (Phase 2)
- No multi-user synchronization
- No authentication/authorization
- Export/import required for data sharing

## File Structure

```
evals-portal/
├── index.html              # Main application
├── css/
│   ├── main.css           # Global styles, design system
│   ├── form.css           # Form-specific styles
│   ├── dashboard.css      # Table and dashboard layouts
│   └── modal.css          # Modal styles
├── js/
│   ├── app.js             # Application initialization
│   ├── state.js           # State management, CRUD ops
│   ├── form.js            # Form handling, validation
│   ├── dashboard.js       # Dashboard rendering
│   ├── modal.js           # Modal lifecycle management
│   └── utils.js           # Helper functions
└── README.md              # This file
```

## Technical Details

### Tech Stack

- **HTML5** - Semantic structure, native `<dialog>` elements
- **CSS3** - CSS Grid, Flexbox, CSS Variables
- **JavaScript (ES6+)** - Vanilla JS, no frameworks
- **localStorage API** - Client-side persistence

### Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 15+

### Design System

**Colors:**
- Primary: `#0078D4` (Microsoft Blue)
- Success: `#107C10` (Green)
- Warning: `#FF8C00` (Orange)
- Neutral: `#605E5C` (Gray)
- Danger: `#D13438` (Red)

**Spacing:** 8px base unit (multiples of 8)

**Typography:** Segoe UI (system fallback)

## Troubleshooting

### Issue: Data not persisting
- **Check**: Browser localStorage is enabled
- **Fix**: Enable cookies and site data in browser settings

### Issue: Form validation errors
- **Check**: All required fields are filled
- **Fix**: Ensure at least one agent is selected

### Issue: Search not working
- **Check**: Correct spelling in search query
- **Note**: Search is case-insensitive and searches all fields

### Issue: Modal not closing
- **Fix**: Press `Escape` key or click outside the modal

## Future Enhancements (Phase 2+)

- [ ] Backend API with database (PostgreSQL/MongoDB)
- [ ] User authentication (SSO)
- [ ] Email/Slack notifications
- [ ] Advanced analytics dashboard
- [ ] Role-based permissions
- [ ] Real-time collaboration
- [ ] SLA tracking

## Support

For questions or issues:
- Contact: Tezan Sahu
- Team: M365 Core IDC Copilot Extensibility Platform

## License

Internal tool for Microsoft 3PCxP team use only.

---

**Version:** 1.0 (Phase 1 MVP)  
**Last Updated:** November 21, 2025
