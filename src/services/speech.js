export class SpeechService {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;

        if ('webkitSpeechRecognition' in window) {
            this.recognition = new window.webkitSpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
        }
    }

    startListening(onResult, onError) {
        if (!this.recognition) {
            onError("Speech recognition not supported in this browser.");
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
            console.error("Speech recognition error", event.error);
            onError(event.error);
            this.isListening = false;
        };

        try {
            this.recognition.start();
        } catch (e) {
            console.error("Failed to start recognition", e);
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    speak(text, persona = 'wendy') {
        if (this.synthesis.speaking) {
            this.synthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        const voices = this.synthesis.getVoices();

        // Simple voice selection logic
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

        // Adjust pitch/rate based on persona
        if (persona === 'wendy') {
            utterance.pitch = 1.0; // Natural pitch
            utterance.rate = 0.95; // Slightly slower, more thoughtful
        } else {
            utterance.pitch = 0.85; // Deeper for Liz
            utterance.rate = 1.1; // Sharper, faster
        }

        this.synthesis.speak(utterance);

        return new Promise((resolve) => {
            utterance.onend = resolve;
        });
    }
}

export const speechService = new SpeechService();
