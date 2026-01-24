const { JSDOM } = require('jsdom');
const { 
    writeTempFile, 
    handleScraperError, 
    extractSection, 
    getSectionHeaders, 
    extractPokemonList,
    extractEggPools
} = require('../../utils/scraperUtils');

/**
 * Handler for Season events.
 * Extracts seasonal bonuses, spawns, eggs, research, community days, special features.
 */
async function get(url, id, bkp) {
    try {
        const dom = await JSDOM.fromURL(url, {});
        const doc = dom.window.document;
        
        const seasonData = {
            name: '',
            bonuses: [],
            spawns: [],
            eggs: {
                '2km': [],
                '5km': [],
                '7km': [],
                '10km': [],
                '12km': [],
                'route': [],
                'adventure': []
            },
            researchBreakthrough: [],
            specialResearch: [],
            masterworkResearch: [],
            communityDays: [],
            features: [],
            goBattleLeague: '',
            goPass: [],
            pokemonDebuts: [],
            maxPokemonDebuts: []
        };

        // Get season name from title
        const title = doc.querySelector('h1');
        if (title) {
            seasonData.name = title.textContent?.trim() || '';
        }

        // Extract eggs using shared utility
        seasonData.eggs = await extractEggPools(doc);

        const sections = getSectionHeaders(doc);
        
        for (const sectionId of sections) {
            if (sectionId === 'leek-duck' || sectionId === 'graphic') continue;

            const sectionContent = await extractSection(doc, sectionId);

            // Seasonal bonuses
            if (sectionId.includes('bonus')) {
                sectionContent.lists.forEach(list => {
                    seasonData.bonuses.push(...list);
                });
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim() && !p.includes('following bonuses')) {
                        seasonData.bonuses.push(p);
                    }
                });
            }

            // Spawns / Wild encounters
            if (sectionId.includes('spawn') || sectionId.includes('wild')) {
                seasonData.spawns.push(...sectionContent.pokemon);
            }

            // Research Breakthrough
            if (sectionId.includes('breakthrough')) {
                seasonData.researchBreakthrough.push(...sectionContent.pokemon);
            }

            // Special Research
            if (sectionId.includes('special-research') || 
                (sectionId.includes('research') && !sectionId.includes('breakthrough') && !sectionId.includes('masterwork'))) {
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim()) seasonData.specialResearch.push(p);
                });
                seasonData.specialResearch.push(...sectionContent.pokemon);
            }

            // Masterwork Research
            if (sectionId.includes('masterwork')) {
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim()) seasonData.masterworkResearch.push(p);
                });
            }

            // Community Days
            if (sectionId.includes('community')) {
                sectionContent.lists.forEach(list => {
                    seasonData.communityDays.push(...list);
                });
            }

            // Features / New Pokemon
            if (sectionId.includes('new') || sectionId.includes('debut') || sectionId.includes('discover')) {
                if (sectionId.includes('max')) {
                    seasonData.maxPokemonDebuts.push(...sectionContent.pokemon);
                    sectionContent.paragraphs.forEach(p => {
                        if (p.trim()) seasonData.maxPokemonDebuts.push(p);
                    });
                } else {
                    seasonData.pokemonDebuts.push(...sectionContent.pokemon);
                    sectionContent.paragraphs.forEach(p => {
                        if (p.trim()) seasonData.pokemonDebuts.push(p);
                    });
                }
            }

            // GO Battle League
            if (sectionId.includes('battle-league')) {
                seasonData.goBattleLeague = sectionContent.paragraphs.join(' ');
            }

            // GO Pass
            if (sectionId === 'go-pass') {
                sectionContent.lists.forEach(list => {
                    seasonData.goPass.push(...list);
                });
            }
        }

        if (seasonData.name || seasonData.bonuses.length > 0) {
            writeTempFile(id, 'season', seasonData);
        }
    } catch (err) {
        handleScraperError(err, id, 'season', bkp, 'season');
    }
}

module.exports = { get };
