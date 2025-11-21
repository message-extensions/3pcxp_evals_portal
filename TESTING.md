# Phase 1 Testing Checklist

## ✅ Functionality Testing

### Form Submission
- [ ] Submit request with all required fields
- [ ] Form validation prevents submission with missing fields
- [ ] Agent selection requires at least one agent
- [ ] Character counter updates for notes field
- [ ] Reset button clears form after confirmation

### Conditional Fields
- [ ] Purpose "Ad-hoc" shows Purpose Reason field (required)
- [ ] Query Set "Others" shows Query Set Details field (required)
- [ ] Control Config "Others" shows custom input (required)
- [ ] Treatment Config "Others" shows custom input (required)
- [ ] Conditional fields hide when selection changes

### Agent Selection
- [ ] DA: Hierarchical categories display correctly
  - [ ] Message Extensions (Mock MEs, Jira Cloud)
  - [ ] OpenAPI (5 agents)
  - [ ] Remote MCP (3 agents)
  - [ ] Instructions++ (5 agents)
- [ ] FCC: Flat list displays correctly
- [ ] Multi-select works across categories
- [ ] Selected agents show as removable chips
- [ ] Removing chip unchecks checkbox
- [ ] Agent type change clears selections

### Dashboard - Pending Section
- [ ] Displays pending requests correctly
- [ ] Shows: Type, Agents, Purpose, Submitter, Submitted At
- [ ] "Pick/Start" button opens execution modal
- [ ] Empty state shows when no pending requests
- [ ] Count badge shows correct number

### Dashboard - In Progress Section
- [ ] Displays in-progress evaluations correctly
- [ ] Shows all pending columns + Executor, Run Links, Started At
- [ ] Run links are clickable (open in new tab)
- [ ] "Update" button opens update modal
- [ ] "Mark Complete" button completes with confirmation
- [ ] Empty state works
- [ ] Count badge correct

### Dashboard - Completed Section
- [ ] Displays completed evaluations correctly
- [ ] Shows all in-progress columns + Completed At, Duration
- [ ] Duration calculates correctly (format: Xd Xh or Xh Xm or Xm)
- [ ] Empty state works
- [ ] Count badge correct

### Execution Modal
- [ ] Opens with correct request preview
- [ ] All request details displayed
- [ ] Executor name required
- [ ] First run link required
- [ ] Can add up to 10 run links
- [ ] Remove link button works (except first)
- [ ] URL validation works
- [ ] Submission moves request to In Progress
- [ ] Modal closes after successful submission

### Update Modal
- [ ] Shows existing run links
- [ ] Displays link URLs, notes, and timestamps
- [ ] Can add new links (not required)
- [ ] New links validate if provided
- [ ] Updates append to existing links (don't replace)
- [ ] Modal closes after save

### Search & Filtering
- [ ] Search filters across all sections simultaneously
- [ ] Searches in: purpose, agents, submitter, executor, notes
- [ ] Case-insensitive search
- [ ] Real-time filtering as you type
- [ ] Clear search shows all results

### Sorting
- [ ] Click column header to sort
- [ ] Second click reverses sort direction
- [ ] Sort indicator (arrow) shows correctly
- [ ] Sorts work on all sortable columns
- [ ] Sort persists across searches

### Data Persistence
- [ ] Submit request → refresh → data persists
- [ ] Start evaluation → refresh → status persists
- [ ] Update links → refresh → links persist
- [ ] Complete evaluation → refresh → completion persists

### Export/Import
- [ ] Export downloads JSON file with timestamp
- [ ] Exported JSON contains all requests
- [ ] Import validates file format
- [ ] Import confirms before replacing data
- [ ] Invalid JSON shows error message
- [ ] Import updates dashboard immediately

### Navigation
- [ ] Dashboard/Submit buttons work
- [ ] Active button highlighted
- [ ] View switches correctly
- [ ] Returning to dashboard refreshes data

## 🎨 UI/UX Testing

### Visual Design
- [ ] Colors match design system (primary blue, status colors)
- [ ] Spacing consistent (8px base unit)
- [ ] Typography readable (Segoe UI)
- [ ] Status badges color-coded correctly
- [ ] Count badges visible and styled

### Responsiveness
- [ ] Desktop layout works (1400px+)
- [ ] Tablet layout acceptable (768px+)
- [ ] Tables scroll horizontally if needed
- [ ] Forms stack properly on smaller screens

### Interactions
- [ ] Buttons have hover states
- [ ] Inputs have focus states
- [ ] Table rows highlight on hover
- [ ] Toast notifications appear and disappear
- [ ] Modals center correctly
- [ ] Modal backdrop dims background

### Accessibility
- [ ] All inputs have labels
- [ ] Required fields marked with asterisk
- [ ] Error messages clear and actionable
- [ ] Keyboard navigation works
- [ ] Tab order logical
- [ ] Escape closes modals

## ⌨️ Keyboard Shortcuts

- [ ] Ctrl/Cmd + K focuses search
- [ ] Ctrl/Cmd + N goes to Submit Request
- [ ] Ctrl/Cmd + D goes to Dashboard
- [ ] Escape closes open modals

## 🧪 Edge Cases

### Form Edge Cases
- [ ] Submit with max characters (2000) in notes
- [ ] Submit with all optional fields empty
- [ ] Submit with multiple agents from different categories
- [ ] Select all agents in a category

### Dashboard Edge Cases
- [ ] 0 requests total (all empty states)
- [ ] 100+ requests (performance)
- [ ] Very long agent names
- [ ] Very long URLs in run links
- [ ] Requests with 10 run links

### Data Edge Cases
- [ ] Import empty array `[]`
- [ ] Import file with single request
- [ ] Export with 0 requests
- [ ] localStorage quota exceeded (>5MB)

### Time Edge Cases
- [ ] Request submitted "just now"
- [ ] Request from 30+ days ago
- [ ] Evaluation completed in < 1 minute
- [ ] Duration spanning multiple days

## 🌐 Browser Compatibility

### Chrome/Edge
- [ ] All features work
- [ ] No console errors
- [ ] Dialog element supported

### Firefox
- [ ] All features work
- [ ] No console errors
- [ ] Dialog element supported

### Safari (if available)
- [ ] All features work
- [ ] No console errors
- [ ] Dialog element supported

## 📱 Mobile/Tablet (Optional)

- [ ] Read-only dashboard view works
- [ ] Can view request details
- [ ] Tables scroll horizontally
- [ ] Search works

## 🐛 Error Handling

- [ ] Invalid URL in run link shows error
- [ ] Import invalid JSON shows error message
- [ ] Import missing required fields shows error
- [ ] Form submission with missing fields prevented
- [ ] No JavaScript errors in console during normal use

## 🚀 Performance

- [ ] Initial page load < 2 seconds
- [ ] Form submission responds < 500ms
- [ ] Dashboard renders 100 requests < 1 second
- [ ] Search filters 100 requests instantly
- [ ] No lag when typing in form fields

## 💾 Data Integrity

- [ ] Request IDs unique and consistent
- [ ] Timestamps in ISO 8601 format
- [ ] Status transitions correct (pending → in_progress → completed)
- [ ] Run links immutable (only append, never delete)
- [ ] Export/import preserves all data exactly

## 🎯 Demo Data

- [ ] `loadDemoData()` loads 5 requests
- [ ] Demo requests span all statuses
- [ ] Demo includes DA and FCC agents
- [ ] Demo includes various purposes
- [ ] `clearDemoData()` clears with confirmation

---

## Test Results

**Date Tested:** _______________  
**Tested By:** _______________  
**Browser:** _______________  
**Pass Rate:** _____ / _____ (___%)

**Critical Issues Found:** _______________

**Notes:**
