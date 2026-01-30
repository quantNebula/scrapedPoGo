/**
 * @fileoverview Eggs page scraper for Pokemon GO data.
 * Scrapes egg hatch data from LeekDuck including Pokemon available in different egg types,
 * CP ranges, shiny availability, and rarity tiers.
 * @module pages/eggs
 */

const fs = require('fs');
const jsd = require('jsdom');
const { JSDOM } = jsd;
const https = require('https');
const { loadShinyData, extractDexNumber, hasShiny } = require('../utils/shinyData');
const { getMultipleImageDimensions } = require('../utils/imageDimensions');
const { transformUrls } = require('../utils/blobUrls');

/**
 * @typedef {Object} CombatPower
 * @property {number} min - Minimum CP at hatch
 * @property {number} max - Maximum CP at hatch
 */

/**
 * @typedef {Object} EggPokemon
 * @property {string} name - Pokemon name
 * @property {string} eggType - Egg distance type (e.g., "2km", "5km", "10km")
 * @property {boolean} isAdventureSync - Whether this Pokemon is from Adventure Sync rewards
 * @property {string} image - URL to Pokemon image
 * @property {boolean} canBeShiny - Whether this Pokemon can be shiny
 * @property {CombatPower} combatPower - CP range at hatch
 * @property {boolean} isRegional - Whether this is a regional Pokemon
 * @property {boolean} isGiftExchange - Whether this Pokemon is from Route Gift eggs
 * @property {number} rarity - Rarity tier (number of mini-eggs displayed)
 * @property {number} [imageWidth] - Image width in pixels
 * @property {number} [imageHeight] - Image height in pixels
 * @property {string} [imageType] - Image format type
 */

/**
 * Scrapes egg hatch data from LeekDuck and writes to data files.
 * 
 * Fetches the eggs page, parses Pokemon available in each egg type,
 * cross-references shiny data, fetches image dimensions, and writes
 * both formatted and minified JSON output files.
 * 
 * @async
 * @function get
 * @returns {Promise<void>} Resolves when data has been written to files
 * @throws {Error} On network failure, falls back to cached CDN data
 * 
 * @example
 * // Scrape eggs data
 * const eggs = require('./pages/eggs');
 * await eggs.get();
 * // Creates data/eggs.json and data/eggs.min.json
 */
function get()
{
    return new Promise(resolve => {
        JSDOM.fromURL("https://leekduck.com/eggs/", {
        })
        .then(async (dom) => {

            var content = dom.window.document.querySelector('.page-content').childNodes;

            var eggs = [];
            var currentType = "";
            var currentAdventureSync = false;
            var currentGiftExchange = false;
            
            // Load shiny data for cross-referencing
            const shinyMap = loadShinyData();
            
            content.forEach(c =>
            {
                if (c.tagName == "H2")
                {
                    currentType = c.innerHTML.trim();
                    currentAdventureSync = currentType.includes("(Adventure Sync Rewards)");
                    currentGiftExchange = currentType.includes("(From Route Gift)");
                    currentType = currentType.split(" Eggs")[0];
                }
                else if (c.className == "egg-grid")
                {
                    c.querySelectorAll(".pokemon-card").forEach(e =>
                    {
                        var pokemon = {
                            name: "",
                            eggType: "",
                            isAdventureSync: false,
                            image: "",
                            canBeShiny: false,
                            combatPower: {
                                min: -1,
                                max: -1
                            },
                            isRegional: false,
                            isGiftExchange: false,
                            rarity: 0
                        };

                        pokemon.name = e.querySelector(".name").innerHTML || "";
                        pokemon.eggType = currentType;
                        pokemon.isAdventureSync = currentAdventureSync;
                        pokemon.image = e.querySelector(".icon img").src || "";
                        
                        // Shiny - check both LeekDuck icon and PogoAssets data
                        const hasShinyIcon = e.querySelector(".shiny-icon") != null;
                        const dexNumber = extractDexNumber(pokemon.image);
                        const hasShinyInAssets = dexNumber ? hasShiny(shinyMap, dexNumber) : false;
                        pokemon.canBeShiny = hasShinyIcon || hasShinyInAssets;
                        
                        pokemon.isRegional = e.querySelector(".regional-icon") != null;
                        pokemon.isGiftExchange = currentGiftExchange;

                        var cpText = e.querySelector(".cp-range").innerHTML;
                        var cpValue = cpText.replace('<span class="label">CP </span>', '').trim();
                        
                        // Logic to handle single CP value if no range is provided 
                        if (cpValue.includes(' - ')) {
                            pokemon.combatPower.min = parseInt(cpValue.split(' - ')[0]);
                            pokemon.combatPower.max = parseInt(cpValue.split(' - ')[1]);
                        } else {
                            pokemon.combatPower.min = parseInt(cpValue);
                            pokemon.combatPower.max = parseInt(cpValue);
                        }

                        var rarityDiv = e.querySelector(".rarity");
                        if (rarityDiv) {
                            var miniEggs = rarityDiv.querySelectorAll("svg.mini-egg");
                            pokemon.rarity = miniEggs.length;
                        }

                        eggs.push(pokemon);
                    });
                }
            })

            // Fetch image dimensions for all egg Pokemon
            const imageUrls = eggs.map(e => e.image).filter(Boolean);
            const dimensionsMap = await getMultipleImageDimensions(imageUrls);
            
            // Assign dimensions back to eggs
            eggs.forEach(egg => {
                if (egg.image && dimensionsMap.has(egg.image)) {
                    const dims = dimensionsMap.get(egg.image);
                    egg.imageWidth = dims.width;
                    egg.imageHeight = dims.height;
                    egg.imageType = dims.type;
                }
            });

            const output = transformUrls(eggs);

            fs.writeFile('data/eggs.min.json', JSON.stringify(output), err => {
                if (err) {
                    console.error(err);
                    return;
                }
            });
        }).catch(_err =>
            {
                console.log(_err);
                https.get("https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/eggs.min.json", (res) =>
                {
                    let body = "";
                    res.on("data", (chunk) => { body += chunk; });
                
                    res.on("end", () => {
                        try
                        {
                            let json = JSON.parse(body);
    
                            const output = transformUrls(json);

                            fs.writeFile('data/eggs.min.json', JSON.stringify(output), err => {
                                if (err) {
                                    console.error(err);
                                    return;
                                }
                            });
                        }
                        catch (error)
                        {
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