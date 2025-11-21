// Modal Handler

const modalHandler = {
  currentRequestId: null,
  maxRunLinks: 10,

  init() {
    this.initExecutionModal();
    this.initUpdateModal();
    this.initViewDetailsModal();
  },

  // ===== EXECUTION MODAL =====

  initExecutionModal() {
    const modal = document.getElementById('executionModal');
    const form = document.getElementById('executionForm');
    const closeBtn = document.getElementById('closeExecutionModal');
    const cancelBtn = document.getElementById('cancelExecutionBtn');
    const addLinkBtn = document.getElementById('addRunLinkBtn');

    // Close handlers
    closeBtn.addEventListener('click', () => modal.close());
    cancelBtn.addEventListener('click', () => modal.close());

    // Add link button
    addLinkBtn.addEventListener('click', () => {
      this.addRunLinkInput('runLinksContainer');
    });

    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleExecutionSubmit();
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.close();
      }
    });
  },

  openExecutionModal(requestId) {
    this.currentRequestId = requestId;
    const request = state.getRequest(requestId);
    if (!request) return;

    const modal = document.getElementById('executionModal');
    const preview = document.getElementById('requestPreview');

    // Render request preview
    preview.innerHTML = `
      <h4>Request Details</h4>
      <div class="preview-row">
        <div class="preview-label">Purpose:</div>
        <div class="preview-value">${escapeHtml(request.purpose)}</div>
      </div>
      <div class="preview-row">
        <div class="preview-label">Agent Type:</div>
        <div class="preview-value">${escapeHtml(request.agent_type)}</div>
      </div>
      <div class="preview-row">
        <div class="preview-label">Agents:</div>
        <div class="preview-value">${escapeHtml(request.agents.join(', '))}</div>
      </div>
      <div class="preview-row">
        <div class="preview-label">Query Set:</div>
        <div class="preview-value">${escapeHtml(request.query_set)}</div>
      </div>
      <div class="preview-row">
        <div class="preview-label">Control:</div>
        <div class="preview-value">${escapeHtml(request.control_config)}</div>
      </div>
      <div class="preview-row">
        <div class="preview-label">Treatment:</div>
        <div class="preview-value">${escapeHtml(request.treatment_config)}</div>
      </div>
      <div class="preview-row">
        <div class="preview-label">Submitter:</div>
        <div class="preview-value">${escapeHtml(request.submitter)}</div>
      </div>
      ${request.notes ? `
        <div class="preview-row">
          <div class="preview-label">Notes:</div>
          <div class="preview-value">${escapeHtml(request.notes)}</div>
        </div>
      ` : ''}
    `;

    // Reset form
    document.getElementById('executionForm').reset();
    document.getElementById('runLinksContainer').innerHTML = `
      <div class="form-group run-link-group">
        <label>Run Link 1 <span class="required">*</span></label>
        <input type="url" class="run-link-url" required placeholder="https://...">
        <textarea class="run-link-notes" rows="2" placeholder="Notes (optional)"></textarea>
      </div>
    `;

    modal.showModal();
  },

  async handleExecutionSubmit() {
    const runLinks = this.collectRunLinks('runLinksContainer');

    if (runLinks.length === 0) {
      showToast('Please add at least one run link', 'error');
      return;
    }

    // Validate all URLs
    for (const link of runLinks) {
      if (!isValidUrl(link.url)) {
        showToast('Please enter valid URLs', 'error');
        return;
      }
    }

    try {
      // Update state (calls API - executor auto-populated by backend)
      await state.startEvaluation(this.currentRequestId, runLinks);
      
      document.getElementById('executionModal').close();
      dashboard.render();
    } catch (error) {
      // Error already shown by state.startEvaluation
      console.error('Execution start failed:', error);
    }
  },

  // ===== UPDATE MODAL =====

  initUpdateModal() {
    const modal = document.getElementById('updateModal');
    const form = document.getElementById('updateForm');
    const closeBtn = document.getElementById('closeUpdateModal');
    const cancelBtn = document.getElementById('cancelUpdateBtn');
    const addLinkBtn = document.getElementById('addUpdateLinkBtn');

    // Close handlers
    closeBtn.addEventListener('click', () => modal.close());
    cancelBtn.addEventListener('click', () => modal.close());

    // Add link button
    addLinkBtn.addEventListener('click', () => {
      this.addRunLinkInput('updateLinksContainer');
    });

    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleUpdateSubmit();
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.close();
      }
    });
  },

  openUpdateModal(requestId) {
    this.currentRequestId = requestId;
    const request = state.getRequest(requestId);
    if (!request) return;

    const modal = document.getElementById('updateModal');
    const preview = document.getElementById('existingLinksPreview');

    // Show existing links (use snake_case from API)
    if (request.run_links && request.run_links.length > 0) {
      preview.innerHTML = `
        <h4>Existing Run Links</h4>
        ${request.run_links.map(link => `
          <div class="existing-link-item">
            <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" class="existing-link-url">
              ${escapeHtml(link.url)}
            </a>
            ${link.notes ? `<div class="existing-link-notes">${escapeHtml(link.notes)}</div>` : ''}
            <div class="existing-link-time">Added ${getRelativeTime(link.added_at)}</div>
          </div>
        `).join('')}
      `;
    } else {
      preview.innerHTML = '<div class="text-secondary">No existing links</div>';
    }

    // Reset new links form
    document.getElementById('updateForm').reset();
    document.getElementById('updateLinksContainer').innerHTML = `
      <div class="form-group run-link-group">
        <label>Run Link</label>
        <input type="url" class="run-link-url" placeholder="https://...">
        <textarea class="run-link-notes" rows="2" placeholder="Notes (optional)"></textarea>
      </div>
    `;

    modal.showModal();
  },

  async handleUpdateSubmit() {
    const newLinks = this.collectRunLinks('updateLinksContainer', false); // not required

    if (newLinks.length === 0) {
      showToast('No new links to add', 'error');
      return;
    }

    // Validate URLs
    for (const link of newLinks) {
      if (link.url && !isValidUrl(link.url)) {
        showToast('Please enter valid URLs', 'error');
        return;
      }
    }

    try {
      // Update state (calls API)
      await state.addRunLinks(this.currentRequestId, newLinks);
      
      document.getElementById('updateModal').close();
      dashboard.render();
    } catch (error) {
      // Error already shown by state.addRunLinks
      console.error('Update failed:', error);
    }
  },

  // ===== SHARED HELPERS =====

  addRunLinkInput(containerId) {
    const container = document.getElementById(containerId);
    const currentCount = container.querySelectorAll('.run-link-group').length;

    if (currentCount >= this.maxRunLinks) {
      showToast(`Maximum ${this.maxRunLinks} links allowed`, 'error');
      return;
    }

    const isRequired = containerId === 'runLinksContainer'; // Only required for execution modal
    const linkNum = currentCount + 1;

    const linkGroup = document.createElement('div');
    linkGroup.className = 'form-group run-link-group';
    linkGroup.innerHTML = `
      <label>Run Link ${linkNum}${isRequired ? ' <span class="required">*</span>' : ''}</label>
      <input type="url" class="run-link-url" ${isRequired ? 'required' : ''} placeholder="https://...">
      <textarea class="run-link-notes" rows="2" placeholder="Notes (optional)"></textarea>
      <button type="button" class="remove-link-btn" title="Remove">&times;</button>
    `;

    container.appendChild(linkGroup);

    // Add remove handler
    linkGroup.querySelector('.remove-link-btn').addEventListener('click', () => {
      linkGroup.remove();
      this.updateLinkLabels(containerId);
    });
  },

  updateLinkLabels(containerId) {
    const container = document.getElementById(containerId);
    const linkGroups = container.querySelectorAll('.run-link-group');
    const isRequired = containerId === 'runLinksContainer';

    linkGroups.forEach((group, index) => {
      const label = group.querySelector('label');
      const linkNum = index + 1;
      label.innerHTML = `Run Link ${linkNum}${isRequired && linkNum === 1 ? ' <span class="required">*</span>' : ''}`;
    });
  },

  collectRunLinks(containerId, filterEmpty = true) {
    const container = document.getElementById(containerId);
    const linkGroups = container.querySelectorAll('.run-link-group');
    const links = [];

    linkGroups.forEach(group => {
      const url = group.querySelector('.run-link-url').value.trim();
      const notes = group.querySelector('.run-link-notes').value.trim();

      if (filterEmpty && !url) return; // Skip empty URLs
      if (!filterEmpty && url) { // For update modal, only include if URL is provided
        links.push({ url, notes: notes || null });
      } else if (filterEmpty && url) {
        links.push({ url, notes: notes || null });
      }
    });

    return links;
  },

  // ===== VIEW DETAILS MODAL =====

  initViewDetailsModal() {
    const modal = document.getElementById('viewDetailsModal');
    const closeBtn = document.getElementById('closeViewDetailsModal');
    const closeActionBtn = document.getElementById('closeViewDetailsBtn');

    // Close handlers
    closeBtn.addEventListener('click', () => modal.close());
    closeActionBtn.addEventListener('click', () => modal.close());

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.close();
      }
    });
  },

  openViewDetailsModal(requestId) {
    const request = state.getRequest(requestId);
    if (!request) return;

    const modal = document.getElementById('viewDetailsModal');
    const content = document.getElementById('viewDetailsContent');

    // Render full request details
    content.innerHTML = `
      <div class="details-section">
        <h4>Request Information</h4>
        ${request.high_priority ? '<div class="priority-badge high" style="margin-bottom: 12px;">🔥 HIGH PRIORITY</div>' : ''}
        
        <div class="preview-row">
          <div class="preview-label">Request ID:</div>
          <div class="preview-value"><code>${escapeHtml(request.id)}</code></div>
        </div>
        
        <div class="preview-row">
          <div class="preview-label">Purpose:</div>
          <div class="preview-value">
            <span class="purpose-badge ${getPurposeBadgeClass(request.purpose)}">
              ${escapeHtml(request.purpose)}
            </span>
          </div>
        </div>

        ${request.purpose_reason ? `
          <div class="preview-row">
            <div class="preview-label">Purpose Reason:</div>
            <div class="preview-value">${escapeHtml(request.purpose_reason)}</div>
          </div>
        ` : ''}

        <div class="preview-row">
          <div class="preview-label">Agent Type:</div>
          <div class="preview-value">
            <span class="type-badge">${escapeHtml(request.agent_type)}</span>
          </div>
        </div>

        <div class="preview-row">
          <div class="preview-label">Agents:</div>
          <div class="preview-value">
            <div class="agents-list">
              ${request.agents.map(a => `<span class="agent-pill">${escapeHtml(a)}</span>`).join('')}
            </div>
          </div>
        </div>

        <div class="preview-row">
          <div class="preview-label">Query Set:</div>
          <div class="preview-value">${escapeHtml(request.query_set)}</div>
        </div>

        ${request.query_set_details ? `
          <div class="preview-row">
            <div class="preview-label">Query Set Details:</div>
            <div class="preview-value">${escapeHtml(request.query_set_details)}</div>
          </div>
        ` : ''}

        <div class="preview-row">
          <div class="preview-label">Control Config:</div>
          <div class="preview-value">${escapeHtml(request.control_config)}</div>
        </div>

        <div class="preview-row">
          <div class="preview-label">Treatment Config:</div>
          <div class="preview-value">${escapeHtml(request.treatment_config)}</div>
        </div>

        ${request.notes ? `
          <div class="preview-row">
            <div class="preview-label">Notes:</div>
            <div class="preview-value">${escapeHtml(request.notes)}</div>
          </div>
        ` : ''}
      </div>

      <div class="details-section">
        <h4>Submission Details</h4>
        
        <div class="preview-row">
          <div class="preview-label">Submitter:</div>
          <div class="preview-value">${escapeHtml(request.submitter)}</div>
        </div>

        <div class="preview-row">
          <div class="preview-label">Submitted At:</div>
          <div class="preview-value">
            ${formatAbsoluteDate(request.submitted_at)}
            <span class="text-secondary">(${getRelativeTime(request.submitted_at)})</span>
          </div>
        </div>
      </div>

      ${request.status !== 'pending' ? `
        <div class="details-section">
          <h4>Execution Details</h4>
          
          <div class="preview-row">
            <div class="preview-label">Executor:</div>
            <div class="preview-value">${escapeHtml(request.executor || 'N/A')}</div>
          </div>

          <div class="preview-row">
            <div class="preview-label">Started At:</div>
            <div class="preview-value">
              ${formatAbsoluteDate(request.started_at)}
              <span class="text-secondary">(${getRelativeTime(request.started_at)})</span>
            </div>
          </div>

          ${request.status === 'completed' ? `
            <div class="preview-row">
              <div class="preview-label">Completed At:</div>
              <div class="preview-value">
                ${formatAbsoluteDate(request.completed_at)}
                <span class="text-secondary">(${getRelativeTime(request.completed_at)})</span>
              </div>
            </div>

            <div class="preview-row">
              <div class="preview-label">Duration:</div>
              <div class="preview-value">
                <span class="duration-badge">${calculateDuration(request.started_at, request.completed_at)}</span>
              </div>
            </div>
          ` : ''}

          <div class="preview-row" style="margin-top: 16px;">
            <div class="preview-label" style="align-self: flex-start;">Run Links:</div>
            <div class="preview-value">
              ${request.run_links && request.run_links.length > 0 ? request.run_links.map(link => `
                <div class="existing-link-item" style="margin-bottom: 12px;">
                  <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" class="existing-link-url">
                    ${escapeHtml(link.url)}
                  </a>
                  ${link.notes ? `<div class="existing-link-notes">${escapeHtml(link.notes)}</div>` : ''}
                  <div class="existing-link-time">Added ${getRelativeTime(link.added_at)}</div>
                </div>
              `).join('') : '<span class="text-secondary">No run links</span>'}
            </div>
          </div>
        </div>
      ` : ''}
    `;

    modal.showModal();
  }
};

