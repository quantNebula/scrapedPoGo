const { JSDOM } = require('jsdom');
const { 
    writeTempFile, 
    handleScraperError, 
    extractPokemonList, 
    extractBonuses, 
    extractResearchTasks,
    extractSection,
    extractPrice
} = require('../../utils/scraperUtils');

/**
 * Handler for Community Day events.
 * Extracts spawns, bonuses, shinies, special research, and additional CD-specific features.
 */
async function get(url, id, bkp) {
    try {
        const dom = await JSDOM.fromURL(url, {});
        const doc = dom.window.document;

        const commday = {
            spawns: [],
            bonuses: [],
            bonusDisclaimers: [],
            shinies: [],
            specialresearch: [],
            // Enhanced fields from EXAMPLE_detailed
            featuredAttack: null,
            photobomb: null,
            pokestopShowcases: [],
            fieldResearchTasks: [],
            lureModuleBonus: null,
            ticketedResearch: null
        };

        const pageContent = doc.querySelector('.page-content');
        let lastHeader = '';

        // Iterate through page content sections
        for (const n of pageContent?.childNodes || []) {
            if (n.className?.includes('event-section-header')) {
                lastHeader = n.id;
            }

            // Spawns
            if (lastHeader === 'spawns' && n.className === 'pkmn-list-flex') {
                commday.spawns.push(...(await extractPokemonList(n)));
            }
            // Shinies
            else if (lastHeader === 'shiny' && n.className === 'pkmn-list-flex') {
                commday.shinies.push(...(await extractPokemonList(n)));
            }
            // Featured Attack
            else if (lastHeader === 'featured-attack') {
                if (n.tagName === 'P') {
                    if (!commday.featuredAttack) {
                        commday.featuredAttack = { description: n.innerHTML, stats: [] };
                    }
                } else if (n.tagName === 'UL' && commday.featuredAttack) {
                    n.querySelectorAll('li').forEach(li => {
                        commday.featuredAttack.stats.push(li.innerHTML);
                    });
                }
            }
            // Photobomb
            else if (lastHeader === 'photobomb') {
                if (n.tagName === 'P') {
                    if (!commday.photobomb) {
                        commday.photobomb = { description: n.innerHTML, pokemon: [] };
                    }
                } else if (n.className === 'pkmn-list-flex' && commday.photobomb) {
                    commday.photobomb.pokemon.push(...(await extractPokemonList(n)));
                }
            }
            // PokéStop Showcases
            else if ((lastHeader === 'pokestop-showcases' || lastHeader === 'pokéstop-showcases') && 
                     n.className === 'pkmn-list-flex') {
                commday.pokestopShowcases.push(...(await extractPokemonList(n)));
            }
            // Lure Module Bonus
            else if (lastHeader === 'lure-module-bonus' && n.tagName === 'P') {
                if (!commday.lureModuleBonus) {
                    commday.lureModuleBonus = n.innerHTML;
                }
            }
            // Field Research Tasks
            else if (lastHeader === 'field-research-tasks') {
                if (n.tagName === 'P') {
                    commday.fieldResearchTasks.push({ type: 'info', text: n.innerHTML });
                } else if (n.tagName === 'UL') {
                    n.querySelectorAll('li').forEach(li => {
                        commday.fieldResearchTasks.push({ type: 'task', text: li.innerHTML });
                    });
                } else if (n.className === 'pkmn-list-flex') {
                    const pokemon = await extractPokemonList(n);
                    commday.fieldResearchTasks.push({ type: 'encounters', pokemon });
                }
            }
        }

        // Extract bonuses using shared utility
        const bonusData = await extractBonuses(doc);
        commday.bonuses = bonusData.bonuses;
        commday.bonusDisclaimers = bonusData.disclaimers;

        // Extract special research using shared utility
        const researchData = await extractResearchTasks(doc, 'special');
        if (researchData.steps.length > 0) {
            commday.specialresearch = researchData.steps;
        }

        // Check for ticketed/paid research
        const pageText = pageContent?.textContent || '';
        if (pageText.includes('US$') && pageText.includes('Special Research')) {
            const priceInfo = extractPrice(pageText);
            if (priceInfo) {
                commday.ticketedResearch = {
                    price: priceInfo.price,
                    description: ''
                };
                // Try to find ticketed research description
                const ticketedSection = await extractSection(doc, 'community-day-classic');
                if (ticketedSection.paragraphs.length > 0) {
                    commday.ticketedResearch.description = ticketedSection.paragraphs.join(' ');
                }
            }
        }

        // Only write if we have meaningful data
        if (commday.spawns.length > 0 || commday.bonuses.length > 0 || commday.specialresearch.length > 0) {
            writeTempFile(id, 'community-day', commday);
        }
    } catch (err) {
        handleScraperError(err, id, 'community-day', bkp, 'communityday');
    }
}

module.exports = { get };
