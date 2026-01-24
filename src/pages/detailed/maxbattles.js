const { JSDOM } = require('jsdom');
const { 
    writeTempFile, 
    handleScraperError, 
    extractPokemonList, 
    extractSection, 
    getSectionHeaders 
} = require('../../utils/scraperUtils');

/**
 * Handler for Max Battles (Dynamax Weekend) events.
 * Extracts featured Dynamax/Gigantamax boss, bonuses.
 */
async function get(url, id, bkp) {
    try {
        const dom = await JSDOM.fromURL(url, {});
        const doc = dom.window.document;
        
        const maxBattlesData = {
            featured: [],
            bonuses: [],
            gigantamax: [],
            dynamax: []
        };

        const firstPkmnList = doc.querySelector('.pkmn-list-flex');
        if (firstPkmnList) {
            maxBattlesData.featured = await extractPokemonList(firstPkmnList);
        }

        const sections = getSectionHeaders(doc);
        for (const sectionId of sections) {
            if (sectionId === 'leek-duck' || sectionId === 'graphic') continue;

            const sectionContent = await extractSection(doc, sectionId);

            if (sectionId.includes('gigantamax')) {
                maxBattlesData.gigantamax.push(...sectionContent.pokemon);
            } else if (sectionId.includes('dynamax')) {
                maxBattlesData.dynamax.push(...sectionContent.pokemon);
            } else if (sectionId === 'bonuses') {
                sectionContent.lists.forEach(list => {
                    maxBattlesData.bonuses.push(...list);
                });
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim()) maxBattlesData.bonuses.push(p);
                });
            }
        }

        if (maxBattlesData.featured.length > 0 || maxBattlesData.gigantamax.length > 0 || maxBattlesData.dynamax.length > 0) {
            writeTempFile(id, 'max-battles', maxBattlesData);
        }
    } catch (err) {
        handleScraperError(err, id, 'max-battles', bkp, 'maxbattles');
    }
}

module.exports = { get };
