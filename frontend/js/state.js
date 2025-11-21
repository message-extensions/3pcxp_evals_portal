// State Management - Phase 2: API Integration

const state = {
  requests: [],
  currentUser: null,
  currentSort: { field: 'submitted_at', direction: 'desc' },
  searchQuery: '',
  loading: false,

  // Initialize state - check auth and load data from API
  async init() {
    try {
      this.loading = true;
      // Get current user from backend
      this.currentUser = await api.getCurrentUser();
      console.log('Authenticated as:', this.currentUser.name);
      
      // Update UI with user info
      this.updateUserDisplay();
      
      // Load requests from API
      await this.loadRequests();
      this.loading = false;
    } catch (error) {
      console.error('Initialization failed:', error);
      this.loading = false;
      // Will redirect to login via API client
    }
  },

  // Update UI with current user info
  updateUserDisplay() {
    const userDisplays = document.querySelectorAll('.current-user-display');
    userDisplays.forEach(el => {
      el.textContent = this.currentUser.name;
    });
    
    // Update logout button if exists
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.style.display = 'inline-block';
    }
  },

  // Load all requests from API
  async loadRequests() {
    try {
      this.requests = await api.getRequests();
      console.log('Loaded', this.requests.length, 'requests from API');
    } catch (error) {
      console.error('Failed to load requests:', error);
      showToast('Failed to load requests', 'error');
      this.requests = [];
    }
  },

  // Add new request
  async addRequest(requestData) {
    try {
      const request = await api.createRequest(requestData);
      this.requests.push(request);
      showToast('Request submitted successfully');
      return request;
    } catch (error) {
      console.error('Failed to create request:', error);
      showToast(error.message || 'Failed to submit request', 'error');
      throw error;
    }
  },

  // Update request
  async updateRequest(id, updates) {
    try {
      const request = await api.updateRequest(id, updates);
      const index = this.requests.findIndex(r => r.id === id);
      if (index !== -1) {
        this.requests[index] = request;
      }
      return request;
    } catch (error) {
      console.error('Failed to update request:', error);
      showToast(error.message || 'Failed to update request', 'error');
      throw error;
    }
  },

  // Get request by ID
  getRequest(id) {
    return this.requests.find(r => r.id === id);
  },

  // Get requests by status
  getRequestsByStatus(status) {
    return this.requests.filter(r => r.status === status);
  },

  // Start evaluation (move to in-progress)
  async startEvaluation(id, runLinks) {
    try {
      const request = await api.startEvaluation(id, runLinks);
      const index = this.requests.findIndex(r => r.id === id);
      if (index !== -1) {
        this.requests[index] = request;
      }
      showToast('Evaluation started successfully');
      return request;
    } catch (error) {
      console.error('Failed to start evaluation:', error);
      showToast(error.message || 'Failed to start evaluation', 'error');
      throw error;
    }
  },

  // Add run links to in-progress evaluation
  async addRunLinks(id, newLinks) {
    try {
      const request = await api.addRunLinks(id, newLinks);
      const index = this.requests.findIndex(r => r.id === id);
      if (index !== -1) {
        this.requests[index] = request;
      }
      showToast('Run links added successfully');
      return request;
    } catch (error) {
      console.error('Failed to add run links:', error);
      showToast(error.message || 'Failed to add run links', 'error');
      throw error;
    }
  },

  // Complete evaluation
  async completeEvaluation(id) {
    try {
      const request = await api.completeEvaluation(id);
      const index = this.requests.findIndex(r => r.id === id);
      if (index !== -1) {
        this.requests[index] = request;
      }
      showToast('Evaluation completed successfully');
      return request;
    } catch (error) {
      console.error('Failed to complete evaluation:', error);
      showToast(error.message || 'Failed to complete evaluation', 'error');
      throw error;
    }
  },

  // Delete request (for admin/testing)
  async deleteRequest(id) {
    try {
      await api.deleteRequest(id);
      const index = this.requests.findIndex(r => r.id === id);
      if (index !== -1) {
        this.requests.splice(index, 1);
      }
      showToast('Request deleted successfully');
      return true;
    } catch (error) {
      console.error('Failed to delete request:', error);
      showToast(error.message || 'Failed to delete request', 'error');
      return false;
    }
  },

  // Search requests
  search(query) {
    this.searchQuery = query.toLowerCase();
  },

  // Filter requests based on search
  getFilteredRequests() {
    if (!this.searchQuery) return this.requests;

    return this.requests.filter(r => {
      const searchableText = [
        r.purpose,
        r.purpose_reason || '',
        r.agent_type,
        ...(r.agents || []),
        r.submitter,
        r.executor || '',
        r.notes || ''
      ].join(' ').toLowerCase();

      return searchableText.includes(this.searchQuery);
    });
  },

  // Sort requests
  sort(field) {
    if (this.currentSort.field === field) {
      // Toggle direction
      this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSort.field = field;
      this.currentSort.direction = 'desc';
    }
  },

  // Get sorted requests
  getSortedRequests(requests) {
    const { field, direction } = this.currentSort;
    
    return [...requests].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];

      // Handle arrays (agents)
      if (Array.isArray(aVal)) aVal = aVal.join(', ');
      if (Array.isArray(bVal)) bVal = bVal.join(', ');

      // Handle null values
      if (aVal == null) aVal = '';
      if (bVal == null) bVal = '';

      // String comparison
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return direction === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      // Numeric/date comparison
      if (direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  },

  // Logout
  async logout() {
    try {
      await api.logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect anyway
      window.location.href = '/';
    }
  }
};
