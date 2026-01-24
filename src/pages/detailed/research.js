const { JSDOM } = require('jsdom');
const { 
    writeTempFile, 
    handleScraperError,
    extractResearchTasks, 
    extractSection, 
    getSectionHeaders,
    extractPromoCodes,
    extractPrice
} = require('../../utils/scraperUtils');

/**
 * Handler for Research events (Masterwork Research, Special Research, etc.)
 * Extracts research tasks, rewards, promo codes, pricing info.
 */
async function get(url, id, bkp) {
    try {
        const dom = await JSDOM.fromURL(url, {});
        const doc = dom.window.document;

        const researchData = {
            name: '',
            researchType: 'special',
            isPaid: false,
            price: null,
            description: '',
            tasks: [],
            rewards: [],
            encounters: [],
            promoCodes: [],
            expires: false,
            webStoreInfo: ''
        };

        // Get research name from title
        const title = doc.querySelector('h1');
        if (title) {
            researchData.name = title.textContent?.trim() || '';
            if (researchData.name.toLowerCase().includes('masterwork')) {
                researchData.researchType = 'masterwork';
            } else if (researchData.name.toLowerCase().includes('timed')) {
                researchData.researchType = 'timed';
            }
        }

        // Extract structured research using shared utility
        const structuredResearch = await extractResearchTasks(doc, researchData.researchType);
        if (structuredResearch.steps.length > 0) {
            researchData.tasks = structuredResearch.steps;
        } else {
            researchData.tasks = structuredResearch.tasks;
        }
        researchData.rewards = structuredResearch.rewards;

        // Extract promo codes using shared utility
        researchData.promoCodes = extractPromoCodes(doc);

        // Process sections for additional data
        const sections = getSectionHeaders(doc);
        
        for (const sectionId of sections) {
            if (sectionId === 'leek-duck' || sectionId === 'graphic') continue;

            const sectionContent = await extractSection(doc, sectionId);

            // Research sections (not field research)
            if (sectionId.includes('research') && !sectionId.includes('field')) {
                sectionContent.paragraphs.forEach(p => {
                    // Check for pricing
                    const priceInfo = extractPrice(p);
                    if (priceInfo) {
                        researchData.isPaid = true;
                        researchData.price = priceInfo.price;
                    }

                    // Check expiration
                    if (p.toLowerCase().includes('does not expire')) {
                        researchData.expires = false;
                    } else if (p.toLowerCase().includes('expire')) {
                        researchData.expires = true;
                    }

                    // Description (first non-price paragraph)
                    if (!researchData.description && p.trim() && !p.includes('US$')) {
                        researchData.description = p;
                    }
                });

                // List-based rewards
                sectionContent.lists.forEach(list => {
                    list.forEach(item => {
                        researchData.rewards.push(item);
                    });
                });

                // Pokemon encounters
                researchData.encounters.push(...sectionContent.pokemon);
            }

            // Web store info
            if (sectionId.includes('web-store') || sectionId.includes('pokemon-go-web-store')) {
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim()) researchData.webStoreInfo += p + ' ';
                });
            }

            // Sales section
            if (sectionId === 'sales') {
                sectionContent.paragraphs.forEach(p => {
                    if (p.trim()) researchData.webStoreInfo += p + ' ';
                });
            }
        }

        researchData.webStoreInfo = researchData.webStoreInfo.trim();

        // Write data if we have meaningful content
        if (researchData.name || researchData.tasks.length > 0 || researchData.promoCodes.length > 0) {
            writeTempFile(id, 'research', researchData);
        }

        // Write promo codes separately if found
        if (researchData.promoCodes.length > 0) {
            writeTempFile(id, 'promo-codes', researchData.promoCodes, '_codes');
        }
    } catch (err) {
        handleScraperError(err, id, 'research', bkp, 'research');
    }
}

module.exports = { get };
