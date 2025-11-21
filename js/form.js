// Form Handler

const formHandler = {
  selectedAgents: new Set(),

  init() {
    const form = document.getElementById('requestForm');
    
    // Setup conditional fields
    this.setupConditionalFields();
    
    // Setup agent selection
    this.setupAgentSelection();
    
    // Setup character counter
    this.setupCharCounter();
    
    // Form submission
    form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Reset button
    document.getElementById('resetFormBtn').addEventListener('click', () => {
      if (confirm('Are you sure you want to clear the form?')) {
        this.resetForm();
      }
    });
  },

  setupConditionalFields() {
    // Purpose -> Purpose Reason
    const purposeSelect = document.getElementById('purpose');
    const purposeReasonGroup = document.getElementById('purposeReasonGroup');
    const purposeReasonField = document.getElementById('purposeReason');

    purposeSelect.addEventListener('change', () => {
      if (purposeSelect.value === 'Ad-hoc') {
        purposeReasonGroup.classList.remove('hidden');
        purposeReasonField.required = true;
      } else {
        purposeReasonGroup.classList.add('hidden');
        purposeReasonField.required = false;
        purposeReasonField.value = '';
      }
    });

    // Query Set -> Query Set Details
    const querySetSelect = document.getElementById('querySet');
    const querySetDetailsGroup = document.getElementById('querySetDetailsGroup');
    const querySetDetailsField = document.getElementById('querySetDetails');

    querySetSelect.addEventListener('change', () => {
      if (querySetSelect.value === 'Others') {
        querySetDetailsGroup.classList.remove('hidden');
        querySetDetailsField.required = true;
      } else {
        querySetDetailsGroup.classList.add('hidden');
        querySetDetailsField.required = false;
        querySetDetailsField.value = '';
      }
    });

    // Control Config -> Custom Input
    const controlConfigSelect = document.getElementById('controlConfig');
    const controlConfigCustom = document.getElementById('controlConfigCustom');

    controlConfigSelect.addEventListener('change', () => {
      if (controlConfigSelect.value === 'Others') {
        controlConfigCustom.classList.remove('hidden');
        controlConfigCustom.required = true;
      } else {
        controlConfigCustom.classList.add('hidden');
        controlConfigCustom.required = false;
        controlConfigCustom.value = '';
      }
    });

    // Treatment Config -> Custom Input
    const treatmentConfigSelect = document.getElementById('treatmentConfig');
    const treatmentConfigCustom = document.getElementById('treatmentConfigCustom');

    treatmentConfigSelect.addEventListener('change', () => {
      if (treatmentConfigSelect.value === 'Others') {
        treatmentConfigCustom.classList.remove('hidden');
        treatmentConfigCustom.required = true;
      } else {
        treatmentConfigCustom.classList.add('hidden');
        treatmentConfigCustom.required = false;
        treatmentConfigCustom.value = '';
      }
    });
  },

  setupAgentSelection() {
    const agentTypeSelect = document.getElementById('agentType');
    const agentSelectionDiv = document.getElementById('agentSelection');

    agentTypeSelect.addEventListener('change', () => {
      const agentType = agentTypeSelect.value;
      if (agentType) {
        this.renderAgentSelection(agentType, agentSelectionDiv);
      } else {
        agentSelectionDiv.innerHTML = '<div class="placeholder-text">Select agent type first...</div>';
        this.selectedAgents.clear();
        this.updateSelectedChips();
      }
    });
  },

  renderAgentSelection(agentType, container) {
    this.selectedAgents.clear();
    
    if (agentType === 'DA') {
      // Hierarchical selection for DA
      const categories = AGENT_HIERARCHY.DA;
      let html = '';

      for (const [category, agents] of Object.entries(categories)) {
        html += `
          <div class="agent-category">
            <div class="category-header">${category}</div>
            <div class="agent-options">
              ${agents.map(agent => `
                <label class="agent-checkbox">
                  <input type="checkbox" value="${agent}" data-category="${category}">
                  <span>${agent}</span>
                </label>
              `).join('')}
            </div>
          </div>
        `;
      }

      // Add "Others" option for DA
      html += `
        <div class="agent-category">
          <div class="agent-options">
            <label class="agent-checkbox">
              <input type="checkbox" value="Others" id="daOthersCheckbox">
              <span><strong>Others (specify custom agents)</strong></span>
            </label>
          </div>
        </div>
      `;

      container.innerHTML = html;
    } else if (agentType === 'FCC') {
      // Simple list for FCC
      const agents = AGENT_HIERARCHY.FCC;
      let html = '<div class="fcc-agents">';

      agents.forEach(agent => {
        html += `
          <label class="agent-checkbox">
            <input type="checkbox" value="${agent}">
            <span>${agent}</span>
          </label>
        `;
      });

      // Add "Others" option for FCC
      html += `
        <label class="agent-checkbox">
          <input type="checkbox" value="Others" id="fccOthersCheckbox">
          <span><strong>Others (specify custom agents)</strong></span>
        </label>
      `;

      html += '</div>';
      container.innerHTML = html;
    }

    // Add event listeners to checkboxes
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          this.selectedAgents.add(checkbox.value);
        } else {
          this.selectedAgents.delete(checkbox.value);
        }
        this.updateSelectedChips();
        this.toggleCustomAgentsField();
      });
    });

    this.updateSelectedChips();
  },

  updateSelectedChips() {
    const chipsContainer = document.getElementById('selectedAgents');
    
    if (this.selectedAgents.size === 0) {
      chipsContainer.innerHTML = '';
      return;
    }

    const chips = Array.from(this.selectedAgents).map(agent => `
      <div class="chip">
        ${escapeHtml(agent)}
        <button type="button" class="chip-remove" data-agent="${escapeHtml(agent)}">&times;</button>
      </div>
    `).join('');

    chipsContainer.innerHTML = chips;

    // Add remove handlers
    chipsContainer.querySelectorAll('.chip-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const agent = btn.dataset.agent;
        this.selectedAgents.delete(agent);
        
        // Uncheck the checkbox
        const checkbox = document.querySelector(`input[type="checkbox"][value="${agent}"]`);
        if (checkbox) checkbox.checked = false;
        
        this.updateSelectedChips();
      });
    });
  },

  setupCharCounter() {
    const notesField = document.getElementById('notes');
    const counter = document.getElementById('notesCount');

    notesField.addEventListener('input', () => {
      counter.textContent = notesField.value.length;
    });
  },

  toggleCustomAgentsField() {
    const customAgentsGroup = document.getElementById('customAgentsGroup');
    const customAgentsField = document.getElementById('customAgents');
    
    if (this.selectedAgents.has('Others')) {
      customAgentsGroup.classList.remove('hidden');
      customAgentsField.required = true;
    } else {
      customAgentsGroup.classList.add('hidden');
      customAgentsField.required = false;
      customAgentsField.value = '';
    }
  },

  handleSubmit(e) {
    e.preventDefault();

    // Validate at least one agent selected or custom agents provided
    const customAgents = document.getElementById('customAgents').value.trim();
    const hasSelectedAgents = this.selectedAgents.size > 0 && 
      (this.selectedAgents.size > 1 || !this.selectedAgents.has('Others'));
    const hasCustomAgents = this.selectedAgents.has('Others') && customAgents;

    if (!hasSelectedAgents && !hasCustomAgents) {
      showToast('Please select at least one agent or specify custom agents', 'error');
      return;
    }

    // Build agents array
    let agentsArray = Array.from(this.selectedAgents).filter(a => a !== 'Others');
    
    // Add custom agents if "Others" is selected
    if (this.selectedAgents.has('Others') && customAgents) {
      const customAgentsList = customAgents.split(',').map(a => a.trim()).filter(a => a);
      agentsArray = [...agentsArray, ...customAgentsList];
    }

    // Gather form data
    const formData = {
      purpose: document.getElementById('purpose').value,
      purposeReason: document.getElementById('purposeReason').value || null,
      agentType: document.getElementById('agentType').value,
      agents: agentsArray,
      querySet: document.getElementById('querySet').value,
      querySetDetails: document.getElementById('querySetDetails').value || null,
      controlConfig: this.getConfigValue('control'),
      treatmentConfig: this.getConfigValue('treatment'),
      notes: document.getElementById('notes').value || null,
      submitter: document.getElementById('submitter').value,
      highPriority: document.getElementById('highPriority').checked
    };

    // Add to state
    const request = state.addRequest(formData);
    
    showToast('Request submitted successfully');
    
    // Reset form
    this.resetForm();
    
    // Switch to dashboard
    setTimeout(() => {
      switchView('dashboard');
      dashboard.render();
    }, 500);
  },

  getConfigValue(type) {
    const select = document.getElementById(`${type}Config`);
    const custom = document.getElementById(`${type}ConfigCustom`);
    
    if (select.value === 'Others') {
      return custom.value;
    }
    return select.value;
  },

  resetForm() {
    document.getElementById('requestForm').reset();
    this.selectedAgents.clear();
    this.updateSelectedChips();
    
    // Hide conditional fields
    document.getElementById('purposeReasonGroup').classList.add('hidden');
    document.getElementById('querySetDetailsGroup').classList.add('hidden');
    document.getElementById('controlConfigCustom').classList.add('hidden');
    document.getElementById('treatmentConfigCustom').classList.add('hidden');
    document.getElementById('customAgentsGroup').classList.add('hidden');
    
    // Reset agent selection
    document.getElementById('agentSelection').innerHTML = '<div class="placeholder-text">Select agent type first...</div>';
    
    // Reset char counter
    document.getElementById('notesCount').textContent = '0';
  }
};
