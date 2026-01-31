# ScrapedPoGo - Codebase Analysis & Feature Proposal

**Date:** 2026-01-31  
**Analyst:** Autonomous Software Architect

---

## 1. Codebase Understanding Summary

### Architecture Overview

**Project Type:** Node.js Web Scraper + Static JSON API  
**Primary Purpose:** Scrape Pokémon GO event data from LeekDuck.com and serve as JSON API at pokemn.quest

**Core Components:**
1. **Scraping Pipeline (3 stages)**
   - `npm run scrape` → Basic event metadata → `data/events.min.json`
   - `npm run detailedscrape` → Event-specific details → `data/temp/*.json`
   - `npm run combinedetails` → Merge + generate per-eventType files → `data/eventTypes/*.json`

2. **Data Sources**
   - 6 primary endpoints: Events, Raids, Research, Eggs, Rocket Lineups, Shinies
   - 18+ event type-specific detailed scrapers
   - 1200+ line shared utility library (`scraperUtils.js`)

3. **Supporting Features**
   - JSON Schema validation for all data types
   - Vercel Blob Storage integration for image hosting
   - AI enrichment system (partial - `enrich-events-ai.js` exists but not in pipeline)
   - Basic web UI for data exploration (`/web` directory)
   - GitHub Actions CI/CD (runs every 8 hours)

### Technology Stack
- **Runtime:** Node.js 20
- **Web Scraping:** JSDOM 27.4.0
- **Date Handling:** Moment.js (latest)
- **AI Integration:** Vercel AI Gateway (fetch-based)
- **Image Storage:** Vercel Blob (@vercel/blob 2.0.1)
- **Validation:** AJV 8.17.1 + ajv-formats 3.0.1
- **Environment:** dotenv 16.4.7

### Current Development Direction
Based on recent commits and existing code:
- Actively maintaining data quality (shiny data shape validation)
- Image management migration (CDN → Blob storage)
- AI enrichment capability added but not fully integrated
- No backend database (pure static JSON)
- Web UI exists but requires external API

### Existing Patterns
**Coding Conventions:**
- Consistent module structure: `{ get }` exports
- Centralized error handling via `handleScraperError()`
- Flat data structure (no nested `details` wrapper)
- Temp file pattern for detailed scrapers
- Logger utility for colored console output
- No testing infrastructure present

**Naming Conventions:**
- kebab-case for files and event types
- camelCase for functions and variables
- Event IDs as URL slugs (lowercase)

---

## 2. Feature Suggestions

### Feature 1: Historical Data Tracking & Change Detection

**Description:** Add versioned historical data tracking to detect and log changes between scraping runs, enabling change alerts and trend analysis.

**Complexity:** Medium

**Business Value:**
The current system overwrites data every 8 hours, losing all historical information. Users have no way to:
- Track when event details change (e.g., extended duration, bonus adjustments)
- See what Pokemon were previously featured in recurring events
- Detect errors by comparing against historical baselines
- Generate "What's New" summaries for major updates

This feature would enable:
- Change alerts for event modifications
- Historical archives for research and comparisons
- Data quality improvements through anomaly detection
- Future analytics and trending features

**Implementation Approach:**
- Store snapshots in `data/history/YYYY-MM-DD/` on significant changes
- Generate diff reports in `data/changes/latest.json`
- Add `npm run history:snapshot` and `npm run history:diff` commands
- Minimal storage impact (only store when changes detected)

---

### Feature 2: Data Quality Metrics Dashboard

**Description:** Automated data quality monitoring system that validates completeness, freshness, and accuracy of scraped data with visual dashboard.

**Complexity:** Simple

**Business Value:**
The current validation only checks JSON schema compliance. There's no visibility into:
- When scrapers fail silently (continue-on-error in CI)
- Which events have incomplete data (missing bonuses, spawns, etc.)
- How fresh the data is (last successful scrape timestamp)
- Data completeness trends over time

This feature would:
- Surface scraper health issues immediately
- Provide confidence metrics for downstream consumers
- Enable proactive maintenance before users report issues
- Create accountability for data completeness

**Implementation Approach:**
- Generate `data/metrics.json` during pipeline runs
- Track: last update time, record counts, completeness percentages, failed scrapers
- Create simple HTML dashboard in `/web/metrics.html`
- Add `npm run metrics:generate` command
- Zero external dependencies (use existing libraries)

---

### Feature 3: Smart Event Recommendations API Endpoint

**Description:** Generate personalized event recommendations based on user preferences (casual/competitive, new player vs veteran, shiny hunter, raider, etc.).

**Complexity:** Complex

**Business Value:**
With 59 concurrent events and 18+ event types, users face information overload. Currently:
- All events shown equally (no prioritization)
- Users must manually filter through all data
- No guidance for new players on what matters
- Missed opportunities for engagement

This feature would:
- Provide curated event lists per user archetype
- Increase user engagement with relevant content
- Reduce information overload
- Enable downstream apps to provide better UX

**Implementation Approach:**
- Extend AI enrichment to add recommendation scores
- Create scoring algorithm based on event type, bonuses, featured Pokemon
- Generate `data/recommendations/*.json` files per archetype
- Add "priority" field to events based on multiple factors
- Requires AI Gateway integration (already partially implemented)

---

## 3. Selected Feature: Data Quality Metrics Dashboard

**Selection Reasoning:**

**Best Value-to-Complexity Ratio**
- **Simple complexity** with immediate high-value impact
- Addresses critical operational blind spot (scraper health)
- Zero new dependencies (uses existing tools)
- Non-breaking addition (no schema changes)
- Directly leverages existing infrastructure

**Why Not The Others:**
- **Feature 1 (Historical Tracking):** Medium complexity with storage implications; valuable but lower immediate priority
- **Feature 3 (Recommendations):** Complex with subjective ranking logic; requires extensive AI API calls (cost); harder to validate

**Immediate Benefits:**
1. Operations team can monitor scraper health at a glance
2. Users gain confidence in data freshness and completeness
3. Foundation for future monitoring/alerting systems
4. Prevents silent failures from going unnoticed

---

## 4. Implementation Plan: Data Quality Metrics Dashboard

### Prerequisites
✓ All files exist:
- `src/utils/logger.js` - For consistent logging
- `data/*.min.json` - Source data files
- `schemas/*.schema.json` - For validation checks
- `package.json` - Has validate script

### Database/Data Changes
**New Files:**
- `data/metrics.json` - Dashboard data source (formatted)
- `data/metrics.min.json` - Minified for API consumption

**Schema:**
```json
{
  "generatedAt": "ISO8601 timestamp",
  "pipeline": {
    "status": "healthy|degraded|critical",
    "lastSuccessful": "ISO8601 timestamp"
  },
  "datasets": {
    "events": {
      "recordCount": 59,
      "lastUpdated": "ISO8601 timestamp",
      "completeness": 85.5,
      "issues": ["12% missing bonuses", "3 events have no end date"]
    },
    "raids": { /* similar structure */ },
    /* ... other datasets ... */
  },
  "scrapers": {
    "scrape": { "status": "success", "duration": 12.5, "recordsProcessed": 59 },
    "detailedscrape": { "status": "partial", "failedEvents": ["event-id-1"], "duration": 45.2 },
    /* ... other scrapers ... */
  },
  "summary": {
    "overallHealth": "healthy",
    "totalRecords": 342,
    "avgCompleteness": 87.3,
    "criticalIssues": 0,
    "warnings": 3
  }
}
```

### API/Backend Changes
**None required** - This is a static JSON generation project. The metrics will be served as:
- `https://pokemn.quest/data/metrics.json`
- `https://pokemn.quest/data/metrics.min.json`

### UI/Frontend Changes

**New File:** `web/metrics.html`
- Standalone metrics dashboard (similar to existing `web/index.html`)
- Real-time data fetching from `../data/metrics.json`
- Visual indicators: ✅ Green (healthy), ⚠️ Yellow (warnings), ❌ Red (critical)

**Components:**
1. **Pipeline Status Panel** - Last run, overall health, duration
2. **Dataset Health Grid** - 6 cards (one per dataset) with completeness bars
3. **Scraper Status List** - Table of individual scraper results
4. **Issues Log** - Expandable list of warnings and errors
5. **Refresh Button** - Manual reload (auto-refresh every 5 minutes)

**Styling:** Extend existing `web/styles.css` (maintain consistency)

### Testing Strategy

**No Existing Test Infrastructure** - Following "minimal modifications" principle, we'll:

1. **Manual Validation:**
   - Run `npm run metrics:generate` on current data
   - Verify JSON structure matches schema
   - Open `web/metrics.html` in browser
   - Confirm visual indicators display correctly

2. **Integration Test:**
   - Modify one dataset to introduce issues
   - Re-generate metrics
   - Verify issues appear in dashboard

3. **CI Validation:**
   - Metrics generation runs in CI but doesn't fail pipeline
   - Committed metrics file shows current system health

**Future:** If testing infrastructure is added later, we can create:
- `src/scripts/__tests__/metrics.test.js`
- `schemas/metrics.schema.json` validation

### File Inventory

**New Files (5):**
1. `src/scripts/generate-metrics.js` - Metrics calculation engine
2. `web/metrics.html` - Dashboard UI
3. `web/metrics.js` - Dashboard JavaScript logic
4. `data/metrics.json` - Generated metrics (formatted)
5. `data/metrics.min.json` - Generated metrics (minified)

**Modified Files (4):**
1. `package.json` - Add `metrics:generate` script
2. `.github/workflows/scraper.yaml` - Add metrics generation step
3. `README.md` - Document metrics feature
4. `web/styles.css` - Add metrics dashboard styles (if needed)

### Step-by-Step Execution Order

1. **Create Metrics Generation Script**
   - `src/scripts/generate-metrics.js`
   - Implement: File reading, validation checks, completeness calculation
   - Output: Write both `.json` and `.min.json` files
   - Test: `node src/scripts/generate-metrics.js`

2. **Add NPM Script**
   - Update `package.json` with `"metrics:generate": "node src/scripts/generate-metrics.js"`
   - Test: `npm run metrics:generate`

3. **Create Dashboard HTML**
   - `web/metrics.html`
   - Static structure with placeholders for dynamic content

4. **Create Dashboard JavaScript**
   - `web/metrics.js`
   - Fetch metrics data
   - Render status indicators
   - Implement auto-refresh

5. **Add Dashboard Styles**
   - Update `web/styles.css` if needed
   - Maintain consistency with existing design

6. **Integrate into CI Pipeline**
   - Update `.github/workflows/scraper.yaml`
   - Add metrics generation after `combinedetails`
   - Use `continue-on-error: true` (don't break pipeline)

7. **Update Documentation**
   - Add metrics section to `README.md`
   - Include example metrics output
   - Document dashboard URL

8. **Manual Testing**
   - Generate metrics locally
   - Open dashboard in browser
   - Verify all panels display correctly
   - Test with various data states (healthy, degraded, critical)

9. **Commit and Deploy**
   - Commit all new files
   - Push to trigger CI
   - Verify metrics generation in GitHub Actions
   - Confirm dashboard accessible at pokemn.quest

---

## 5. First 3 Steps - Ready for Execution

### Step 1: Create Metrics Generation Script
**Action:** Create `src/scripts/generate-metrics.js`
**Details:**
- Import existing utilities (logger, fs, path)
- Read all data files (`data/*.min.json`)
- Calculate completeness metrics for each dataset
- Detect common issues (missing fields, invalid dates, empty arrays)
- Generate status summary
- Write `data/metrics.json` and `data/metrics.min.json`

**Success Criteria:** Running `node src/scripts/generate-metrics.js` creates valid metrics files

---

### Step 2: Add NPM Script & Test Generation
**Action:** Update `package.json`
**Details:**
- Add `"metrics:generate": "node src/scripts/generate-metrics.js"` to scripts
- Run `npm run metrics:generate` to verify
- Inspect generated metrics files for accuracy

**Success Criteria:** `npm run metrics:generate` succeeds and produces expected output

---

### Step 3: Create Dashboard HTML Structure
**Action:** Create `web/metrics.html`
**Details:**
- Copy structure from `web/index.html` (for consistency)
- Create panels for: Pipeline Status, Dataset Health, Scraper Status, Issues
- Add meta tag for API base (similar to main app)
- Link to `metrics.js` and `styles.css`

**Success Criteria:** Opening `web/metrics.html` shows static dashboard skeleton

---

## Conclusion

This implementation provides immediate operational value by surfacing data quality issues that are currently invisible. The simple complexity ensures rapid delivery while establishing patterns for future monitoring features. The dashboard is self-contained, non-breaking, and leverages existing infrastructure perfectly.

**Estimated Implementation Time:** 4-6 hours
**Risk Level:** Low (no breaking changes, additive only)
**Maintenance Burden:** Minimal (runs automatically, no external services)
