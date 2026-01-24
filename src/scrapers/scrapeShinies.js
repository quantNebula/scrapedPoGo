const fs = require('fs');
const shinies = require('../pages/shinies');

function main()
{
    if (!fs.existsSync('data'))
        fs.mkdirSync('data');

    console.log('Scraping shiny Pokemon data from PogoAssets...');
    
    shinies().then(data => {
        fs.writeFile('data/shinies.json', JSON.stringify(data, null, 4), err => {
            if (err) {
                console.error('Error writing shinies.json:', err);
                return;
            }
            console.log(`Successfully saved ${data.totalShinies} shinies to data/shinies.json`);
        });
        
        fs.writeFile('data/shinies.min.json', JSON.stringify(data), err => {
            if (err) {
                console.error('Error writing shinies.min.json:', err);
                return;
            }
        });
    }).catch(error => {
        console.error('Failed to scrape shinies:', error);
        process.exit(1);
    });
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
