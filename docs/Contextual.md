# Endpoints

- Minified: `https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/contextual.min.json`

# Overview

The `contextual.json` file is a unified, player-focused aggregation of all scraped data sources. It answers "What's available now, from where, and when does it end?"

## Schema Overview

```json
{
  "metadata": { ... },
  "timeline": { ... },
  "currentAvailability": { ... },
  "pokemonIndex": [ ... ],
  "shinyOpportunities": { ... }
}
```

# Fields

The contextual file contains five main sections:

| Field | Type | Description |
|-------|------|-------------|
| `metadata` | object | Generation timestamp and source versions |
| `timeline` | object | Events categorized by urgency |
| `currentAvailability` | object | Unified availability by source type |
| `pokemonIndex` | array | Cross-reference for all Pokemon sources |
| `shinyOpportunities` | object | Shiny availability with current sources |

## Metadata

Provides generation timestamp and source file versions for cache invalidation.

```json
{
  "generatedAt": "2026-01-25T00:13:32.250Z",
  "sourceVersions": {
    "events": "2026-01-25T00:02:25.080Z",
    "raids": "2026-01-25T00:02:01.349Z",
    "eggs": "2026-01-25T00:02:01.402Z",
    "research": "2026-01-25T00:02:01.322Z",
    "rocketLineups": "2026-01-25T00:02:01.211Z",
    "shinies": "2026-01-25T00:00:58.145Z"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `generatedAt` | string (ISO 8601) | Timestamp when the data was generated |
| `sourceVersions` | object | Object containing timestamps of source files (events, raids, eggs, research, rocketLineups, shinies) |

## Timeline

Events categorized by urgency with priority scoring.

### Timeline Categories

| Category | Definition |
|----------|------------|
| `endingSoon` | Active events ending within 24 hours |
| `active` | Currently running events (>24h remaining) |
| `upcoming` | Events starting within 7 days |

### Event Types

Pokémon GO features various recurring event types with distinct mechanics:

| Event Type | Description | Typical Duration | Key Features |
|------------|-------------|------------------|--------------|
| **Community Day** | Monthly event featuring one Pokémon with exclusive moves | 3 hours (2-5 PM local time) | Boosted spawns, exclusive moves, 1/25 shiny rate, special bonuses |
| **Spotlight Hour** | Weekly mini-event featuring increased spawns | 1 hour (6-7 PM Tuesday local time) | Featured Pokémon spawns, bonus rewards (2x XP, Stardust, or Candy) |
| **Raid Day** | Special raid event with featured legendary or rare Pokémon | 3 hours | 1/10 shiny rate, raid-exclusive Pokémon, increased raid availability |
| **Raid Hour** | Weekly event with coordinated tier 5 raids | 1 hour (6-7 PM Wednesday local time) | Synchronized legendary raids at all gyms |
| **GO Fest** | Annual flagship event with global tie-ins | 2 days (ticketed) | Exclusive Pokémon debuts, regional exclusives, special research |
| **GO Tour** | Annual celebration of a specific region | 2 days (ticketed) | Regional Pokémon, shiny releases, masterwork research |
| **Team GO Rocket Takeover** | Event featuring increased Team GO Rocket activity | Multiple days | New shadow Pokémon, increased grunt/leader spawns, special research |
| **Hatch Day** | Event focused on egg hatching with featured Pokémon | 6 hours (11 AM - 5 PM) | 1/10 shiny rate from eggs, 2x hatch candy, featured 2km eggs |
| **Max Mondays** | Weekly Dynamax/Gigantamax event | 1 hour (6-7 PM Monday local time) | Featured Max Battle boss, 8x Max Particles from Power Spots, increased particle cap to 1,600 |
| **Season** | 3-month themed period with rotating content | ~90 days | Themed spawns, research, events, rotating hemispheric spawns |

### Event Entry Fields

| Field | Type | Description |
|-------|------|-------------|
| `eventID` | string | Unique identifier |
| `name` | string | Display name |
| `eventType` | string | Type (raid-day, community-day, event, etc.) |
| `start` | string (ISO 8601) | Event start timestamp |
| `end` | string (ISO 8601) | Event end timestamp |
| `priority` | number | Calculated score (higher = more important) |
| `endsIn` | string | Human-readable duration until event ends |
| `startsIn` | string | Human-readable duration until event starts |
| `hasShiny` | boolean | Event has shiny opportunities |
| `hasRaids` | boolean | Event has raid-related content |
| `hasEggs` | boolean | Event has egg-related content |
| `hasBonuses` | boolean | Event has bonuses |
| `hasSpawns` | boolean | Event has special spawns |
| `hasFieldResearchTasks` | boolean | Event has field research tasks |

### Priority Scoring

Priority scores are calculated based on event type and features:
- Community Day: 100
- GO Tour/Fest: 95
- Raid Day: 90
- Raid Hour: 85
- Spotlight Hour: 80
- Team GO Rocket: 75
- Generic Event: 70
- Raid Battles: 60
- Season: 50
- +15 bonus for shiny opportunities
- +10 bonus for active bonuses
- +25 urgency bonus for events ending <24h

## Current Availability

Unified availability object organized by source type.

### Raids (`currentAvailability.raids`)

Raids are cooperative multiplayer battles against powerful Pokémon that appear at Gyms. Multiple trainers can team up to defeat raid bosses and earn rewards including rare candy, TMs, and a chance to catch the featured Pokémon.

#### Raid Mechanics

- **Duration**: Raids appear for 1 hour with a 45-minute egg countdown
- **Team Size**: 1-20 trainers (varies by difficulty)
- **Raid Passes**: In-person raids require Raid Passes (1 free per day) or Premium Raid Passes; Remote Raid Passes allow participation from a distance (daily limit applies)
- **Rewards**: Premier Balls (based on damage, gym control, team contribution), rare items, XP, and a catch encounter
- **Weather Boost**: Raid bosses can be weather-boosted, appearing at level 25 instead of level 20 with increased CP
- **IV Floor**: 10/10/10 for regular raids, 6/6/6 for Shadow Raids

Grouped by tier:
- `mega` - Mega Raids (Tier 4 difficulty)
- `5-star` - Legendary Raids (hardest tier, requires multiple trainers)
- `3-star` - Tier 3 Raids (soloable with strong teams)
- `1-star` - Tier 1 Raids (easily soloable)
- `shadow` - Shadow Raids (Team GO Rocket-occupied gyms, cannot use Remote Passes)

**New in 2026**: Tier 7 Mega Raids featuring Mega Legendary Pokémon with significantly increased difficulty and 8+ trainer requirements.

Each raid includes:
- `name`, `originalName`, `form`
- `image`
- `canBeShiny`
- `isShadowRaid`
- `types` - Array of type objects with name/image
- `combatPower` - Normal and boosted CP ranges
- `boostedWeather` - Weather conditions
- `activeEventIDs` - Related active events

#### Weather Boost System

Weather directly affects Pokémon spawns, move effectiveness, and CP levels in Pokémon GO:

| Weather | Boosted Types | Effects |
|---------|---------------|---------|
| Clear/Sunny | Grass, Fire, Ground | +5 levels to wild spawns (max level 35), +25% Stardust, 4/4/4 IV floor, +20% move damage |
| Rainy | Water, Electric, Bug | Same boosts as above for respective types |
| Partly Cloudy | Normal, Rock | Same boosts as above for respective types |
| Cloudy | Fairy, Fighting, Poison | Same boosts as above for respective types |
| Windy | Flying, Dragon, Psychic | Same boosts as above for respective types |
| Snow | Ice, Steel | Same boosts as above for respective types |
| Fog | Dark, Ghost | Same boosts as above for respective types |

**Important**: Weather is determined by AccuWeather data and updates hourly. Weather-boosted Pokémon (including raid bosses) have a swirling animation on the catch screen.

### Eggs (`currentAvailability.eggs`)

Eggs are obtained from PokéStops, Gyms, Gifts, and special encounters. They require Incubators to hatch and must be walked a specific distance.

#### Egg Hatching Mechanics

- **Incubators**: Unlimited-use Incubator (orange) or Limited-use Incubators (3 uses, blue)
- **Distance Tracking**: Uses GPS and smartphone motion sensors; Adventure Sync tracks distance when app is closed
- **Speed Limit**: ~10.5 km/h (6.5 mph) maximum speed for distance to count
- **IV Floor**: All hatched Pokémon have minimum 10/10/10 IVs (significantly better than wild catches)
- **Level**: Hatched Pokémon level equals trainer level when egg was obtained (capped at level 20)
- **Quick Hatch Strategy**: Close app with Adventure Sync off, walk distance, turn Adventure Sync on before opening app to batch-hatch eggs with star piece active

Grouped by distance:
- `2km`, `5km`, `7km`, `10km`, `12km`
- `adventureSync5km`, `adventureSync10km`

**Adventure Sync Eggs**: Special eggs earned by walking 25km (5km egg) or 50km (10km egg) per week with Adventure Sync enabled, featuring rarer Pokémon pools.

**Gift Eggs (7km)**: Obtained from opening Gifts from friends; often contain regional forms (Alolan, Galarian, Hisuian) and baby Pokémon.

**Strange Eggs (12km)**: Red eggs obtained by defeating Team GO Rocket Leaders; contain Dark and Poison-type Pokémon including rare species like Sandile, Salandit, and Shroodle.

Each egg entry includes:
- `name`, `image`
- `canBeShiny`
- `combatPower`
- `rarity` - 1-5 scale
- `isRegional`, `isGiftExchange`
- `eventOverride` - Active event IDs affecting egg pools

#### Rarity Tiers

Egg contents are displayed with rarity tiers visible in-game:

| Tier | Estimated Hatch Rate | Description |
|------|---------------------|-------------|
| 1 | >10% | Most common hatches |
| 2 | 7-10% | Common hatches |
| 3 | 4-7% | Uncommon hatches |
| 4 | 2-4% | Rare hatches |
| 5 | <2% | Very rare hatches (e.g., Larvesta, Jangmo-o, Frigibax) |

**Note**: Rarity tiers represent ranges, not exact percentages. Different species within the same tier may have varying actual rates.

### Research (`currentAvailability.research`)

Field Research consists of tasks obtained by spinning PokéStops. Completing tasks rewards items, Stardust, XP, or Pokémon encounters.

#### Research System

- **Task Acquisition**: Spin PokéStops/Gyms to receive one random task
- **Task Storage**: Up to 3 tasks can be held simultaneously; completing or deleting tasks opens slots
- **Stamps**: Completing one task per day awards a stamp (resets at midnight local time)
- **Research Breakthrough**: Collect 7 stamps to unlock a special encounter with a rare or legendary Pokémon plus bonus rewards (encounters rotate monthly)
- **Task Types**: Catching, throwing, battling, walking, evolving, powering up, buddy activities, raids, Team GO Rocket, hatching, and exploration tasks

Contains:
- `encounters` - Deduplicated Pokemon encounters with all source tasks
- `itemRewards` - Notable item rewards (limited to 50)

Encounter format:
```json
{
  "pokemon": "Fidough",
  "image": "...",
  "canBeShiny": true,
  "combatPower": { "min": 389, "max": 422 },
  "tasks": [
    { "text": "Earn a Candy exploring with your buddy", "type": "buddy" }
  ]
}
```

#### Common Task Categories

| Category | Example Tasks | Typical Rewards |
|----------|---------------|-----------------|
| Catching | Catch 5 Pokémon, Catch 5 Weather-boosted Pokémon | Common Pokémon, Stardust |
| Throwing | Make 5 Great Throws, Make 3 Excellent Throws in a row | Rare Pokémon (Anorith, Gible), encounter chances |
| Battling | Win a raid, Win in GO Battle League | Rare encounters (Aerodactyl, Lapras, Scyther) |
| Walking | Walk 2km, Earn 2 hearts with your buddy | Pokémon encounters, items |
| Hatching | Hatch an Egg, Hatch 2 Eggs | Baby Pokémon, rare species (Mawile, Feebas) |

### Rocket (`currentAvailability.rocket`)

Team GO Rocket operatives invade PokéStops (turning them black) and appear in hot air balloons every 6 hours. Defeating them rewards encounters with Shadow Pokémon.

#### Team GO Rocket Mechanics

- **Grunts**: Basic operatives at invaded PokéStops and balloons; use type-themed teams
- **Leaders** (Cliff, Arlo, Sierra): Require a Rocket Radar (crafted from 6 Mysterious Components from Grunts); reward rare Shadow Pokémon with 1/64 shiny rate
- **Giovanni**: Final boss requiring Super Rocket Radar (from Special Research); rewards Shadow Legendary Pokémon (100% catch rate)
- **Shadow Pokémon**: Powered-up Pokémon with +20% attack but -20% defense; charged move is Frustration (can be removed during special events)
- **Purification**: Costs Candy and Stardust; reduces power-up costs and grants Return charged move
- **Shiny Shadow Rates**: Grunts 1/256, Leaders 1/64 (significantly boosted compared to wild)
- **Battle Strategy**: Grunts use no shields; Leaders use 2 shields; charge attacks cause brief AI delay for switching/attacking
- **Premier Balls**: Based on surviving Pokémon and Hero/Purifier medal ranks

**New in 2026**: Shadow Raid feature allows Remote Raid Pass participation in Shadow Raids for the first time, with higher IV floors for better Shadow Pokémon.

Contains:
- `leaders` - Giovanni, Cliff, Arlo, Sierra
- `grunts` - Type-themed grunts

Each entry includes:
- `name`, `title`, `type`
- `catchablePokemon` - Array of encounterable Pokemon
- `lineup` - First/second/third slot Pokemon names

#### Grunt Identification Guide

Grunts announce their type before battle:

| Taunt | Type | Strategy |
|-------|------|----------|
| "Normal doesn't mean weak" | Normal | Use Fighting types |
| "Ke...ke...ke...ke...ke" | Grass | Use Fire/Flying/Bug types |
| "These waters are treacherous!" | Water | Use Electric/Grass types |
| "Get ready to be shocked!" | Electric | Use Ground types |
| "Don't tangle with us!" | Grass | Use Fire types |
| "You're gonna be frozen in your tracks!" | Ice | Use Fire/Fighting/Rock types |
| "ROAR! ...That's how a dragon roars!" | Dragon | Use Dragon/Ice/Fairy types |

## Pokemon Index

Cross-reference array showing every source for each Pokemon.

```json
{
  "name": "Alolan Diglett",
  "sources": [
    { "type": "egg", "eggType": "7 km", "canBeShiny": true, "rarity": 1 },
    { "type": "research", "task": "Make 5 Nice Throws", "canBeShiny": true }
  ],
  "shinyEligible": true,
  "cpRange": { "min": 264, "max": 389 },
  "shinyData": {
    "releasedDate": "2019/06/28",
    "dexNumber": 50,
    "family": "Diglett_61"
  },
  "baseSpecies": "Diglett",
  "activeEventIDs": ["precious-pals-2026"]
}
```

### Source Types
- `raid` - Include tier, isShadow
- `egg` - Include eggType, isAdventureSync, rarity
- `research` - Include task text and taskType
- `rocket` - Include leader name, isShadow flag

### Form Handling

Pokémon with forms (Shadow, Mega, Alolan, Galarian, Hisuian, Paldean, or parenthetical forms like "Incarnate") have:
- Separate index entries
- `baseSpecies` field linking to the base Pokemon

#### Regional Forms

Regional forms are variants of existing Pokémon with different appearances, types, and stats:

| Region | Count | Introduction | Typical Acquisition |
|--------|-------|--------------|---------------------|
| **Alolan** | 18 forms | Gen 7 (Sun/Moon) | 7km Gift Eggs, Raids, occasional wild spawns |
| **Galarian** | 20 forms | Gen 8 (Sword/Shield) | 7km Gift Eggs, Raids, Research encounters |
| **Hisuian** | 17 forms | Legends: Arceus | 7km Gift Eggs, Raids, Special events |
| **Paldean** | 4 forms | Gen 9 (Scarlet/Violet) | Event-exclusive spawns and eggs |

**Notable Regional Forms**:
- Alolan Ninetales (Ice/Fairy), Alolan Marowak (Fire/Ghost), Alolan Exeggutor (Grass/Dragon)
- Galarian Darmanitan (Ice), Galarian Weezing (Poison/Fairy), Galarian Stunfisk (Ground/Steel)
- Hisuian Arcanine (Fire/Rock), Hisuian Goodra (Steel/Dragon), Hisuian Zoroark (Normal/Ghost)

### Combat Power (CP) System

CP is the primary stat indicator in Pokémon GO, calculated from base stats, IVs, and level:

#### CP Formula

```
CP = FLOOR(((Attack + Attack IV) × √(Defense + Defense IV) × √(Stamina + Stamina IV) × (CPM² )) / 10)
```

Where:
- **Base Stats**: Species-specific values (e.g., Blissey has high Stamina, Mewtwo has high Attack)
- **IVs**: Individual Values ranging 0-15 for each stat (Attack, Defense, Stamina/HP)
- **CPM**: Combat Power Multiplier (level-based scaling factor)
- **Level**: Ranges from 1 to 50 (current cap); half-levels exist (e.g., 40.5, 41.5)

#### CP Ranges by Source

| Source | Level Range | IV Floor | Max CP at Catch |
|--------|-------------|----------|-----------------|
| Wild (normal) | 1-30 (Trainer level cap) | 0/0/0 | Base species dependent |
| Wild (weather boosted) | 1-35 | 4/4/4 | Higher than normal |
| Raids (T1-5, Mega) | 20 (25 boosted) | 10/10/10 | Fixed per species/tier |
| Shadow Raids | 20 (25 boosted) | 6/6/6 | Fixed per species |
| Eggs (all types) | Trainer level (max 20) | 10/10/10 | Varies by species |
| Research encounters | 15 | 10/10/10 | Fixed per species |
| GO Battle League rewards | 20 | 10/10/10 | Fixed per species |

**Best Buddy Boost**: Pokémon at Best Buddy status gain +1 level (CP boost) while active as your buddy.

#### IV Appraisal

The in-game appraisal system rates IVs with stars:
- **3 stars (red)**: 82-100% IV perfection (37-45 total stat points)
- **2 stars (orange)**: 67-80% IV perfection
- **1 star (yellow)**: 51-64% IV perfection
- **0 stars (white)**: 0-49% IV perfection

**Perfect IVs ("Hundo")**: 15/15/15 = 100% IV = 3 red stars

## Shiny Opportunities

Cross-references shiny availability with current sources.

### Shiny Mechanics

Shiny Pokémon are alternate color variants that are purely cosmetic. The shiny status is determined when a Pokémon spawns or is generated (for eggs/raids/research).

#### Base Shiny Rates

| Encounter Type | Shiny Rate | Notes |
|----------------|------------|-------|
| Standard Wild Spawn | 1/512 | Base rate for most species |
| Shadow Pokémon (Grunts) | 1/256 | Doubled rate from Grunts |
| Shadow Pokémon (Leaders) | 1/64 | 8x base rate from Cliff/Arlo/Sierra |
| Rare Wild Spawns (Gible, Shinx) | 1/128 | "Permaboosted" species |
| Raid Bosses (Legendary, T5) | 1/20 | Significantly increased for legendaries |
| Mega Raids | 1/128 | Applied to evolved forms |
| Research Tasks (Limited/Special) | 1/20 to 1/40 | Varies by research type |

#### Event-Boosted Rates

| Event Type | Shiny Rate | Duration |
|------------|------------|----------|
| **Community Day** | 1/25 | 3 hours monthly |
| **Raid Day** | 1/10 | 3-4 hours special events |
| **Hatch Day** | 1/10 | 6 hours (from featured eggs) |
| **GO Fest (ticketed)** | 1/64 to 1/128 | 2-day annual event |
| **Safari Zone** | 1/128 | Regional events |
| **Limited Research** | 1/20 to 1/40 | Varies by task |
| **Costume/Event Boosted** | 1/64 | Special costume releases |

**Important**: Shiny rates are per encounter, not cumulative. Encountering 512 standard spawns does not guarantee a shiny.

### Shiny Categories

| Category | Definition |
|----------|------------|
| `recentDebuts` | Shinies released within the last 30 days |
| `boostedRates` | Shinies with boosted rates from active events |
| `permanentlyAvailable` | Standard shiny-eligible Pokemon (limited to 100) |

```json
{
  "name": "Fidough",
  "dexNumber": 926,
  "releasedDate": "2026/01/20",
  "imageUrl": "...",
  "family": "Fidough",
  "debutType": "recent"
}
```

### Shiny Entry Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Pokemon name |
| `dexNumber` | number | National Pokedex number |
| `releasedDate` | string | Date when shiny was released (YYYY/MM/DD) |
| `imageUrl` | string | Image URL |
| `family` | string | Evolution family |
| `debutType` | string | Type of debut (recent, boosted, etc.) |
| `boostSource` | array | (Optional) Array of event IDs providing boost |

### Shiny Hunting Strategies

1. **Community Day**: Best odds for featured species (1/25) - play full 3 hours for maximum encounters
2. **Raid Days**: Target legendary shinies at 1/10 rate with coordinated raid groups
3. **Spotlight Hours**: Not boosted rates, but massive spawn increases improve overall odds
4. **Shadow Pokémon**: Leaders offer 1/64 shiny rate - use Rocket Radars strategically
5. **Permaboosted Species**: Prioritize Gible, Shinx, Alolan forms (1/128 or 1/64 permanent rates)

## Dynamax and Gigantamax System (New in 2024-2026)

Dynamax and Gigantamax mechanics from Pokémon Sword/Shield were integrated into Pokémon GO starting with the Max Out season.

### Power Spots

Power Spots are special locations (separate from PokéStops/Gyms) where Max Battles occur:

- **Duration**: Typically appear for 2 days before rotating to new locations
- **Max Particles**: Collect 100-120 particles per Power Spot per day (resets at 5 AM local time)
- **Daily Cap**: 800 Max Particles from all sources; 1,000 maximum storage
- **Walking Bonus**: Walk 2km to earn 300 Max Particles (once per day)
- **Max Mondays**: Weekly event with 8x Max Particle distribution and increased cap to 1,600
- **Placement**: After defeating a Max Battle, place your Dynamax/Gigantamax Pokémon to help others (up to 40 total)
- **Damage Boost**: Power Spots with 15+ placed Pokémon grant +20% damage bonus to all participants

### Max Battles

- **Dynamax Battles**: 1-4 star difficulty; 4 trainers team up against a giant Pokémon
- **Gigantamax Battles**: 6-star difficulty; 10-40 trainers coordinate to defeat ultra-powerful bosses
- **Max Moves**: Three special moves per Dynamax Pokémon:
  - **Max Attack** (unlocked by default at level 1)
  - **Max Guard** (shield ability, must unlock)
  - **Max Spirit** (healing ability, must unlock)
- **Upgrade Costs**: Max Particles + Stardust + Candy/XL Candy to level moves (max level 3)
- **Battle Phases**: 
  1. Tank phase - use fast attacks to charge Dynamax meter
  2. Dynamax phase - transform and use 3 Max Attacks for massive damage
  3. Return to normal - resume tanking/charging
- **Cheering**: Fainted trainers can still tap screen to help charge meter for active teammates
- **Party Power**: When raiding with Party Play active, Party Power doubles Charged Attack damage (charges faster with more party members)

### Obtaining Dynamax/Gigantamax Pokémon

1. **Max Battles**: Defeat and catch from Power Spot battles (costs Max Particles to enter)
2. **Special Trade**: Trade Gigantamax Pokémon with other trainers (requires Special Trade slot)
3. **Evolution**: Dynamax Pokémon can evolve while maintaining Dynamax status (e.g., Dynamax Charmander → Charmeleon → Charizard)

**Note**: Dynamax and Gigantamax Pokémon cannot be placed in Gyms or used in GO Battle League (PvP).

## Buddy System and Adventure Effects

The Buddy System allows trainers to walk with a Pokémon to earn Candy, XL Candy, and unlock progressive bonuses through Affection Hearts.

### Buddy Levels

| Level | Hearts Required | Key Unlocks |
|-------|----------------|-------------|
| **Good Buddy** | 1 | Appears on map, shows mood |
| **Great Buddy** | 70 | Catches Pokémon that deflect Poké Balls, brings Presents |
| **Ultra Buddy** | 150 | Finds Souvenirs, highlights interesting PokéStops |
| **Best Buddy** | 300 | CP Boost (+1 level) while active, Best Buddy Ribbon |

### Earning Hearts (Max 10/day, or 20 when Excited)

| Activity | Hearts | Requirements |
|----------|--------|--------------|
| Walk 2km | ❤️ | Walk with buddy active |
| Give Buddy a treat | ❤️ | Feed berries (3 berries = 1 full hunger bar) |
| Play together | ❤️ | AR interaction, rub buddy until happy |
| Battle together | ❤️ | Use in Gym/Raid/Trainer/GO Rocket battle (just needs to be in party) |
| Take a snapshot | ❤️ | Photo of your buddy |
| Visit new places | ❤️ | Spin a new PokéStop/Gym with this buddy |

### Buddy Excitement

Get buddy "Excited" for double hearts (20/day instead of 10):
- Requires 32 Emotion Points in one day
- Each activity has 30-minute cooldown
- Do activities 3+ times per day to reach Excited mood
- Excited mood reduces walking distance for Candy by 50%

### Adventure Effects

When a Pokémon reaches Best Buddy and has an Adventure Effect, it provides special bonuses while active:

| Effect | Bonus | Legendary Pokémon |
|--------|-------|-------------------|
| **Catch Bonus** | Increased catch rate for all Pokémon | Victini, Latios, Latias |
| **Finding Items** | Higher chance for rare items from PokéStops | Kyogre, Groudon, Rayquaza |
| **CP Boost** | +1 level increase (always active for Best Buddy) | All Best Buddy Pokémon |
| **Catch Assistance** | Buddy may bounce back deflected Poké Balls | Great Buddy+ (all species) |
| **XP Boost** | Increased XP from catches | Jirachi |
| **Candy Finding** | Finds extra Candy while walking | Palkia, Dialga, Giratina |
| **Bonus Hearts** | Easier to earn hearts | Mew, Celebi, Meloetta |
| **Interaction Range** | Extended distance for spinning stops and catching | Azelf, Mesprit, Uxie |

**Tip**: Many trainers keep legendary Pokémon with useful Adventure Effects (like Kyogre for item bonus) at Best Buddy status and rotate them as needed.

### Candy Walking Distances

Different Pokémon require different walking distances to earn 1 Candy:

| Distance | Typical Species | Examples |
|----------|----------------|----------|
| 1 km | Common, starter, baby Pokémon | Caterpie, Pikachu, Pichu |
| 3 km | Uncommon species | Charmander, Squirtle, Bulbasaur |
| 5 km | Rare and evolved forms | Most evolved forms, rarer species |
| 20 km | Legendary and Mythical | Mewtwo, Kyogre, Mew, Celebi |

**XL Candy**: Walking distance with buddy also has a chance to reward XL Candy (required for powering past level 40).

## Party Play

Party Play enables 4 trainers (level 15+) to adventure together with shared objectives:

### Features

- **On-Map Display**: See party members' avatars on the map in real-time
- **Party Challenges**: Cooperative tasks (catch Pokémon, spin stops, win raids, walk distance)
- **Party Power**: In raids, doubles Charged Attack damage (charges faster with more party members)
- **Activity Summary**: Tracks party progress in categories (Pokémon, Throws, Adventure, Battle, General)
- **Post-Party Highlights**: Shareable visual recap of accomplishments
- **Team Representation**: Show off your team (Mystic/Valor/Instinct) affiliation

### How to Use

**Host a Party**:
1. Open Trainer profile → Party tab → Create
2. Share numerical code or QR code with up to 3 nearby trainers
3. Tap Start to begin

**Join a Party**:
1. Open Trainer profile → Party tab → Join Party
2. Scan QR code or enter numerical code
3. Wait for host to start

### Party Challenge Examples

| Challenge | Reward |
|-----------|---------|
| Catch 25 Pokémon | 200 Stardust, 6 Poké Balls, 2 Pinap Berries |
| Make 20 Excellent Throws | 500 Stardust, 3 Ultra Balls, Max Potion/Revive |
| Win 2 Raids | Mega Energy (Charizard/Blastoise/Beedrill/Pidgeot) |
| Walk 3 km | 500 Stardust, 6 Poké Balls, Razz/Pinap Berries |
| Spin 20 PokéStops/Gyms | 3 Razz Berries |

**Duration**: Parties last 1 hour (can end early if host disbands)

# Generation

The contextual data is regenerated on every scrape run, after `combinedetails` completes.

```bash
npm run combinecontextual
```

# Use Cases

1. **"What raids are available right now?"** → `currentAvailability.raids`
2. **"What's ending soon?"** → `timeline.endingSoon`
3. **"Where can I find Thundurus?"** → Search `pokemonIndex` by name
4. **"What new shinies were just released?"** → `shinyOpportunities.recentDebuts`
5. **"Which Pokemon have boosted shiny rates?"** → `shinyOpportunities.boostedRates`
6. **"What events are active?"** → Combine `timeline.endingSoon` + `timeline.active`
7. **"Which Shadow Pokémon can I catch from Team GO Rocket?"** → `currentAvailability.rocket`
8. **"What Pokémon can hatch from 10km eggs?"** → `currentAvailability.eggs.10km`
9. **"What Field Research tasks reward rare encounters?"** → `currentAvailability.research.encounters`
10. **"Is this Pokémon weather-boosted right now?"** → Check weather icon and `boostedWeather` in raid data
11. **"What Dynamax battles are available at Power Spots?"** → Power Spot locations and featured boss rotation
12. **"Which legendary Pokémon has the best Adventure Effect for item farming?"** → Kyogre, Groudon, Rayquaza
