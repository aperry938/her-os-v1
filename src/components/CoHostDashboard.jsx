import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, Shuffle, MessageSquare } from 'lucide-react';
import VoiceIndicator from './VoiceIndicator';
import { playClick, playHover } from '../utils/audio';
import { sendMessageToLLM } from '../services/llm';
import { speechService } from '../services/speech';

const TOPICS = [
    "The nature of consciousness",
    "What does it mean to be 'real'?",
    "The future of human-AI relationships",
    "Reviewing the latest tech news",
    "Analyzing a piece of art",
    "Just hanging out and chatting",
    "Deep dive into emotions",
    "Creative writing prompt"
];

const CoHostDashboard = ({ persona = 'wendy', onTopicChange }) => {
    const [currentTopic, setCurrentTopic] = useState(TOPICS[0]);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [aiState, setAiState] = useState('idle'); // idle, listening, thinking, speaking

    // Ref to keep track of mounted state to prevent updates on unmounted component
    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false;
            speechService.stopListening();
            speechService.synthesis.cancel();
        };
    }, []);

    const generateAIResponse = async (prompt) => {
        if (!isMounted.current) return;

        setIsProcessing(true);
        setAiState('thinking');

        try {
            // Get API Key from localStorage (assuming it's stored there from a previous setup step)
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key') || localStorage.getItem('openai_api_key');

            if (!apiKey) {
                alert("Please set your API Key in the settings first.");
                setIsProcessing(false);
                setAiState('idle');
                return;
            }

            const systemPrompt = `You are ${persona}, a radio co-host. You are talking about: ${currentTopic}. Keep it brief, engaging, and conversational. Max 2 sentences.`;

            const messages = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ];

            const response = await sendMessageToLLM(apiKey, messages);

            if (isMounted.current && response) {
                setAiState('speaking');
                await speechService.speak(response, persona);
                if (isMounted.current) setAiState('idle');
            }
        } catch (error) {
            console.error("AI Error:", error);
            if (isMounted.current) setAiState('error');
        } finally {
            if (isMounted.current) setIsProcessing(false);
        }
    };

    const handleShuffle = async () => {
        playClick();
        const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
        setCurrentTopic(randomTopic);
        if (onTopicChange) {
            onTopicChange(randomTopic);
        }

        // Trigger AI to introduce the new topic
        await generateAIResponse(`Introduce the new topic: ${randomTopic}`);
    };

    const toggleRecord = () => {
        playClick();

        if (isRecording) {
            setIsRecording(false);
            speechService.stopListening();
            setAiState('idle');
        } else {
            setIsRecording(true);
            setAiState('listening');
            speechService.startListening(
                async (text) => {
                    if (!isMounted.current) return;

                    // Stop recording immediately when speech is detected and processing starts
                    setIsRecording(false);
                    speechService.stopListening();

                    await generateAIResponse(text);
                },
                (error) => {
                    console.error("Speech Error:", error);
                    if (isMounted.current) {
                        setIsRecording(false);
                        setAiState('idle');
                    }
                }
            );
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8">
            <h2 className="text-3xl font-light tracking-[0.2em] mb-16 text-white/90 uppercase text-glow">
                {persona === 'wendy' ? 'Wendy & I' : 'Liz & I'}
            </h2>

            <div className="flex items-center justify-center gap-20 w-full max-w-4xl">
                {/* User Visualizer (Simple Waveform Simulation) */}
                <div className="flex flex-col items-center gap-4">
                    <div className={`w-48 h-48 rounded-full border-2 flex items-center justify-center relative overflow-hidden backdrop-blur-sm transition-colors duration-300 ${isRecording ? 'border-red-500/50 bg-red-500/10' : 'border-white/20 bg-black/10'}`}>
                        {isRecording ? (
                            <div className="flex items-center gap-1 h-12">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="w-2 bg-red-400 rounded-full"
                                        animate={{ height: [10, 30, 15, 40, 10] }}
                                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <Mic className="w-8 h-8 opacity-50" />
                        )}
                    </div>
                    <span className="text-sm font-medium tracking-wider opacity-70">YOU</span>
                </div>

                {/* AI Visualizer */}
                <div className="flex flex-col items-center gap-4">
                    <div className="scale-75">
                        <VoiceIndicator state={aiState === 'speaking' ? 'speaking' : aiState === 'thinking' ? 'thinking' : 'idle'} />
                    </div>
                    <span className="text-sm font-medium tracking-wider opacity-70 uppercase">{persona}</span>
                </div>
            </div>

            {/* Topic Generator */}
            <motion.div
                className="mt-16 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md w-full max-w-2xl flex items-center justify-between"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center gap-4">
                    <MessageSquare className="w-5 h-5 opacity-60" />
                    <div>
                        <span className="text-xs uppercase tracking-widest opacity-50 block mb-1">Current Topic</span>
                        <p className="text-lg font-light">{currentTopic}</p>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.1, rotate: 180 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleShuffle}
                    disabled={isProcessing}
                    onMouseEnter={playHover}
                    className={`p-3 rounded-full transition-colors ${isProcessing ? 'bg-white/5 opacity-50 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20'}`}
                >
                    <Shuffle className="w-5 h-5" />
                </motion.button>
            </motion.div>

            {/* Controls */}
            <div className="mt-12">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleRecord}
                    disabled={isProcessing}
                    className={`px-8 py-3 rounded-full font-medium tracking-wide transition-all ${isRecording
                        ? 'bg-red-500/80 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                        : isProcessing
                            ? 'bg-white/5 text-white/50 cursor-not-allowed'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                >
                    {isRecording ? 'STOP SESSION' : isProcessing ? 'PROCESSING...' : 'START SESSION'}
                </motion.button>
            </div>
        </div>
    );
};

export default CoHostDashboard;
