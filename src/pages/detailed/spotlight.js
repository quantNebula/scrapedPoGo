const { JSDOM } = require('jsdom');
const { writeTempFile, handleScraperError, extractPokemonList } = require('../../utils/scraperUtils');

/**
 * Handler for Pokemon Spotlight Hour events.
 * Extracts featured Pokemon and bonus information.
 */
async function get(url, id, bkp) {
    try {
        const dom = await JSDOM.fromURL(url, {});
        const doc = dom.window.document;

        const content = doc.querySelector('.pkmn-list-flex');
        
        // Extract bonus from event description
        const eventDesc = doc.querySelector('.event-description');
        let bonus = '';
        if (eventDesc) {
            const temp = eventDesc.innerHTML;
            const split = temp.split('<strong>');
            if (split.length > 1) {
                bonus = split[split.length - 1].split('</strong>')[0];
            }
        }

        const pokemonList = await extractPokemonList(content);
        
        if (pokemonList.length === 0) {
            throw new Error('No pokemon found in spotlight page');
        }

        const spotlight = {
            name: pokemonList[0].name,
            canBeShiny: pokemonList[0].canBeShiny,
            image: pokemonList[0].image,
            imageWidth: pokemonList[0].imageWidth,
            imageHeight: pokemonList[0].imageHeight,
            bonus,
            list: pokemonList
        };

        writeTempFile(id, 'pokemon-spotlight-hour', spotlight);
    } catch (err) {
        handleScraperError(err, id, 'pokemon-spotlight-hour', bkp, 'spotlight');
    }
}

module.exports = { get };
