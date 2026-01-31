/**
 * @fileoverview Shared utility functions for LeekDuck scrapers.
 * Provides standardized extraction methods, error handling, and file operations
 * used across all detailed event scrapers.
 * @module utils/scraperUtils
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { getMultipleImageDimensions, clearCache } = require('./imageDimensions');

/**
 * @typedef {Object} Pokemon
 * @property {string} name - Pokemon display name
 * @property {string} image - URL to Pokemon image
 * @property {boolean} canBeShiny - Whether this Pokemon can be shiny
 * @property {number} [imageWidth] - Image width in pixels
 * @property {number} [imageHeight] - Image height in pixels
 * @property {string} [imageType] - Image format type
 */

/**
 * @typedef {Object} Bonus
 * @property {string} text - Bonus description text
 * @property {string} image - URL to bonus icon image
 */

/**
 * @typedef {Object} SectionContent
 * @property {string[]} paragraphs - Paragraph text content
 * @property {string[][]} lists - Array of list item arrays
 * @property {Pokemon[]} pokemon - Extracted Pokemon data
 * @property {Object[]} tables - Extracted table data
 */

// ============================================================================
// Network Utilities
// ============================================================================

/**
 * Fetches content from a URL with a timeout and user-agent.
 * @param {string} url - URL to fetch
 * @param {number} [timeout=30000] - Timeout in milliseconds
 * @returns {Promise<string>} Response text
 */
async function fetchUrl(url, timeout = 30000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; ScrapedPoGo/1.0; +https://github.com/quantNebula/scrapedPoGo)'
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
        }
        return await response.text();
    } finally {
        clearTimeout(id);
    }
}

/**
 * Fetches JSON content from a URL.
 * @param {string} url - URL to fetch
 * @param {number} [timeout=30000] - Timeout in milliseconds
 * @returns {Promise<Object>} Parsed JSON object
 */
async function fetchJson(url, timeout = 30000) {
    const text = await fetchUrl(url, timeout);
    return JSON.parse(text);
}

/**
 * Fetches a URL and returns a JSDOM instance.
 * Replaces JSDOM.fromURL with a secure, timeout-enabled version.
 * @param {string} url - URL to fetch
 * @returns {Promise<JSDOM>} JSDOM instance
 */
async function getJSDOM(url) {
    const html = await fetchUrl(url);
    return new JSDOM(html, { url });
}

// ============================================================================
// File Operations
// ============================================================================

/**
 * Sanitizes a string to be safe for use in filenames.
 * Replaces any character that is not a letter, number, underscore, or hyphen with an underscore.
 *
 * @param {string} name - The string to sanitize
 * @returns {string} The sanitized string
 */
function sanitizeFilename(name) {
    if (!name) return '';
    return name.replace(/[^a-z0-9_\-]/gi, '_');
}

/**
 * Writes a temporary JSON file for scraped event data.
 * Files are written to data/temp/ directory and later combined by combinedetails.js.
 * 
 * @param {string} id - Event ID (URL slug)
 * @param {string} type - Event type identifier (e.g., 'community-day', 'raid-battles')
 * @param {Object} data - Scraped data object to serialize
 * @param {string} [suffix=''] - Optional filename suffix (e.g., '_generic', '_codes')
 * @returns {void}
 * 
 * @example
 * writeTempFile('january-community-day', 'community-day', { spawns: [...] });
 * // Creates: data/temp/january-community-day.json
 * 
 * writeTempFile('event-id', 'promo-codes', ['CODE1', 'CODE2'], '_codes');
 * // Creates: data/temp/event-id_codes.json
 */
function writeTempFile(id, type, data, suffix = '') {
    const safeId = sanitizeFilename(id);
    const safeSuffix = sanitizeFilename(suffix);
    const filename = path.join('data/temp', `${safeId}${safeSuffix}.json`);
    const content = JSON.stringify({ id, type, data });
    
    fs.writeFile(filename, content, err => {
        if (err) {
            console.error(`Error writing ${filename}:`, err);
        }
    });
}

/**
 * Centralized error handler for scrapers with fallback to backup data.
 * When scraping fails, searches backup data for previously scraped content
 * and writes it to maintain data availability.
 * 
 * @param {Error} err - The error that occurred during scraping
 * @param {string} id - Event ID (URL slug)
 * @param {string} type - Event type for the output file
 * @param {Object[]} bkp - Backup data array from events_min.json (CDN fallback)
 * @param {string} scraperKey - Key to look up in extraData (e.g., 'communityday', 'raidbattles')
 * @returns {void}
 * 
 * @example
 * try {
 *   // scraping code
 * } catch (err) {
 *   handleScraperError(err, 'event-id', 'community-day', backupData, 'communityday');
 * }
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
 * Extracts a list of Pokemon from a .pkmn-list-flex container element.
 * Parses name, image, shiny status, and optionally fetches image dimensions.
 * 
 * @async
 * @param {Element} container - DOM element containing .pkmn-list-item elements
 * @param {Object} [options] - Extraction options
 * @param {boolean} [options.fetchDimensions=true] - Whether to fetch image dimensions from URLs
 * @returns {Promise<Pokemon[]>} Array of Pokemon objects
 * 
 * @example
 * const pokemonList = doc.querySelector('.pkmn-list-flex');
 * const pokemon = await extractPokemonList(pokemonList);
 * // Returns: [{ name: 'Pikachu', image: '...', canBeShiny: true, ... }, ...]
 */
async function extractPokemonList(container, options = {}) {
    const { fetchDimensions = true } = options;
    
    if (!container) return [];
    
    const pokemon = [];
    const items = container.querySelectorAll(':scope > .pkmn-list-item');
    
    // First pass: extract all Pokemon data
    items.forEach(item => {
        const poke = {};
        
        // Name
        const nameEl = item.querySelector(':scope > .pkmn-name');
        poke.name = nameEl ? nameEl.innerHTML.trim() : '';
        
        // Image
        const imgEl = item.querySelector(':scope > .pkmn-list-img > img');
        if (imgEl) {
            poke.image = imgEl.src || '';
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
    
    // Second pass: fetch dimensions for all images
    if (fetchDimensions && pokemon.length > 0) {
        const imageUrls = pokemon.map(p => p.image).filter(Boolean);
        
        if (imageUrls.length > 0) {
            const dimensionsMap = await getMultipleImageDimensions(imageUrls);
            
            // Assign dimensions back to Pokemon objects
            pokemon.forEach(poke => {
                if (poke.image && dimensionsMap.has(poke.image)) {
                    const dims = dimensionsMap.get(poke.image);
                    poke.imageWidth = dims.width;
                    poke.imageHeight = dims.height;
                    poke.imageType = dims.type;
                }
            });
        }
    }
    
    return pokemon;
}

// ============================================================================
// Section Extraction
// ============================================================================

/**
 * Gets all section header IDs from a page document.
 * Finds event-section-header elements and h2/h3 elements with IDs.
 * 
 * @param {Document} doc - DOM document to search
 * @returns {string[]} Array of section ID strings
 * 
 * @example
 * const sections = getSectionHeaders(doc);
 * // Returns: ['spawns', 'bonuses', 'shiny', 'raids', ...]
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
 * Extracts content from a specific section by header ID.
 * Walks through sibling elements until the next section header,
 * collecting paragraphs, lists, pokemon, and tables.
 * 
 * @async
 * @param {Document} doc - DOM document
 * @param {string} sectionId - Section header ID to extract from
 * @returns {Promise<SectionContent>} Object with paragraphs, lists, pokemon, tables arrays
 * 
 * @example
 * const spawnSection = await extractSection(doc, 'spawns');
 * console.log(spawnSection.pokemon); // Array of Pokemon in spawns section
 * console.log(spawnSection.paragraphs); // Text descriptions
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
        
        // Pokemon lists (skip dimension fetching for performance)
        if (sibling.className === 'pkmn-list-flex') {
            const pokemon = await extractPokemonList(sibling, { fetchDimensions: false });
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
 * Extracts data from a table element into structured format.
 * Parses header row and body rows into separate arrays.
 * 
 * @param {Element} table - Table DOM element
 * @returns {{headers: string[], rows: string[][]}} Object with headers and rows arrays
 * 
 * @example
 * const tableData = extractTable(tableElement);
 * // Returns: { headers: ['Pokemon', 'CP Range'], rows: [['Pikachu', '200-400'], ...] }
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
 * Extracts bonus items from a page's .bonus-list section.
 * Also extracts disclaimer paragraphs if any bonus has an asterisk.
 * 
 * @async
 * @param {Document} doc - DOM document
 * @returns {Promise<{bonuses: Bonus[], disclaimers: string[]}>} Bonuses and their disclaimers
 * 
 * @example
 * const { bonuses, disclaimers } = await extractBonuses(doc);
 * // bonuses: [{ text: '2× Catch XP', image: '...' }, ...]
 * // disclaimers: ['*Bonus only available in certain regions']
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
 * Extracts raid information from a page including boss tiers.
 * Categorizes Pokemon lists by their section headers into appropriate tiers.
 * 
 * @async
 * @param {Document} doc - DOM document
 * @returns {Promise<{tiers: {mega: Pokemon[], fiveStar: Pokemon[], threeStar: Pokemon[], oneStar: Pokemon[]}, bosses: Pokemon[], shinies: Pokemon[]}>} Raid data organized by tier
 * 
 * @example
 * const raidInfo = await extractRaidInfo(doc);
 * console.log(raidInfo.tiers.fiveStar); // 5-star raid bosses
 * console.log(raidInfo.tiers.mega); // Mega raid bosses
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
    let lastHeaderText = '';
    
    const tasks = [];

    for (const node of pageContent.childNodes) {
        if (node.className?.includes('event-section-header')) {
            lastHeader = node.id || '';
            lastHeaderText = node.textContent?.toLowerCase() || '';
        }
        
        if (node.className === 'pkmn-list-flex') {
            const headerLower = lastHeader.toLowerCase();
            const textLower = lastHeaderText;

            tasks.push(
                extractPokemonList(node).then(pokemon => ({
                    pokemon,
                    headerLower,
                    textLower
                }))
            );
        }
    }

    const results = await Promise.all(tasks);

    for (const { pokemon, headerLower, textLower } of results) {
        if (headerLower.includes('mega') || textLower.includes('mega')) {
            result.tiers.mega.push(...pokemon);
        } else if (headerLower.includes('5-star') || headerLower.includes('five-star') ||
                   textLower.includes('5-star') || textLower.includes('five-star') ||
                   headerLower.includes('legendary') || textLower.includes('legendary')) {
            result.tiers.fiveStar.push(...pokemon);
        } else if (headerLower.includes('3-star') || headerLower.includes('three-star') ||
                   textLower.includes('3-star') || textLower.includes('three-star')) {
            result.tiers.threeStar.push(...pokemon);
        } else if (headerLower.includes('1-star') || headerLower.includes('one-star') ||
                   textLower.includes('1-star') || textLower.includes('one-star')) {
            result.tiers.oneStar.push(...pokemon);
        } else if (headerLower.includes('raids') || headerLower.includes('boss') ||
                   textLower.includes('raids') || textLower.includes('appearing in')) {
            result.bosses.push(...pokemon);
        } else if (headerLower.includes('shiny') || textLower.includes('shiny')) {
            result.shinies.push(...pokemon);
        }
    }
    
    return result;
}

// ============================================================================
// Research Extraction
// ============================================================================

/**
 * Extracts research tasks from a page.
 * Handles Special Research with multi-step format and simpler Field Research.
 * 
 * @async
 * @param {Document} doc - DOM document
 * @param {string} [researchType='special'] - Type: 'special', 'timed', 'masterwork', 'field'
 * @returns {Promise<{tasks: Object[], steps: Object[], rewards: string[]}>} Research data
 * 
 * @example
 * const research = await extractResearchTasks(doc, 'special');
 * // For special research with steps:
 * // research.steps = [{ name: 'Step 1', step: 1, tasks: [...], rewards: [...] }, ...]
 * 
 * // For field research:
 * // research.tasks = [{ task: 'Catch 5 Pokemon', reward: 'Pikachu encounter' }, ...]
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
 * Extracts price information from text content.
 * Supports USD ($), EUR (€), and GBP (£) formats.
 * 
 * @param {string} text - Text that may contain price information
 * @returns {{price: number, amount: number, currency: string}|null} Price object or null if not found
 * 
 * @example
 * extractPrice('Get access for US$4.99!'); // { price: 4.99, amount: 4.99, currency: 'USD' }
 * extractPrice('Only €2.99'); // { price: 2.99, amount: 2.99, currency: 'EUR' }
 * extractPrice('No price here'); // null
 */
function extractPrice(text) {
    if (!text) return null;
    
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
            
            const value = parseFloat(match[1]);
            return {
                price: value,
                amount: value, // Alias for backwards compatibility
                currency
            };
        }
    }
    
    return null;
}

/**
 * Extracts promo codes from page links.
 * Finds links to Pokemon GO Web Store offer redemption and extracts passcodes.
 * 
 * @param {Document} doc - DOM document
 * @returns {string[]} Array of promo code strings
 * 
 * @example
 * const codes = extractPromoCodes(doc);
 * // Returns: ['PROMOCODE1', 'ANOTHERCODE', ...]
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
 * Extracts egg pool data organized by distance tier.
 * Parses the eggs section and categorizes Pokemon by egg distance.
 * 
 * @async
 * @param {Document} doc - DOM document
 * @returns {Promise<{[key: string]: Pokemon[]}>} Eggs organized by distance tier keys
 * 
 * @example
 * const eggs = await extractEggPools(doc);
 * // Returns: { '2km': [...], '5km': [...], '10km': [...], 'adventure': [...] }
 */
async function extractEggPools(doc) {
    const eggs = {
        '1km': [],
        '2km': [],
        '5km': [],
        '7km': [],
        '10km': [],
        '12km': [],
        'route': [],
        'adventure5km': [],
        'adventure10km': []
    };
    
    const pageContent = doc.querySelector('.page-content, article');
    if (!pageContent) return eggs;
    
    let inEggSection = false;
    let currentTier = '5km';
    
    // Get all relevant elements including h3 headers
    const elements = pageContent.querySelectorAll('h2[id], h3, p, .pkmn-list-flex');
    
    for (const node of elements) {
        // Check if we're entering/exiting the eggs section via h2
        if (node.tagName === 'H2' && node.id) {
            inEggSection = node.id === 'eggs';
            continue;
        }
        
        if (!inEggSection) continue;
        
        // Detect tier from h3 headers (primary source)
        if (node.tagName === 'H3') {
            const text = node.textContent?.toLowerCase() || '';
            
            // Check for Adventure Sync first (before general km checks)
            if (text.includes('adventure sync')) {
                if (text.includes('10')) currentTier = 'adventure10km';
                else if (text.includes('5')) currentTier = 'adventure5km';
                else currentTier = 'adventure5km'; // Default adventure
            }
            // Check for Route eggs
            else if (text.includes('route')) {
                currentTier = 'route';
            }
            // Standard km tiers
            else if (text.includes('1 km') || text.includes('1km')) currentTier = '1km';
            else if (text.includes('2 km') || text.includes('2km')) currentTier = '2km';
            else if (text.includes('5 km') || text.includes('5km')) currentTier = '5km';
            else if (text.includes('7 km') || text.includes('7km')) currentTier = '7km';
            else if (text.includes('10 km') || text.includes('10km')) currentTier = '10km';
            else if (text.includes('12 km') || text.includes('12km')) currentTier = '12km';
            continue;
        }
        
        // Also detect tier from paragraph text (fallback)
        if (node.tagName === 'P') {
            const text = node.textContent?.toLowerCase() || '';
            if (text.includes('adventure sync')) {
                if (text.includes('10')) currentTier = 'adventure10km';
                else if (text.includes('5')) currentTier = 'adventure5km';
            }
            else if (text.includes('route') || text.includes('mateo')) currentTier = 'route';
            else if (text.includes('1 km') || text.includes('1km')) currentTier = '1km';
            else if (text.includes('2 km') || text.includes('2km')) currentTier = '2km';
            else if (text.includes('5 km') || text.includes('5km')) currentTier = '5km';
            else if (text.includes('7 km') || text.includes('7km')) currentTier = '7km';
            else if (text.includes('10 km') || text.includes('10km')) currentTier = '10km';
            else if (text.includes('12 km') || text.includes('12km')) currentTier = '12km';
        }
        
        // Extract pokemon for current tier (skip dimension fetching for performance)
        if (node.className === 'pkmn-list-flex') {
            const pokemon = await extractPokemonList(node, { fetchDimensions: false });
            if (eggs[currentTier]) {
                eggs[currentTier].push(...pokemon);
            }
        }
    }
    
    return eggs;
}

// ============================================================================
// Date Handling
// ============================================================================

/**
 * Normalizes a date string to ISO 8601 format.
 * 
 * LeekDuck provides dates in three formats:
 * 1. Local time (no offset): "2022-06-01T18:00:00.000" - for events based on user's local timezone
 * 2. With timezone offset: "2022-06-01T13:00:00.000-0800" - for global events (converted to UTC)
 * 3. UTC (Z suffix): "2022-06-01T21:00:00.000Z" - already in UTC
 * 
 * This function:
 * - Preserves local time strings (no modification needed)
 * - Converts timezone offset strings to UTC with Z suffix
 * - Passes through UTC strings unchanged
 * 
 * @param {string|null} dateStr - Date string from LeekDuck feed
 * @returns {string|null} Normalized ISO 8601 date string, or null if input is null/undefined
 * 
 * @example
 * normalizeDate("2022-06-01T18:00:00.000")         // "2022-06-01T18:00:00.000" (local, unchanged)
 * normalizeDate("2022-06-01T13:00:00.000-0800")    // "2022-06-01T21:00:00.000Z" (converted to UTC)
 * normalizeDate("2022-06-01T21:00:00.000Z")        // "2022-06-01T21:00:00.000Z" (UTC, unchanged)
 * normalizeDate(null)                               // null
 */
function normalizeDate(dateStr) {
    if (!dateStr) return null;
    
    // Standard local time format is 24 characters: "2022-06-01T18:00:00.000"
    // Dates with timezone offsets are longer (e.g., "2022-06-01T13:00:00.000-0800" = 29 chars)
    // UTC dates end with Z and are 25 characters: "2022-06-01T18:00:00.000Z"
    const LOCAL_DATE_LENGTH = 24;
    
    if (dateStr.length <= LOCAL_DATE_LENGTH) {
        // Local time format - return as-is
        return dateStr;
    }
    
    if (dateStr.endsWith('Z')) {
        // Already UTC - return as-is
        return dateStr;
    }
    
    // Has timezone offset - convert to UTC
    try {
        return new Date(Date.parse(dateStr)).toISOString();
    } catch (e) {
        console.warn(`Failed to parse date: ${dateStr}`);
        return dateStr;
    }
}

/**
 * Checks if a date string represents a global (UTC) event.
 * Global events have the "Z" suffix and occur at the same moment worldwide.
 * Local events occur at the stated time in each user's local timezone.
 * 
 * @param {string|null} dateStr - Normalized ISO 8601 date string
 * @returns {boolean} True if date is UTC/global, false if local or null
 * 
 * @example
 * isGlobalEvent("2022-06-01T21:00:00.000Z")  // true (global)
 * isGlobalEvent("2022-06-01T18:00:00.000")   // false (local)
 * isGlobalEvent(null)                         // false
 */
function isGlobalEvent(dateStr) {
    return dateStr ? dateStr.endsWith('Z') : false;
}

/**
 * Normalizes both start and end dates for an event object.
 * Convenience wrapper around normalizeDate for event processing.
 * 
 * @param {string|null} start - Start date string
 * @param {string|null} end - End date string
 * @returns {{start: string|null, end: string|null}} Object with normalized dates
 * 
 * @example
 * const { start, end } = normalizeDatePair(
 *     "2022-06-01T13:00:00.000-0800",
 *     "2022-06-08T13:00:00.000-0800"
 * );
 * // start = "2022-06-01T21:00:00.000Z", end = "2022-06-08T21:00:00.000Z"
 */
function normalizeDatePair(start, end) {
    return {
        start: normalizeDate(start),
        end: normalizeDate(end)
    };
}

// ============================================================================
// Text Parsing Utilities
// ============================================================================

/**
 * @deprecated Use extractPrice instead (returns same shape with both 'price' and 'amount' fields)
 */
const parsePriceFromText = extractPrice;

/**
 * Parses bonus multiplier information from text.
 * @internal Currently unused - available for future scrapers
 * 
 * @param {string} text - Bonus text (e.g., "2× Catch XP", "3x Stardust")
 * @returns {{multiplier: number, bonusType: string}|null} Parsed bonus or null
 * 
 * @example
 * parseBonusMultiplier("2× Catch XP")
 * // Returns: { multiplier: 2, bonusType: "Catch XP" }
 */
function parseBonusMultiplier(text) {
    if (!text) return null;
    
    // Match patterns like "2×", "2x", "2X", "1/2" (half)
    const match = text.match(/(\d+(?:\.\d+)?)\s*[×xX]\s+(.+)/i);
    if (match) {
        return { 
            multiplier: parseFloat(match[1]), 
            bonusType: match[2].trim() 
        };
    }
    
    // Match fraction patterns like "1/2 hatch distance"
    const fractionMatch = text.match(/(\d+)\/(\d+)\s+(.+)/);
    if (fractionMatch) {
        return {
            multiplier: parseInt(fractionMatch[1]) / parseInt(fractionMatch[2]),
            bonusType: fractionMatch[3].trim()
        };
    }
    
    return null;
}

/**
 * Parses GO Battle League cup names from text.
 * 
 * @param {string} text - Text mentioning GBL cups (e.g., "compete in Holiday Cup, Sunshine Cup, and Love Cup")
 * @returns {string[]} Array of cup names found
 * 
 * @example
 * parseGBLCups("Holiday Cup, Sunshine Cup, Love Cup, and more!")
 * // Returns: ["Holiday Cup", "Sunshine Cup", "Love Cup"]
 */
function parseGBLCups(text) {
    if (!text) return [];
    
    // Known GBL cup names - case insensitive matching
    const knownCups = [
        'Great League', 'Ultra League', 'Master League',
        'Holiday Cup', 'Sunshine Cup', 'Love Cup', 'Little Cup',
        'Premier Cup', 'Remix Cup', 'Fantasy Cup', 'Retro Cup',
        'Kanto Cup', 'Johto Cup', 'Hoenn Cup', 'Sinnoh Cup', 'Unova Cup', 'Kalos Cup',
        'Catch Cup', 'Element Cup', 'Summer Cup', 'Halloween Cup',
        'Flying Cup', 'Fighting Cup', 'Psychic Cup', 'Electric Cup',
        'Little Jungle Cup', 'Color Cup', 'Weather Cup', 'Fossil Cup',
        'Willpower Cup', 'Hisui Cup', 'Evolution Cup', 'Swimsuit Cup'
    ];
    
    const results = [];
    const textLower = text.toLowerCase();
    
    for (const cup of knownCups) {
        if (textLower.includes(cup.toLowerCase())) {
            results.push(cup);
        }
    }
    
    // Also try to catch any "X Cup" we might have missed
    const cupPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+Cup\b/g;
    const matches = [...text.matchAll(cupPattern)];
    
    for (const m of matches) {
        const cupName = m[1].trim() + ' Cup';
        if (!results.includes(cupName)) {
            results.push(cupName);
        }
    }
    
    return results;
}

/**
 * Parses Pokemon names from paragraph text.
 * Handles comma-separated lists and modifiers like "Dynamax", "Gigantamax", "wearing X attire".
 * 
 * @param {string} text - Paragraph text containing Pokemon names
 * @returns {{name: string, modifier?: string}[]} Array of Pokemon with optional modifiers
 * 
 * @example
 * parsePokemonFromText("Dynamax Hitmonlee, Dynamax Hitmonchan, Gigantamax Meowth, and more")
 * // Returns: [
 * //   { name: "Hitmonlee", modifier: "Dynamax" },
 * //   { name: "Hitmonchan", modifier: "Dynamax" },
 * //   { name: "Meowth", modifier: "Gigantamax" }
 * // ]
 */
function parsePokemonFromText(text) {
    if (!text) return [];
    
    const results = [];
    
    // Split on commas and "and"
    const segments = text.split(/,\s*|\s+and\s+/i);
    
    for (const segment of segments) {
        const trimmed = segment.trim();
        
        // Skip common filler phrases
        if (/^(more|others?|many|various|etc)\.?!?$/i.test(trimmed)) continue;
        
        // Check for modifiers
        const dynamaxMatch = trimmed.match(/^Dynamax\s+(.+)/i);
        if (dynamaxMatch) {
            results.push({ name: dynamaxMatch[1].trim(), modifier: 'Dynamax' });
            continue;
        }
        
        const gigantamaxMatch = trimmed.match(/^Gigantamax\s+(.+)/i);
        if (gigantamaxMatch) {
            results.push({ name: gigantamaxMatch[1].trim(), modifier: 'Gigantamax' });
            continue;
        }
        
        const costumeMatch = trimmed.match(/^(.+?)\s+wearing\s+(.+)/i);
        if (costumeMatch) {
            results.push({ 
                name: costumeMatch[1].trim(), 
                modifier: 'costume',
                costume: costumeMatch[2].trim()
            });
            continue;
        }
        
        const shadowMatch = trimmed.match(/^Shadow\s+(.+)/i);
        if (shadowMatch) {
            results.push({ name: shadowMatch[1].trim(), modifier: 'Shadow' });
            continue;
        }
        
        // Check if it looks like a Pokemon name (capitalized word, possibly with form)
        const pokemonNamePattern = /^([A-Z][a-z]+(?:\s+\([^)]+\))?)/;
        const nameMatch = trimmed.match(pokemonNamePattern);
        if (nameMatch) {
            results.push({ name: nameMatch[1].trim() });
        }
    }
    
    return results;
}

/**
 * Parses a deadline date from text.
 * @internal Currently unused - available for future scrapers
 * 
 * @param {string} text - Text containing deadline (e.g., "must be claimed before February 8, 2026 at 8 pm local time")
 * @returns {{date: string, isLocal: boolean}|null} Parsed date info or null
 * 
 * @example
 * parseDeadlineFromText("before February 8, 2026 at 8 pm local time")
 * // Returns: { date: "2026-02-08T20:00:00.000", isLocal: true }
 */
function parseDeadlineFromText(text) {
    if (!text) return null;
    
    // Match patterns like "February 8, 2026 at 8 pm"
    const datePattern = /(?:before|until|by)\s+(\w+\s+\d{1,2},?\s+\d{4})\s+(?:at\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i;
    const match = text.match(datePattern);
    
    if (match) {
        const dateStr = match[1];
        const timeStr = match[2];
        const isLocal = text.toLowerCase().includes('local');
        
        try {
            // Parse the date
            const parsedDate = new Date(`${dateStr} ${timeStr}`);
            if (!isNaN(parsedDate.getTime())) {
                // Format as ISO string without timezone for local, with Z for global
                const isoStr = parsedDate.toISOString();
                return {
                    date: isLocal ? isoStr.replace('Z', '').slice(0, 23) : isoStr,
                    isLocal
                };
            }
        } catch (e) {
            // Parsing failed
        }
    }
    
    return null;
}

/**
 * Extracts structured GO Pass tier information from a document.
 * Parses the tiered bonus structure with rank requirements.
 * 
 * @param {Document} doc - DOM document
 * @returns {{standard: Object[], deluxe: Object[]}} GO Pass tier structure
 */
function extractGoPassTiers(doc) {
    const result = {
        standard: [],
        deluxe: []
    };
    
    const pageContent = doc.querySelector('.page-content, article');
    if (!pageContent) return result;
    
    let currentSection = null;  // 'standard' or 'deluxe'
    let currentTier = null;
    let inGoPassSection = false;
    
    const elements = pageContent.querySelectorAll('h2[id], h3, p, ul');
    
    for (const el of elements) {
        const text = el.textContent || '';
        
        // Track if we're in the GO Pass section
        if (el.tagName === 'H2' && el.id) {
            inGoPassSection = el.id.includes('pass') || el.id.includes('milestone');
            if (!inGoPassSection) {
                // Left GO Pass section, stop processing
                currentSection = null;
                currentTier = null;
            }
            continue;
        }
        
        // Detect section headers
        if (el.tagName === 'H3') {
            if (text.includes('Major Milestone') || text.includes('GO Pass Bonuses') || text.includes('GO Pass')) {
                currentSection = 'standard';
                inGoPassSection = true;
            } else if (text.includes('Deluxe')) {
                currentSection = 'deluxe';
            } else if (!text.includes('Tier')) {
                // Hit another section, reset
                if (inGoPassSection && !text.toLowerCase().includes('pass')) {
                    currentSection = null;
                    currentTier = null;
                }
            }
            continue;
        }
        
        if (!currentSection) continue;
        
        // Detect tier info in paragraphs
        if (el.tagName === 'P') {
            const tierMatch = text.match(/Tier\s+(\d+)\s*\((?:Rank\s+)?(\d+)\)/i);
            if (tierMatch) {
                currentTier = {
                    tier: parseInt(tierMatch[1]),
                    rank: parseInt(tierMatch[2]),
                    bonuses: []
                };
                result[currentSection].push(currentTier);
            }
        }
        
        // Extract bonuses from lists - only if they look like bonuses, not Pokemon
        if (el.tagName === 'UL' && currentTier) {
            const items = el.querySelectorAll('li');
            items.forEach(li => {
                const bonusText = li.textContent?.trim();
                // Skip if it looks like a Pokemon name (single word, starts with capital)
                // Bonuses typically have longer text with descriptive phrases
                if (bonusText && bonusText.length > 15 && (
                    bonusText.includes('Gifts') ||
                    bonusText.includes('duration') ||
                    bonusText.includes('rewards') ||
                    bonusText.includes('×') ||
                    bonusText.includes('bonus') ||
                    bonusText.includes('XP') ||
                    bonusText.includes('Stardust') ||
                    bonusText.includes('damage')
                )) {
                    currentTier.bonuses.push(bonusText);
                }
            });
        }
    }
    
    return result;
}

// ============================================================================
// Event Deduplication
// ============================================================================

/**
 * Deduplicates events by merging entries with the same eventID.
 * Uses an O(N) approach with a Map to handle large datasets efficiently.
 *
 * @param {Array<Object>} events - Array of event objects
 * @returns {Array<Object>} Deduplicated array of events
 */
function deduplicateEvents(events) {
    const eventsByID = new Map();
    events.forEach(e => {
        if (!eventsByID.has(e.eventID)) {
            eventsByID.set(e.eventID, []);
        }
        eventsByID.get(e.eventID).push(e);
    });

    const deduplicatedEvents = [];

    for (const duplicates of eventsByID.values()) {
        if (duplicates.length > 1) {
            const mergedEvent = duplicates[0]; // Use the first occurrence

            if (duplicates[0].start)
            {
                mergedEvent.start = duplicates[0].start;
                mergedEvent.end = duplicates[1].end;
            }
            else
            {
                mergedEvent.start = duplicates[1].start;
                mergedEvent.end = duplicates[0].end;
            }

            deduplicatedEvents.push(mergedEvent);
        } else {
            deduplicatedEvents.push(duplicates[0]);
        }
    }

    return deduplicatedEvents;
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
    // Network utilities
    fetchUrl,
    fetchJson,
    getJSDOM,
    
    // File operations
    writeTempFile,
    sanitizeFilename,
    handleScraperError,
    
    // Pokemon extraction
    extractPokemonList,
    
    // Image dimension cache management
    clearImageDimensionCache: clearCache,
    
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
    extractEggPools,
    
    // Date handling
    normalizeDate,
    normalizeDatePair,
    isGlobalEvent,
    
    // Text parsing utilities
    parsePriceFromText,
    parseBonusMultiplier,
    parseGBLCups,
    parsePokemonFromText,
    parseDeadlineFromText,
    extractGoPassTiers,

    // Event processing
    deduplicateEvents
};
