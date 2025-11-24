// Dashboard Renderer

const dashboard = {
  init() {
    // Setup search
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
      state.search(e.target.value);
      this.render();
    });

    // Setup table sorting
    document.querySelectorAll('th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const field = th.dataset.sort;
        state.sort(field);
        this.updateSortIndicators();
        this.render();
      });
    });
  },

  render() {
    const filtered = state.getFilteredRequests();
    
    this.renderSection('pending', filtered);
    this.renderSection('in_progress', filtered);
    this.renderSection('completed', filtered);
  },

  renderSection(status, allRequests) {
    const requests = allRequests.filter(r => r.status === status);
    const sorted = state.getSortedRequests(requests);
    
    const tableBodyId = status === 'in_progress' ? 'inProgressTableBody' : 
                        status === 'completed' ? 'completedTableBody' : 'pendingTableBody';
    const emptyStateId = status === 'in_progress' ? 'inProgressEmpty' : 
                         status === 'completed' ? 'completedEmpty' : 'pendingEmpty';
    const countBadgeId = status === 'in_progress' ? 'inProgressCount' : 
                         status === 'completed' ? 'completedCount' : 'pendingCount';

    const tbody = document.getElementById(tableBodyId);
    const emptyState = document.getElementById(emptyStateId);
    const countBadge = document.getElementById(countBadgeId);

    // Update count
    countBadge.textContent = requests.length;

    // Show/hide empty state
    if (sorted.length === 0) {
      tbody.innerHTML = '';
      emptyState.classList.add('visible');
      return;
    } else {
      emptyState.classList.remove('visible');
    }

    // Render rows
    tbody.innerHTML = sorted.map(req => this.createRow(req, status)).join('');

    // Attach event listeners to action buttons
    this.attachActionListeners(status);
  },

  createRow(request, status) {
    const priorityClass = getPriorityBadgeClass(request.priority);
    const priorityCell = `
      <td>
        <span class="priority-badge ${priorityClass}">${escapeHtml(request.priority)}</span>
      </td>
    `;

    const commonCells = `
      ${priorityCell}
      <td>
        <span class="type-badge">${escapeHtml(request.agent_type)}</span>
      </td>
      <td class="truncate" title="${escapeHtml(request.agents.join(', '))}">
        <div class="agents-list">
          ${request.agents.slice(0, 2).map(a => 
            `<span class="agent-pill">${escapeHtml(a)}</span>`
          ).join('')}
          ${request.agents.length > 2 ? 
            `<span class="agent-pill">+${request.agents.length - 2} more</span>` : ''}
        </div>
      </td>
      <td>
        <span class="purpose-badge ${getPurposeBadgeClass(request.purpose)}">
          ${escapeHtml(request.purpose)}
        </span>
      </td>
      <td>
        ${escapeHtml(request.submitter)}
        ${request.on_behalf_of ? `<span class="obo-indicator" title="Submitted on behalf of ${escapeHtml(request.on_behalf_of)}">(OBO: ${escapeHtml(request.on_behalf_of)})</span>` : ''}
      </td>
    `;

    const isAdmin = state.currentUser && state.currentUser.is_admin;

    if (status === 'pending') {
      return `
        <tr ${request.priority === 'High' ? 'class="high-priority-row"' : ''}>
          ${commonCells}
          <td>
            <div class="time-display">
              <div class="time-relative">${getRelativeTime(request.submitted_at)}</div>
              <div class="time-absolute">${formatAbsoluteDate(request.submitted_at)}</div>
            </div>
          </td>
          <td>
            <div class="table-actions">
              <button class="btn-primary btn-action" data-action="start" data-id="${request.id}">
                Start
              </button>
              <button class="btn-secondary btn-action" data-action="view" data-id="${request.id}">
                View Details
              </button>
              ${isAdmin ? `
                <button class="btn-warning btn-action" data-action="priority" data-id="${request.id}" title="Change priority">
                  Change Priority
                </button>
                <button class="btn-danger btn-action" data-action="delete" data-id="${request.id}" title="Delete request">
                  Delete
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    } else if (status === 'in_progress') {
      return `
        <tr ${request.priority === 'High' ? 'class="high-priority-row"' : ''}>
          ${commonCells}
          <td>${escapeHtml(request.executor || '')}</td>
          <td>
            <div class="run-links">
              ${request.run_links.slice(0, 2).map(link => `
                <div class="run-link">
                  <span class="run-link-icon">🔗</span>
                  <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">
                    ${truncate(link.url, 40)}
                  </a>
                </div>
              `).join('')}
              ${request.run_links.length > 2 ? 
                `<div class="text-secondary">+${request.run_links.length - 2} more</div>` : ''}
            </div>
          </td>
          <td>
            <div class="time-display">
              <div class="time-relative">${getRelativeTime(request.started_at)}</div>
              <div class="time-absolute">${formatAbsoluteDate(request.started_at)}</div>
            </div>
          </td>
          <td>
            <div class="table-actions">
              <button class="btn-secondary btn-action" data-action="update" data-id="${request.id}">
                Update
              </button>
              <button class="btn-primary btn-action" data-action="complete" data-id="${request.id}">
                Mark Complete
              </button>
              <button class="btn-secondary btn-action" data-action="view" data-id="${request.id}">
                View Details
              </button>
              ${isAdmin ? `
                <button class="btn-warning btn-action" data-action="priority" data-id="${request.id}" title="Change priority">
                  Change Priority
                </button>
                <button class="btn-danger btn-action" data-action="delete" data-id="${request.id}" title="Delete request">
                  Delete
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    } else { // completed
      const duration = calculateDuration(request.started_at, request.completed_at);
      return `
        <tr ${request.priority === 'High' ? 'class="high-priority-row"' : ''}>
          ${commonCells}
          <td>${escapeHtml(request.executor || '')}</td>
          <td>
            <div class="run-links">
              ${request.run_links.slice(0, 2).map(link => `
                <div class="run-link">
                  <span class="run-link-icon">🔗</span>
                  <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">
                    ${truncate(link.url, 40)}
                  </a>
                </div>
              `).join('')}
              ${request.run_links.length > 2 ? 
                `<div class="text-secondary">+${request.run_links.length - 2} more</div>` : ''}
            </div>
          </td>
          <td>
            <div class="time-display">
              <div class="time-relative">${getRelativeTime(request.completed_at)}</div>
              <div class="time-absolute">${formatAbsoluteDate(request.completed_at)}</div>
            </div>
          </td>
          <td>
            <span class="duration-badge">${duration}</span>
          </td>
          <td>
            <div class="table-actions">
              <button class="btn-secondary btn-action" data-action="update" data-id="${request.id}">
                Update
              </button>
              <button class="btn-secondary btn-action" data-action="view" data-id="${request.id}">
                View Details
              </button>
              ${isAdmin ? `
                <button class="btn-danger btn-action" data-action="delete" data-id="${request.id}" title="Delete request">
                  Delete
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }
  },

  attachActionListeners(status) {
    const tableBodyId = status === 'in_progress' ? 'inProgressTableBody' : 
                        status === 'completed' ? 'completedTableBody' : 'pendingTableBody';
    const tbody = document.getElementById(tableBodyId);

    tbody.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const id = btn.dataset.id;

        if (action === 'start') {
          modalHandler.openExecutionModal(id);
        } else if (action === 'update') {
          modalHandler.openUpdateModal(id);
        } else if (action === 'complete') {
          this.handleComplete(id);
        } else if (action === 'view') {
          modalHandler.openViewDetailsModal(id);
        } else if (action === 'priority') {
          this.handleChangePriority(id);
        } else if (action === 'delete') {
          this.handleDelete(id);
        }
      });
    });
  },

  async handleComplete(id) {
    if (confirm('Are you sure you want to mark this evaluation as complete?')) {
      try {
        await state.completeEvaluation(id);
        this.render();
      } catch (error) {
        // Error already shown by state.completeEvaluation
        console.error('Complete failed:', error);
      }
    }
  },

  async handleChangePriority(id) {
    // Open the priority modal
    modalHandler.openChangePriorityModal(id);
  },

  async handleDelete(id) {
    if (!confirm(`Are you sure you want to delete request ${id}?\n\nThis action cannot be undone.`)) {
      return;
    }
    
    const success = await state.deleteRequest(id);
    if (success) {
      this.render();
    }
  },

  updateSortIndicators() {
    // Remove all sort classes
    document.querySelectorAll('th[data-sort]').forEach(th => {
      th.classList.remove('sort-asc', 'sort-desc');
    });

    // Add sort class to active column
    const { field, direction } = state.currentSort;
    document.querySelectorAll(`th[data-sort="${field}"]`).forEach(th => {
      th.classList.add(`sort-${direction}`);
    });
  }
};
