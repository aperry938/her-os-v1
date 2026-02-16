// Simple synth for UI sounds — lazy-initialized to avoid browser autoplay warnings
let audioCtx = null;

const getAudioContext = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
};

const playTone = (freq, type, duration, vol = 0.1) => {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
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
