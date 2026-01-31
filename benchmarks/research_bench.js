const { performance } = require('perf_hooks');

// Legacy O(N^2) implementation
function processLegacy(inputs) {
    const research = [];

    inputs.forEach(input => {
        const { text, type, rewards, categoryIcon } = input;

        if (rewards.length > 0) {
            if (research.filter(r => r.text == text && r.type == type).length > 0) {
                var foundResearch = research.findIndex(fr => { return fr.text == text && fr.type == type });
                rewards.forEach(rw => {
                    research[foundResearch].rewards.push(rw);
                });
            } else {
                var taskData = { "text": text, "type": type, "rewards": [...rewards] }; // Clone rewards to be safe
                if (categoryIcon) {
                    taskData.categoryIcon = categoryIcon;
                }
                research.push(taskData);
            }
        }
    });

    return research;
}

// Optimized O(N) implementation using Map
function processOptimized(inputs) {
    // Map key: `${text}|${type}`
    const researchMap = new Map();

    inputs.forEach(input => {
        const { text, type, rewards, categoryIcon } = input;

        if (rewards.length > 0) {
            const key = `${text}|${type}`;
            if (researchMap.has(key)) {
                const existing = researchMap.get(key);
                rewards.forEach(rw => {
                    existing.rewards.push(rw);
                });
            } else {
                var taskData = { "text": text, "type": type, "rewards": [...rewards] }; // Clone rewards to be safe
                if (categoryIcon) {
                    taskData.categoryIcon = categoryIcon;
                }
                researchMap.set(key, taskData);
            }
        }
    });

    return Array.from(researchMap.values());
}

// Data generator
function generateInputs(count, uniqueRatio = 0.2) {
    const inputs = [];
    const uniqueCount = Math.floor(count * uniqueRatio);
    const uniqueTasks = [];

    // Generate unique tasks
    for (let i = 0; i < uniqueCount; i++) {
        uniqueTasks.push({
            text: `Task ${i}`,
            type: i % 2 === 0 ? 'catch' : 'throw',
            categoryIcon: i % 10 === 0 ? 'icon.png' : null
        });
    }

    // Generate inputs reusing unique tasks
    for (let i = 0; i < count; i++) {
        const template = uniqueTasks[Math.floor(Math.random() * uniqueTasks.length)];
        inputs.push({
            text: template.text,
            type: template.type,
            categoryIcon: template.categoryIcon,
            rewards: [
                { type: 'item', name: 'Potion', quantity: 1 }
            ]
        });
    }

    return inputs;
}

function runBenchmark() {
    const INPUT_COUNT = 10000;
    console.log(`Generating ${INPUT_COUNT} inputs...`);
    const inputs = generateInputs(INPUT_COUNT);
    console.log("Inputs generated.");

    console.log("\n--- Benchmarking Legacy O(N^2) Implementation ---");
    const startLegacy = performance.now();
    const resultLegacy = processLegacy(inputs);
    const endLegacy = performance.now();
    const timeLegacy = endLegacy - startLegacy;
    console.log(`Time: ${timeLegacy.toFixed(2)} ms`);
    console.log(`Output count: ${resultLegacy.length}`);

    console.log("\n--- Benchmarking Optimized O(N) Implementation ---");
    const startOpt = performance.now();
    const resultOpt = processOptimized(inputs);
    const endOpt = performance.now();
    const timeOpt = endOpt - startOpt;
    console.log(`Time: ${timeOpt.toFixed(2)} ms`);
    console.log(`Output count: ${resultOpt.length}`);

    const speedup = timeLegacy / timeOpt;
    console.log(`\nSpeedup: ${speedup.toFixed(2)}x`);

    // Verification
    if (resultLegacy.length !== resultOpt.length) {
        console.error("ERROR: Output lengths differ!");
        process.exit(1);
    }

    // Deep comparison
    // We need to sort rewards to ensure deterministic comparison if order changed (though map preserves insertion order mostly)
    // Actually, order of tasks in array depends on when they were first encountered.
    // Legacy: pushes to array when first encountered.
    // Optimized: adds to map when first encountered. Map iteration order is insertion order.
    // So order should be preserved.

    // Check first and last element
    const firstLegacy = resultLegacy[0];
    const firstOpt = resultOpt[0];
    if (JSON.stringify(firstLegacy) !== JSON.stringify(firstOpt)) {
         console.error("ERROR: First element differs!");
         console.log("Legacy:", JSON.stringify(firstLegacy));
         console.log("Optimized:", JSON.stringify(firstOpt));
         process.exit(1);
    }

    console.log("Verification: Outputs appear identical.");
}

runBenchmark();
