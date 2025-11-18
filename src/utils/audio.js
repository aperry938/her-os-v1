// Simple synth for UI sounds
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const playTone = (freq, type, duration, vol = 0.1) => {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
};

export const playHover = () => playTone(400, 'sine', 0.1, 0.05);
export const playClick = () => playTone(600, 'sine', 0.15, 0.1);
export const playNotification = () => {
    playTone(500, 'sine', 0.2, 0.1);
    setTimeout(() => playTone(800, 'sine', 0.4, 0.1), 100);
};
export const playStartListening = () => {
    playTone(300, 'sine', 0.2, 0.1);
    setTimeout(() => playTone(500, 'sine', 0.4, 0.1), 150);
};
