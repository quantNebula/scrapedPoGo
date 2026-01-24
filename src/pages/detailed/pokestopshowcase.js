const { JSDOM } = require('jsdom');
const { writeTempFile, handleScraperError, extractPokemonList, extractSection } = require('../../utils/scraperUtils');

/**
 * Handler for PokéStop Showcase events.
 * Extracts featured Pokémon for showcase.
 */
async function get(url, id, bkp) {
    try {
        const dom = await JSDOM.fromURL(url, {});
        const doc = dom.window.document;
        
        const showcaseData = {
            featured: [],
            description: ''
        };

        const pkmnLists = doc.querySelectorAll('.pkmn-list-flex');
        for (const list of pkmnLists) {
            showcaseData.featured.push(...(await extractPokemonList(list)));
        }

        const eventDesc = doc.querySelector('.event-description');
        if (eventDesc) {
            showcaseData.description = eventDesc.textContent?.trim() || '';
        }

        const showcaseSection = await extractSection(doc, 'pokestop-showcases');
        if (showcaseSection.paragraphs.length > 0) {
            showcaseData.description = showcaseSection.paragraphs[0];
        }
        showcaseData.featured.push(...showcaseSection.pokemon);

        if (showcaseData.featured.length > 0) {
            writeTempFile(id, 'pokestop-showcase', showcaseData);
        }
    } catch (err) {
        handleScraperError(err, id, 'pokestop-showcase', bkp, 'pokestopshowcase');
    }
}

module.exports = { get };
