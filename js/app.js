// Application Initialization and Global Functions

// View switching
function switchView(viewName) {
  // Update nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.view === viewName) {
      btn.classList.add('active');
    }
  });

  // Update views
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });

  const targetView = viewName === 'dashboard' ? 'dashboardView' : 'submitView';
  document.getElementById(targetView).classList.add('active');
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing 3PCxP Evals Portal...');

  // Initialize state
  state.init();

  // Initialize modules
  formHandler.init();
  dashboard.init();
  modalHandler.init();

  // Setup navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      switchView(view);
      
      // Refresh dashboard when switching to it
      if (view === 'dashboard') {
        dashboard.render();
      }
    });
  });

  // Setup export/import
  document.getElementById('exportBtn').addEventListener('click', () => {
    state.exportJSON();
  });

  document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });

  document.getElementById('importFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      const success = await state.importJSON(file);
      if (success) {
        dashboard.render();
      }
      // Reset file input
      e.target.value = '';
    }
  });

  // Initial render
  dashboard.render();
  dashboard.updateSortIndicators();

  console.log('Application initialized successfully');
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + K: Focus search
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    document.getElementById('searchInput').focus();
  }

  // Ctrl/Cmd + N: New request
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault();
    switchView('submit');
  }

  // Ctrl/Cmd + D: Dashboard
  if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
    e.preventDefault();
    switchView('dashboard');
    dashboard.render();
  }

  // Escape: Close modals
  if (e.key === 'Escape') {
    const executionModal = document.getElementById('executionModal');
    const updateModal = document.getElementById('updateModal');
    if (executionModal.open) executionModal.close();
    if (updateModal.open) updateModal.close();
  }
});

// Warn before leaving if there's unsaved data in form
window.addEventListener('beforeunload', (e) => {
  const form = document.getElementById('requestForm');
  const submitView = document.getElementById('submitView');
  
  // Only warn if submit view is active and form has data
  if (submitView.classList.contains('active')) {
    const formData = new FormData(form);
    let hasData = false;
    
    for (let [key, value] of formData.entries()) {
      if (value && value.trim()) {
        hasData = true;
        break;
      }
    }
    
    if (hasData || formHandler.selectedAgents.size > 0) {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      return e.returnValue;
    }
  }
});

// Service Worker for offline support (optional enhancement)
if ('serviceWorker' in navigator) {
  // Uncomment to enable offline support in Phase 2
  // navigator.serviceWorker.register('/sw.js').then(reg => {
  //   console.log('Service Worker registered:', reg);
  // }).catch(err => {
  //   console.log('Service Worker registration failed:', err);
  // });
}
