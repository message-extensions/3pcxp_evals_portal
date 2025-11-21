// Utility Functions

// Generate unique ID
function generateId() {
  return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Format date to ISO string
function toISOString(date) {
  return new Date(date).toISOString();
}

// Get relative time (e.g., "2 hours ago")
function getRelativeTime(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
  if (diffDay < 30) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  
  return formatAbsoluteDate(timestamp);
}

// Format absolute date
function formatAbsoluteDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Calculate duration between two timestamps
function calculateDuration(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end - start;
  const diffMin = Math.floor(diffMs / 1000 / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 60) return `${diffMin}m`;
  if (diffHour < 24) return `${diffHour}h ${diffMin % 60}m`;
  return `${diffDay}d ${diffHour % 24}h`;
}

// Show toast notification
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Truncate text with ellipsis
function truncate(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Get purpose badge class
function getPurposeBadgeClass(purpose) {
  if (purpose === 'RAI check') return 'rai';
  if (purpose === 'Flight review') return 'flight';
  if (purpose === 'GPT-5 migration') return 'gpt5';
  if (purpose === 'Ad-hoc') return 'adhoc';
  return 'adhoc';
}

// Download JSON file
function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Read JSON file
function readJSONFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// Validate URL
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Get priority badge class
function getPriorityBadgeClass(priority) {
  if (priority === 'High') return 'high';
  if (priority === 'Medium') return 'medium';
  if (priority === 'Low') return 'low';
  return 'medium';  // Default
}

// Agent hierarchy data - NOW LOADED FROM SERVER
// Kept here for backward compatibility, but should use state.config instead
const AGENT_HIERARCHY = {
  DA: {
    'Message Extensions': ['Mock MEs', 'Jira Cloud'],
    'OpenAPI': ['GitHub Mock', 'KYC Mock', 'GitHub', 'IDEAS', 'KYC'],
    'Remote MCP': ['Monday.com', 'Connect', 'Sales UAT'],
    'Instructions++': ['Hugo', 'Vantage Rewards', 'Sales Genie', 'IT Helpdesk', 'Adobe Express']
  },
  FCC: ['Notion', 'Canva', 'HubSpot', 'Linear', 'Google Calendar', 'Google Contacts', 'Intercom']
};
