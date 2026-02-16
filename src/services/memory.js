const MEMORY_KEY = 'her_os_memory';
const MAX_MESSAGES = 50;

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
        const trimmed = updated.slice(-MAX_MESSAGES);
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

export const exportMemory = (persona) => {
    const memory = getMemory();
    const exportData = {
        application: 'Her OS',
        exportedAt: new Date().toISOString(),
        persona,
        messageCount: memory.length,
        messages: memory.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: new Date(m.timestamp).toISOString(),
        }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `her-os-transcript-${persona}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
};
