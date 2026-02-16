export class SpeechService {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;

        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
        }
    }

    startListening(onResult, onError) {
        if (!this.recognition) {
            onError("Speech recognition not supported in this browser. Use Chrome or Edge, or type your message instead.");
            return;
        }

        if (this.isListening) return;

        this.recognition.onstart = () => {
            this.isListening = true;
        };

        this.recognition.onend = () => {
            this.isListening = false;
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
        };

        this.recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            this.isListening = false;
            onError(event.error);
        };

        try {
            this.recognition.start();
        } catch (e) {
            console.error("Failed to start recognition:", e);
            onError("Failed to start speech recognition.");
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            try {
                this.recognition.stop();
            } catch {
                // Already stopped
            }
            this.isListening = false;
        }
    }

    speak(text, persona = 'wendy') {
        if (this.synthesis.speaking) {
            this.synthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        const voices = this.synthesis.getVoices();

        let selectedVoice = null;
        const keywords = persona === 'wendy'
            ? ['Google US English', 'Samantha', 'Karen']
            : ['Moira', 'Tessa', 'Google UK English Female'];

        for (const keyword of keywords) {
            selectedVoice = voices.find(v => v.name.includes(keyword));
            if (selectedVoice) break;
        }

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        if (persona === 'wendy') {
            utterance.pitch = 1.0;
            utterance.rate = 0.95;
        } else {
            utterance.pitch = 0.85;
            utterance.rate = 1.1;
        }

        this.synthesis.speak(utterance);

        return new Promise((resolve, reject) => {
            utterance.onend = resolve;
            utterance.onerror = (event) => {
                if (event.error === 'canceled') {
                    resolve(); // User-initiated cancel is not an error
                } else {
                    reject(new Error(`Speech synthesis failed: ${event.error}`));
                }
            };
            // Safety timeout — if TTS hangs for 30s, resolve anyway
            setTimeout(() => resolve(), 30000);
        });
    }
}

export const speechService = new SpeechService();
