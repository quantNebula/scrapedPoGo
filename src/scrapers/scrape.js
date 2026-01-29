/**
 * @fileoverview Main scraper orchestrator for Pokemon GO data.
 * Entry point that coordinates scraping of all primary data sources:
 * events, raids, research, eggs, and Team GO Rocket lineups.
 * @module scrapers/scrape
 */

const fs = require('fs');
const logger = require('../utils/logger');
const events = require('../pages/events')
const raids = require('../pages/raids')
const research = require('../pages/research')
const eggs = require('../pages/eggs')
const rocketLineups = require('../pages/rocketLineups')

/**
 * Main function that orchestrates all primary scrapers.
 * Creates the data directory if it doesn't exist, then initiates
 * parallel scraping of all data sources.
 *
 * @function main
 * @returns {void}
 * @throws {Error} Logs error and exits with code 1 on failure
 *
 * @example
 * // Run via npm script or directly:
 * // node src/scrapers/scrape.js
 * // Creates data/*.json files for all sources
 */
function main()
{
    logger.start("Starting primary scrapers...");

    if (!fs.existsSync('data'))
        fs.mkdirSync('data');

    events.get();
    raids.get();
    research.get();
    eggs.get();
    rocketLineups.get();

    logger.info("Scrapers initiated.");
}

try
{
    main();
}
catch (e)
{
    logger.error(e);
    process.exit(1);
}
