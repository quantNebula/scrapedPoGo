/**
 * @fileoverview Detailed event scraper orchestrator.
 * Iterates through all events and dispatches to appropriate detailed
 * scrapers based on event type, writing temporary data files.
 * @module scrapers/detailedscrape
 */

const fs = require('fs');
const { fetchJson } = require('../utils/scraperUtils');
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
 * - timed-research, special-research, research-day -> timedresearch
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
async function main()
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

    try {
        const bkpData = await fetchJson("https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/events.min.json");
        
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

        // Helper to process a single event
        async function processEvent(e, bkp) {
            // Construct the event link from eventID
            const link = `https://www.leekduck.com/events/${e.eventID}/`;
            const p = [];
            
            // get generic extra data independend from event type
                    p.push(generic.get(link, e.eventID, bkp));

                    // get event type specific extra data
                    if (e.eventType == "research-breakthrough")
                    {
                        p.push(breakthrough.get(link, e.eventID, bkp));
                    }
                    else if (e.eventType == "pokemon-spotlight-hour")
                    {
                        p.push(spotlight.get(link, e.eventID, bkp));
                    }
                    else if (e.eventType == "community-day")
                    {
                        p.push(communityday.get(link, e.eventID, bkp));
                    }
                    else if (e.eventType == "raid-battles")
                    {
                        p.push(raidbattles.get(link, e.eventID, bkp));
                    }
                    else if (e.eventType == "raid-hour")
                    {
                        p.push(raidhour.get(link, e.eventID, bkp));
                    }
                    else if (e.eventType == "raid-day")
                    {
                        p.push(raidday.get(link, e.eventID, bkp));
                    }
                    else if (e.eventType == "team-go-rocket" || e.eventType == "go-rocket-takeover")
                    {
                        p.push(teamgorocket.get(link, e.eventID, bkp));
                    }
                    else if (e.eventType == "go-battle-league")
                    {
                        p.push(gobattleleague.get(link, e.eventID, bkp));
                    }
                    else if (e.eventType == "season")
                    {
                        p.push(season.get(link, e.eventID, bkp));
                    }
                    else if (e.eventType == "pokemon-go-tour")
                    {
                        p.push(gotour.get(link, e.eventID, bkp));
                    }
                    else if (e.eventType == "timed-research" || e.eventType == "special-research" || e.eventType == "research-day")
                    {
                        p.push(timedresearch.get(link, e.eventID, bkp));
                    }
                    else if (e.eventType == "max-battles")
                    {
                        p.push(maxbattles.get(link, e.eventID, bkp));
                    }
                    else if (e.eventType == "max-mondays")
                    {
                        p.push(maxmondays.get(link, e.eventID, bkp));
                    }
                    else if (e.eventType == "go-pass")
                    {
                        p.push(gopass.get(link, e.eventID, bkp));
                    }
                    else if (e.eventType == "pokestop-showcase")
                    {
                        p.push(pokestopshowcase.get(link, e.eventID, bkp));
                    }
                    else if (e.eventType == "research")
                    {
                        p.push(research.get(link, e.eventID, bkp));
                    }
                    else if (e.eventType == "event")
                    {
                        p.push(event.get(link, e.eventID, bkp));
                    }

                    await Promise.all(p);
                }

                // Helper for concurrency
                async function runWithConcurrency(items, limit, fn) {
                    const executing = [];
                    const promises = [];

                    for (const item of items) {
                        const p = Promise.resolve().then(() => fn(item));
                        promises.push(p);

                        const e = p.then(() => executing.splice(executing.indexOf(e), 1));
                        executing.push(e);

                        if (executing.length >= limit) {
                            await Promise.race(executing);
                        }
                    }
                    return Promise.all(promises);
                }

        // Run with concurrency limit of 5
        await runWithConcurrency(events, 5, (e) => processEvent(e, bkp));
        logger.success(`Completed scraping detailed event pages`);
    } catch (error) {
        logger.error(error.message);
    }
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
