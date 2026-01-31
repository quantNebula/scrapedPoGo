#!/usr/bin/env node

/**
 * @fileoverview Data Quality Metrics Generator
 * Analyzes scraped data and generates comprehensive quality metrics
 * including completeness, freshness, and issue detection.
 * @module scripts/generate-metrics
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Dataset configuration with their file paths and expected fields
 */
const DATASETS = [
  {
    id: 'events',
    file: 'data/events.min.json',
    requiredFields: ['eventID', 'name', 'eventType', 'heading', 'image', 'start', 'end'],
    optionalFields: ['pokemon', 'bonuses', 'raids', 'research', 'eggs'],
    isArray: true
  },
  {
    id: 'raids',
    file: 'data/raids.min.json',
    requiredFields: ['name', 'tier'],
    optionalFields: ['form', 'combatPower', 'canBeShiny', 'types'],
    isArray: true
  },
  {
    id: 'research',
    file: 'data/research.min.json',
    requiredFields: ['text', 'type', 'rewards'],
    optionalFields: [],
    isArray: true
  },
  {
    id: 'eggs',
    file: 'data/eggs.min.json',
    requiredFields: ['name', 'eggType'],
    optionalFields: ['canBeShiny', 'isRegional', 'combatPower'],
    isArray: true
  },
  {
    id: 'rocketLineups',
    file: 'data/rocketLineups.min.json',
    requiredFields: ['name', 'title'],
    optionalFields: ['firstPokemon', 'secondPokemon', 'thirdPokemon'],
    isArray: true
  },
  {
    id: 'shinies',
    file: 'data/shinies.min.json',
    requiredFields: ['name'],
    optionalFields: ['family', 'released', 'source', 'image'],
    isArray: true
  }
];

/**
 * Calculate completeness percentage for a dataset
 * @param {Array<Object>} records - Dataset records
 * @param {Array<string>} optionalFields - Fields to check
 * @returns {number} Completeness percentage (0-100)
 */
function calculateCompleteness(records, optionalFields) {
  if (!Array.isArray(records) || records.length === 0) return 0;
  
  let totalFields = 0;
  let populatedFields = 0;
  
  records.forEach(record => {
    optionalFields.forEach(field => {
      totalFields++;
      const value = record[field];
      // Consider field populated if it exists and is not empty
      if (value !== undefined && value !== null && value !== '' && 
          !(Array.isArray(value) && value.length === 0)) {
        populatedFields++;
      }
    });
  });
  
  return totalFields > 0 ? Math.round((populatedFields / totalFields) * 100 * 10) / 10 : 100;
}

/**
 * Detect issues in a dataset
 * @param {string} datasetId - Dataset identifier
 * @param {Array<Object>} records - Dataset records
 * @param {Array<string>} requiredFields - Required fields
 * @param {Array<string>} optionalFields - Optional fields
 * @returns {Array<string>} List of issues
 */
function detectIssues(datasetId, records, requiredFields, optionalFields) {
  const issues = [];
  
  if (!Array.isArray(records)) {
    issues.push('Data is not an array');
    return issues;
  }
  
  if (records.length === 0) {
    issues.push('No records found');
    return issues;
  }
  
  // Check for missing required fields
  const recordsWithMissingFields = records.filter(record => {
    return requiredFields.some(field => 
      record[field] === undefined || record[field] === null || record[field] === ''
    );
  });
  
  if (recordsWithMissingFields.length > 0) {
    const percentage = Math.round((recordsWithMissingFields.length / records.length) * 100);
    issues.push(`${percentage}% of records have missing required fields`);
  }
  
  // Check optional field population
  optionalFields.forEach(field => {
    const emptyCount = records.filter(record => {
      const value = record[field];
      return value === undefined || value === null || value === '' || 
             (Array.isArray(value) && value.length === 0);
    }).length;
    
    if (emptyCount > 0) {
      const percentage = Math.round((emptyCount / records.length) * 100);
      if (percentage >= 20) { // Only report if >20% are missing
        issues.push(`${percentage}% missing ${field}`);
      }
    }
  });
  
  // Dataset-specific checks
  if (datasetId === 'events') {
    // Check for invalid date ranges
    const invalidDates = records.filter(record => {
      if (!record.start || !record.end) return false;
      const start = new Date(record.start);
      const end = new Date(record.end);
      return end < start;
    });
    
    if (invalidDates.length > 0) {
      issues.push(`${invalidDates.length} events have end date before start date`);
    }
    
    // Check for events without end date
    const noEndDate = records.filter(r => !r.end || r.end === '').length;
    if (noEndDate > 0) {
      issues.push(`${noEndDate} events have no end date`);
    }
  }
  
  return issues;
}

/**
 * Get file modification time
 * @param {string} filepath - Path to file
 * @returns {string|null} ISO timestamp or null
 */
function getFileLastModified(filepath) {
  try {
    const stats = fs.statSync(filepath);
    return stats.mtime.toISOString();
  } catch (err) {
    return null;
  }
}

/**
 * Analyze a single dataset
 * @param {Object} dataset - Dataset configuration
 * @returns {Object} Dataset metrics
 */
function analyzeDataset(dataset) {
  const filepath = path.join(__dirname, '..', '..', dataset.file);
  
  const result = {
    recordCount: 0,
    lastUpdated: null,
    completeness: 0,
    issues: [],
    status: 'unknown'
  };
  
  // Check if file exists
  if (!fs.existsSync(filepath)) {
    result.issues.push('Data file not found');
    result.status = 'critical';
    return result;
  }
  
  try {
    // Read and parse data
    const content = fs.readFileSync(filepath, 'utf8');
    const data = JSON.parse(content);
    
    result.lastUpdated = getFileLastModified(filepath);
    
    if (dataset.isArray) {
      if (!Array.isArray(data)) {
        result.issues.push('Expected array but got different type');
        result.status = 'critical';
        return result;
      }
      
      result.recordCount = data.length;
      result.completeness = calculateCompleteness(data, dataset.optionalFields);
      result.issues = detectIssues(dataset.id, data, dataset.requiredFields, dataset.optionalFields);
    } else {
      result.recordCount = 1;
      result.completeness = 100;
    }
    
    // Determine status
    if (result.issues.length === 0 && result.completeness >= 70) {
      result.status = 'healthy';
    } else if (result.issues.length === 0 || result.completeness >= 50) {
      result.status = 'degraded';
    } else {
      result.status = 'critical';
    }
    
  } catch (error) {
    result.issues.push(`Parse error: ${error.message}`);
    result.status = 'critical';
  }
  
  return result;
}

/**
 * Calculate overall system health
 * @param {Object} datasets - Dataset metrics
 * @returns {string} Overall health status
 */
function calculateOverallHealth(datasets) {
  const statuses = Object.values(datasets).map(d => d.status);
  
  if (statuses.some(s => s === 'critical')) return 'critical';
  if (statuses.some(s => s === 'degraded')) return 'degraded';
  if (statuses.every(s => s === 'healthy')) return 'healthy';
  return 'unknown';
}

/**
 * Main metrics generation function
 */
function generateMetrics() {
  logger.start('Generating data quality metrics...');
  
  const metrics = {
    generatedAt: new Date().toISOString(),
    pipeline: {
      status: 'healthy',
      lastSuccessful: new Date().toISOString()
    },
    datasets: {},
    summary: {
      overallHealth: 'unknown',
      totalRecords: 0,
      avgCompleteness: 0,
      criticalIssues: 0,
      warnings: 0
    }
  };
  
  // Analyze each dataset
  let totalCompleteness = 0;
  let datasetCount = 0;
  
  DATASETS.forEach(dataset => {
    logger.info(`Analyzing ${dataset.id}...`);
    const analysis = analyzeDataset(dataset);
    metrics.datasets[dataset.id] = analysis;
    
    metrics.summary.totalRecords += analysis.recordCount;
    totalCompleteness += analysis.completeness;
    datasetCount++;
    
    if (analysis.status === 'critical') {
      metrics.summary.criticalIssues++;
    } else if (analysis.status === 'degraded') {
      metrics.summary.warnings++;
    }
  });
  
  // Calculate summary
  metrics.summary.avgCompleteness = datasetCount > 0 
    ? Math.round((totalCompleteness / datasetCount) * 10) / 10 
    : 0;
  metrics.summary.overallHealth = calculateOverallHealth(metrics.datasets);
  
  // Update pipeline status based on overall health
  if (metrics.summary.overallHealth === 'critical') {
    metrics.pipeline.status = 'critical';
  } else if (metrics.summary.overallHealth === 'degraded') {
    metrics.pipeline.status = 'degraded';
  }
  
  // Write metrics files
  const metricsDir = path.join(__dirname, '..', '..', 'data');
  const metricsPath = path.join(metricsDir, 'metrics.json');
  const metricsMinPath = path.join(metricsDir, 'metrics.min.json');
  
  // Ensure data directory exists
  if (!fs.existsSync(metricsDir)) {
    fs.mkdirSync(metricsDir, { recursive: true });
  }
  
  // Write formatted version
  fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
  logger.success(`Written: ${metricsPath}`);
  
  // Write minified version
  fs.writeFileSync(metricsMinPath, JSON.stringify(metrics));
  logger.success(`Written: ${metricsMinPath}`);
  
  // Log summary
  console.log('\n📊 Metrics Summary:');
  console.log(`   Overall Health: ${metrics.summary.overallHealth.toUpperCase()}`);
  console.log(`   Total Records: ${metrics.summary.totalRecords}`);
  console.log(`   Avg Completeness: ${metrics.summary.avgCompleteness}%`);
  console.log(`   Critical Issues: ${metrics.summary.criticalIssues}`);
  console.log(`   Warnings: ${metrics.summary.warnings}\n`);
  
  logger.success('Metrics generation complete!');
  
  // Return metrics for programmatic use
  return metrics;
}

// Run if executed directly
if (require.main === module) {
  try {
    generateMetrics();
  } catch (error) {
    logger.error(`Metrics generation failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { generateMetrics };
