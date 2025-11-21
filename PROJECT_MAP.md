# 3PCxP Evals Portal - Project Map

```
3pcxp_evals_portal/
│
├── 📄 index.html                    # Single-page application (SPA)
│                                     Entry point - loads all CSS/JS
│
├── 🎨 css/                          # Stylesheets (Design System)
│   ├── main.css                     # Global: colors, typography, layout
│   ├── form.css                     # Forms, inputs, agent selection
│   ├── dashboard.css                # Tables, badges, sections
│   └── modal.css                    # Execution & update modals
│
├── ⚙️ js/                           # JavaScript Modules
│   ├── utils.js                     # Helpers (dates, IDs, validation)
│   ├── state.js                     # State management, CRUD, persistence
│   ├── form.js                      # Form handling, validation
│   ├── dashboard.js                 # Dashboard rendering, sort/filter
│   ├── modal.js                     # Modal lifecycle management
│   └── app.js                       # Initialization, navigation
│
├── 🧪 demo-data.js                  # Test data generator
│                                     loadDemoData() / clearDemoData()
│
├── 🚀 start.bat                     # Windows launcher script
│                                     Auto-detects Python/Node
│
├── 📚 Documentation/
│   ├── README.md                    # Complete user guide
│   ├── QUICKSTART.md                # 30-second getting started
│   ├── TESTING.md                   # Testing checklist
│   ├── IMPLEMENTATION.md            # Implementation summary
│   ├── PRD.md                       # Product requirements
│   └── PROJECT_MAP.md               # This file
│
└── 🤖 .github/
    └── copilot-instructions.md      # AI agent guidance

```

## 🗺️ Application Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     INDEX.HTML (SPA)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐        ┌─────────────────────────────┐  │
│  │  Navigation  │        │      Dashboard View          │  │
│  ├──────────────┤        ├─────────────────────────────┤  │
│  │ - Dashboard  │───────▶│  ┌────────────────────┐     │  │
│  │ - Submit Req │        │  │ Pending Requests   │     │  │
│  │ - Export     │        │  │ [Pick/Start] ──────┼─┐   │  │
│  │ - Import     │        │  └────────────────────┘ │   │  │
│  └──────────────┘        │                         │   │  │
│                          │  ┌────────────────────┐ │   │  │
│  ┌──────────────┐        │  │ In Progress        │ │   │  │
│  │ Submit View  │        │  │ [Update] [Complete]│ │   │  │
│  ├──────────────┤        │  └────────────────────┘ │   │  │
│  │ - Purpose    │        │                         │   │  │
│  │ - Agents     │        │  ┌────────────────────┐ │   │  │
│  │ - Query Set  │        │  │ Completed          │ │   │  │
│  │ - Configs    │        │  │ [Duration]         │ │   │  │
│  │ - Notes      │        │  └────────────────────┘ │   │  │
│  └──────────────┘        └─────────────────────────┘   │  │
│                                                         │  │
│  ┌─────────────────────────────────────────────────────┼──┤
│  │            Execution Modal (Pick/Start)             │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ - Request Preview                                   │  │
│  │ - Executor Name                                     │  │
│  │ - Run Links (1-10) ──────────────────┐             │  │
│  │   [+ Add Link] [Submit]              │             │  │
│  └──────────────────────────────────────┼─────────────┘  │
│                                         │                │
│  ┌──────────────────────────────────────┼───────────────┤
│  │            Update Modal              │               │
│  ├──────────────────────────────────────┤               │
│  │ - Existing Links (read-only)         │               │
│  │ - Add New Links                      │               │
│  │   [+ Add Link] [Save] ───────────────┘               │
│  └──────────────────────────────────────────────────────┘
│                                                           │
└───────────────────────────────────────────────────────────┘
```

## 💾 Data Flow

```
┌──────────────┐
│ User Actions │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│   Form Handler   │ (form.js)
│   Modal Handler  │ (modal.js)
└──────┬───────────┘
       │
       ▼
┌──────────────────────────────┐
│      State Management        │ (state.js)
│  ┌────────────────────────┐  │
│  │  In-Memory State       │  │
│  │  requests: []          │  │
│  └────────┬───────────────┘  │
│           │                  │
│           ▼                  │
│  ┌────────────────────────┐  │
│  │  localStorage Backup   │  │
│  │  'evalsPortal'         │  │
│  └────────┬───────────────┘  │
│           │                  │
│           ▼                  │
│  ┌────────────────────────┐  │
│  │  Export/Import JSON    │  │
│  │  *.json files          │  │
│  └────────────────────────┘  │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────┐
│ Dashboard Render │ (dashboard.js)
└──────────────────┘
```

## 🎯 Key Components

### State Management (state.js)
```javascript
state = {
  requests: [],              // In-memory array
  init()                     // Load from localStorage
  save()                     // Save to localStorage
  addRequest(data)           // Create new request
  updateRequest(id, data)    // Update existing
  startEvaluation(...)       // pending → in_progress
  addRunLinks(...)           // Append links (immutable)
  completeEvaluation(id)     // in_progress → completed
  exportJSON()               // Download backup
  importJSON(file)           // Restore from file
  search(query)              // Filter requests
  sort(field)                // Sort by column
}
```

### Form Handler (form.js)
```javascript
formHandler = {
  selectedAgents: Set()      // Multi-select state
  setupConditionalFields()   // Ad-hoc, Others logic
  setupAgentSelection()      // Hierarchical DA / Flat FCC
  updateSelectedChips()      // Visual feedback
  handleSubmit()             // Validation + create request
  resetForm()                // Clear all fields
}
```

### Dashboard (dashboard.js)
```javascript
dashboard = {
  renderSection(status)      // pending / in_progress / completed
  createRow(request)         // Generate table row HTML
  attachActionListeners()    // Wire up buttons
  handleComplete(id)         // Completion workflow
  updateSortIndicators()     // Visual sort arrows
}
```

### Modal Handler (modal.js)
```javascript
modalHandler = {
  openExecutionModal(id)     // Pick/Start workflow
  handleExecutionSubmit()    // Create in_progress + links
  openUpdateModal(id)        // Add more links
  handleUpdateSubmit()       // Append new links
  addRunLinkInput()          // Dynamic form fields (1-10)
  collectRunLinks()          // Gather form data
}
```

## 🎨 Design System Reference

### Colors (CSS Variables)
```css
--primary: #0078D4      /* Actions, links */
--success: #107C10      /* Completed */
--warning: #FF8C00      /* In progress */
--neutral: #605E5C      /* Pending */
--danger: #D13438       /* Errors */
```

### Spacing (8px base)
```css
--space-1: 8px          /* Tight spacing */
--space-2: 16px         /* Component padding */
--space-3: 24px         /* Section margins */
--space-4: 32px         /* Page margins */
```

### Typography
```css
--font-family: 'Segoe UI', system-ui, sans-serif
--font-size-base: 14px
--font-size-h1: 24px
--font-size-h2: 20px
--font-size-h3: 16px
```

## 🔑 Key Features Checklist

- [x] Request submission with validation
- [x] Hierarchical agent selection (DA: 4 categories, FCC: flat)
- [x] Conditional form fields (3 patterns)
- [x] Dashboard with 3 status sections
- [x] Search across all fields
- [x] Sort by any column
- [x] Execution modal (1-10 run links)
- [x] Update modal (append links)
- [x] Complete workflow with duration
- [x] localStorage persistence
- [x] Export/import JSON
- [x] Toast notifications
- [x] Keyboard shortcuts
- [x] Empty states
- [x] Demo data generator

## 📖 Quick Reference

### Getting Started
```bash
# Windows
start.bat

# Python
python -m http.server 8000

# Direct
# Double-click index.html
```

### Load Demo Data
```javascript
// Browser console (F12)
loadDemoData()    // Load 5 sample requests
clearDemoData()   // Clear all data
```

### Keyboard Shortcuts
```
Ctrl/Cmd + K   →   Focus search
Ctrl/Cmd + N   →   New request
Ctrl/Cmd + D   →   Dashboard
Escape         →   Close modal
```

### Testing
```bash
# Follow checklist in TESTING.md
# 100+ test cases covering:
# - Form submission
# - Conditional fields
# - Agent selection
# - Dashboard rendering
# - Modals
# - Search/sort/filter
# - Export/import
# - Edge cases
```

## 🚀 Deployment Checklist

- [ ] Review all files created
- [ ] Test in multiple browsers
- [ ] Load demo data and test workflows
- [ ] Export/import data to verify integrity
- [ ] Test keyboard shortcuts
- [ ] Verify localStorage persistence
- [ ] Check all modals open/close
- [ ] Test form validation
- [ ] Verify conditional fields
- [ ] Test multi-agent selection
- [ ] Complete full workflow (submit → start → update → complete)

## 📞 Need Help?

1. **Quick Start:** See `QUICKSTART.md`
2. **Full Guide:** See `README.md`
3. **Testing:** See `TESTING.md`
4. **Requirements:** See `PRD.md`
5. **Implementation Details:** See `IMPLEMENTATION.md`

---

**Ready to Launch!** 🚀
