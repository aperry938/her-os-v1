import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Menu, Clock, Calendar, Mail, Gamepad2, Radio, User, Settings, Key, AlertCircle, X } from 'lucide-react';
import VoiceIndicator from './VoiceIndicator';
import Card from './Card';
import CoHostDashboard from './CoHostDashboard';
import GameMode from './GameMode';
import { playHover, playClick, playNotification, playStartListening } from '../utils/audio';
import { speechService } from '../services/speech';
import { sendMessageToLLM } from '../services/llm';
import { getMemory, addToMemory, clearMemory } from '../services/memory';
import { PERSONAS } from '../data/personas';

const OSInterface = () => {
  const [time, setTime] = useState(new Date());
  const [voiceState, setVoiceState] = useState('idle');
  const [messages, setMessages] = useState([]);
  const [mode, setMode] = useState('home');
  const [persona, setPersona] = useState('wendy');
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [tempKey, setTempKey] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Theme styles based on persona
  const themeStyles = persona === 'wendy'
    ? 'from-[#E87C56] to-[#D94436] selection:bg-[#F2E8DC] selection:text-[#D94436]'
    : 'from-[#8B5CF6] to-[#4C1D95] selection:bg-[#E9D5FF] selection:text-[#4C1D95]';

  const handleMicClick = () => {
    playClick();

    if (!apiKey) {
      setShowSettings(true);
      setError("Please enter your OpenAI API Key in settings.");
      return;
    }

    if (voiceState === 'idle') {
      playStartListening();
      setVoiceState('listening');
      setError(null);

      speechService.startListening(
        async (transcript) => {
          // On Result
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
          } catch (error) {
            console.error(error);
            setError(error.message || "Failed to communicate with AI.");
            setVoiceState('idle');
          }
        },
        (error) => {
          console.error("Speech Error:", error);
          setError("Speech recognition failed. Please try again.");
          setVoiceState('idle');
        }
      );
    } else {
      // Cancel interaction
      speechService.stopListening();
      setVoiceState('idle');
    }
  };

  const handleTopicChange = async (topic) => {
    if (!apiKey) {
      setShowSettings(true);
      setError("Please enter your OpenAI API Key in settings.");
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
    } catch (error) {
      console.error(error);
      setError(error.message || "Failed to generate topic response.");
      setVoiceState('idle');
    }
  };

  const switchMode = (newMode) => {
    playClick();
    // Safety: Stop any active listening/speaking when switching modes
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
    localStorage.setItem('openai_api_key', tempKey);
    setApiKey(tempKey);
    setShowSettings(false);
    playNotification();
  };

  return (
    <div className={`relative w-full h-screen flex flex-col items-center justify-between p-8 text-white overflow-hidden transition-colors duration-1000 bg-radial ${themeStyles}`}>

      {/* Background Gradient Animation */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${themeStyles} opacity-50`}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
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
      <header className="w-full max-w-6xl flex justify-between items-center opacity-80 z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-full px-4 py-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => switchMode('home')}
              className={`p-2 rounded-full ${mode === 'home' ? 'bg-white/20' : ''}`}
            >
              <Menu className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => switchMode('cohost')}
              className={`p-2 rounded-full ${mode === 'cohost' ? 'bg-white/20' : ''}`}
            >
              <Radio className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => switchMode('game')}
              className={`p-2 rounded-full ${mode === 'game' ? 'bg-white/20' : ''}`}
            >
              <Gamepad2 className="w-5 h-5" />
            </motion.button>
          </div>
          <span className="text-sm font-medium tracking-wider uppercase">{persona} OS</span>
        </div>

        <div className="flex items-center gap-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={togglePersona}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <User className="w-3 h-3" />
            <span className="text-xs uppercase tracking-widest">Switch Persona</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-full hover:bg-white/10"
          >
            <Settings className="w-4 h-4" />
          </motion.button>

          <div className="h-4 w-px bg-white/20" />
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-light">
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
                    className="absolute top-[65%] text-lg font-light tracking-widest opacity-80"
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
              className="w-full h-full"
            >
              <GameMode />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Controls (Only show on Home) */}
      {mode === 'home' && (
        <footer className="w-full max-w-md flex justify-center items-center gap-8 pb-8 z-20">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={playHover}
            onClick={handleMicClick}
            className={`p-4 rounded-full backdrop-blur-md transition-all duration-500 ${voiceState === 'listening'
              ? 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.5)]'
              : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
          >
            <Mic className="w-6 h-6" />
          </motion.button>
        </footer>
      )}

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1a1a1a] p-8 rounded-2xl w-full max-w-md border border-white/10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3 text-white/80">
                  <Key className="w-5 h-5" />
                  <h3 className="text-lg font-medium tracking-wide">API Configuration</h3>
                </div>
                <button onClick={() => setShowSettings(false)} className="text-white/50 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-white/50 mb-4 leading-relaxed">
                To enable real AI communication, please enter your OpenAI API Key.
                It will be stored locally in your browser.
              </p>

              <input
                type="password"
                placeholder="sk-... or AIza..."
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white mb-6 focus:outline-none focus:border-white/30 transition-colors"
              />

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveApiKey}
                  className="px-6 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
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
