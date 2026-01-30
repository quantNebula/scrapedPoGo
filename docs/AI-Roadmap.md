# AI Integration Roadmap for ScrapedPoGo

This document outlines improved capabilities for the ScrapedPoGo application by leveraging the **Vercel AI Router (AI Gateway)**. These features move the project from a passive data scraper to an intelligent data companion.

## 1. Natural Language Search & Discovery
**Current State:** Users must filter by exact keywords or dropdowns (e.g., "Event Type: Community Day").
**AI Upgrade:** Users can ask questions in plain English.
- **Idea:** "Show me events good for farming Stardust."
- **Mechanism:**
  - The UI sends the query to Vercel AI Gateway.
  - The AI translates the intent ("farming Stardust") into specific data filters (`bonus CONTAINS "Stardust"` OR `reward CONTAINS "Stardust"`).
  - The app filters the JSON client-side based on the AI's structured response.
- **Value:** Makes the data accessible to casual players who don't memorize event types.

## 2. "At a Glance" Smart Summaries
**Current State:** Events are displayed as raw lists of bonuses, spawns, and dates. Large events like "Global GO Tour" can be overwhelming.
**AI Upgrade:** Auto-generated executive summaries.
- **Idea:** A "TL;DR" card for every event.
- **Mechanism:**
  - During the build pipeline (via `enrich-events-ai.js`), send the raw event JSON to the AI.
  - Ask for a 2-sentence summary and 3 "Key Highlights."
  - Store this capability in `events.min.json` so it loads instantly for the user without hitting an API at runtime.
- **Value:** Users save time; they instantly know *why* they should care about an event.

## 3. Automated Data Quality Assurance (QA)
**Current State:** Scrapers rely on brittle regex. If LeekDuck changes a class name, data might come back as `null` or empty strings, requiring manual checking.
**AI Upgrade:** AI as a content moderator/validator.
- **Idea:** A "Sanity Check" step in the GitHub Action pipeline.
- **Mechanism:**
  - After scraping, pass the diff or the new JSON to the AI.
  - Prompt: "Does this event look correct? Are the dates chronological? Do the bonuses match standard Pokémon GO formatting?"
  - If the AI flags a "High Confidence Error" (e.g., "End date is before Start date"), fail the build or alert the maintainer.
- **Value:** Prevents bad data from reaching production.

## 4. Contextual Strategy Tips
**Current State:** The app tells you *what* starts spawning. It doesn't tell you *what to do*.
**AI Upgrade:** Strategic advice based on the data.
- **Idea:** Generated "Pro Tips" for each event.
- **Mechanism:**
  - The AI analyzes the `pokemon` and `bonuses` arrays together.
  - Example Output: "With **2x Evolve XP** and **Pidgey spawns**, this is an ideal time to use a Lucky Egg for mass evolutions."
  - Example Output: "Machop is spawning; farm this for candies to counter the 5-star Raid Boss (Darkrai)."
- **Value:** Transforms the app from a calendar into a strategy guide.

## 5. Automated Translation & Localization
**Current State:** English only (as scraped from source).
**AI Upgrade:** Zero-config localization.
- **Idea:** Serve the site in Spanish, Japanese, German, etc.
- **Mechanism:**
  - The AI Gateway models are excellent at translation while preserving JSON structure.
  - We can generate `events.es.min.json`, `events.de.min.json` during the build process.
- **Value:** Expands the user base globally without hiring translators.

## Implementation Priority
1. **Smart Summaries** (Partially implemented in `scripts/enrich-events-ai.js`) - High impact, low complexity.
2. **Contextual Strategy** - High value, medium complexity (requires prompt tuning).
3. **Natural Language Search** - High "wow" factor, high complexity (requires frontend changes + API cost management).
