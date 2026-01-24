const fs = require('fs');
const https = require('https');

const breakthrough = require('../pages/detailed/breakthrough')
const spotlight = require('../pages/detailed/spotlight')
const communityday = require('../pages/detailed/communityday')
const raidbattles = require('../pages/detailed/raidbattles')
const research = require('../pages/detailed/research')
const generic = require('../pages/detailed/generic')
const raidhour = require('../pages/detailed/raidhour')
const raidday = require('../pages/detailed/raidday')
const teamgorocket = require('../pages/detailed/teamgorocket')
const gobattleleague = require('../pages/detailed/gobattleleague')
const season = require('../pages/detailed/season')
const gotour = require('../pages/detailed/gotour')
const timedresearch = require('../pages/detailed/timedresearch')
const maxbattles = require('../pages/detailed/maxbattles')
const maxmondays = require('../pages/detailed/maxmondays')
const gopass = require('../pages/detailed/gopass')
const pokestopshowcase = require('../pages/detailed/pokestopshowcase')
const event = require('../pages/detailed/event')

function main()
{
    if (!fs.existsSync('data/temp'))
        fs.mkdirSync('data/temp');

    var events = JSON.parse(fs.readFileSync("./data/events.min.json"));

    https.get("https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/events.min.json", (res) =>
    {
        let body = "";
        res.on("data", (chunk) => { body += chunk; });
    
        res.on("end", () => {
            try
            {
                let bkp = JSON.parse(body);

                events.forEach(e => {
                    // Construct the event link from eventID
                    const link = `https://www.leekduck.com/events/${e.eventID}/`;
                    
                    // get generic extra data independend from event type
                    generic.get(link, e.eventID, bkp);
                    // get event type specific extra data
                    if (e.eventType == "research-breakthrough")
                    {
                        breakthrough.get(link, e.eventID, bkp);
                    }
                    else if (e.eventType == "pokemon-spotlight-hour")
                    {
                        spotlight.get(link, e.eventID, bkp);
                    }
                    else if (e.eventType == "community-day")
                    {
                        communityday.get(link, e.eventID, bkp);
                    }
                    else if (e.eventType == "raid-battles")
                    {
                        raidbattles.get(link, e.eventID, bkp);
                    }
                    else if (e.eventType == "raid-hour")
                    {
                        raidhour.get(link, e.eventID, bkp);
                    }
                    else if (e.eventType == "raid-day")
                    {
                        raidday.get(link, e.eventID, bkp);
                    }
                    else if (e.eventType == "team-go-rocket" || e.eventType == "go-rocket-takeover")
                    {
                        teamgorocket.get(link, e.eventID, bkp);
                    }
                    else if (e.eventType == "go-battle-league")
                    {
                        gobattleleague.get(link, e.eventID, bkp);
                    }
                    else if (e.eventType == "season")
                    {
                        season.get(link, e.eventID, bkp);
                    }
                    else if (e.eventType == "pokemon-go-tour")
                    {
                        gotour.get(link, e.eventID, bkp);
                    }
                    else if (e.eventType == "timed-research" || e.eventType == "special-research")
                    {
                        timedresearch.get(link, e.eventID, bkp);
                    }
                    else if (e.eventType == "max-battles")
                    {
                        maxbattles.get(link, e.eventID, bkp);
                    }
                    else if (e.eventType == "max-mondays")
                    {
                        maxmondays.get(link, e.eventID, bkp);
                    }
                    else if (e.eventType == "go-pass")
                    {
                        gopass.get(link, e.eventID, bkp);
                    }
                    else if (e.eventType == "pokestop-showcase")
                    {
                        pokestopshowcase.get(link, e.eventID, bkp);
                    }
                    else if (e.eventType == "research")
                    {
                        research.get(link, e.eventID, bkp);
                    }
                    else if (e.eventType == "event")
                    {
                        event.get(link, e.eventID, bkp);
                    }
                });
            }
            catch (error)
            {
                console.error(error.message);
            };
        });
    
    }).on("error", (error) => {
        console.error(error.message);
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