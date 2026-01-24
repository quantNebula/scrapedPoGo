const { JSDOM } = require('jsdom');
const { writeTempFile, handleScraperError, extractPokemonList } = require('../../utils/scraperUtils');

/**
 * Handler for Raid Hour events.
 * Extracts single featured raid boss (lightweight handler).
 */
async function get(url, id, bkp) {
    try {
        const dom = await JSDOM.fromURL(url, {});
        const doc = dom.window.document;
        
        const raidHourData = {
            featured: null,
            canBeShiny: false
        };

        const pkmnList = doc.querySelector('.pkmn-list-flex');
        if (pkmnList) {
            const pokemon = await extractPokemonList(pkmnList);
            if (pokemon.length > 0) {
                raidHourData.featured = pokemon[0];
                raidHourData.canBeShiny = pokemon[0].canBeShiny;
            }
        }

        // Fallback: try to get name from title
        if (!raidHourData.featured) {
            const eventTitle = doc.querySelector('.event-pokemon-name, h1');
            if (eventTitle) {
                raidHourData.featured = {
                    name: eventTitle.textContent?.replace('Raid Hour', '').trim() || '',
                    image: '',
                    canBeShiny: false
                };
            }
        }

        if (raidHourData.featured) {
            writeTempFile(id, 'raid-hour', raidHourData);
        }
    } catch (err) {
        handleScraperError(err, id, 'raid-hour', bkp, 'raidhour');
    }
}

module.exports = { get };
