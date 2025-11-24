/**
 * API client for backend communication
 */
class APIClient {
  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
  }

  /**
   * Make HTTP request to backend API
   */
  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      credentials: 'include',  // Send cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (response.status === 401) {
      // Not authenticated - redirect to login
      console.log('Not authenticated, redirecting to login');
      window.location.href = '/api/auth/login';
      return null;
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || 'Request failed');
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  // ===== Authentication Endpoints =====
  
  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // ===== Request Endpoints =====
  
  async getRequests(status = null) {
    const params = status ? `?status_filter=${status}` : '';
    return this.request(`/requests${params}`);
  }

  async createRequest(data) {
    return this.request('/requests', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getRequest(id) {
    return this.request(`/requests/${id}`);
  }

  async updateRequest(id, data) {
    return this.request(`/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteRequest(id) {
    return this.request(`/requests/${id}`, {
      method: 'DELETE'
    });
  }

  async startEvaluation(id, runLinks) {
    return this.request(`/requests/${id}/start`, {
      method: 'POST',
      body: JSON.stringify({ run_links: runLinks })
    });
  }

  async addRunLinks(id, runLinks, updateNotes = null) {
    const payload = { run_links: runLinks };
    if (updateNotes) {
      payload.update_notes = updateNotes;
    }
    return this.request(`/requests/${id}/links`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async completeEvaluation(id) {
    return this.request(`/requests/${id}/complete`, {
      method: 'POST'
    });
  }

  async searchRequests(query) {
    return this.request(`/requests/search/${encodeURIComponent(query)}`);
  }

  // ===== Admin-Only Endpoints =====
  
  async updatePriority(id, priority) {
    return this.request(`/requests/${id}/priority?priority=${priority}`, {
      method: 'PUT'
    });
  }

  async exportRequests() {
    // Use native fetch for file download
    const response = await fetch(`${this.baseURL}/requests/export/json`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'evals_requests_export.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async importRequests(requestsData) {
    return this.request('/requests/import/json', {
      method: 'POST',
      body: JSON.stringify(requestsData)
    });
  }

  // ===== Config Endpoints =====
  
  async getConfig() {
    return this.request('/config');
  }

  async getPurposes() {
    return this.request('/config/purposes');
  }

  async getAgentTypes() {
    return this.request('/config/agent-types');
  }

  async getAgents() {
    return this.request('/config/agents');
  }

  async getQuerySets() {
    return this.request('/config/query-sets');
  }

  async getConfigs() {
    return this.request('/config/configs');
  }

  async getPriorityLevels() {
    return this.request('/config/priority-levels');
  }
}

// Global API client instance
const api = new APIClient();
