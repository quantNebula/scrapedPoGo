const fs = require('fs');
const jsd = require('jsdom');
const { JSDOM } = jsd;
const https = require('https');
const { loadShinyData, extractDexNumber, hasShiny } = require('../utils/shinyData');

function get()
{
    return new Promise(resolve => {
        JSDOM.fromURL("https://leekduck.com/research/", {
        })
        .then((dom) => {
            // Load shiny data for cross-referencing
            const shinyMap = loadShinyData();

            var taskNameToID = [];
            taskNameToID["Event Tasks"] = "event";
            taskNameToID["Catching Tasks"] = "catch";
            taskNameToID["Throwing Tasks"] = "throw";
            taskNameToID["Battling Tasks"] = "battle";
            taskNameToID["Exploring Tasks"] = "explore";
            taskNameToID["Training Tasks"] = "training";
            taskNameToID["Team GO Rocket Tasks"] = "rocket";
            taskNameToID["Buddy &amp; Friendship Tasks"] = "buddy";
            taskNameToID["AR Scanning Tasks"] = "ar";
            taskNameToID["Sponsored Tasks"] = "sponsored";


            var types = dom.window.document.querySelectorAll('.task-category');

            var research = [] 
            
            types.forEach (_e =>
            {
                // Get category icon if present
                var categoryIcon = _e.querySelector(":scope > h2 img")?.src || null;
                var categoryType = taskNameToID[_e.querySelector(":scope > h2").innerHTML.trim().replace(/<img[^>]*>/g, '').trim()];
                
                _e.querySelectorAll(":scope > .task-list > .task-item").forEach(task => {
                    var text = task.querySelector(":scope > .task-text").innerHTML.trim();
                    var type = categoryType;

                    var rewards = [];
                    
                    task.querySelectorAll(":scope > .reward-list > .reward").forEach(r => {
                        var rewardType = r.dataset.rewardType;
                        
                        if (rewardType == "encounter")
                        {
                            var reward = { 
                                type: "encounter",
                                name: "",
                                image: "",
                                canBeShiny: false,
                                combatPower: {
                                    min: -1,
                                    max: -1
                                }
                            };

                            reward.name = r.querySelector(":scope > .reward-label > span")?.innerHTML.trim() || "";
                            reward.image = r.querySelector(":scope > .reward-bubble > .reward-image")?.src || "";

                            var minCpEl = r.querySelector(":scope > .cp-values > .min-cp");
                            var maxCpEl = r.querySelector(":scope > .cp-values > .max-cp");
                            if (minCpEl) {
                                reward.combatPower.min = parseInt(minCpEl.innerHTML.trim().split("</div>")[1]) || -1;
                            }
                            if (maxCpEl) {
                                reward.combatPower.max = parseInt(maxCpEl.innerHTML.trim().split("</div>")[1]) || -1;
                            }
                            
                            // Shiny - check both LeekDuck icon and PogoAssets data
                            const hasShinyIcon = r.querySelector(":scope > .reward-bubble > .shiny-icon") != null;
                            const dexNumber = extractDexNumber(reward.image);
                            const hasShinyInAssets = dexNumber ? hasShiny(shinyMap, dexNumber) : false;
                            reward.canBeShiny = hasShinyIcon || hasShinyInAssets;

                            rewards.push(reward);
                        }
                        else if (rewardType == "item" || rewardType == "resource")
                        {
                            // Parse item/resource rewards with name and quantity
                            var reward = {
                                type: rewardType,
                                name: "",
                                quantity: 1,
                                image: ""
                            };

                            // Get item name from reward-label (excluding the nested span with quantity)
                            var labelEl = r.querySelector(":scope > .reward-label");
                            if (labelEl) {
                                // Get full text and remove the quantity part at the end
                                var fullText = labelEl.textContent.trim();
                                // Remove the "×N" suffix to get just the item name
                                reward.name = fullText.replace(/\s*×\d+\s*$/, '').trim();
                            }
                            
                            // Get quantity from .quantity div (format: "×1" or "×10")
                            var quantityEl = r.querySelector(":scope > .reward-bubble .quantity");
                            if (quantityEl) {
                                var qtyText = quantityEl.textContent.trim();
                                var qtyMatch = qtyText.match(/[×x](\d+)/i);
                                if (qtyMatch) {
                                    reward.quantity = parseInt(qtyMatch[1]) || 1;
                                }
                            }
                            
                            // Get item image
                            reward.image = r.querySelector(":scope > .reward-bubble > .reward-image")?.src || "";

                            rewards.push(reward);
                        }
                    });

                    if (rewards.length > 0)
                    {
                        if (research.filter(r => r.text == text && r.type == type).length > 0)
                        {
                            var foundResearch = research.findIndex(fr => { return fr.text == text && fr.type == type });
                            rewards.forEach(rw => {
                                research[foundResearch].rewards.push(rw);
                            });
                        }
                        else
                        {
                            var taskData = { "text": text, "type": type, "rewards": rewards };
                            if (categoryIcon) {
                                taskData.categoryIcon = categoryIcon;
                            }
                            research.push(taskData);
                        }
                    }
                });
            });

            fs.writeFile('data/research.json', JSON.stringify(research, null, 4), err => {
                if (err) {
                    console.error(err);
                    return;
                }
            });
            fs.writeFile('data/research.min.json', JSON.stringify(research), err => {
                if (err) {
                    console.error(err);
                    return;
                }
            });
        }).catch(_err =>
            {
                console.log(_err);
                https.get("https://raw.githubusercontent.com/bigfoott/ScrapedDuck/data/research.min.json", (res) =>
                {
                    let body = "";
                    res.on("data", (chunk) => { body += chunk; });
                
                    res.on("end", () => {
                        try
                        {
                            let json = JSON.parse(body);
    
                            fs.writeFile('data/research.json', JSON.stringify(json, null, 4), err => {
                                if (err) {
                                    console.error(err);
                                    return;
                                }
                            });
                            fs.writeFile('data/research.min.json', JSON.stringify(json), err => {
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