import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Menu, Clock, Gamepad2, Radio, User, Settings, Key, AlertCircle, X } from 'lucide-react';
import VoiceIndicator from './VoiceIndicator';
import CoHostDashboard from './CoHostDashboard';
import GameMode from './GameMode';
import { playHover, playClick, playNotification, playStartListening } from '../utils/audio';
import { speechService } from '../services/speech';
import { sendMessageToLLM } from '../services/llm';
import { getMemory, addToMemory } from '../services/memory';
import { PERSONAS } from '../data/personas';

const OSInterface = () => {
  const [time, setTime] = useState(new Date());
  const [voiceState, setVoiceState] = useState('idle');
  const [mode, setMode] = useState('home');
  const [persona, setPersona] = useState('wendy');
  const [apiKey, setApiKey] = useState(() => {
    const legacy = localStorage.getItem('openai_api_key');
    if (legacy && !localStorage.getItem('her_os_api_key')) {
      localStorage.setItem('her_os_api_key', legacy);
      localStorage.removeItem('openai_api_key');
    }
    return localStorage.getItem('her_os_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
  });
  const [showSettings, setShowSettings] = useState(false);
  const [tempKey, setTempKey] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const themeStyles = persona === 'wendy'
    ? 'from-[#E87C56] to-[#D94436]'
    : 'from-[#8B5CF6] to-[#4C1D95]';

  const handleMicClick = () => {
    playClick();

    if (!apiKey) {
      setShowSettings(true);
      setError("Please enter your API key in settings.");
      return;
    }

    if (voiceState === 'idle') {
      playStartListening();
      setVoiceState('listening');
      setError(null);

      speechService.startListening(
        async (transcript) => {
          setVoiceState('processing');
          addToMemory('user', transcript);

          try {
            const history = getMemory();
            const systemMsg = { role: 'system', content: PERSONAS[persona].systemPrompt };
            const conversation = [systemMsg, ...history.map(m => ({ role: m.role, content: m.content }))];

            const responseText = await sendMessageToLLM(apiKey, conversation);

            addToMemory('assistant', responseText);
            setVoiceState('speaking');

            await speechService.speak(responseText, persona);
            setVoiceState('idle');
          } catch (err) {
            console.error(err);
            setError(err.message || "Failed to communicate with AI.");
            setVoiceState('idle');
          }
        },
        (err) => {
          console.error("Speech Error:", err);
          setError("Speech recognition failed. Please try again.");
          setVoiceState('idle');
        }
      );
    } else {
      speechService.stopListening();
      setVoiceState('idle');
    }
  };

  const handleTopicChange = async (topic) => {
    if (!apiKey) {
      setShowSettings(true);
      setError("Please enter your API key in settings.");
      return;
    }

    setVoiceState('processing');
    setError(null);
    const prompt = `Let's talk about this topic: "${topic}". Start the conversation with an interesting thought or question.`;
    addToMemory('user', prompt);

    try {
      const history = getMemory();
      const systemMsg = { role: 'system', content: PERSONAS[persona].systemPrompt };
      const conversation = [systemMsg, ...history.map(m => ({ role: m.role, content: m.content }))];

      const responseText = await sendMessageToLLM(apiKey, conversation);

      addToMemory('assistant', responseText);
      setVoiceState('speaking');

      await speechService.speak(responseText, persona);
      setVoiceState('idle');
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to generate topic response.");
      setVoiceState('idle');
    }
  };

  const switchMode = (newMode) => {
    playClick();
    speechService.stopListening();
    speechService.synthesis.cancel();
    setVoiceState('idle');
    setMode(newMode);
  };

  const togglePersona = () => {
    playClick();
    setPersona(prev => prev === 'wendy' ? 'liz' : 'wendy');
  };

  const saveApiKey = () => {
    localStorage.setItem('her_os_api_key', tempKey);
    setApiKey(tempKey);
    setShowSettings(false);
    setTempKey('');
    playNotification();
  };

  return (
    <div className={`noise-overlay relative w-full h-screen flex flex-col items-center justify-between p-8 text-white overflow-hidden transition-colors duration-1000 bg-gradient-to-br ${themeStyles}`}>

      {/* Ambient Background Orbs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
        style={{ background: persona === 'wendy' ? 'radial-gradient(circle, #F2E8DC 0%, transparent 70%)' : 'radial-gradient(circle, #C4B5FD 0%, transparent 70%)' }}
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -60, 30, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl"
        style={{ background: persona === 'wendy' ? 'radial-gradient(circle, #E6B8A2 0%, transparent 70%)' : 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }}
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 40, -20, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-24 left-1/2 transform -translate-x-1/2 z-50 bg-red-500/90 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 backdrop-blur-md"
          >
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <header className="w-full max-w-6xl flex justify-between items-center z-20">
        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-1 glass rounded-full px-2 py-1.5">
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => switchMode('home')}
              onMouseEnter={playHover}
              aria-label="Home"
              className={`p-2.5 rounded-full transition-colors ${mode === 'home' ? 'bg-white/20 shadow-inner' : 'hover:bg-white/10'}`}
            >
              <Menu className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => switchMode('cohost')}
              onMouseEnter={playHover}
              aria-label="Co-Host Radio Mode"
              className={`p-2.5 rounded-full transition-colors ${mode === 'cohost' ? 'bg-white/20 shadow-inner' : 'hover:bg-white/10'}`}
            >
              <Radio className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => switchMode('game')}
              onMouseEnter={playHover}
              aria-label="Game Mode"
              className={`p-2.5 rounded-full transition-colors ${mode === 'game' ? 'bg-white/20 shadow-inner' : 'hover:bg-white/10'}`}
            >
              <Gamepad2 className="w-5 h-5" />
            </motion.button>
          </nav>
          <motion.span
            key={persona}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 0.8, y: 0 }}
            className="text-sm font-medium tracking-wider uppercase"
          >
            {persona} OS
          </motion.span>
        </div>

        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={togglePersona}
            onMouseEnter={playHover}
            aria-label="Switch AI Persona"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full glass hover:bg-white/10 transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            <span className="text-xs uppercase tracking-widest font-medium">Switch Persona</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            onClick={() => setShowSettings(true)}
            onMouseEnter={playHover}
            aria-label="Settings"
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <Settings className="w-4 h-4 opacity-70" />
          </motion.button>

          <div className="h-4 w-px bg-white/15" />
          <div className="flex items-center gap-2 opacity-70">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-sm font-light tabular-nums">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl flex flex-col items-center justify-center relative z-10">
        <AnimatePresence mode="wait">
          {mode === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full h-full flex flex-col items-center justify-center"
            >
              <div className="relative">
                <VoiceIndicator state={voiceState} />
              </div>

              {/* Status Text */}
              <AnimatePresence>
                {voiceState !== 'idle' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-[65%] text-lg font-light tracking-[0.25em] opacity-80"
                  >
                    {voiceState === 'listening' && "Listening..."}
                    {voiceState === 'processing' && "Thinking..."}
                    {voiceState === 'speaking' && "Speaking..."}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {mode === 'cohost' && (
            <motion.div
              key="cohost"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              <CoHostDashboard persona={persona} onTopicChange={handleTopicChange} />
            </motion.div>
          )}

          {mode === 'game' && (
            <motion.div
              key="game"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              <GameMode />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Controls (Home only) */}
      {mode === 'home' && (
        <footer className="w-full max-w-md flex justify-center items-center gap-8 pb-8 z-20">
          <div className="relative">
            {/* Pulse ring when listening */}
            {voiceState === 'listening' && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-white/40"
                animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onMouseEnter={playHover}
              onClick={handleMicClick}
              aria-label={voiceState === 'idle' ? 'Start listening' : 'Stop'}
              className={`relative p-5 rounded-full backdrop-blur-md transition-all duration-500 ${voiceState === 'listening'
                ? 'bg-white text-black shadow-[0_0_40px_rgba(255,255,255,0.6)]'
                : voiceState === 'processing' || voiceState === 'speaking'
                  ? 'bg-white/20 text-white/50 cursor-wait'
                  : 'bg-white/10 hover:bg-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                }`}
            >
              <Mic className="w-6 h-6" />
            </motion.button>
          </div>
        </footer>
      )}

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSettings(false)}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1a1a]/95 p-8 rounded-2xl w-full max-w-md border border-white/10 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3 text-white/80">
                  <Key className="w-5 h-5" />
                  <h3 className="text-lg font-medium tracking-wide">API Configuration</h3>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  aria-label="Close settings"
                  className="text-white/50 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-white/50 mb-4 leading-relaxed">
                Enter your Gemini or OpenAI API key to enable AI communication.
                Your key is stored locally in your browser and never sent to any server.
              </p>

              <input
                type="password"
                placeholder="AIza... (Gemini) or sk-... (OpenAI)"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && tempKey && saveApiKey()}
                aria-label="API Key"
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white mb-6 focus:outline-none focus:border-white/30 focus:bg-black/50 transition-all placeholder:text-white/25"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-5 py-2.5 text-sm text-white/60 hover:text-white transition-colors rounded-xl hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={saveApiKey}
                  disabled={!tempKey}
                  className="px-6 py-2.5 bg-white text-black rounded-xl text-sm font-medium hover:bg-white/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Save Key
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OSInterface;
