import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand, Scissors, Square } from 'lucide-react'; // Square as Paper/Rock representation
import { playClick, playHover, playNotification } from '../utils/audio';

const CHOICES = [
    { id: 'rock', icon: <div className="w-8 h-8 rounded-full bg-current" />, label: 'Rock' },
    { id: 'paper', icon: <Square className="w-8 h-8" />, label: 'Paper' },
    { id: 'scissors', icon: <Scissors className="w-8 h-8" />, label: 'Scissors' }
];

const GameMode = () => {
    const [playerChoice, setPlayerChoice] = useState(null);
    const [aiChoice, setAiChoice] = useState(null);
    const [result, setResult] = useState(null);
    const [isThinking, setIsThinking] = useState(false);

    const handleChoice = (choice) => {
        playClick();
        setPlayerChoice(choice);
        setIsThinking(true);
        setResult(null);
        setAiChoice(null);

        // AI thinks for a bit
        setTimeout(() => {
            const randomChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)];
            setAiChoice(randomChoice);
            setIsThinking(false);
            determineWinner(choice, randomChoice);
            playNotification();
        }, 1500);
    };

    const determineWinner = (player, ai) => {
        if (player.id === ai.id) {
            setResult("It's a tie!");
        } else if (
            (player.id === 'rock' && ai.id === 'scissors') ||
            (player.id === 'paper' && ai.id === 'rock') ||
            (player.id === 'scissors' && ai.id === 'paper')
        ) {
            setResult("You win!");
        } else {
            setResult("I win!");
        }
    };

    const resetGame = () => {
        setPlayerChoice(null);
        setAiChoice(null);
        setResult(null);
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8">
            <h2 className="text-2xl font-light tracking-widest mb-16 opacity-80 uppercase">Rock Paper Scissors</h2>

            <div className="flex items-center justify-center gap-32 w-full max-w-4xl mb-20">
                {/* Player Side */}
                <div className="flex flex-col items-center gap-8">
                    <span className="text-sm font-medium tracking-wider opacity-60">YOU</span>
                    <div className="flex gap-4">
                        {CHOICES.map((choice) => (
                            <motion.button
                                key={choice.id}
                                whileHover={{ scale: 1.1, y: -5 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleChoice(choice)}
                                onMouseEnter={playHover}
                                disabled={isThinking || (playerChoice && !result)}
                                className={`p-6 rounded-2xl border transition-all ${playerChoice?.id === choice.id
                                        ? 'bg-white text-her-red border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    } ${playerChoice && playerChoice.id !== choice.id ? 'opacity-30' : 'opacity-100'}`}
                            >
                                {choice.icon}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* VS Divider */}
                <div className="text-2xl font-light opacity-30">VS</div>

                {/* AI Side */}
                <div className="flex flex-col items-center gap-8">
                    <span className="text-sm font-medium tracking-wider opacity-60">HER</span>
                    <div className="w-32 h-32 flex items-center justify-center rounded-full bg-white/5 border border-white/10 relative">
                        <AnimatePresence mode="wait">
                            {isThinking ? (
                                <motion.div
                                    key="thinking"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="w-full h-full rounded-full border-t-2 border-white animate-spin opacity-50"
                                />
                            ) : aiChoice ? (
                                <motion.div
                                    key="choice"
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1.5, rotate: 0 }}
                                    className="text-white"
                                >
                                    {aiChoice.icon}
                                </motion.div>
                            ) : (
                                <span className="text-xs opacity-30">WAITING</span>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Result */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center gap-6"
                    >
                        <h3 className="text-4xl font-light tracking-tight">{result}</h3>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={resetGame}
                            className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm tracking-wider"
                        >
                            PLAY AGAIN
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GameMode;
