const { JSDOM } = require('jsdom');
const { 
    writeTempFile, 
    handleScraperError, 
    extractSection, 
    getSectionHeaders, 
    extractPokemonList 
} = require('../../utils/scraperUtils');

/**
 * Handler for Team GO Rocket events.
 * Extracts grunt lineups, leader info, shadow Pokemon, Giovanni encounters.
 */
async function get(url, id, bkp) {
    try {
        const dom = await JSDOM.fromURL(url, {});
        const doc = dom.window.document;
        
        const rocketData = {
            shadowPokemon: [],
            leaders: {
                arlo: [],
                cliff: [],
                sierra: []
            },
            giovanni: [],
            grunts: [],
            bonuses: [],
            specialResearch: []
        };

        const sections = getSectionHeaders(doc);
        
        for (const sectionId of sections) {
            if (sectionId === 'leek-duck' || sectionId === 'graphic') continue;

            const sectionContent = await extractSection(doc, sectionId);

            // Shadow Pokemon
            if (sectionId.includes('shadow')) {
                rocketData.shadowPokemon.push(...sectionContent.pokemon);
            }

            // Leaders
            if (sectionId.includes('arlo')) {
                rocketData.leaders.arlo.push(...sectionContent.pokemon);
            } else if (sectionId.includes('cliff')) {
                rocketData.leaders.cliff.push(...sectionContent.pokemon);
            } else if (sectionId.includes('sierra')) {
                rocketData.leaders.sierra.push(...sectionContent.pokemon);
            }

            // Giovanni
            if (sectionId.includes('giovanni')) {
                rocketData.giovanni.push(...sectionContent.pokemon);
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim()) rocketData.giovanni.push({ info: p });
                });
            }

            // Grunts
            if (sectionId.includes('grunt')) {
                rocketData.grunts.push(...sectionContent.pokemon);
            }

            // Bonuses
            if (sectionId.includes('bonus')) {
                sectionContent.lists.forEach(list => {
                    rocketData.bonuses.push(...list);
                });
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim()) rocketData.bonuses.push(p);
                });
            }

            // Special Research
            if (sectionId.includes('research')) {
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim()) rocketData.specialResearch.push(p);
                });
            }
        }

        // Also look for lineup tables (common format for rocket events)
        const lineupTables = doc.querySelectorAll('.lineup-pokemon, .shadow-pokemon-list');
        for (const table of lineupTables) {
            const pokemon = await extractPokemonList(table);
            rocketData.shadowPokemon.push(...pokemon);
        }

        if (rocketData.shadowPokemon.length > 0 || 
            rocketData.giovanni.length > 0 || 
            Object.values(rocketData.leaders).some(l => l.length > 0)) {
            writeTempFile(id, 'team-go-rocket', rocketData);
        }
    } catch (err) {
        handleScraperError(err, id, 'team-go-rocket', bkp, 'teamgorocket');
    }
}

module.exports = { get };
