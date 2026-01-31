const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const htmlContent = fs.readFileSync(path.resolve(__dirname, '../web/index.html'), 'utf8');
const jsContent = fs.readFileSync(path.resolve(__dirname, '../web/app.js'), 'utf8');

// Mock data
const mockEvents = [
    {
        name: "Test Event 1",
        start: "2023-10-01T10:00:00",
        end: "2023-10-01T18:00:00",
        eventType: "community-day",
        image: "test1.png"
    },
    {
        name: "Test Event 2",
        start: "2023-10-02T10:00:00",
        end: "2023-10-02T18:00:00",
        eventType: "spotlight-hour",
        image: "test2.png"
    }
];

const dom = new JSDOM(htmlContent, {
    url: "http://localhost/",
    runScripts: "dangerously",
    resources: "usable",
    pretendToBeVisual: true
});

const { window } = dom;

// Mock localStorage
const localStorageMock = (function() {
    let store = {};
    return {
        getItem: function(key) {
            return store[key] || null;
        },
        setItem: function(key, value) {
            store[key] = value.toString();
        },
        clear: function() {
            store = {};
        }
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch
window.fetch = (url) => {
    console.log(`Mock fetch called for ${url}`);
    if (url.includes('/events')) {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockEvents)
        });
    }
    return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
    });
};

// Add the script content manually since JSDOM might not resolve relative paths correctly without a server
const scriptElement = window.document.createElement('script');
scriptElement.textContent = jsContent;
window.document.body.appendChild(scriptElement);

// Wait for the app to initialize and render
console.log("Waiting for app to initialize...");

setTimeout(() => {
    const grid = window.document.getElementById('grid');
    const cards = grid.querySelectorAll('.card');

    console.log(`Grid has ${cards.length} cards.`);

    if (cards.length === 2) {
        console.log("SUCCESS: Grid rendered correctly with 2 cards.");
        process.exit(0);
    } else {
        console.error("FAILURE: Grid did not render expected number of cards.");
        console.log("Grid content:", grid.innerHTML);
        process.exit(1);
    }
}, 1000);
