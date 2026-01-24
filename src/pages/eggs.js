const fs = require('fs');
const jsd = require('jsdom');
const { JSDOM } = jsd;
const https = require('https');
const { loadShinyData, extractDexNumber, hasShiny } = require('../utils/shinyData');

function get()
{
    return new Promise(resolve => {
        JSDOM.fromURL("https://leekduck.com/eggs/", {
        })
        .then((dom) => {

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

            fs.writeFile('data/eggs.json', JSON.stringify(eggs, null, 4), err => {
                if (err) {
                    console.error(err);
                    return;
                }
            });
            fs.writeFile('data/eggs.min.json', JSON.stringify(eggs), err => {
                if (err) {
                    console.error(err);
                    return;
                }
            });
        }).catch(_err =>
            {
                console.log(_err);
                https.get("https://raw.githubusercontent.com/bigfoott/ScrapedDuck/data/eggs.min.json", (res) =>
                {
                    let body = "";
                    res.on("data", (chunk) => { body += chunk; });
                
                    res.on("end", () => {
                        try
                        {
                            let json = JSON.parse(body);
    
                            fs.writeFile('data/eggs.json', JSON.stringify(json, null, 4), err => {
                                if (err) {
                                    console.error(err);
                                    return;
                                }
                            });
                            fs.writeFile('data/eggs.min.json', JSON.stringify(json), err => {
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