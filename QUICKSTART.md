# Quick Start Guide - 3PCxP Evals Portal

## 🚀 Launch in 30 Seconds

1. **Open the portal:**
   - Navigate to the project folder
   - Open `index.html` in your browser

2. **Load demo data (optional):**
   - Press `F12` to open browser console
   - Type: `loadDemoData()`
   - Press Enter

3. **Start using:**
   - Browse the Dashboard (Pending, In Progress, Completed)
   - Click "Submit Request" to create new evaluations
   - Try search, sorting, and filtering

## 📋 Common Tasks

### Submit Your First Request

1. Click **"Submit Request"** in navigation
2. Fill in the form:
   - Purpose: `Flight review`
   - Agent Type: `Declarative Agents (DA)`
   - Select agents: Check `GitHub Mock` and `GitHub`
   - Query Set: `Default`
   - Control: `Current Prod`
   - Treatment: `Current Prod`
   - Submitter: `Your Name`
3. Click **"Submit Request"**
4. You'll be redirected to Dashboard

### Start an Evaluation

1. Go to **Dashboard**
2. Find your request in **Pending Requests**
3. Click **"Pick/Start"**
4. Enter your name as executor
5. Add run link: `https://example.com/run/123`
6. Click **"Start Evaluation"**

### Add More Run Links

1. Find evaluation in **In Progress** section
2. Click **"Update"**
3. Add new run link with notes
4. Click **"Save Updates"**

### Complete an Evaluation

1. Find evaluation in **In Progress**
2. Click **"Mark Complete"**
3. Confirm
4. View in **Completed** section with duration

## 🔍 Tips & Tricks

- **Search**: Type in the search box to filter across all fields
- **Sort**: Click column headers to sort (click again to reverse)
- **Export**: Backup your data regularly with "Export Data"
- **Import**: Restore from a backup with "Import Data"
- **Keyboard shortcuts**: 
  - `Ctrl+K` - Focus search
  - `Ctrl+N` - New request
  - `Ctrl+D` - Dashboard
  - `Esc` - Close modals

## 🧪 Testing Scenarios

### Test Conditional Fields

**Ad-hoc Purpose:**
1. Submit Request → Purpose: `Ad-hoc`
2. Notice "Purpose Reason" field appears (required)

**Custom Query Set:**
1. Query Set: `Others`
2. "Query Set Details" field appears (required)

**Custom Configs:**
1. Control/Treatment: `Others`
2. Text area appears for custom configuration

### Test Multi-Agent Selection

**DA Agents (Hierarchical):**
1. Agent Type: `Declarative Agents (DA)`
2. Select from different categories:
   - Message Extensions: `Mock MEs`
   - OpenAPI: `GitHub`, `KYC`
   - Instructions++: `Hugo`
3. View selected as chips (removable)

**FCC Agents (Simple):**
1. Agent Type: `Federated Copilot Connectors (FCC)`
2. Select from flat list

### Test Run Links (1-10)

1. Start evaluation → add first link
2. Click "+ Add Another Link" (up to 10 total)
3. Try removing links with × button
4. Submit with multiple links

## 🔧 Troubleshooting

**Can't see demo data?**
- Open console (F12)
- Run: `loadDemoData()`

**Form won't submit?**
- Check all required fields (marked with *)
- Ensure at least one agent is selected
- Check browser console for errors

**Data disappeared?**
- Check if localStorage is enabled
- Restore from exported JSON backup

**Modal won't open?**
- Refresh the page
- Check browser console for errors

## 📊 Demo Data Overview

When you run `loadDemoData()`, you get:

- **2 Pending** requests (RAI check, Ad-hoc)
- **2 In Progress** evaluations (Flight review, Flight review)
- **1 Completed** evaluation (GPT-5 migration)

Mix of DA and FCC agents, various purposes, and different configurations.

## 🎯 Next Steps

1. **Explore**: Browse all sections, test search/sort
2. **Submit**: Create your own evaluation request
3. **Execute**: Start and complete an evaluation
4. **Export**: Backup your data as JSON
5. **Share**: Show the portal to your team

## 💾 Data Management

**Important**: Data is stored in browser localStorage
- Persists across sessions
- Local to this browser/computer
- Export regularly as backup
- Import to restore or share

**Clear all data:**
- Console: `clearDemoData()`
- Or manually: `state.clearAll()`

## 📞 Need Help?

- Check the main README.md for full documentation
- Review PRD.md for detailed requirements
- Contact: Tezan Sahu (Product Owner)

---

**Happy Evaluating! 🎉**
