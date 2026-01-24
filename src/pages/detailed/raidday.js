const { JSDOM } = require('jsdom');
const { 
    writeTempFile, 
    handleScraperError, 
    extractRaidInfo, 
    extractBonuses, 
    extractSection, 
    getSectionHeaders,
    extractPrice
} = require('../../utils/scraperUtils');

/**
 * Handler for Raid Day events.
 * Extracts alternating raid bosses, featured attacks, ticket bonuses, fusion info.
 */
async function get(url, id, bkp) {
    try {
        const dom = await JSDOM.fromURL(url, {});
        const doc = dom.window.document;
        
        const raidDayData = {
            featured: [],
            featuredAttacks: [],
            raids: {
                fiveStar: [],
                mega: [],
                other: []
            },
            shinies: [],
            bonuses: [],
            ticketBonuses: [],
            ticketPrice: null,
            alternationPattern: '',
            specialMechanics: []
        };

        // Extract raid info
        const raidInfo = await extractRaidInfo(doc);
        raidDayData.raids.fiveStar = raidInfo.tiers.fiveStar;
        raidDayData.raids.mega = raidInfo.tiers.mega;
        raidDayData.shinies = raidInfo.shinies;
        if (raidInfo.bosses.length > 0) {
            raidDayData.featured = raidInfo.bosses;
        }

        // Extract bonuses
        const bonusData = await extractBonuses(doc);
        raidDayData.bonuses = bonusData.bonuses;

        const sections = getSectionHeaders(doc);
        for (const sectionId of sections) {
            if (sectionId === 'leek-duck' || sectionId === 'graphic') continue;

            const sectionContent = await extractSection(doc, sectionId);

            // Featured attacks
            if (sectionId.includes('attack')) {
                sectionContent.paragraphs.forEach(p => {
                    if (p.includes('Charged Attack') || p.includes('Fast Attack')) {
                        raidDayData.featuredAttacks.push(p);
                    }
                });
            }

            // Ticket info
            if (sectionId.includes('ticket')) {
                sectionContent.paragraphs.forEach(p => {
                    const priceInfo = extractPrice(p);
                    if (priceInfo) {
                        raidDayData.ticketPrice = priceInfo.price;
                    }
                    raidDayData.ticketBonuses.push(p);
                });
                sectionContent.lists.forEach(list => {
                    raidDayData.ticketBonuses.push(...list);
                });
            }

            // Featured pokemon
            if (sectionId.includes('featured')) {
                raidDayData.featured.push(...sectionContent.pokemon);
                // Look for alternation pattern
                sectionContent.paragraphs.forEach(p => {
                    if (p.includes('alternate') || p.includes('half hour')) {
                        raidDayData.alternationPattern = p;
                    }
                });
            }

            // Special mechanics (fusion, mega evolution, etc.)
            if (sectionId.includes('fusion') || sectionId.includes('mega') || sectionId.includes('special')) {
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim()) raidDayData.specialMechanics.push(p);
                });
                sectionContent.lists.forEach(list => {
                    raidDayData.specialMechanics.push(...list);
                });
            }

            // 5-star raids section
            if (sectionId.includes('5-star') || sectionId.includes('five-star')) {
                raidDayData.raids.fiveStar.push(...sectionContent.pokemon);
            }
        }

        if (raidDayData.featured.length > 0 || raidDayData.raids.fiveStar.length > 0) {
            writeTempFile(id, 'raid-day', raidDayData);
        }
    } catch (err) {
        handleScraperError(err, id, 'raid-day', bkp, 'raidday');
    }
}

module.exports = { get };
