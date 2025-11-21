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
    const priorityCell = `
      <td>
        ${request.highPriority ? 
          '<span class="priority-badge high">🔥 HIGH</span>' : 
          '<span class="priority-badge normal">—</span>'}
      </td>
    `;

    const commonCells = `
      ${priorityCell}
      <td>
        <span class="type-badge">${escapeHtml(request.agentType)}</span>
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
      <td>${escapeHtml(request.submitter)}</td>
    `;

    if (status === 'pending') {
      return `
        <tr ${request.highPriority ? 'class="high-priority-row"' : ''}>
          ${commonCells}
          <td>
            <div class="time-display">
              <div class="time-relative">${getRelativeTime(request.submittedAt)}</div>
              <div class="time-absolute">${formatAbsoluteDate(request.submittedAt)}</div>
            </div>
          </td>
          <td>
            <div class="table-actions">
              <button class="btn-primary btn-action" data-action="start" data-id="${request.id}">
                Start
              </button>
            </div>
          </td>
        </tr>
      `;
    } else if (status === 'in_progress') {
      return `
        <tr ${request.highPriority ? 'class="high-priority-row"' : ''}>
          ${commonCells}
          <td>${escapeHtml(request.executor || '')}</td>
          <td>
            <div class="run-links">
              ${request.runLinks.slice(0, 2).map(link => `
                <div class="run-link">
                  <span class="run-link-icon">🔗</span>
                  <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">
                    ${truncate(link.url, 40)}
                  </a>
                </div>
              `).join('')}
              ${request.runLinks.length > 2 ? 
                `<div class="text-secondary">+${request.runLinks.length - 2} more</div>` : ''}
            </div>
          </td>
          <td>
            <div class="time-display">
              <div class="time-relative">${getRelativeTime(request.startedAt)}</div>
              <div class="time-absolute">${formatAbsoluteDate(request.startedAt)}</div>
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
            </div>
          </td>
        </tr>
      `;
    } else { // completed
      const duration = calculateDuration(request.startedAt, request.completedAt);
      return `
        <tr ${request.highPriority ? 'class="high-priority-row"' : ''}>
          ${commonCells}
          <td>${escapeHtml(request.executor || '')}</td>
          <td>
            <div class="run-links">
              ${request.runLinks.slice(0, 2).map(link => `
                <div class="run-link">
                  <span class="run-link-icon">🔗</span>
                  <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">
                    ${truncate(link.url, 40)}
                  </a>
                </div>
              `).join('')}
              ${request.runLinks.length > 2 ? 
                `<div class="text-secondary">+${request.runLinks.length - 2} more</div>` : ''}
            </div>
          </td>
          <td>
            <div class="time-display">
              <div class="time-relative">${getRelativeTime(request.completedAt)}</div>
              <div class="time-absolute">${formatAbsoluteDate(request.completedAt)}</div>
            </div>
          </td>
          <td>
            <span class="duration-badge">${duration}</span>
          </td>
          <td>
            <div class="table-actions">
              <button class="btn-secondary btn-action" data-action="view" data-id="${request.id}">
                View Details
              </button>
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
        }
      });
    });
  },

  handleComplete(id) {
    if (confirm('Are you sure you want to mark this evaluation as complete?')) {
      state.completeEvaluation(id);
      showToast('Evaluation marked as complete');
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
