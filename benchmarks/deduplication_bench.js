
const { deduplicateEvents } = require('../src/utils/scraperUtils');
const { performance } = require('perf_hooks');

// Legacy O(N^2) implementation for comparison
function deduplicateEventsLegacy(allEvents) {
    const deduplicatedEvents = [];
    const processedIDs = [];

    for (var i = 0; i < allEvents.length; i++) {
        var event = allEvents[i];

        // Skip if we already processed this ID
        // Note: In a true naive implementation, one might not skip, or use another O(N) check.
        // includes() is O(N), making this check O(N^2) overall.
        if (processedIDs.includes(event.eventID)) continue;

        // O(N) scan to find duplicates
        var allWithID = allEvents.filter(_e => _e.eventID == event.eventID);

        if (allWithID.length > 1) {
            // Merging logic
            var mergedEvent = Object.assign({}, allWithID[0]); // Clone to be safe, though legacy might have mutated

            if (allWithID[0].start) {
                mergedEvent.start = allWithID[0].start;
                mergedEvent.end = allWithID[1].end;
            } else {
                mergedEvent.start = allWithID[1].start;
                mergedEvent.end = allWithID[0].end;
            }
            deduplicatedEvents.push(mergedEvent);
        } else {
            deduplicatedEvents.push(event);
        }
        processedIDs.push(event.eventID);
    }
    return deduplicatedEvents;
}

// Generate synthetic events
function generateEvents(count, duplicateRate = 0.5) {
    const events = [];
    const uniqueCount = Math.floor(count / (1 + duplicateRate));

    for (let i = 0; i < uniqueCount; i++) {
        const id = `event-${i}`;
        // First occurrence
        events.push({
            eventID: id,
            name: `Event ${i}`,
            start: `2023-01-01T10:00:00`,
            end: null
        });

        // Duplicate occurrence (simulate split dates)
        if (Math.random() < duplicateRate) {
            events.push({
                eventID: id,
                name: `Event ${i}`,
                start: null,
                end: `2023-01-05T20:00:00`
            });
        }
    }

    // Shuffle events to mimic real scraping order
    for (let i = events.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [events[i], events[j]] = [events[j], events[i]];
    }

    return events;
}

function runBenchmark() {
    console.log("Generating synthetic events...");
    const eventCount = 10000;
    const events = generateEvents(eventCount, 0.5);
    console.log(`Generated ${events.length} events.`);

    console.log("\n--- Benchmarking Legacy O(N^2) Implementation ---");
    const startLegacy = performance.now();
    const resultLegacy = deduplicateEventsLegacy(events);
    const endLegacy = performance.now();
    const timeLegacy = endLegacy - startLegacy;
    console.log(`Time: ${timeLegacy.toFixed(2)} ms`);
    console.log(`Output count: ${resultLegacy.length}`);

    console.log("\n--- Benchmarking Optimized O(N) Implementation ---");
    const startOpt = performance.now();
    const resultOpt = deduplicateEvents(events);
    const endOpt = performance.now();
    const timeOpt = endOpt - startOpt;
    console.log(`Time: ${timeOpt.toFixed(2)} ms`);
    console.log(`Output count: ${resultOpt.length}`);

    const speedup = timeLegacy / timeOpt;
    console.log(`\nSpeedup: ${speedup.toFixed(2)}x`);

    // Verification
    if (resultLegacy.length !== resultOpt.length) {
        console.error("WARNING: Output lengths differ!");
    } else {
        console.log("Verification: Output lengths match.");
    }
}

runBenchmark();
