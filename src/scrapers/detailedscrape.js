/**
 * @fileoverview Detailed event scraper orchestrator.
 * Iterates through all events and dispatches to appropriate detailed
 * scrapers based on event type, writing temporary data files.
 * @module scrapers/detailedscrape
 */

const fs = require('fs');
const https = require('https');
const logger = require('../utils/logger');

const breakthrough = require('../pages/detailed/breakthrough')
const spotlight = require('../pages/detailed/spotlight')
const communityday = require('../pages/detailed/communityday')
const raidbattles = require('../pages/detailed/raidbattles')
const research = require('../pages/detailed/research')
const generic = require('../pages/detailed/generic')
const raidhour = require('../pages/detailed/raidhour')
const raidday = require('../pages/detailed/raidday')
const teamgorocket = require('../pages/detailed/teamgorocket')
const gobattleleague = require('../pages/detailed/gobattleleague')
const season = require('../pages/detailed/season')
const gotour = require('../pages/detailed/gotour')
const timedresearch = require('../pages/detailed/timedresearch')
const maxbattles = require('../pages/detailed/maxbattles')
const maxmondays = require('../pages/detailed/maxmondays')
const gopass = require('../pages/detailed/gopass')
const pokestopshowcase = require('../pages/detailed/pokestopshowcase')
const event = require('../pages/detailed/event')

/**
 * Main function that orchestrates detailed event scraping.
 * Creates temp directory, loads events list, fetches backup data from CDN,
 * then dispatches each event to the appropriate detailed scraper based
 * on its eventType. Always runs generic scraper for metadata.
 * 
 * Scraper dispatch by eventType:
 * - research-breakthrough -> breakthrough
 * - pokemon-spotlight-hour -> spotlight
 * - community-day -> communityday
 * - raid-battles -> raidbattles
 * - raid-hour -> raidhour
 * - raid-day -> raidday
 * - team-go-rocket, go-rocket-takeover -> teamgorocket
 * - go-battle-league -> gobattleleague
 * - season -> season
 * - pokemon-go-tour -> gotour
 * - timed-research, special-research -> timedresearch
 * - max-battles -> maxbattles
 * - max-mondays -> maxmondays
 * - go-pass -> gopass
 * - pokestop-showcase -> pokestopshowcase
 * - research -> research
 * - event -> event
 * 
 * @function main
 * @returns {void}
 * @throws {Error} Logs error and exits with code 1 on failure
 * 
 * @example
 * // Run after scrape.js completes:
 * // node src/scrapers/detailedscrape.js
 * // Creates data/temp/*.json files for each event
 */
function main()
{
    logger.start("Starting detailed scrapers...");

    if (!fs.existsSync('data/temp'))
        fs.mkdirSync('data/temp');

    const eventsData = JSON.parse(fs.readFileSync("./data/events.min.json"));
    
    // Handle both array format and eventType-keyed object format
    let events = [];
    if (Array.isArray(eventsData)) {
        // Array format: use as-is (primary format from events.js)
        events = eventsData;
    } else if (eventsData && typeof eventsData === 'object') {
        // Legacy object format: { "event-type": [...], "another-type": [...] }
        Object.values(eventsData).forEach(typeArray => {
            if (Array.isArray(typeArray)) {
                events = events.concat(typeArray);
            }
        });
    }

    const promises = [];

    https.get("https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/events.min.json", (res) =>
    {
        let body = "";
        res.on("data", (chunk) => { body += chunk; });
    
        res.on("end", () => {
            try
            {
                let bkpData = JSON.parse(body);
                
                // Flatten backup data if it's in new structure
                let bkp = [];
                if (bkpData && typeof bkpData === 'object') {
                    if (Array.isArray(bkpData)) {
                        // Old structure: already an array
                        bkp = bkpData;
                    } else {
                        // New structure: { "event-type": [...], "another-type": [...] }
                        Object.values(bkpData).forEach(typeArray => {
                            if (Array.isArray(typeArray)) {
                                bkp = bkp.concat(typeArray);
                            }
                        });
                    }
                }

                events.forEach(e => {
                    // Construct the event link from eventID
                    const link = `https://www.leekduck.com/events/${e.eventID}/`;
                    
                    // get generic extra data independend from event type
                    promises.push(generic.get(link, e.eventID, bkp));
                    // get event type specific extra data
                    if (e.eventType == "research-breakthrough")
                    {
                        promises.push(breakthrough.get(link, e.eventID, bkp));
                    }
                    else if (e.eventType == "pokemon-spotlight-hour")
                    {
                        promises.push(spotlight.get(link, e.eventID, bkp));
                    }
                    else if (e.eventType == "community-day")
                    {
                        promises.push(communityday.get(link, e.eventID, bkp));
                    }
                    else if (e.eventType == "raid-battles")
                    {
                        promises.push(raidbattles.get(link, e.eventID, bkp));
                    }
                    else if (e.eventType == "raid-hour")
                    {
                        promises.push(raidhour.get(link, e.eventID, bkp));
                    }
                    else if (e.eventType == "raid-day")
                    {
                        promises.push(raidday.get(link, e.eventID, bkp));
                    }
                    else if (e.eventType == "team-go-rocket" || e.eventType == "go-rocket-takeover")
                    {
                        promises.push(teamgorocket.get(link, e.eventID, bkp));
                    }
                    else if (e.eventType == "go-battle-league")
                    {
                        promises.push(gobattleleague.get(link, e.eventID, bkp));
                    }
                    else if (e.eventType == "season")
                    {
                        promises.push(season.get(link, e.eventID, bkp));
                    }
                    else if (e.eventType == "pokemon-go-tour")
                    {
                        promises.push(gotour.get(link, e.eventID, bkp));
                    }
                    else if (e.eventType == "timed-research" || e.eventType == "special-research")
                    {
                        promises.push(timedresearch.get(link, e.eventID, bkp));
                    }
                    else if (e.eventType == "max-battles")
                    {
                        promises.push(maxbattles.get(link, e.eventID, bkp));
                    }
                    else if (e.eventType == "max-mondays")
                    {
                        promises.push(maxmondays.get(link, e.eventID, bkp));
                    }
                    else if (e.eventType == "go-pass")
                    {
                        promises.push(gopass.get(link, e.eventID, bkp));
                    }
                    else if (e.eventType == "pokestop-showcase")
                    {
                        promises.push(pokestopshowcase.get(link, e.eventID, bkp));
                    }
                    else if (e.eventType == "research")
                    {
                        promises.push(research.get(link, e.eventID, bkp));
                    }
                    else if (e.eventType == "event")
                    {
                        promises.push(event.get(link, e.eventID, bkp));
                    }
                });
                
                // Wait for all scrapers to complete
                Promise.all(promises).then(() => {
                    logger.success(`Completed scraping ${promises.length} detailed event pages`);
                }).catch(err => {
                    logger.error('Error during detailed scraping:', err.message);
                });
            }
            catch (error)
            {
                logger.error(error.message);
            };
        });
    
    }).on("error", (error) => {
        logger.error(error.message);
    });
}

try
{
    main();
}
catch (e)
{
    logger.error("ERROR: " + e);
    process.exit(1);
}