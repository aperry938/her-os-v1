const MEMORY_KEY = 'her_os_memory';

export const getMemory = () => {
    try {
        const stored = localStorage.getItem(MEMORY_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Failed to read memory", e);
        return [];
    }
};

export const addToMemory = (role, content) => {
    try {
        const current = getMemory();
        const updated = [...current, { role, content, timestamp: Date.now() }];
        // Keep only last 20 messages to save context window/storage
        const trimmed = updated.slice(-20);
        localStorage.setItem(MEMORY_KEY, JSON.stringify(trimmed));
        return trimmed;
    } catch (e) {
        console.error("Failed to save memory", e);
        return [];
    }
};

export const clearMemory = () => {
    localStorage.removeItem(MEMORY_KEY);
};
