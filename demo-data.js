// Demo/Test Data Generator
// Open browser console and run: loadDemoData()

function loadDemoData() {
  const demoRequests = [
    {
      id: 'req_demo_1',
      purpose: 'RAI check',
      purposeReason: null,
      agentType: 'DA',
      agents: ['Mock MEs', 'Jira Cloud'],
      querySet: 'Default',
      querySetDetails: null,
      controlConfig: 'Current Prod',
      treatmentConfig: 'Current Prod',
      notes: 'Initial RAI validation for Message Extensions',
      submitter: 'John Doe',
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      executor: null,
      startedAt: null,
      completedAt: null,
      runLinks: []
    },
    {
      id: 'req_demo_2',
      purpose: 'Flight review',
      purposeReason: null,
      agentType: 'DA',
      agents: ['GitHub Mock', 'GitHub'],
      querySet: 'Default',
      querySetDetails: null,
      controlConfig: 'Current Prod',
      treatmentConfig: 'Other',
      notes: 'Testing OpenAPI agents with new flight configuration',
      submitter: 'Jane Smith',
      submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      status: 'in_progress',
      executor: 'Alice Johnson',
      startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      completedAt: null,
      runLinks: [
        {
          url: 'https://example.com/run/12345',
          notes: 'Initial baseline run',
          addedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
        },
        {
          url: 'https://example.com/run/12346',
          notes: 'Flight variant test',
          addedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
      ]
    },
    {
      id: 'req_demo_3',
      purpose: 'GPT-5 migration',
      purposeReason: null,
      agentType: 'DA',
      agents: ['Monday.com', 'Connect'],
      querySet: 'Others',
      querySetDetails: 'Custom query set for MCP remote agents with enhanced prompts',
      controlConfig: 'GPT-4 baseline',
      treatmentConfig: 'GPT-5 preview',
      notes: 'Comparing GPT-4 vs GPT-5 performance for Remote MCP agents',
      submitter: 'Bob Wilson',
      submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      executor: 'Alice Johnson',
      startedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      runLinks: [
        {
          url: 'https://example.com/run/11111',
          notes: 'GPT-4 baseline',
          addedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          url: 'https://example.com/run/11112',
          notes: 'GPT-5 preview run',
          addedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          url: 'https://example.com/run/11113',
          notes: 'Additional validation',
          addedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    },
    {
      id: 'req_demo_4',
      purpose: 'Ad-hoc',
      purposeReason: 'Testing Instructions++ agents with new prompt engineering techniques',
      agentType: 'DA',
      agents: ['Hugo', 'Sales Genie', 'IT Helpdesk'],
      querySet: 'Default',
      querySetDetails: null,
      controlConfig: 'Current Prod',
      treatmentConfig: 'Enhanced prompts v2.1',
      notes: 'Exploring improved instruction following for Instructions++ category',
      submitter: 'Carol Martinez',
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      executor: null,
      startedAt: null,
      completedAt: null,
      runLinks: []
    },
    {
      id: 'req_demo_5',
      purpose: 'Flight review',
      purposeReason: null,
      agentType: 'FCC',
      agents: ['FCC Agent 1', 'FCC Agent 2'],
      querySet: 'Default',
      querySetDetails: null,
      controlConfig: 'Current Prod',
      treatmentConfig: 'FCC Flight B',
      notes: 'Validating FCC connector performance with new flight',
      submitter: 'David Lee',
      submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      status: 'in_progress',
      executor: 'Bob Wilson',
      startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      completedAt: null,
      runLinks: [
        {
          url: 'https://example.com/run/22222',
          notes: 'Initial FCC test',
          addedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        }
      ]
    }
  ];

  // Load demo data into state
  state.requests = demoRequests;
  state.save();
  dashboard.render();
  
  console.log('✅ Demo data loaded successfully!');
  console.log(`   - ${demoRequests.filter(r => r.status === 'pending').length} Pending requests`);
  console.log(`   - ${demoRequests.filter(r => r.status === 'in_progress').length} In Progress evaluations`);
  console.log(`   - ${demoRequests.filter(r => r.status === 'completed').length} Completed evaluations`);
  
  showToast('Demo data loaded successfully');
}

function clearDemoData() {
  if (confirm('Are you sure you want to clear all data?')) {
    state.requests = [];
    state.save();
    dashboard.render();
    console.log('✅ All data cleared');
    showToast('Data cleared');
  }
}

console.log('Demo data functions available:');
console.log('  - loadDemoData() - Load sample requests');
console.log('  - clearDemoData() - Clear all requests');
