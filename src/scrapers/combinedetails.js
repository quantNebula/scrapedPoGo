/**
 * @fileoverview Event details combiner.
 * Merges scraped event detail data from temporary files back into
 * the main events.json file, generates per-eventType files, then cleans up temp files.
 * @module scrapers/combinedetails
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Sanitizes an event type to a safe filename.
 * 
 * @param {string} type - Event type string
 * @returns {string} Safe filename segment
 */
function sanitizeType(type) {
    return String(type || 'unknown')
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * Flattens event data into a consistent top-level structure.
 * All data fields are placed at the top level (no details wrapper).
 * No flags object is computed - consumers can check for field presence directly.
 * 
 * This function is idempotent - if the event is already in flattened format,
 * it will preserve the existing structure.
 * 
 * @param {Object} event - Event object with flat structure or pre-flattened structure
 * @returns {Object} Event with flattened structure, all fields at top level
 */
function segmentEventData(event) {
    const flattened = {
        eventID: event.eventID,
        name: event.name,
        eventType: event.eventType,
        heading: event.heading,
        image: event.image,
        start: event.start,
        end: event.end
    };

    // If event already has consolidated fields (already flattened),
    // AND doesn't have the pre-flatten fields,
    // preserve it as-is to make this function idempotent
    // Use 'in' operator to check for property existence regardless of value
    const hasConsolidatedFields = ('pokemon' in event) || ('raids' in event) || 
                                   ('battle' in event) || ('rocket' in event) || 
                                   ('research' in event) || ('rewards' in event);
    const hasPreFlattenFields = ('spawns' in event) || ('featured' in event) || 
                                 ('incenseEncounters' in event) || ('costumedPokemon' in event) || 
                                 ('pokemonDebuts' in event) || ('maxPokemonDebuts' in event) ||
                                 ('bosses' in event) || ('tiers' in event);
    const isAlreadyFlattened = hasConsolidatedFields && !hasPreFlattenFields;
    
    if (isAlreadyFlattened) {
        // Event is already in flattened format - copy all fields except core ones
        Object.keys(event).forEach(key => {
            if (!Object.hasOwn(flattened, key)) {
                flattened[key] = event[key];
            }
        });
        return flattened;
    }

    // Helper to filter valid pokemon objects (must have name property)
    const isValidPokemon = (p) => p && typeof p === 'object' && p.name;

    // Pokemon section - spawns, featured, debuts, incense, costumed, photobomb
    const pokemon = [];
    if (event.spawns && event.spawns.length > 0) {
        pokemon.push(...event.spawns.filter(isValidPokemon).map(p => ({ ...p, source: 'spawn' })));
    }
    if (event.featured && event.featured.length > 0) {
        pokemon.push(...event.featured.filter(isValidPokemon).map(p => ({ ...p, source: 'featured' })));
    }
    if (event.incenseEncounters && event.incenseEncounters.length > 0) {
        pokemon.push(...event.incenseEncounters.filter(isValidPokemon).map(p => ({ ...p, source: 'incense' })));
    }
    if (event.costumedPokemon && event.costumedPokemon.length > 0) {
        pokemon.push(...event.costumedPokemon.filter(isValidPokemon).map(p => ({ ...p, source: 'costumed' })));
    }
    if (event.pokemonDebuts && event.pokemonDebuts.length > 0) {
        pokemon.push(...event.pokemonDebuts.filter(isValidPokemon).map(p => ({ ...p, source: 'debut' })));
    }
    if (event.maxPokemonDebuts && event.maxPokemonDebuts.length > 0) {
        pokemon.push(...event.maxPokemonDebuts.filter(isValidPokemon).map(p => ({ ...p, source: 'maxDebut' })));
    }
    if (pokemon.length > 0) flattened.pokemon = pokemon;

    // Raids section
    const raids = [];
    if (event.bosses && event.bosses.length > 0) {
        raids.push(...event.bosses);
    }
    if (event.tiers) {
        // Handle both object format { mega: [], fiveStar: [] } and array format [{ tier, pokemon }]
        if (Array.isArray(event.tiers)) {
            // Array format: flatten tiers into raids array with tier info
            event.tiers.forEach(tier => {
                if (tier.pokemon && tier.pokemon.length > 0) {
                    tier.pokemon.forEach(p => {
                        raids.push({ ...p, tier: tier.tier || tier.name });
                    });
                }
            });
        } else if (typeof event.tiers === 'object') {
            // Object format from raidbattles.js: { mega: [], fiveStar: [], threeStar: [], oneStar: [] }
            const tierMap = { mega: 'Mega', fiveStar: '5-Star', threeStar: '3-Star', oneStar: '1-Star' };
            Object.entries(event.tiers).forEach(([tierKey, pokemon]) => {
                if (Array.isArray(pokemon) && pokemon.length > 0) {
                    pokemon.forEach(p => {
                        raids.push({ ...p, tier: tierMap[tierKey] || tierKey });
                    });
                }
            });
        }
    }
    if (raids.length > 0) flattened.raids = raids;
    // Also include raid-specific metadata
    if (event.alternationPattern) flattened.raidAlternation = event.alternationPattern;
    if (event.featuredAttacks && event.featuredAttacks.length > 0) flattened.raidFeaturedAttacks = event.featuredAttacks;

    // Battle section (GBL)
    const battle = {};
    if (event.leagues && event.leagues.length > 0) battle.leagues = event.leagues;
    if (event.featuredAttack) battle.featuredAttack = event.featuredAttack;
    if (Object.keys(battle).length > 0) flattened.battle = battle;

    // Rocket section
    const rocket = {};
    if (event.shadowPokemon && event.shadowPokemon.length > 0) rocket.shadows = event.shadowPokemon;
    if (event.leaders && event.leaders.length > 0) rocket.leaders = event.leaders;
    if (event.giovanni) rocket.giovanni = event.giovanni;
    if (event.grunts && event.grunts.length > 0) rocket.grunts = event.grunts;
    if (Object.keys(rocket).length > 0) flattened.rocket = rocket;

    // Eggs section - handle both array format and object format (for seasons)
    if (event.eggs) {
        if (Array.isArray(event.eggs) && event.eggs.length > 0) {
            // Standard array format from events
            flattened.eggs = event.eggs;
        } else if (typeof event.eggs === 'object' && !Array.isArray(event.eggs)) {
            // Object format from seasons: { '2km': [...], '5km': [...], ... }
            const hasEggData = Object.values(event.eggs).some(arr => Array.isArray(arr) && arr.length > 0);
            if (hasEggData) {
                flattened.eggs = event.eggs;
            }
        }
    }

    // Bonuses section
    const bonuses = [];
    if (event.bonuses && event.bonuses.length > 0) {
        bonuses.push(...event.bonuses);
    }
    if (bonuses.length > 0) flattened.bonuses = bonuses;
    if (event.bonusDisclaimers && event.bonusDisclaimers.length > 0) {
        flattened.bonusDisclaimers = event.bonusDisclaimers;
    }
    if (event.lureModuleBonus) flattened.lureModuleBonus = event.lureModuleBonus;
    if (event.exclusiveBonuses && event.exclusiveBonuses.length > 0) {
        flattened.exclusiveBonuses = event.exclusiveBonuses;
    }

    // Research section
    const research = {};
    if (event.fieldResearchTasks && event.fieldResearchTasks.length > 0) {
        research.field = event.fieldResearchTasks;
    }
    if (event.specialresearch && event.specialresearch.length > 0) {
        research.special = event.specialresearch;
    }
    if (event.timedResearch && event.timedResearch.length > 0) {
        research.timed = event.timedResearch;
    }
    if (event.researchBreakthrough) {
        research.breakthrough = event.researchBreakthrough;
    }
    if (event.masterworkResearch && event.masterworkResearch.length > 0) {
        research.masterwork = event.masterworkResearch;
    }
    if (Object.keys(research).length > 0) flattened.research = research;

    // Rewards/Ticket section
    const rewards = {};
    if (event.ticketedResearch) rewards.ticketedResearch = event.ticketedResearch;
    if (event.ticketBonuses && event.ticketBonuses.length > 0) rewards.ticketBonuses = event.ticketBonuses;
    if (event.ticketPrice) rewards.ticketPrice = event.ticketPrice;
    if (event.ticketAddOns && event.ticketAddOns.length > 0) rewards.ticketAddOns = event.ticketAddOns;
    if (Object.keys(rewards).length > 0) flattened.rewards = rewards;

    // Showcases section
    if (event.pokestopShowcases && event.pokestopShowcases.length > 0) {
        flattened.showcases = event.pokestopShowcases;
    }

    // Shinies section
    if (event.shinies && event.shinies.length > 0) {
        flattened.shinies = event.shinies;
    }
    if (event.shinyDebuts && event.shinyDebuts.length > 0) {
        flattened.shinyDebuts = event.shinyDebuts;
    }

    // Photobomb section
    if (event.photobomb) {
        flattened.photobomb = event.photobomb;
    }

    // Season-specific sections
    if (event.communityDays && event.communityDays.length > 0) flattened.communityDays = event.communityDays;
    if (event.features && event.features.length > 0) flattened.features = event.features;
    if (event.goBattleLeague) flattened.goBattleLeague = event.goBattleLeague;
    
    // GO Pass specific sections
    if (event.goPass) flattened.goPass = event.goPass;
    if (event.pricing) flattened.pricing = event.pricing;
    if (event.pointTasks) flattened.pointTasks = event.pointTasks;
    if (event.ranks && event.ranks.length > 0) flattened.ranks = event.ranks;
    if (event.featuredPokemon && event.featuredPokemon.length > 0) flattened.featuredPokemon = event.featuredPokemon;
    if (event.milestoneBonuses) flattened.milestoneBonuses = event.milestoneBonuses;

    // GO Tour specific sections
    if (event.eventInfo) flattened.eventInfo = event.eventInfo;
    if (event.habitats && event.habitats.length > 0) flattened.habitats = event.habitats;
    if (event.whatsNew && event.whatsNew.length > 0) flattened.whatsNew = event.whatsNew;
    if (event.sales && event.sales.length > 0) flattened.sales = event.sales;

    // Custom sections from generic event scraper
    if (event.customSections && Object.keys(event.customSections).length > 0) {
        flattened.customSections = event.customSections;
    }

    // Max Battles specific
    if (event.maxBattles) flattened.maxBattles = event.maxBattles;
    if (event.maxMondays) flattened.maxMondays = event.maxMondays;

    // Description (if present)
    if (event.description) flattened.description = event.description;

    // Special properties at top level
    if (event.canBeShiny !== undefined) flattened.canBeShiny = event.canBeShiny;
    if (event.bonus) flattened.bonus = event.bonus;

    return flattened;
}

/**
 * Generates per-eventType JSON files from the pre-segmented events object.
 * Creates data/eventTypes/ directory and writes minified JSON for each event type.
 * 
 * @param {Object} eventsByType - Object with eventType keys and arrays of segmented events
 * @returns {void}
 */
function generateEventTypeFiles(eventsByType) {
    const outputDir = './data/eventTypes';
    
    // Create output directory
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Clear existing JSON files to avoid stale types
    if (fs.existsSync(outputDir)) {
        const files = fs.readdirSync(outputDir);
        files.forEach(file => {
            if (file.endsWith('.json')) {
                fs.unlinkSync(path.join(outputDir, file));
            }
        });
    }
    
    // Write per-type files - eventsByType is already grouped and segmented
    let count = 0;
    Object.entries(eventsByType).forEach(([type, items]) => {
        const safeType = sanitizeType(type);
        const minPath = path.join(outputDir, `${safeType}.min.json`);
        
        fs.writeFileSync(minPath, JSON.stringify(items));
        count++;
    });
    
    logger.success(`Generated ${count} eventType files in ${outputDir}`);
}

/**
 * Main function that combines detailed event data with base events.
 * Reads all temporary JSON files from data/temp, matches them to events
 * by ID, merges the detailed data, writes updated events files,
 * generates per-eventType files, and finally cleans up the temporary directory.
 * 
 * Supported event types for merging:
 * - generic (meta flags)
 * - research-breakthrough, pokemon-spotlight-hour, community-day
 * - raid-battles, raid-hour, raid-day
 * - team-go-rocket, go-rocket-takeover, go-battle-league
 * - season, pokemon-go-tour, timed-research, special-research
 * - max-battles, max-mondays, go-pass, pokestop-showcase
 * - event, promo-codes
 * 
 * @function main
 * @returns {void}
 * @throws {Error} Logs error and exits with code 1 on failure
 * 
 * @example
 * // Run after detailedscrape.js completes:
 * // node src/scrapers/combinedetails.js
 * // Updates data/events.json with detailed event data
 * // Generates data/eventTypes/*.json files
 */
function main()
{
    const eventsData = JSON.parse(fs.readFileSync("./data/events.min.json"));
    
    // Flatten events data - handle both array format and eventType-keyed object format
    let events = [];
    if (Array.isArray(eventsData)) {
        // Array format: use as-is (already has complete event data)
        // Don't strip data - this preserves detailed fields from previous runs
        events = eventsData;
    } else if (eventsData && typeof eventsData === 'object') {
        // Legacy object format: { "event-type": [...], "another-type": [...] }
        // Extract just core fields for re-merging with temp detail files
        Object.values(eventsData).forEach(typeArray => {
            if (Array.isArray(typeArray)) {
                typeArray.forEach(e => {
                    const flatEvent = {
                        eventID: e.eventID,
                        name: e.name,
                        eventType: e.eventType,
                        heading: e.heading,
                        image: e.image,
                        start: e.start,
                        end: e.end
                    };
                    events.push(flatEvent);
                });
            }
        });
    }

    fs.readdir("data/temp", function (err, files) {
        if (err) {
            logger.warn('Unable to scan temp directory, writing events without details: ' + err);
            // Still segment and write even without temp data
            writeSegmentedOutput(events);
            return;
        }

        // Create a map for O(1) lookup
        const eventMap = new Map();
        events.forEach(e => {
            if (e.eventID) {
                eventMap.set(e.eventID, e);
            }
        });

        files.forEach(f =>
        {
            // Skip empty files or non-JSON files
            const filePath = "./data/temp/" + f;
            const fileContent = fs.readFileSync(filePath, 'utf8');
            if (!fileContent || fileContent.trim().length === 0) {
                logger.warn(`Skipping empty temp file: ${f}`);
                return;
            }
            
            let data;
            try {
                data = JSON.parse(fileContent);
            } catch (parseErr) {
                logger.warn(`Skipping invalid JSON in temp file ${f}: ${parseErr.message}`);
                return;
            }

            if (eventMap.has(data.id))
            {
                const e = eventMap.get(data.id);
                // add generic data fields directly to event (available for all possible events)
                if (data.type == "generic")
                {
                    Object.assign(e, data.data);
                }
                // add event specific data directly to event object
                if (data.type == "research-breakthrough" ||
                    data.type == "pokemon-spotlight-hour" ||
                    data.type == "community-day" ||
                    data.type == "raid-battles" ||
                    data.type == "raid-hour" ||
                    data.type == "raid-day" ||
                    data.type == "team-go-rocket" ||
                    data.type == "go-rocket-takeover" ||
                    data.type == "go-battle-league" ||
                    data.type == "season" ||
                    data.type == "pokemon-go-tour" ||
                    data.type == "timed-research" ||
                    data.type == "special-research" ||
                    data.type == "max-battles" ||
                    data.type == "max-mondays" ||
                    data.type == "go-pass" ||
                    data.type == "pokestop-showcase" ||
                    data.type == "research" ||
                    data.type == "event" ||
                    data.type == "promo-codes")
                {
                    Object.assign(e, data.data);
                }
            }
        });

        writeSegmentedOutput(events);

        fs.rm("data/temp", { recursive: true }, (err) => {
            if (err) { throw err; }
        });
    });
}

/**
 * Writes the flattened event output to both main and per-type files.
 * Main events.min.json is now a flat array sorted by start date.
 * Per-type files are still generated for backward compatibility.
 * 
 * @param {Object[]} events - Array of flat event objects with merged detail data
 */
function writeSegmentedOutput(events) {
    // Transform all events with flattened structure
    const allEvents = events.map(event => segmentEventData(event));

    // Sort by start date for chronological order
    allEvents.sort((a, b) => {
        const dateA = a.start ? new Date(a.start) : new Date(0);
        const dateB = b.start ? new Date(b.start) : new Date(0);
        return dateA - dateB;
    });

    // Write main events file as a flat array
    fs.writeFile('data/events.min.json', JSON.stringify(allEvents), err => {
        if (err) {
            logger.error(err);
            return;
        }
        logger.success('Created data/events.min.json as flat array with ' + allEvents.length + ' events');
    });

    // Group by eventType for per-type files (backward compatibility)
    const eventsByType = {};
    allEvents.forEach(event => {
        const type = event.eventType || 'unknown';
        if (!eventsByType[type]) {
            eventsByType[type] = [];
        }
        eventsByType[type].push(event);
    });

    // Generate per-eventType files with matching structure
    generateEventTypeFiles(eventsByType);
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