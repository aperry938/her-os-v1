// Client for OpenAI and Gemini Chat Completion APIs
const RATE_LIMIT_WINDOW = 60000;
const MAX_REQUESTS_PER_WINDOW = 10;
let requestTimestamps = [];

const checkRateLimit = () => {
    const now = Date.now();
    requestTimestamps = requestTimestamps.filter(t => now - t < RATE_LIMIT_WINDOW);
    if (requestTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
        throw new Error("Rate limit exceeded. Please wait a moment before trying again.");
    }
    requestTimestamps.push(now);
};

const isGeminiKey = (apiKey) => apiKey.startsWith('AIza') || (apiKey.length > 30 && !apiKey.startsWith('sk-'));

// ── Non-streaming (fallback) ────────────────────────────────────────────────

export const sendMessageToLLM = async (apiKey, messages) => {
    checkRateLimit();
    if (!apiKey) throw new Error("API Key is missing.");

    if (isGeminiKey(apiKey)) {
        return sendMessageToGemini(apiKey, messages);
    } else {
        return sendMessageToOpenAI(apiKey, messages);
    }
};

const sendMessageToOpenAI = async (apiKey, messages) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4-turbo-preview',
            messages,
            temperature: 0.7,
            max_tokens: 600,
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch response from OpenAI');
    }

    const data = await response.json();
    return data.choices[0].message.content;
};

const buildGeminiBody = (messages) => {
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const contents = conversationMessages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
    }));

    return {
        ...(systemMessage && {
            system_instruction: { parts: [{ text: systemMessage.content }] }
        }),
        contents,
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 600,
        }
    };
};

const sendMessageToGemini = async (apiKey, messages) => {
    const body = buildGeminiBody(messages);
    const models = ['gemini-2.5-flash', 'gemini-2.0-flash'];

    for (let i = 0; i < models.length; i++) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${models[i]}:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || errorData.error?.status || 'Unknown Gemini Error');
            }

            const data = await response.json();

            if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
                throw new Error("Gemini returned no content. Check safety settings.");
            }

            return data.candidates[0].content.parts[0].text;
        } catch (err) {
            if (i === models.length - 1) throw new Error(`Gemini API Error: ${err.message}`);
        }
    }
};

// ── Streaming ───────────────────────────────────────────────────────────────

export const sendMessageToLLMStreaming = async (apiKey, messages, onChunk) => {
    checkRateLimit();
    if (!apiKey) throw new Error("API Key is missing.");

    if (isGeminiKey(apiKey)) {
        return streamGemini(apiKey, messages, onChunk);
    } else {
        // OpenAI fallback: non-streaming, deliver as single chunk
        const text = await sendMessageToOpenAI(apiKey, messages);
        onChunk(text);
        return text;
    }
};

const streamGemini = async (apiKey, messages, onChunk) => {
    const body = buildGeminiBody(messages);
    const models = ['gemini-2.5-flash', 'gemini-2.0-flash'];

    for (let i = 0; i < models.length; i++) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${models[i]}:streamGenerateContent?alt=sse&key=${apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Gemini streaming error');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText = '';
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop(); // keep incomplete line in buffer

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    const jsonStr = line.slice(6).trim();
                    if (!jsonStr || jsonStr === '[DONE]') continue;

                    try {
                        const parsed = JSON.parse(jsonStr);
                        const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (text) {
                            fullText += text;
                            onChunk(fullText);
                        }
                    } catch {
                        // skip malformed chunks
                    }
                }
            }

            if (!fullText) throw new Error("Gemini stream returned no content.");
            return fullText;
        } catch (err) {
            if (i === models.length - 1) throw new Error(`Gemini Streaming Error: ${err.message}`);
        }
    }
};
