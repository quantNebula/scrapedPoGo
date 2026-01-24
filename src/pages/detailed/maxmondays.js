const { JSDOM } = require('jsdom');
const { writeTempFile, handleScraperError, extractPokemonList } = require('../../utils/scraperUtils');

/**
 * Handler for Max Mondays events.
 * Extracts featured weekly Dynamax Pokémon.
 */
async function get(url, id, bkp) {
    try {
        const dom = await JSDOM.fromURL(url, {});
        const doc = dom.window.document;
        
        const maxMondaysData = {
            featured: null,
            bonus: ''
        };

        const pkmnList = doc.querySelector('.pkmn-list-flex');
        if (pkmnList) {
            const pokemon = await extractPokemonList(pkmnList);
            if (pokemon.length > 0) {
                maxMondaysData.featured = pokemon[0];
            }
        }

        const eventDesc = doc.querySelector('.event-description');
        if (eventDesc) {
            const strong = eventDesc.querySelector('strong');
            if (strong) {
                maxMondaysData.bonus = strong.innerHTML;
            }
        }

        if (maxMondaysData.featured) {
            writeTempFile(id, 'max-mondays', maxMondaysData);
        }
    } catch (err) {
        handleScraperError(err, id, 'max-mondays', bkp, 'maxmondays');
    }
}

module.exports = { get };
