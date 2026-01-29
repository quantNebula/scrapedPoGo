/**
 * @fileoverview Events page scraper for Pokemon GO data.
 * Scrapes current and upcoming event information from LeekDuck including
 * event names, types, images, and date ranges.
 * @module pages/events
 */

const fs = require('fs');
const jsd = require('jsdom');
const { JSDOM } = jsd;
const https = require('https');
const { normalizeDatePair } = require('../utils/scraperUtils');
const logger = require('../utils/logger');

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
function get()
{
    https.get("https://leekduck.com/feeds/events.json", (res) =>
    {
        var body = "";
        var eventDates = [];
        res.on("data", (chunk) => { body += chunk; });

        res.on("end", () => {
            try
            {
                var feedJson = JSON.parse(body);

                for (var i = 0; i < feedJson.length; i++)
                {
                    var id = feedJson[i].eventID;
                    var start = feedJson[i].start;
                    var end = feedJson[i].end;

                    eventDates[id] = { "start": start, "end": end };
                }
            }
            catch (error)
            {
                logger.error(error.message);
            };

            return new Promise(resolve => {
                JSDOM.fromURL("https://leekduck.com/events/", {
                })
                .then((dom) => {

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
                    const eventsByID = new Map();
                    allEvents.forEach(e => {
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

                    allEvents = deduplicatedEvents;

                    fs.writeFile('data/events.min.json', JSON.stringify(allEvents), err => {
                        if (err) {
                            logger.error(err);
                            return;
                        }
                    });
                }).catch(_err =>
                {
                    logger.error(_err);
                    https.get("https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/events.min.json", (res) =>
                    {
                        let body = "";
                        res.on("data", (chunk) => { body += chunk; });

                        res.on("end", () => {
                            try
                            {
                                let json = JSON.parse(body);

                                fs.writeFile('data/events.min.json', JSON.stringify(json), err => {
                                    if (err) {
                                        logger.error(err);
                                        return;
                                    }
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
                });
            })
        });

    }).on("error", (error) => {
        logger.error(error.message);
    });
}

module.exports = { get }
