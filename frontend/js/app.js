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
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Initializing 3PCxP Evals Portal (Phase 2)...');

  // Show loading indicator
  showLoadingIndicator();

  try {
    // Initialize state (checks authentication)
    await state.init();

    // Initialize modules
    formHandler.init();
    dashboard.init();
    modalHandler.init();
  } catch (error) {
    console.error('Application initialization failed:', error);
    hideLoadingIndicator();
    return; // Will redirect to login
  }

  hideLoadingIndicator();

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

  // Setup logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to logout?')) {
        await state.logout();
      }
    });
  }

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

// Loading indicator helpers
function showLoadingIndicator() {
  let loader = document.getElementById('appLoader');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'appLoader';
    loader.className = 'app-loader';
    loader.innerHTML = '<div class="spinner"></div><p>Loading...</p>';
    document.body.appendChild(loader);
  }
  loader.style.display = 'flex';
}

function hideLoadingIndicator() {
  const loader = document.getElementById('appLoader');
  if (loader) {
    loader.style.display = 'none';
  }
}
