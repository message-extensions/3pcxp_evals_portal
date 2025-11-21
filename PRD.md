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

### Phase 2: Enhanced UX (Weeks 4-5)
**Goal:** Improved user experience and advanced features

**Features:**
- Advanced search across all fields
- Data visualization (load metrics, trends)
- Keyboard shortcuts
- Bulk actions (future: bulk complete, reassign)
- Toast notifications for actions
- Auto-save for forms

### Phase 3: Production Ready (Weeks 6-8)
**Goal:** Backend integration and enterprise features

**Features:**
- Database integration (PostgreSQL/MongoDB)
- RESTful API
- User authentication (SSO integration)
- Role-based permissions
- Email notifications
- API documentation
- Comprehensive testing suite

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

## Technical Architecture (MVP)

### 8.1 Technology Stack
- **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Styling:** Custom CSS with CSS Grid and Flexbox
- **State Management:** JavaScript objects with in-memory storage
- **Data Persistence:** Export to JSON file, import from JSON
- **Icons:** Font Awesome or SVG icons
- **No external dependencies** for core functionality (offline-capable)

### 8.2 File Structure
```
evals-portal/
├── index.html              # Main application page
├── css/
│   ├── main.css           # Global styles
│   ├── form.css           # Form-specific styles
│   ├── dashboard.css      # Dashboard styles
│   └── modal.css          # Modal styles
├── js/
│   ├── app.js             # Application initialization
│   ├── state.js           # State management
│   ├── form.js            # Form handling
│   ├── dashboard.js       # Dashboard rendering
│   ├── modal.js           # Modal components
│   └── utils.js           # Helper functions
├── assets/
│   └── icons/             # SVG icons
└── README.md              # Documentation
```

### 8.3 Key JavaScript Modules

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

### A. Glossary
- **DA:** Declarative Agent
- **FCC:** Federated Copilot Connector
- **ME:** Message Extension
- **RAI:** Responsible AI
- **MCP:** Model Context Protocol
- **3PCxP:** M365 Core IDC Copilot Extensibility Platform Team



---

**Document History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Nov 21, 2025 | Tezan Sahu | Initial draft |

---

*This PRD is a living document and will be updated based on feedback and implementation learnings.*