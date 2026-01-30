/**
 * @fileoverview Shiny Pokemon scraper entry point.
 * Orchestrates the scraping of shiny Pokemon data from LeekDuck/PogoAssets
 * and writes the results to data files.
 * @module scrapers/scrapeShinies
 */

const fs = require('fs');
const logger = require('../utils/logger');
const shinies = require('../pages/shinies');
const { transformUrls } = require('../utils/blobUrls');
const dotenv = require('dotenv');

dotenv.config();
dotenv.config({ path: '.env.local' });

/**
 * Main function that runs the shiny Pokemon scraper.
 * Creates the data directory if needed, calls the shinies scraper,
 * and writes both formatted and minified JSON output files.
 * 
 * @async
 * @function main
 * @returns {void}
 * @throws {Error} Logs error and exits with code 1 on failure
 * 
 * @example
 * // Run via npm script or directly:
 * // node src/scrapers/scrapeShinies.js
 * // Creates data/shinies.json and data/shinies.min.json
 */
function main()
{
    if (!fs.existsSync('data'))
        fs.mkdirSync('data');

    logger.start('Scraping shiny Pokemon data from PogoAssets...');
    
    shinies().then(data => {
        const output = transformUrls(data);
        fs.writeFile('data/shinies.min.json', JSON.stringify(output), err => {
            if (err) {
                logger.error('Error writing shinies.min.json:', err);
                return;
            }
            logger.success(`Successfully saved ${output.length} shinies to data/shinies.min.json`);
        });
    }).catch(error => {
        logger.error('Failed to scrape shinies:', error);
        process.exit(1);
    });
}

try
{
    main();
}
catch (e)
{
    logger.error("ERROR: " + e);
    process.exit(1);
}
