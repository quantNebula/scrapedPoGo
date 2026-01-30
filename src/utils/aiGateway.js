/**
 * @fileoverview Lightweight Vercel AI Gateway client helper.
 * Uses the OpenAI-compatible chat/completions endpoint.
 */

const DEFAULT_BASE_URL = process.env.AI_GATEWAY_BASE_URL || 'https://ai-gateway.vercel.sh/v1';
const DEFAULT_MODEL = process.env.AI_GATEWAY_MODEL || 'openai/gpt-5';

function getApiKey() {
    const key = process.env.AI_GATEWAY_API_KEY;
    if (!key) {
        throw new Error('AI_GATEWAY_API_KEY is not set. Add it to .env or your environment.');
    }
    return key;
}

async function chatCompletion({
    messages,
    model = DEFAULT_MODEL,
    temperature = 0.2,
    maxTokens = 500,
    timeoutMs = 30000,
    ...rest
}) {
    if (!Array.isArray(messages) || messages.length === 0) {
        throw new Error('messages array is required for chatCompletion');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const body = {
            model,
            messages,
            temperature,
            max_tokens: maxTokens,
            stream: false,
            ...rest
        };

        const response = await fetch(`${DEFAULT_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getApiKey()}`
            },
            body: JSON.stringify(body),
            signal: controller.signal
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`AI Gateway error ${response.status}: ${errorText}`);
        }

        return await response.json();
    } finally {
        clearTimeout(timeout);
    }
}

module.exports = {
    chatCompletion
};
