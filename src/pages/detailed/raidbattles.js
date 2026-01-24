const { JSDOM } = require('jsdom');
const { 
    writeTempFile, 
    handleScraperError, 
    extractRaidInfo, 
    extractPokemonList, 
    extractSection, 
    getSectionHeaders 
} = require('../../utils/scraperUtils');

/**
 * Handler for Raid Battles events.
 * Extracts raid bosses by tier, shinies, alternation patterns, and featured attacks.
 */
async function get(url, id, bkp) {
    try {
        const dom = await JSDOM.fromURL(url, {});
        const doc = dom.window.document;

        const raidboss = {
            bosses: [],
            shinies: [],
            tiers: {
                mega: [],
                fiveStar: [],
                threeStar: [],
                oneStar: []
            },
            alternationPattern: '',
            featuredAttacks: []
        };

        // Use the shared extraction utility for raid info
        const raidInfo = await extractRaidInfo(doc);
        raidboss.tiers = raidInfo.tiers;
        raidboss.shinies = raidInfo.shinies;
        raidboss.bosses = raidInfo.bosses;

        // Fallback: original section-based parsing for bosses if utility didn't find them
        if (raidboss.bosses.length === 0 && raidboss.tiers.fiveStar.length === 0) {
            const pageContent = doc.querySelector('.page-content');
            let lastHeader = '';

            for (const n of pageContent?.childNodes || []) {
                if (n.className?.includes('event-section-header')) {
                    lastHeader = n.id;
                }

                if (lastHeader === 'raids' && n.className === 'pkmn-list-flex') {
                    raidboss.bosses.push(...(await extractPokemonList(n)));
                } else if (lastHeader === 'shiny' && n.className === 'pkmn-list-flex') {
                    raidboss.shinies.push(...(await extractPokemonList(n)));
                }
            }
        }

        // Check for alternation patterns and featured attacks
        const sections = getSectionHeaders(doc);
        for (const sectionId of sections) {
            if (sectionId === 'leek-duck' || sectionId === 'graphic') continue;

            const sectionContent = await extractSection(doc, sectionId);

            // Alternation pattern detection
            if (sectionId.includes('featured') || sectionId.includes('raids')) {
                sectionContent.paragraphs.forEach(p => {
                    if (p.includes('alternate') || p.includes('half hour') || p.includes('rotation')) {
                        raidboss.alternationPattern = p;
                    }
                });
            }

            // Featured attacks
            if (sectionId.includes('attack')) {
                sectionContent.paragraphs.forEach(p => {
                    if (p.includes('Charged Attack') || p.includes('Fast Attack') || p.includes('know')) {
                        raidboss.featuredAttacks.push(p);
                    }
                });
            }
        }

        if (raidboss.bosses.length > 0 || Object.values(raidboss.tiers).some(t => t.length > 0)) {
            writeTempFile(id, 'raid-battles', raidboss);
        }
    } catch (err) {
        handleScraperError(err, id, 'raid-battles', bkp, 'raidbattles');
    }
}

module.exports = { get };
