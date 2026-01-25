/**
 * @fileoverview GO Pass event scraper.
 * Extracts GO Pass season information including rank-by-rank rewards,
 * point tasks, milestone bonuses, featured Pokemon, and pricing tiers.
 * @module pages/detailed/gopass
 */

const { JSDOM } = require('jsdom');
const { 
    writeTempFile, 
    handleScraperError, 
    extractSection, 
    getSectionHeaders, 
    extractPokemonList,
    extractPrice
} = require('../../utils/scraperUtils');

/**
 * Scrapes GO Pass event data from LeekDuck.
 * Extracts comprehensive GO Pass information including rank-by-rank rewards,
 * point tasks with their values, featured Pokemon encounters,
 * and milestone bonuses with pricing information.
 * 
 * @async
 * @function get
 * @param {string} url - Full URL to the event page
 * @param {string} id - Event ID (URL slug)
 * @param {Object[]} bkp - Backup data array for fallback on scraping failure
 * @returns {Promise<void>} Writes temp file on success
 * @throws {Error} Falls back to backup data on failure
 * 
 * @example
 * await get('https://leekduck.com/events/go-pass-january-2026/', 'go-pass-january-2026', backupData);
 */
async function get(url, id, bkp) {
    try {
        const dom = await JSDOM.fromURL(url, {});
        const doc = dom.window.document;
        
        const goPassData = {
            description: '',
            pricing: {
                deluxe: null,
                deluxePlus: null
            },
            ranks: [],
            pointTasks: {
                daily: [],
                weekly: [],
                bonus: []
            },
            featuredPokemon: [],
            milestoneBonuses: {
                free: [],
                deluxe: []
            }
        };

        // Extract pricing from paragraphs
        const allParagraphs = doc.querySelectorAll('p');
        allParagraphs.forEach(p => {
            const text = p.textContent;
            if (text.includes('US$') && text.includes('Deluxe')) {
                const priceInfo = extractPrice(text);
                if (priceInfo) {
                    if (text.includes('10 Ranks') || text.includes('+')) {
                        goPassData.pricing.deluxePlus = priceInfo.price;
                    } else if (!goPassData.pricing.deluxe) {
                        goPassData.pricing.deluxe = priceInfo.price;
                    }
                }
            }
            // Description
            if (text.includes('GO Pass') && text.includes('rank up') && !goPassData.description) {
                goPassData.description = text;
            }
        });

        // Extract point tasks
        const sections = getSectionHeaders(doc);
        for (const sectionId of sections) {
            if (sectionId === 'go-pass') {
                const sectionContent = await extractSection(doc, sectionId);
                sectionContent.lists.forEach(list => {
                    list.forEach(item => {
                        const ptsMatch = item.match(/(.+?)\s*-\s*(\d+)\s*PTS/i);
                        if (ptsMatch) {
                            const task = {
                                task: ptsMatch[1].trim(),
                                points: parseInt(ptsMatch[2])
                            };
                            // Categorize tasks
                            if (item.toLowerCase().includes('daily')) {
                                goPassData.pointTasks.daily.push(task);
                            } else if (item.toLowerCase().includes('weekly') || 
                                      sectionContent.paragraphs.some(p => p.toLowerCase().includes('weekly'))) {
                                goPassData.pointTasks.weekly.push(task);
                            } else {
                                goPassData.pointTasks.bonus.push(task);
                            }
                        }
                    });
                });
            }

            // Featured Pokemon
            if (sectionId.includes('featured') && sectionId.includes('pokemon')) {
                const sectionContent = await extractSection(doc, sectionId);
                goPassData.featuredPokemon = sectionContent.pokemon;
            }

            // Milestone bonuses
            if (sectionId.includes('milestone')) {
                const sectionContent = await extractSection(doc, sectionId);
                let currentTier = '';
                let isDeluxe = false;
                
                sectionContent.paragraphs.forEach(p => {
                    const tierMatch = p.match(/Tier\s*(\d+)\s*[–-]\s*Rank\s*(\d+)/i);
                    if (tierMatch) {
                        currentTier = `Tier ${tierMatch[1]} - Rank ${tierMatch[2]}`;
                    }
                    if (p.toLowerCase().includes('deluxe')) {
                        isDeluxe = true;
                    }
                });
                
                sectionContent.lists.forEach(list => {
                    list.forEach(item => {
                        const bonus = {
                            tier: currentTier,
                            bonus: item
                        };
                        if (isDeluxe) {
                            goPassData.milestoneBonuses.deluxe.push(bonus);
                        } else {
                            goPassData.milestoneBonuses.free.push(bonus);
                        }
                    });
                });
            }
        }

        // Extract rank rewards from the reward table
        const rewardTable = doc.querySelector('.gopass-ranks, .pass-rewards');
        if (rewardTable) {
            const ranks = rewardTable.querySelectorAll('.rank-row, [class*="rank"]');
            ranks.forEach(rankRow => {
                const rankText = rankRow.textContent;
                const rankMatch = rankText.match(/RANK\s*(\d+)/i);
                if (rankMatch) {
                    const rank = parseInt(rankMatch[1]);
                    const rewards = {
                        rank: rank,
                        free: [],
                        deluxe: []
                    };
                    
                    // Extract reward items from the rank row
                    const rewardItems = rankRow.querySelectorAll('img, .reward-label');
                    rewardItems.forEach(item => {
                        const rewardText = item.textContent || item.alt || item.title;
                        if (rewardText) {
                            // Determine if free or deluxe based on column position
                            // This is a simplified heuristic
                            rewards.free.push(rewardText.trim());
                        }
                    });
                    
                    if (rewards.free.length > 0 || rewards.deluxe.length > 0) {
                        goPassData.ranks.push(rewards);
                    }
                }
            });
        }

        if (goPassData.pointTasks.daily.length > 0 || 
            goPassData.pricing.deluxe || 
            goPassData.featuredPokemon.length > 0 ||
            goPassData.ranks.length > 0) {
            writeTempFile(id, 'go-pass', goPassData);
        }
    } catch (err) {
        handleScraperError(err, id, 'go-pass', bkp, 'gopass');
    }
}

module.exports = { get };
