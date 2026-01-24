const { JSDOM } = require('jsdom');
const { 
    writeTempFile, 
    handleScraperError,
    extractResearchTasks, 
    extractSection, 
    getSectionHeaders,
    extractPrice
} = require('../../utils/scraperUtils');

/**
 * Handler for Timed Research events.
 * Extracts research tasks, rewards, availability window, pricing if ticketed.
 */
async function get(url, id, bkp) {
    try {
        const dom = await JSDOM.fromURL(url, {});
        const doc = dom.window.document;
        
        const timedResearchData = {
            name: '',
            description: '',
            isPaid: false,
            price: null,
            tasks: [],
            rewards: [],
            encounters: [],
            availability: {
                start: '',
                end: ''
            }
        };

        // Get title
        const title = doc.querySelector('h1');
        if (title) {
            timedResearchData.name = title.textContent?.trim() || '';
        }

        // Try to extract structured research
        const researchData = await extractResearchTasks(doc, 'timed');
        timedResearchData.tasks = researchData.tasks;
        timedResearchData.rewards = researchData.rewards;
        if (researchData.steps.length > 0) {
            timedResearchData.tasks = researchData.steps;
        }

        const sections = getSectionHeaders(doc);
        
        for (const sectionId of sections) {
            if (sectionId === 'leek-duck' || sectionId === 'graphic') continue;

            const sectionContent = await extractSection(doc, sectionId);

            // Main timed research section (usually named after the event)
            if (sectionId.includes('timed-research') || sectionId.includes('research')) {
                sectionContent.paragraphs.forEach(p => {
                    // Check for pricing
                    const priceInfo = extractPrice(p);
                    if (priceInfo) {
                        timedResearchData.isPaid = true;
                        timedResearchData.price = priceInfo.price;
                    }

                    // Check for dates
                    const dateMatch = p.match(/(\w+day,\s+\w+\s+\d+.*?(?:local time|p\.m\.|a\.m\.))/gi);
                    if (dateMatch) {
                        if (!timedResearchData.availability.start) {
                            timedResearchData.availability.start = dateMatch[0];
                        }
                        if (dateMatch[1]) {
                            timedResearchData.availability.end = dateMatch[1];
                        }
                    }

                    // Description
                    if (!timedResearchData.description && p.trim() && !p.includes('US$')) {
                        timedResearchData.description = p;
                    }
                });

                // Encounter rewards
                timedResearchData.encounters.push(...sectionContent.pokemon);

                // List-based rewards
                sectionContent.lists.forEach(list => {
                    list.forEach(item => {
                        timedResearchData.rewards.push(item);
                    });
                });
            }
        }

        if (timedResearchData.name || timedResearchData.tasks.length > 0 || timedResearchData.encounters.length > 0) {
            writeTempFile(id, 'timed-research', timedResearchData);
        }
    } catch (err) {
        handleScraperError(err, id, 'timed-research', bkp, 'timedresearch');
    }
}

module.exports = { get };
