const fs = require('fs');
const jsd = require('jsdom');
const { JSDOM } = jsd;
const https = require('https');
const { loadShinyData, extractDexNumber, hasShiny } = require('../utils/shinyData');

/**
 * Determines event status for a raid boss by checking events data
 * @param {string} bossName - Name of the raid boss
 * @param {boolean} isShadowRaid - Whether this is a shadow raid
 * @returns {string} - "ongoing", "upcoming", "inactive", or "unknown"
 */
function determineEventStatus(bossName, isShadowRaid) {
    try {
        // Try to load events data
        if (!fs.existsSync('data/events.min.json')) {
            return 'unknown';
        }
        
        const eventsData = JSON.parse(fs.readFileSync('data/events.min.json', 'utf8'));
        const now = new Date();
        
        // Look for raid-related events that match this boss
        for (const event of eventsData) {
            // Check if event is raid-related
            if (!['raid-battles', 'raid-hour', 'raid-day'].includes(event.eventType)) {
                continue;
            }
            
            // Check if event mentions this boss
            const eventNameLower = event.name.toLowerCase();
            const bossNameLower = bossName.toLowerCase();
            
            // Special handling for forms (e.g., "Thundurus" matches "Thundurus (Incarnate)")
            const bossBaseName = bossNameLower.split('(')[0].trim();
            
            if (eventNameLower.includes(bossBaseName)) {
                const startDate = event.start ? new Date(event.start) : null;
                const endDate = event.end ? new Date(event.end) : null;
                
                // Determine status based on dates
                if (startDate && endDate) {
                    if (now >= startDate && now <= endDate) {
                        return 'ongoing';
                    } else if (now < startDate) {
                        return 'upcoming';
                    } else if (now > endDate) {
                        return 'inactive';
                    }
                }
            }
        }
        
        // If no matching event found, return unknown
        return 'unknown';
    } catch (error) {
        console.error('Error determining event status:', error.message);
        return 'unknown';
    }
}

/**
 * Parses form from Pokemon name (e.g., "Giratina (Origin Forme)" -> "Origin Forme")
 * @param {string} name 
 * @returns {string|null}
 */
function parseForm(name) {
    const match = name.match(/\(([^)]+)\)/);
    return match ? match[1] : null;
}

/**
 * Parses gender from Pokemon name
 * @param {string} name 
 * @returns {"male"|"female"|null}
 */
function parseGender(name) {
    if (name.includes('♂')) return 'male';
    if (name.includes('♀')) return 'female';
    return null;
}

/**
 * Cleans Pokemon name by removing form/gender suffixes
 * @param {string} name 
 * @returns {string}
 */
function cleanName(name) {
    return name
        .replace(/\s*\([^)]+\)\s*/g, '')  // Remove parenthetical forms
        .replace(/\s*[♂♀]\s*/g, '')       // Remove gender symbols
        .trim();
}

function get() {
    return new Promise(resolve => {
        JSDOM.fromURL("https://leekduck.com/raid-bosses/", {
        })
            .then((dom) => {

                let bosses = [];
                
                // Load shiny data for cross-referencing
                const shinyMap = loadShinyData();
                
                const raidBosses = dom.window.document.querySelectorAll('.raid-bosses, .shadow-raid-bosses');

                raidBosses.forEach(raidBossContainer => {
                    // Determine if this is a shadow raid container
                    const isShadowRaid = raidBossContainer.classList.contains('shadow-raid-bosses');
                    
                    const tiers = raidBossContainer.querySelectorAll('.tier');

                    tiers.forEach(tierDiv => {
                        const tierHeader = tierDiv.querySelector('h2.header');
                        const currentTier = tierHeader ? tierHeader.textContent.trim() : "";

                        const cards = tierDiv.querySelectorAll('.grid .card');
                        cards.forEach(card => {
                            // Get raw name first for parsing
                            const rawName = card.querySelector('.identity .name')?.textContent.trim() || "";
                            
                            let boss = {
                                name: cleanName(rawName),
                                originalName: rawName,
                                form: parseForm(rawName),
                                gender: parseGender(rawName),
                                tier: currentTier,
                                isShadowRaid: isShadowRaid,
                                eventStatus: 'unknown', // Will be determined below
                                canBeShiny: false,
                                types: [],
                                combatPower: {
                                    normal: { min: -1, max: -1 },
                                    boosted: { min: -1, max: -1 }
                                },
                                boostedWeather: [],
                                image: ""
                            };
                            
                            // Determine event status based on events data
                            boss.eventStatus = determineEventStatus(boss.name, isShadowRaid);

                            // Image
                            boss.image = card.querySelector('.boss-img img')?.src || "";

                            // Shiny - check both LeekDuck icon and PogoAssets data
                            const hasShinyIcon = !!card.querySelector('.boss-img .shiny-icon');
                            const dexNumber = extractDexNumber(boss.image);
                            const hasShinyInAssets = dexNumber ? hasShiny(shinyMap, dexNumber, boss.form) : false;
                            boss.canBeShiny = hasShinyIcon || hasShinyInAssets;

                            // Types
                            card.querySelectorAll('.boss-type .type img').forEach(img => {
                                boss.types.push({
                                    name: img.getAttribute('title')?.toLowerCase() || "",
                                    image: img.src
                                });
                            });

                            // Combat Power (normal)
                            let cpText = card.querySelector('.cp-range')?.textContent.replace('CP', '').trim() || "";
                            let [cpMin, cpMax] = cpText.split('-').map(s => parseInt(s.trim()));
                            boss.combatPower.normal.min = cpMin || -1;
                            boss.combatPower.normal.max = cpMax || -1;

                            // Combat Power (boosted)
                            let boostedText = card.querySelector('.boosted-cp-row .boosted-cp')?.textContent.replace('CP', '').trim() || "";
                            let [boostMin, boostMax] = boostedText.split('-').map(s => parseInt(s.trim()));
                            boss.combatPower.boosted.min = boostMin || -1;
                            boss.combatPower.boosted.max = boostMax || -1;

                            // Boosted Weather
                            card.querySelectorAll('.weather-boosted .boss-weather .weather-pill img').forEach(img => {
                                boss.boostedWeather.push({
                                    name: img.getAttribute('alt')?.toLowerCase() || "",
                                    image: img.src
                                });
                            });

                            bosses.push(boss);
                        });
                    });
                });

                fs.writeFile('data/raids.json', JSON.stringify(bosses, null, 4), err => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                });
                fs.writeFile('data/raids.min.json', JSON.stringify(bosses), err => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                });
                resolve(bosses);
            }).catch(_err => {
                console.log(_err);
                https.get("https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/raids.min.json", (res) => {
                    let body = "";
                    res.on("data", (chunk) => { body += chunk; });

                    res.on("end", () => {
                        try {
                            let json = JSON.parse(body);

                            fs.writeFile('data/raids.json', JSON.stringify(json, null, 4), err => {
                                if (err) {
                                    console.error(err);
                                    return;
                                }
                            });
                            fs.writeFile('data/raids.min.json', JSON.stringify(json), err => {
                                if (err) {
                                    console.error(err);
                                    return;
                                }
                            });
                        }
                        catch (error) {
                            console.error(error.message);
                        };
                    });

                }).on("error", (error) => {
                    console.error(error.message);
                });
            });
    })
}

module.exports = { get }