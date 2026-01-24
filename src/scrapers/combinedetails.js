const fs = require('fs');

function main()
{
    var events = JSON.parse(fs.readFileSync("./data/events.min.json"));

    fs.readdir("data/temp", function (err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }

        files.forEach(f =>
        {
            var data = JSON.parse(fs.readFileSync("./data/temp/" + f));

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
                        data.type == "promo-codes")
                    {
                        Object.assign(e, data.data);
                    }
                }
            });
        });

        fs.writeFile('data/events.json', JSON.stringify(events, null, 4), err => {
            if (err) {
                console.error(err);
                return;
            }
        });
        fs.writeFile('data/events.min.json', JSON.stringify(events), err => {
            if (err) {
                console.error(err);
                return;
            }
        });

        fs.rm("data/temp", { recursive: true }, (err) => {
            if (err) { throw err; }
        });
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