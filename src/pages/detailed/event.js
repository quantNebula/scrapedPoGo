const { JSDOM } = require('jsdom');
const { 
    writeTempFile, 
    handleScraperError, 
    extractBonuses, 
    extractSection, 
    getSectionHeaders, 
    extractPokemonList 
} = require('../../utils/scraperUtils');

/**
 * Handler for generic "Event" type (Winter Weekend, etc.)
 * Extracts bonuses, features, shiny info, and custom event sections.
 */
async function get(url, id, bkp) {
    try {
        const dom = await JSDOM.fromURL(url, {});
        const doc = dom.window.document;
        
        const eventData = {
            bonuses: [],
            bonusDisclaimers: [],
            features: [],
            shinies: [],
            spawns: [],
            customSections: {}
        };

        // Extract bonuses
        const bonusData = await extractBonuses(doc);
        eventData.bonuses = bonusData.bonuses;
        eventData.bonusDisclaimers = bonusData.disclaimers;

        // Extract all sections
        const sections = getSectionHeaders(doc);
        for (const sectionId of sections) {
            if (sectionId === 'bonuses' || sectionId === 'leek-duck' || sectionId === 'graphic') continue;
            
            const sectionContent = await extractSection(doc, sectionId);
            
            if (sectionId === 'shiny' || sectionId.includes('shiny')) {
                eventData.shinies.push(...sectionContent.pokemon);
            } else if (sectionId === 'features') {
                eventData.features = sectionContent.paragraphs;
            } else if (sectionId === 'spawns' || sectionId.includes('wild')) {
                eventData.spawns.push(...sectionContent.pokemon);
            } else {
                // Store any other sections in customSections
                if (sectionContent.paragraphs.length > 0 || 
                    sectionContent.lists.length > 0 || 
                    sectionContent.pokemon.length > 0) {
                    eventData.customSections[sectionId] = sectionContent;
                }
            }
        }

        if (eventData.bonuses.length > 0 || 
            eventData.spawns.length > 0 || 
            Object.keys(eventData.customSections).length > 0) {
            writeTempFile(id, 'event', eventData);
        }
    } catch (err) {
        handleScraperError(err, id, 'event', bkp, 'event');
    }
}

module.exports = { get };
