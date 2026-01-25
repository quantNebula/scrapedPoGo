/**
 * @fileoverview Event details combiner.
 * Merges scraped event detail data from temporary files back into
 * the main events.json file, generates per-eventType files, then cleans up temp files.
 * @module scrapers/combinedetails
 */

const fs = require('fs');
const path = require('path');

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
 * Segments event data into logical sections for better organization.
 * Moves event-specific fields into a 'details' wrapper with nested sections:
 * pokemon, raids, battle, rocket, eggs, bonuses, research, rewards, showcases, shinies, etc.
 * Flags are computed based on actual data presence.
 * 
 * @param {Object} event - Event object with flat structure
 * @returns {Object} Event with segmented structure including details wrapper
 */
function segmentEventData(event) {
    const segmented = {
        eventID: event.eventID,
        name: event.name,
        eventType: event.eventType,
        heading: event.heading,
        image: event.image,
        start: event.start,
        end: event.end
    };

    // Build the details object
    const details = {};

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
    if (pokemon.length > 0) details.pokemon = pokemon;

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
    if (raids.length > 0) details.raids = raids;
    // Also include raid-specific metadata
    if (event.alternationPattern) details.raidAlternation = event.alternationPattern;
    if (event.featuredAttacks && event.featuredAttacks.length > 0) details.raidFeaturedAttacks = event.featuredAttacks;

    // Battle section (GBL)
    const battle = {};
    if (event.leagues && event.leagues.length > 0) battle.leagues = event.leagues;
    if (event.featuredAttack) battle.featuredAttack = event.featuredAttack;
    if (Object.keys(battle).length > 0) details.battle = battle;

    // Rocket section
    const rocket = {};
    if (event.shadowPokemon && event.shadowPokemon.length > 0) rocket.shadows = event.shadowPokemon;
    if (event.leaders && event.leaders.length > 0) rocket.leaders = event.leaders;
    if (event.giovanni) rocket.giovanni = event.giovanni;
    if (event.grunts && event.grunts.length > 0) rocket.grunts = event.grunts;
    if (Object.keys(rocket).length > 0) details.rocket = rocket;

    // Eggs section - handle both array format and object format (for seasons)
    if (event.eggs) {
        if (Array.isArray(event.eggs) && event.eggs.length > 0) {
            // Standard array format from events
            details.eggs = event.eggs;
        } else if (typeof event.eggs === 'object' && !Array.isArray(event.eggs)) {
            // Object format from seasons: { '2km': [...], '5km': [...], ... }
            const hasEggData = Object.values(event.eggs).some(arr => Array.isArray(arr) && arr.length > 0);
            if (hasEggData) {
                details.eggs = event.eggs;
            }
        }
    }

    // Bonuses section
    const bonuses = [];
    if (event.bonuses && event.bonuses.length > 0) {
        bonuses.push(...event.bonuses);
    }
    if (bonuses.length > 0) details.bonuses = bonuses;
    if (event.bonusDisclaimers && event.bonusDisclaimers.length > 0) {
        details.bonusDisclaimers = event.bonusDisclaimers;
    }
    if (event.lureModuleBonus) details.lureModuleBonus = event.lureModuleBonus;
    if (event.exclusiveBonuses && event.exclusiveBonuses.length > 0) {
        details.exclusiveBonuses = event.exclusiveBonuses;
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
    if (Object.keys(research).length > 0) details.research = research;

    // Rewards/Ticket section
    const rewards = {};
    if (event.ticketedResearch) rewards.ticketedResearch = event.ticketedResearch;
    if (event.ticketBonuses && event.ticketBonuses.length > 0) rewards.ticketBonuses = event.ticketBonuses;
    if (event.ticketPrice) rewards.ticketPrice = event.ticketPrice;
    if (event.ticketAddOns && event.ticketAddOns.length > 0) rewards.ticketAddOns = event.ticketAddOns;
    if (Object.keys(rewards).length > 0) details.rewards = rewards;

    // Showcases section
    if (event.pokestopShowcases && event.pokestopShowcases.length > 0) {
        details.showcases = event.pokestopShowcases;
    }

    // Shinies section
    if (event.shinies && event.shinies.length > 0) {
        details.shinies = event.shinies;
    }
    if (event.shinyDebuts && event.shinyDebuts.length > 0) {
        details.shinyDebuts = event.shinyDebuts;
    }

    // Photobomb section
    if (event.photobomb) {
        details.photobomb = event.photobomb;
    }

    // Season-specific sections
    if (event.communityDays && event.communityDays.length > 0) details.communityDays = event.communityDays;
    if (event.features && event.features.length > 0) details.features = event.features;
    if (event.goBattleLeague) details.goBattleLeague = event.goBattleLeague;
    
    // GO Pass specific sections
    if (event.goPass) details.goPass = event.goPass;
    if (event.pricing) details.pricing = event.pricing;
    if (event.pointTasks) details.pointTasks = event.pointTasks;
    if (event.ranks && event.ranks.length > 0) details.ranks = event.ranks;
    if (event.featuredPokemon && event.featuredPokemon.length > 0) details.featuredPokemon = event.featuredPokemon;
    if (event.milestoneBonuses) details.milestoneBonuses = event.milestoneBonuses;

    // GO Tour specific sections
    if (event.eventInfo) details.eventInfo = event.eventInfo;
    if (event.habitats && event.habitats.length > 0) details.habitats = event.habitats;
    if (event.whatsNew && event.whatsNew.length > 0) details.whatsNew = event.whatsNew;
    if (event.sales && event.sales.length > 0) details.sales = event.sales;

    // Custom sections from generic event scraper
    if (event.customSections && Object.keys(event.customSections).length > 0) {
        details.customSections = event.customSections;
    }

    // Max Battles specific
    if (event.maxBattles) details.maxBattles = event.maxBattles;
    if (event.maxMondays) details.maxMondays = event.maxMondays;

    // Description (if present)
    if (event.description) details.description = event.description;

    // Only add details if there's actual content
    if (Object.keys(details).length > 0) {
        segmented.details = details;
    }

    // Compute flags based on actual data presence
    // Helper for eggs - can be array or object format
    const hasEggsData = () => {
        if (!details.eggs) return false;
        if (Array.isArray(details.eggs)) return details.eggs.length > 0;
        // Object format: check if any tier has Pokemon
        return Object.values(details.eggs).some(arr => Array.isArray(arr) && arr.length > 0);
    };

    segmented.flags = {
        hasSpawns: !!(details.pokemon && details.pokemon.some(p => p.source === 'spawn')),
        hasFieldResearchTasks: !!(details.research && details.research.field && details.research.field.length > 0),
        hasBonuses: !!(details.bonuses && details.bonuses.length > 0),
        hasRaids: !!(details.raids && details.raids.length > 0),
        hasEggs: hasEggsData(),
        hasShiny: !!(details.shinies && details.shinies.length > 0),
        hasShowcases: !!(details.showcases && details.showcases.length > 0),
        hasRocket: !!(details.rocket && Object.keys(details.rocket).length > 0),
        hasBattle: !!(details.battle && Object.keys(details.battle).length > 0),
        hasResearch: !!(details.research && Object.keys(details.research).length > 0),
        hasRewards: !!(details.rewards && Object.keys(details.rewards).length > 0)
    };

    // Special properties at top level
    if (event.canBeShiny !== undefined) segmented.canBeShiny = event.canBeShiny;
    if (event.bonus) segmented.bonus = event.bonus;

    return segmented;
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
    
    console.log(`Generated ${count} eventType files in ${outputDir}`);
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
    
    // Flatten events data if it's in eventType-keyed object format
    // This handles both array format (from fresh scrape) and object format (from previous run)
    let events = [];
    if (Array.isArray(eventsData)) {
        // Old/fresh format: already an array
        events = eventsData;
    } else if (eventsData && typeof eventsData === 'object') {
        // New format: { "event-type": [...], "another-type": [...] }
        Object.values(eventsData).forEach(typeArray => {
            if (Array.isArray(typeArray)) {
                // Strip out any existing details/segmented structure to get flat events for re-merging
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
            console.log('Unable to scan temp directory, writing events without details: ' + err);
            // Still segment and write even without temp data
            writeSegmentedOutput(events);
            return;
        }

        files.forEach(f =>
        {
            // Skip empty files or non-JSON files
            const filePath = "./data/temp/" + f;
            const fileContent = fs.readFileSync(filePath, 'utf8');
            if (!fileContent || fileContent.trim().length === 0) {
                console.warn(`Skipping empty temp file: ${f}`);
                return;
            }
            
            let data;
            try {
                data = JSON.parse(fileContent);
            } catch (parseErr) {
                console.warn(`Skipping invalid JSON in temp file ${f}: ${parseErr.message}`);
                return;
            }

            events.forEach(e =>
            {
                if (e.eventID == data.id)
                {
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
        });

        writeSegmentedOutput(events);

        fs.rm("data/temp", { recursive: true }, (err) => {
            if (err) { throw err; }
        });
    });
}

/**
 * Writes the segmented event output to both main and per-type files.
 * 
 * @param {Object[]} events - Array of flat event objects with merged detail data
 */
function writeSegmentedOutput(events) {
    // Group events by eventType with segmented structure
    const eventsByType = {};
    events.forEach(event => {
        const segmentedEvent = segmentEventData(event);
        const type = segmentedEvent.eventType || 'unknown';
        if (!eventsByType[type]) {
            eventsByType[type] = [];
        }
        eventsByType[type].push(segmentedEvent);
    });

    // Write main events file with eventType-keyed structure
    fs.writeFile('data/events.min.json', JSON.stringify(eventsByType), err => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('Created data/events.min.json with eventType-keyed structure');
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
    console.error("ERROR: " + e);
    process.exit(1);
}