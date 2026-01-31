/**
 * Data Quality Metrics Dashboard
 * Displays scraped data health metrics
 */

const elements = {
  loadingMsg: document.getElementById('loadingMsg'),
  errorMsg: document.getElementById('errorMsg'),
  content: document.getElementById('content'),
  updatedAt: document.getElementById('updatedAt'),
  refreshBtn: document.getElementById('refreshBtn'),
  overallHealth: document.getElementById('overallHealth'),
  totalRecords: document.getElementById('totalRecords'),
  avgCompleteness: document.getElementById('avgCompleteness'),
  criticalIssues: document.getElementById('criticalIssues'),
  warnings: document.getElementById('warnings'),
  datasetsGrid: document.getElementById('datasetsGrid')
};

let autoRefreshTimer = null;

/**
 * Format timestamp for display
 */
function formatTimestamp(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

/**
 * Get status emoji
 */
function getStatusEmoji(status) {
  const emojis = {
    healthy: '✅',
    degraded: '⚠️',
    critical: '❌',
    unknown: '❓'
  };
  return emojis[status] || '❓';
}

/**
 * Get completeness color class
 */
function getCompletenessClass(percentage) {
  if (percentage >= 70) return '';
  if (percentage >= 50) return 'medium';
  return 'low';
}

/**
 * Create dataset card HTML
 */
function createDatasetCard(id, data) {
  const statusBadge = `<span class="status-badge ${data.status}">${data.status}</span>`;
  
  const issuesHtml = data.issues.length > 0
    ? `
      <div class="issues-list">
        <h4>Issues (${data.issues.length})</h4>
        <ul>
          ${data.issues.map(issue => `<li>${issue}</li>`).join('')}
        </ul>
      </div>
    `
    : '<div class="issues-list"><h4>No Issues</h4></div>';

  return `
    <div class="metric-card ${data.status}">
      <h3>
        ${getStatusEmoji(data.status)}
        ${id.charAt(0).toUpperCase() + id.slice(1)}
        ${statusBadge}
      </h3>
      <div class="metric-value">${data.recordCount.toLocaleString()}</div>
      <div class="metric-label">Records</div>
      
      <div class="completeness-bar">
        <div class="completeness-fill ${getCompletenessClass(data.completeness)}" 
             style="width: ${data.completeness}%"></div>
      </div>
      <div class="metric-label">${data.completeness.toFixed(1)}% Complete</div>
      
      <div class="metric-label" style="margin-top: 0.5rem;">
        Last Updated: ${formatTimestamp(data.lastUpdated)}
      </div>
      
      ${issuesHtml}
    </div>
  `;
}

/**
 * Update dashboard with metrics data
 */
function updateDashboard(metrics) {
  // Update header
  elements.updatedAt.textContent = `Last updated: ${formatTimestamp(metrics.generatedAt)}`;
  
  // Update summary
  const healthEmoji = getStatusEmoji(metrics.summary.overallHealth);
  elements.overallHealth.textContent = `${healthEmoji} ${metrics.summary.overallHealth.toUpperCase()}`;
  elements.totalRecords.textContent = metrics.summary.totalRecords.toLocaleString();
  elements.avgCompleteness.textContent = `${metrics.summary.avgCompleteness}%`;
  elements.criticalIssues.textContent = metrics.summary.criticalIssues;
  elements.warnings.textContent = metrics.summary.warnings;
  
  // Update datasets grid
  const datasetsHtml = Object.entries(metrics.datasets)
    .map(([id, data]) => createDatasetCard(id, data))
    .join('');
  
  elements.datasetsGrid.innerHTML = datasetsHtml;
  
  // Show content, hide loading
  elements.loadingMsg.style.display = 'none';
  elements.content.style.display = 'block';
}

/**
 * Show error message
 */
function showError(message) {
  elements.errorMsg.textContent = `Error: ${message}`;
  elements.errorMsg.style.display = 'block';
  elements.loadingMsg.style.display = 'none';
}

/**
 * Load metrics from JSON file
 */
async function loadMetrics() {
  try {
    elements.loadingMsg.style.display = 'block';
    elements.errorMsg.style.display = 'none';
    
    const response = await fetch('../data/metrics.json');
    
    if (!response.ok) {
      throw new Error(`Failed to load metrics: ${response.status} ${response.statusText}`);
    }
    
    const metrics = await response.json();
    updateDashboard(metrics);
    
  } catch (error) {
    console.error('Failed to load metrics:', error);
    showError(error.message);
  }
}

/**
 * Setup auto-refresh
 */
function setupAutoRefresh() {
  // Clear existing timer
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer);
  }
  
  // Refresh every 5 minutes
  autoRefreshTimer = setInterval(loadMetrics, 5 * 60 * 1000);
}

/**
 * Initialize dashboard
 */
function init() {
  // Load metrics on page load
  loadMetrics();
  
  // Setup refresh button
  elements.refreshBtn.addEventListener('click', () => {
    loadMetrics();
    setupAutoRefresh(); // Reset auto-refresh timer
  });
  
  // Setup auto-refresh
  setupAutoRefresh();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
