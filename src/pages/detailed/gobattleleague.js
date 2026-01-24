const { JSDOM } = require('jsdom');
const { 
    writeTempFile, 
    handleScraperError, 
    extractSection, 
    getSectionHeaders 
} = require('../../utils/scraperUtils');

/**
 * Handler for GO Battle League events.
 * Extracts league brackets, CP restrictions, type restrictions.
 */
async function get(url, id, bkp) {
    try {
        const dom = await JSDOM.fromURL(url, {});
        const doc = dom.window.document;
        
        const gblData = { leagues: [] };

        const sections = getSectionHeaders(doc);
        for (const sectionId of sections) {
            if (sectionId === 'leek-duck' || sectionId === 'graphic') continue;

            const sectionContent = await extractSection(doc, sectionId);
            
            const league = {
                name: sectionId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                cpCap: null,
                typeRestrictions: [],
                rules: []
            };

            sectionContent.lists.forEach(list => {
                list.forEach(item => {
                    // CP cap detection
                    const cpMatch = item.match(/(\d{1,4}(?:,\d{3})?)\s*CP/i);
                    if (cpMatch) {
                        league.cpCap = parseInt(cpMatch[1].replace(',', ''));
                    }
                    
                    // Type restriction detection
                    const typeMatch = item.match(/Only\s+([\w,\s-]+)-type/i);
                    if (typeMatch) {
                        league.typeRestrictions = typeMatch[1].split(/,\s*and\s*|,\s*/).map(t => t.trim());
                    }
                    
                    league.rules.push(item);
                });
            });

            sectionContent.paragraphs.forEach(p => {
                if (p.trim()) league.rules.push(p);
            });

            if (league.rules.length > 0) {
                gblData.leagues.push(league);
            }
        }

        if (gblData.leagues.length > 0) {
            writeTempFile(id, 'go-battle-league', gblData);
        }
    } catch (err) {
        handleScraperError(err, id, 'go-battle-league', bkp, 'gobattleleague');
    }
}

module.exports = { get };
