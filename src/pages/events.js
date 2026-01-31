/**
 * @fileoverview Events page scraper for Pokemon GO data.
 * Scrapes current and upcoming event information from LeekDuck including
 * event names, types, images, and date ranges.
 * @module pages/events
 */

const fs = require('fs');
const { normalizeDatePair, deduplicateEvents, fetchJson, getJSDOM } = require('../utils/scraperUtils');
const logger = require('../utils/logger');
const { transformUrls } = require('../utils/blobUrls');

/**
 * @typedef {Object} GameEvent
 * @property {string} eventID - Unique event identifier (URL slug)
 * @property {string} name - Display name of the event
 * @property {string} eventType - Event category (e.g., "community-day", "raid-battles", "spotlight")
 * @property {string} image - URL to event banner image
 * @property {string|null} start - ISO 8601 start datetime or null if unknown
 * @property {string|null} end - ISO 8601 end datetime or null if unknown
 */

/**
 * Scrapes event data from LeekDuck and writes to data files.
 *
 * First fetches the events JSON feed to get accurate date/time information,
 * then scrapes the events page for current and upcoming events. Merges
 * date information with scraped event details and handles events that
 * span multiple date ranges.
 *
 * @async
 * @function get
 * @returns {void} Writes data asynchronously, no return value
 * @throws {Error} On network failure, falls back to cached CDN data
 *
 * @example
 * // Scrape events data
 * const events = require('./pages/events');
 * events.get();
 * // Creates data/events.json and data/events.min.json
 */
async function get()
{
    try {
        // Fetch event dates from JSON feed
        const feedJson = await fetchJson("https://leekduck.com/feeds/events.json");
        
        const eventDates = [];
        for (var i = 0; i < feedJson.length; i++)
        {
            var id = feedJson[i].eventID;
            var start = feedJson[i].start;
            var end = feedJson[i].end;

            eventDates[id] = { "start": start, "end": end };
        }

        try {
            // Scrape events page using secure JSDOM
            const dom = await getJSDOM("https://leekduck.com/events/");
            
            var allEvents = [];

            ["current","upcoming"].forEach(category => {

                var events = dom.window.document.querySelectorAll(`div.events-list.${category}-events a.event-item-link`);

                events.forEach (e =>
                {
                    var name = e.querySelector(":scope > .event-item-wrapper > .event-item > .event-text-container > .event-text > h2").innerHTML;
                    var image = e.querySelector(":scope > .event-item-wrapper > .event-item > .event-img-wrapper > img").src;
                    if (image.includes("cdn-cgi"))
                    {
                        image = "https://cdn.leekduck.com/assets/" + image.split("/assets/")[1];
                    }
                    var link = e.href;
                    var eventID = link.split("/events/")[1];
                    eventID = eventID.substring(0, eventID.length - 1);

                    if (!(eventID in eventDates))
                    {
                        logger.warn(`Event '${eventID}' not present in events feed. Date values will be null.`);
                    }

                    var eventItemWrapper = e.querySelector(":scope > .event-item-wrapper");
                    var eventType = (eventItemWrapper.classList + "").replace("event-item-wrapper ", "").replace(" skeleton-loading", "");
                    eventType = eventType.replace("é", "e");

                    // Generate heading from event type
                    var heading = eventType
                        .split('-')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');

                    var start = eventDates[eventID]?.start || null;
                    var end = eventDates[eventID]?.end || null;

                    // Normalize dates: convert timezone offsets to UTC, preserve local times
                    const normalized = normalizeDatePair(start, end);
                    start = normalized.start;
                    end = normalized.end;

                    allEvents.push({ "eventID": eventID, "name": name, "eventType": eventType, "heading": heading, "image": image, "start": start, "end": end });
                });
            });

            // Optimization: Deduplicate events using a Map to reduce iterations and lookups
            allEvents = deduplicateEvents(allEvents);

            const output = transformUrls(allEvents);

            fs.writeFile('data/events.min.json', JSON.stringify(output), err => {
                if (err) {
                    logger.error(err);
                    return;
                }
            });
        } catch (_err) {
            logger.error(_err);
            
            // Fallback to cached CDN data
            const json = await fetchJson("https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/events.min.json");

            const output = transformUrls(json);

            fs.writeFile('data/events.min.json', JSON.stringify(output), err => {
                if (err) {
                    logger.error(err);
                    return;
                }
            });
        }
    } catch (error) {
        logger.error(error.message);
    }
}

module.exports = { get }
