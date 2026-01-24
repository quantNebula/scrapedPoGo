const fs = require('fs');
const path = require('path');

/**
 * Shared utility functions for LeekDuck scrapers.
 * Provides standardized extraction, error handling, and file operations.
 */

// ============================================================================
// File Operations
// ============================================================================

/**
 * Write a temporary JSON file for scraped event data.
 * @param {string} id - Event ID
 * @param {string} type - Event type (e.g., 'community-day', 'raid-battles')
 * @param {object} data - Scraped data object
 * @param {string} [suffix=''] - Optional filename suffix (e.g., '_generic', '_codes')
 */
function writeTempFile(id, type, data, suffix = '') {
    const filename = `data/temp/${id}${suffix}.json`;
    const content = JSON.stringify({ id, type, data });
    
    fs.writeFile(filename, content, err => {
        if (err) {
            console.error(`Error writing ${filename}:`, err);
        }
    });
}

/**
 * Centralized error handler for scrapers.
 * Falls back to backup data when scraping fails.
 * @param {Error} err - The error that occurred
 * @param {string} id - Event ID
 * @param {string} type - Event type for the output file
 * @param {Array} bkp - Backup data array from events_min.json
 * @param {string} scraperKey - Key to look up in extraData (e.g., 'communityday', 'raidbattles')
 */
function handleScraperError(err, id, type, bkp, scraperKey) {
    // Log error for debugging
    if (process.env.DEBUG) {
        console.error(`Scraper error for ${id} (${type}):`, err.message);
    }
    
    // Search backup data for fallback
    for (let i = 0; i < bkp.length; i++) {
        if (bkp[i].eventID === id && bkp[i].extraData != null) {
            if (scraperKey in bkp[i].extraData) {
                writeTempFile(id, type, bkp[i].extraData[scraperKey].data);
                return;
            }
        }
    }
}

// ============================================================================
// Pokemon Extraction
// ============================================================================

/**
 * Extract a list of Pokémon from a .pkmn-list-flex element.
 * @param {Element} container - DOM element containing .pkmn-list-item elements
 * @returns {Promise<Array>} Array of Pokemon objects with name, image, canBeShiny, dimensions
 */
async function extractPokemonList(container) {
    if (!container) return [];
    
    const pokemon = [];
    const items = container.querySelectorAll(':scope > .pkmn-list-item');
    
    items.forEach(item => {
        const poke = {};
        
        // Name
        const nameEl = item.querySelector(':scope > .pkmn-name');
        poke.name = nameEl ? nameEl.innerHTML.trim() : '';
        
        // Image
        const imgEl = item.querySelector(':scope > .pkmn-list-img > img');
        if (imgEl) {
            poke.image = imgEl.src || '';
            poke.imageWidth = imgEl.width || null;
            poke.imageHeight = imgEl.height || null;
        } else {
            poke.image = '';
        }
        
        // Shiny indicator - check for shiny icon or class
        const shinyIcon = item.querySelector('.pokemon-shiny-icon, .shiny-icon, [class*="shiny"]');
        const hasShinyClass = item.className?.includes('shiny') || false;
        poke.canBeShiny = !!(shinyIcon || hasShinyClass);
        
        // Also check image src for shiny indicator
        if (poke.image && poke.image.includes('_shiny')) {
            poke.canBeShiny = true;
        }
        
        if (poke.name) {
            pokemon.push(poke);
        }
    });
    
    return pokemon;
}

// ============================================================================
// Section Extraction
// ============================================================================

/**
 * Get all section header IDs from a page.
 * @param {Document} doc - DOM document
 * @returns {Array<string>} Array of section IDs
 */
function getSectionHeaders(doc) {
    const headers = doc.querySelectorAll('.event-section-header, h2[id], h3[id]');
    const sections = [];
    
    headers.forEach(header => {
        if (header.id) {
            sections.push(header.id);
        }
    });
    
    return sections;
}

/**
 * Extract content from a specific section by ID.
 * @param {Document} doc - DOM document
 * @param {string} sectionId - Section header ID
 * @returns {Promise<object>} Object with paragraphs, lists, pokemon arrays
 */
async function extractSection(doc, sectionId) {
    const result = {
        paragraphs: [],
        lists: [],
        pokemon: [],
        tables: []
    };
    
    const header = doc.getElementById(sectionId);
    if (!header) return result;
    
    // Walk through siblings until next section header
    let sibling = header.nextElementSibling;
    
    while (sibling && !sibling.classList?.contains('event-section-header') && 
           !(sibling.tagName === 'H2' && sibling.id)) {
        
        // Paragraphs
        if (sibling.tagName === 'P') {
            const text = sibling.innerHTML?.trim();
            if (text) {
                result.paragraphs.push(text);
            }
        }
        
        // Unordered/Ordered lists
        if (sibling.tagName === 'UL' || sibling.tagName === 'OL') {
            const listItems = [];
            sibling.querySelectorAll('li').forEach(li => {
                listItems.push(li.innerHTML?.trim());
            });
            if (listItems.length > 0) {
                result.lists.push(listItems);
            }
        }
        
        // Pokemon lists
        if (sibling.className === 'pkmn-list-flex') {
            const pokemon = await extractPokemonList(sibling);
            result.pokemon.push(...pokemon);
        }
        
        // Tables
        if (sibling.tagName === 'TABLE') {
            const tableData = extractTable(sibling);
            result.tables.push(tableData);
        }
        
        sibling = sibling.nextElementSibling;
    }
    
    return result;
}

/**
 * Extract data from a table element.
 * @param {Element} table - Table DOM element
 * @returns {object} Object with headers and rows arrays
 */
function extractTable(table) {
    const data = { headers: [], rows: [] };
    
    // Headers
    const headerCells = table.querySelectorAll('thead th, tr:first-child th');
    headerCells.forEach(th => {
        data.headers.push(th.textContent?.trim() || '');
    });
    
    // Rows
    const rows = table.querySelectorAll('tbody tr, tr:not(:first-child)');
    rows.forEach(row => {
        const cells = [];
        row.querySelectorAll('td').forEach(td => {
            cells.push(td.innerHTML?.trim() || '');
        });
        if (cells.length > 0) {
            data.rows.push(cells);
        }
    });
    
    return data;
}

// ============================================================================
// Bonus Extraction
// ============================================================================

/**
 * Extract bonuses from a page.
 * @param {Document} doc - DOM document
 * @returns {Promise<object>} Object with bonuses array and disclaimers array
 */
async function extractBonuses(doc) {
    const result = {
        bonuses: [],
        disclaimers: []
    };
    
    const bonusItems = doc.querySelectorAll('.bonus-item');
    let hasDisclaimer = false;
    
    bonusItems.forEach(item => {
        const bonus = {};
        
        const textEl = item.querySelector(':scope > .bonus-text');
        bonus.text = textEl ? textEl.innerHTML.trim() : '';
        
        const imgEl = item.querySelector(':scope > .item-circle > img');
        bonus.image = imgEl ? imgEl.src : '';
        
        if (bonus.text) {
            result.bonuses.push(bonus);
            
            if (bonus.text.includes('*')) {
                hasDisclaimer = true;
            }
        }
    });
    
    // Extract disclaimers if any bonus has asterisk
    if (hasDisclaimer) {
        const bonusList = doc.querySelector('.bonus-list');
        if (bonusList) {
            let sibling = bonusList.nextSibling;
            
            while (sibling && sibling.tagName !== 'H2' && sibling.nextSibling) {
                if (sibling.tagName === 'P') {
                    const html = sibling.innerHTML;
                    if (html.includes('<br>\n')) {
                        html.split('<br>\n').forEach(s => {
                            if (s.trim()) result.disclaimers.push(s.trim());
                        });
                    } else if (html.trim()) {
                        result.disclaimers.push(html.trim());
                    }
                }
                sibling = sibling.nextSibling;
            }
        }
    }
    
    return result;
}

// ============================================================================
// Raid Extraction
// ============================================================================

/**
 * Extract raid information including boss tiers.
 * @param {Document} doc - DOM document
 * @returns {Promise<object>} Object with tiers, bosses, shinies
 */
async function extractRaidInfo(doc) {
    const result = {
        tiers: {
            mega: [],
            fiveStar: [],
            threeStar: [],
            oneStar: []
        },
        bosses: [],
        shinies: []
    };
    
    const pageContent = doc.querySelector('.page-content');
    if (!pageContent) return result;
    
    let lastHeader = '';
    
    for (const node of pageContent.childNodes) {
        if (node.className?.includes('event-section-header')) {
            lastHeader = node.id || '';
        }
        
        if (node.className === 'pkmn-list-flex') {
            const pokemon = await extractPokemonList(node);
            
            // Categorize by section header
            if (lastHeader.includes('mega')) {
                result.tiers.mega.push(...pokemon);
            } else if (lastHeader.includes('5-star') || lastHeader.includes('five-star') || lastHeader.includes('legendary')) {
                result.tiers.fiveStar.push(...pokemon);
            } else if (lastHeader.includes('3-star') || lastHeader.includes('three-star')) {
                result.tiers.threeStar.push(...pokemon);
            } else if (lastHeader.includes('1-star') || lastHeader.includes('one-star')) {
                result.tiers.oneStar.push(...pokemon);
            } else if (lastHeader.includes('raids') || lastHeader.includes('boss')) {
                result.bosses.push(...pokemon);
            } else if (lastHeader.includes('shiny')) {
                result.shinies.push(...pokemon);
            }
        }
    }
    
    return result;
}

// ============================================================================
// Research Extraction
// ============================================================================

/**
 * Extract research tasks from a page.
 * @param {Document} doc - DOM document
 * @param {string} [researchType='special'] - Type: 'special', 'timed', 'masterwork', 'field'
 * @returns {Promise<object>} Object with tasks, steps, rewards arrays
 */
async function extractResearchTasks(doc, researchType = 'special') {
    const result = {
        tasks: [],
        steps: [],
        rewards: []
    };
    
    // Special Research with steps
    const stepItems = doc.querySelectorAll('.special-research-list > .step-item');
    
    stepItems.forEach(stepItem => {
        const step = {
            name: '',
            step: 0,
            tasks: [],
            rewards: []
        };
        
        // Step number
        const stepNumEl = stepItem.querySelector(':scope > .step-label > .step-number');
        if (stepNumEl) {
            step.step = parseInt(stepNumEl.innerHTML) || 0;
        }
        
        // Step name
        const stepNameEl = stepItem.querySelector(':scope > .task-reward-wrapper > .step-name');
        if (stepNameEl) {
            step.name = stepNameEl.innerHTML?.trim() || '';
        }
        
        // Tasks within step
        const taskItems = stepItem.querySelectorAll(':scope > .task-reward-wrapper > .task-reward');
        taskItems.forEach(taskItem => {
            const task = {
                text: '',
                reward: {
                    text: '',
                    image: ''
                }
            };
            
            const taskTextEl = taskItem.querySelector(':scope > .task-text');
            if (taskTextEl) {
                task.text = taskTextEl.innerHTML?.replace(/\n\s+/g, ' ').trim() || '';
            }
            
            const rewardLabelEl = taskItem.querySelector(':scope > .reward-text > .reward-label');
            if (rewardLabelEl) {
                task.reward.text = rewardLabelEl.innerHTML?.replace(/<span>|<\/span>/g, '').trim() || '';
            }
            
            const rewardImgEl = taskItem.querySelector(':scope > .reward-text > .reward-bubble > .reward-image');
            if (rewardImgEl) {
                task.reward.image = rewardImgEl.src || '';
            }
            
            if (task.text) {
                step.tasks.push(task);
            }
        });
        
        // Page rewards (completion rewards)
        const pageRewards = stepItem.querySelectorAll(':scope > .page-reward-wrapper > .page-reward-list > .page-reward');
        pageRewards.forEach(rewardItem => {
            const reward = {
                text: '',
                image: ''
            };
            
            const labelEl = rewardItem.querySelector(':scope > .reward-label > span');
            if (labelEl) {
                reward.text = labelEl.innerHTML?.trim() || '';
            }
            
            const imgEl = rewardItem.querySelector(':scope > .page-reward-item > .reward-image');
            if (imgEl) {
                reward.image = imgEl.src || '';
            }
            
            if (reward.text) {
                step.rewards.push(reward);
            }
        });
        
        if (step.tasks.length > 0 || step.rewards.length > 0) {
            result.steps.push(step);
        }
    });
    
    // Field research tasks (simpler format)
    const fieldTasks = doc.querySelectorAll('.field-research-task, .research-task');
    fieldTasks.forEach(taskEl => {
        const task = {
            task: '',
            reward: ''
        };
        
        const taskTextEl = taskEl.querySelector('.task-text, .research-task-text');
        if (taskTextEl) {
            task.task = taskTextEl.textContent?.trim() || '';
        }
        
        const rewardEl = taskEl.querySelector('.reward-text, .research-reward');
        if (rewardEl) {
            task.reward = rewardEl.textContent?.trim() || '';
        }
        
        if (task.task) {
            result.tasks.push(task);
        }
    });
    
    return result;
}

// ============================================================================
// Price/Ticket Extraction
// ============================================================================

/**
 * Extract price information from text.
 * @param {string} text - Text that may contain price
 * @returns {object|null} Object with price and currency, or null
 */
function extractPrice(text) {
    const patterns = [
        /US\$(\d+\.?\d*)/,
        /\$(\d+\.?\d*)\s*USD/i,
        /€(\d+\.?\d*)/,
        /£(\d+\.?\d*)/,
        /\$(\d+\.?\d*)/
    ];
    
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            let currency = 'USD';
            if (text.includes('€')) currency = 'EUR';
            if (text.includes('£')) currency = 'GBP';
            
            return {
                price: parseFloat(match[1]),
                currency
            };
        }
    }
    
    return null;
}

/**
 * Extract promo codes from page links.
 * @param {Document} doc - DOM document
 * @returns {Array<string>} Array of promo code strings
 */
function extractPromoCodes(doc) {
    const codes = [];
    const links = doc.querySelectorAll('a[href*="store.pokemongo.com/offer-redemption"]');
    
    links.forEach(link => {
        const href = link.href || '';
        const match = /passcode=(\w+)/.exec(href);
        if (match && match[1]) {
            codes.push(match[1]);
        }
    });
    
    return codes;
}

// ============================================================================
// Egg Extraction
// ============================================================================

/**
 * Extract egg pool data organized by distance tier.
 * @param {Document} doc - DOM document
 * @returns {Promise<object>} Object with egg tiers as keys
 */
async function extractEggPools(doc) {
    const eggs = {
        '2km': [],
        '5km': [],
        '7km': [],
        '10km': [],
        '12km': [],
        'route': [],
        'adventure': []
    };
    
    const pageContent = doc.querySelector('.page-content');
    if (!pageContent) return eggs;
    
    let inEggSection = false;
    let currentTier = '5km';
    
    for (const node of pageContent.childNodes) {
        // Check if we're in the eggs section
        if (node.className?.includes('event-section-header')) {
            inEggSection = node.id === 'eggs';
        }
        
        if (!inEggSection) continue;
        
        // Detect tier from paragraph text
        if (node.tagName === 'P') {
            const text = node.textContent || '';
            if (text.includes('2 km') || text.includes('2km')) currentTier = '2km';
            else if (text.includes('5 km') || text.includes('5km')) currentTier = '5km';
            else if (text.includes('7 km') || text.includes('7km')) currentTier = '7km';
            else if (text.includes('10 km') || text.includes('10km')) currentTier = '10km';
            else if (text.includes('12 km') || text.includes('12km')) currentTier = '12km';
            else if (text.includes('Route') || text.includes('Mateo')) currentTier = 'route';
            else if (text.includes('Adventure Sync')) currentTier = 'adventure';
        }
        
        // Extract pokemon for current tier
        if (node.className === 'pkmn-list-flex') {
            const pokemon = await extractPokemonList(node);
            if (eggs[currentTier]) {
                eggs[currentTier].push(...pokemon);
            }
        }
    }
    
    return eggs;
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
    // File operations
    writeTempFile,
    handleScraperError,
    
    // Pokemon extraction
    extractPokemonList,
    
    // Section extraction
    getSectionHeaders,
    extractSection,
    extractTable,
    
    // Bonus extraction
    extractBonuses,
    
    // Raid extraction
    extractRaidInfo,
    
    // Research extraction
    extractResearchTasks,
    
    // Price/promo extraction
    extractPrice,
    extractPromoCodes,
    
    // Egg extraction
    extractEggPools
};
