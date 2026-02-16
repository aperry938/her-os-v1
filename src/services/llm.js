// Client for OpenAI and Gemini Chat Completion APIs
// Simple in-memory rate limiter
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;
let requestTimestamps = [];

export const sendMessageToLLM = async (apiKey, messages, model = 'gpt-4-turbo-preview') => {
    // Check Rate Limit
    const now = Date.now();
    requestTimestamps = requestTimestamps.filter(t => now - t < RATE_LIMIT_WINDOW);

    if (requestTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
        throw new Error("Rate limit exceeded. Please wait a moment before trying again.");
    }

    requestTimestamps.push(now);

    if (!apiKey) {
        throw new Error("API Key is missing.");
    }

    // Detect API Provider based on Key Format
    const isGemini = apiKey.startsWith('AIza') || (apiKey.length > 30 && !apiKey.startsWith('sk-'));

    if (isGemini) {
        return sendMessageToGemini(apiKey, messages);
    } else {
        return sendMessageToOpenAI(apiKey, messages, model);
    }
};

const sendMessageToOpenAI = async (apiKey, messages, model) => {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: 0.7,
                max_tokens: 150,
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to fetch response from OpenAI');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("OpenAI Error:", error);
        throw error;
    }
};

const sendMessageToGemini = async (apiKey, messages) => {
    // Helper to make the request
    const makeGeminiRequest = async (modelName) => {
        try {
            const systemMessage = messages.find(m => m.role === 'system');
            let conversationMessages = messages.filter(m => m.role !== 'system');

            // Prepend system prompt to first user message for compatibility
            if (systemMessage && conversationMessages.length > 0) {
                const firstMsg = conversationMessages[0];
                if (firstMsg.role === 'user') {
                    conversationMessages[0] = {
                        ...firstMsg,
                        content: `${systemMessage.content}\n\n${firstMsg.content}`
                    };
                } else {
                    conversationMessages.unshift({
                        role: 'user',
                        content: systemMessage.content
                    });
                }
            } else if (systemMessage) {
                conversationMessages = [{ role: 'user', content: systemMessage.content }];
            }

            const contents = conversationMessages.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
            }));

            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

            const body = {
                contents: contents,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 150,
                }
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.error?.message || errorData.error?.status || 'Unknown Gemini Error';
                throw new Error(errorMessage);
            }

            const data = await response.json();

            if (!data.candidates || data.candidates.length === 0) {
                throw new Error("Gemini returned no candidates. Check safety settings.");
            }

            const candidate = data.candidates[0];
            if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
                throw new Error("Gemini candidate missing content or parts.");
            }

            return candidate.content.parts[0].text;
        } catch (error) {
            throw error;
        }
    };

    // Try gemini-3-pro-preview first, then fallback to gemini-2.5-pro
    try {
        return await makeGeminiRequest('gemini-3-pro-preview');
    } catch (error) {
        console.warn("Gemini 3 Pro Preview failed, trying fallback to gemini-2.5-pro:", error.message);
        try {
            return await makeGeminiRequest('gemini-2.5-pro');
        } catch (fallbackError) {
            console.warn("Gemini 2.5 Pro failed, trying fallback to gemini-2.5-flash:", fallbackError.message);
            try {
                return await makeGeminiRequest('gemini-2.5-flash');
            } catch (finalError) {
                console.error("All Gemini Models Failed:", finalError);
                throw new Error(`Gemini API Error: ${finalError.message}`);
            }
        }
    }
};
