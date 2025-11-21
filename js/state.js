// State Management

const state = {
  requests: [],
  currentSort: { field: 'submittedAt', direction: 'desc' },
  searchQuery: '',

  // Initialize state from localStorage
  init() {
    this.load();
  },

  // Load from localStorage
  load() {
    try {
      const data = localStorage.getItem('evalsPortal');
      if (data) {
        this.requests = JSON.parse(data);
        console.log('Loaded', this.requests.length, 'requests from localStorage');
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      showToast('Failed to load saved data', 'error');
    }
  },

  // Save to localStorage
  save() {
    try {
      localStorage.setItem('evalsPortal', JSON.stringify(this.requests));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      showToast('Failed to save data', 'error');
    }
  },

  // Add new request
  addRequest(requestData) {
    const request = {
      id: generateId(),
      ...requestData,
      submittedAt: toISOString(new Date()),
      status: 'pending',
      executor: null,
      startedAt: null,
      completedAt: null,
      runLinks: []
    };

    this.requests.push(request);
    this.save();
    return request;
  },

  // Update request
  updateRequest(id, updates) {
    const index = this.requests.findIndex(r => r.id === id);
    if (index !== -1) {
      this.requests[index] = { ...this.requests[index], ...updates };
      this.save();
      return this.requests[index];
    }
    return null;
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
  startEvaluation(id, executor, runLinks) {
    return this.updateRequest(id, {
      status: 'in_progress',
      executor,
      startedAt: toISOString(new Date()),
      runLinks: runLinks.map(link => ({
        ...link,
        addedAt: toISOString(new Date())
      }))
    });
  },

  // Add run links to in-progress evaluation
  addRunLinks(id, newLinks) {
    const request = this.getRequest(id);
    if (request && request.status === 'in_progress') {
      const updatedLinks = [
        ...request.runLinks,
        ...newLinks.map(link => ({
          ...link,
          addedAt: toISOString(new Date())
        }))
      ];
      return this.updateRequest(id, { runLinks: updatedLinks });
    }
    return null;
  },

  // Complete evaluation
  completeEvaluation(id) {
    return this.updateRequest(id, {
      status: 'completed',
      completedAt: toISOString(new Date())
    });
  },

  // Delete request (for testing/admin)
  deleteRequest(id) {
    const index = this.requests.findIndex(r => r.id === id);
    if (index !== -1) {
      this.requests.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  },

  // Export to JSON
  exportJSON() {
    const filename = `evals-portal-export-${new Date().toISOString().split('T')[0]}.json`;
    downloadJSON(this.requests, filename);
    showToast('Data exported successfully');
  },

  // Import from JSON
  async importJSON(file) {
    try {
      const data = await readJSONFile(file);
      
      // Validate data structure
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format: expected array');
      }

      // Validate each request has required fields
      const requiredFields = ['id', 'purpose', 'agentType', 'agents', 'status'];
      for (const item of data) {
        for (const field of requiredFields) {
          if (!(field in item)) {
            throw new Error(`Missing required field: ${field}`);
          }
        }
      }

      // Ask for confirmation before replacing
      if (this.requests.length > 0) {
        const confirmed = confirm(
          `This will replace ${this.requests.length} existing requests with ${data.length} imported requests. Continue?`
        );
        if (!confirmed) return;
      }

      this.requests = data;
      this.save();
      showToast(`Successfully imported ${data.length} requests`);
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      showToast(error.message || 'Failed to import data', 'error');
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
        r.purposeReason || '',
        r.agentType,
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

  // Clear all data (for testing)
  clearAll() {
    if (confirm('Are you sure you want to delete all requests? This cannot be undone.')) {
      this.requests = [];
      this.save();
      showToast('All data cleared');
      return true;
    }
    return false;
  }
};
