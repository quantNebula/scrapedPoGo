const { JSDOM } = require('jsdom');
const { writeTempFile, handleScraperError } = require('../../utils/scraperUtils');

/**
 * Handler for generic events.
 * Creates a minimal data file indicating available sections in the event page.
 */
async function get(url, id, bkp) {
    try {
        const dom = await JSDOM.fromURL(url, {});
        const doc = dom.window.document;

        const generic = {
            hasSpawns: doc.getElementById('spawns') !== null,
            hasFieldResearchTasks: doc.getElementById('field-research-tasks') !== null,
            hasBonuses: doc.getElementById('bonuses') !== null,
            hasRaids: doc.getElementById('raids') !== null,
            hasEggs: doc.getElementById('eggs') !== null,
            hasShiny: doc.getElementById('shiny') !== null
        };

        writeTempFile(id, 'generic', generic, '_generic');
    } catch (err) {
        handleScraperError(err, id, 'generic', bkp, 'generic');
    }
}

module.exports = { get };
