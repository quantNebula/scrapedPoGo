const { JSDOM } = require('jsdom');
const { writeTempFile, handleScraperError, extractPokemonList } = require('../../utils/scraperUtils');

/**
 * Handler for Research Breakthrough events.
 * Extracts the featured breakthrough reward Pokemon.
 */
async function get(url, id, bkp) {
    try {
        const dom = await JSDOM.fromURL(url, {});
        const doc = dom.window.document;

        const content = doc.querySelector('.pkmn-list-flex');
        const pokemonList = await extractPokemonList(content);
        
        if (pokemonList.length === 0) {
            throw new Error('No pokemon found in breakthrough page');
        }

        const reward = {
            name: pokemonList[0].name,
            canBeShiny: pokemonList[0].canBeShiny,
            image: pokemonList[0].image,
            imageWidth: pokemonList[0].imageWidth,
            imageHeight: pokemonList[0].imageHeight,
            list: pokemonList
        };

        writeTempFile(id, 'research-breakthrough', reward);
    } catch (err) {
        handleScraperError(err, id, 'research-breakthrough', bkp, 'breakthrough');
    }
}

module.exports = { get };
