
const assert = require('assert');
const { deduplicateEvents } = require('../src/utils/scraperUtils');

console.log('Running deduplicateEvents tests...');

// Test Case 1: Simple pair merging
const events1 = [
    { eventID: 'e1', start: '2023-01-01', end: null },
    { eventID: 'e1', start: null, end: '2023-01-02' }
];
const result1 = deduplicateEvents(events1);
assert.strictEqual(result1.length, 1, 'Should merge to 1 event');
assert.strictEqual(result1[0].eventID, 'e1');
assert.strictEqual(result1[0].start, '2023-01-01');
assert.strictEqual(result1[0].end, '2023-01-02');
console.log('Test 1 Passed: Simple merge');

// Test Case 2: Reversed pair merging
const events2 = [
    { eventID: 'e2', start: null, end: '2023-01-04' },
    { eventID: 'e2', start: '2023-01-03', end: null }
];
const result2 = deduplicateEvents(events2);
assert.strictEqual(result2.length, 1, 'Should merge to 1 event');
assert.strictEqual(result2[0].eventID, 'e2');
assert.strictEqual(result2[0].start, '2023-01-03');
assert.strictEqual(result2[0].end, '2023-01-04');
console.log('Test 2 Passed: Reversed merge');

// Test Case 3: No duplicates
const events3 = [
    { eventID: 'e3', start: '2023-01-05', end: '2023-01-06' },
    { eventID: 'e4', start: '2023-01-07', end: '2023-01-08' }
];
const result3 = deduplicateEvents(events3);
assert.strictEqual(result3.length, 2, 'Should keep 2 events');
console.log('Test 3 Passed: No duplicates');

// Test Case 4: Triplets (Should take first two effectively based on current logic, or 0 and 1)
// Current logic: if duplicates.length > 1, take duplicates[0] and merge with [1] or vice versa.
const events4 = [
    { eventID: 'e5', start: '2023-01-01', end: null, name: 'First' },
    { eventID: 'e5', start: null, end: '2023-01-02', name: 'Second' },
    { eventID: 'e5', start: null, end: '2023-01-03', name: 'Third' }
];
const result4 = deduplicateEvents(events4);
assert.strictEqual(result4.length, 1);
assert.strictEqual(result4[0].start, '2023-01-01');
assert.strictEqual(result4[0].end, '2023-01-02'); // Based on logic, it uses index 1 for end
console.log('Test 4 Passed: Triplet handling');

console.log('All tests passed!');
