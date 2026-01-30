/**
 * @fileoverview AI enrichment for events using Vercel AI Gateway.
 * Adds aiSummary, aiHighlights, aiTags, and aiWarnings to each event.
 */

const fs = require('fs');
const logger = require('../src/utils/logger');
const { chatCompletion } = require('../src/utils/aiGateway');

function normalizeList(values) {
    if (!Array.isArray(values)) return [];
    return values
        .map(value => {
            if (!value) return null;
            if (typeof value === 'string') return value;
            if (typeof value === 'object') {
                if (value.name) return value.name;
                if (value.text) return value.text;
            }
            return null;
        })
        .filter(Boolean)
        .slice(0, 12);
}

function buildPrompt(event) {
    const bonuses = normalizeList(event.bonuses);
    const pokemon = normalizeList(event.pokemon);
    const raids = normalizeList(event.raids);
    const research = normalizeList(event.research?.field || event.research);

    const payload = {
        id: event.eventID,
        name: event.name,
        type: event.eventType,
        heading: event.heading,
        start: event.start,
        end: event.end,
        bonuses,
        pokemon,
        raids,
        research
    };

    return `You are a data normalizer for Pokemon GO events.\n` +
        `Return ONLY Valid, parseable JSON. Do not include markdown formatting.\n` +
        `Use this structure:\n` +
        `{\n` +
        `  "summary": "Brief 1-2 sentence overview (max 40 words)",\n` +
        `  "highlights": ["Short highlight 1", "Short highlight 2", "Short highlight 3"],\n` +
        `  "tags": ["tag_1", "tag_2", "tag_3", "tag_4"],\n` +
        `  "warnings": ["Warning message if dates are invalid or data looks corrupted"]\n` +
        `}\n` +
        `Event data:\n${JSON.stringify(payload)}`;
}

function extractJson(text) {
    if (!text) return null;
    let trimmed = text.trim();
    // Remove markdown code block if present
    if (trimmed.startsWith('```json')) {
        trimmed = trimmed.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (trimmed.startsWith('```')) {
         trimmed = trimmed.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;
    const match = trimmed.match(/\{[\s\S]*\}/);
    return match ? match[0] : null;
}

async function enrichEvent(event, model) {
    const messages = [
        { role: 'system', content: 'You are a helpful assistant that outputs JSON.' },
        { role: 'user', content: buildPrompt(event) }
    ];

    // Use Vercel AI Gateway's fallback mechanism
    // If primary model fails, it tries the list in 'models'
    const response = await chatCompletion({
        messages,
        model,
        temperature: 0.2,
        maxTokens: 400,
        response_format: { type: "json_object" },
        // Fallback models (2026 standard)
        models: ['openai/gpt-4o', 'anthropic/claude-sonnet-4']
    });

    const content = response?.choices?.[0]?.message?.content || '';
    const jsonText = extractJson(content);

    if (!jsonText) {
        throw new Error('No JSON object found in AI response.');
    }

    const parsed = JSON.parse(jsonText);

    return {
        aiSummary: parsed.summary || '',
        aiHighlights: Array.isArray(parsed.highlights) ? parsed.highlights.slice(0, 3) : [],
        aiTags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 6) : [],
        aiWarnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
        aiModel: model,
        aiGeneratedAt: new Date().toISOString()
    };
}

async function main() {
    const filePath = 'data/events.min.json';
    if (!fs.existsSync(filePath)) {
        logger.error(`Missing ${filePath}. Run the scrape pipeline first.`);
        process.exit(1);
    }

    const model = process.env.AI_GATEWAY_MODEL || 'openai/gpt-5';
    const limit = parseInt(process.env.AI_ENRICH_LIMIT || '0', 10);
    const force = String(process.env.AI_ENRICH_FORCE || 'false').toLowerCase() === 'true';

    const raw = fs.readFileSync(filePath, 'utf8');
    const events = JSON.parse(raw);

    if (!Array.isArray(events)) {
        logger.error('events.min.json is not an array.');
        process.exit(1);
    }

    let processed = 0;
    let updated = 0;

    for (const event of events) {
        if (!event || !event.eventID) continue;
        if (!force && event.aiSummary) {
            continue;
        }

        if (limit > 0 && processed >= limit) {
            break;
        }

        processed += 1;
        logger.info(`AI enriching ${event.eventID} (${event.eventType})...`);

        try {
            const enrichment = await enrichEvent(event, model);
            Object.assign(event, enrichment);
            updated += 1;
        } catch (error) {
            logger.warn(`AI enrichment failed for ${event.eventID}: ${error.message}`);
        }
    }

    fs.writeFileSync(filePath, JSON.stringify(events));
    logger.success(`AI enrichment complete. Updated ${updated} events.`);
}

main().catch(err => {
    logger.error(err.message || err);
    process.exit(1);
});
