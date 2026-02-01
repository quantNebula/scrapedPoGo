const { performance } = require('perf_hooks');

function generateFeed(count) {
    const feed = [];
    for (let i = 0; i < count; i++) {
        feed.push({
            eventID: `event-${i}-${Math.random().toString(36).substring(7)}`,
            start: new Date().toISOString(),
            end: new Date().toISOString()
        });
    }
    return feed;
}

function runBenchmark() {
    const count = 200000; // Large enough to show differences
    console.log(`Generating ${count} synthetic events...`);
    const feedJson = generateFeed(count);
    const lookupIds = feedJson.map(e => e.eventID);

    // Shuffle lookupIds to avoid sequential access bias
    for (let i = lookupIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [lookupIds[i], lookupIds[j]] = [lookupIds[j], lookupIds[i]];
    }

    console.log(`Running benchmark with ${count} items...`);

    // --- Array as Object (Legacy) ---
    const startArray = performance.now();
    const eventDatesArray = [];
    for (var i = 0; i < feedJson.length; i++) {
        var id = feedJson[i].eventID;
        var start = feedJson[i].start;
        var end = feedJson[i].end;
        eventDatesArray[id] = { "start": start, "end": end };
    }
    // Lookup
    let foundArray = 0;
    for (const id of lookupIds) {
        if (eventDatesArray[id]) foundArray++;
    }
    const endArray = performance.now();
    console.log(`Array as Object: ${(endArray - startArray).toFixed(2)} ms`);

    // --- Plain Object ---
    const startObj = performance.now();
    const eventDatesObj = {};
    for (var i = 0; i < feedJson.length; i++) {
        var id = feedJson[i].eventID;
        var start = feedJson[i].start;
        var end = feedJson[i].end;
        eventDatesObj[id] = { "start": start, "end": end };
    }
    // Lookup
    let foundObj = 0;
    for (const id of lookupIds) {
        if (eventDatesObj[id]) foundObj++;
    }
    const endObj = performance.now();
    console.log(`Plain Object: ${(endObj - startObj).toFixed(2)} ms`);

    // --- Map ---
    const startMap = performance.now();
    const eventDatesMap = new Map();
    for (var i = 0; i < feedJson.length; i++) {
        var id = feedJson[i].eventID;
        var start = feedJson[i].start;
        var end = feedJson[i].end;
        eventDatesMap.set(id, { "start": start, "end": end });
    }
    // Lookup
    let foundMap = 0;
    for (const id of lookupIds) {
        if (eventDatesMap.has(id)) foundMap++;
    }
    const endMap = performance.now();
    console.log(`Map: ${(endMap - startMap).toFixed(2)} ms`);

    // --- Verification ---
    console.log(`\nVerification:`);
    console.log(`Array matches: ${foundArray}`);
    console.log(`Object matches: ${foundObj}`);
    console.log(`Map matches: ${foundMap}`);

    if (foundArray === foundObj && foundObj === foundMap) {
        console.log("All implementations return consistent results.");
    } else {
        console.error("MISMATCH DETECTED!");
        process.exit(1);
    }
}

runBenchmark();
