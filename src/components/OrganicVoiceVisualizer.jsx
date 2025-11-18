import React from 'react';
import { motion } from 'framer-motion';

const OrganicVoiceVisualizer = ({ state }) => {
    // state: 'idle', 'listening', 'processing', 'speaking'

    const variants = {
        idle: {
            scale: [1, 1.05, 1],
            opacity: 0.5,
            transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            }
        },
        listening: {
            scale: [1, 1.2, 1],
            opacity: 0.8,
            transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
            }
        },
        processing: {
            scale: [1, 0.9, 1],
            rotate: [0, 180, 360],
            opacity: 0.6,
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "linear"
            }
        },
        speaking: {
            scale: [1, 1.5, 0.8, 1.2, 1],
            opacity: 1,
            transition: {
                duration: 0.8,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <div className="relative flex items-center justify-center w-64 h-64">
            {/* Core Circle */}
            <motion.div
                className="absolute w-32 h-32 bg-white rounded-full blur-xl"
                animate={state}
                variants={variants}
            />

            {/* Outer Glow */}
            <motion.div
                className="absolute w-48 h-48 bg-white rounded-full blur-3xl opacity-30"
                animate={state}
                variants={{
                    ...variants,
                    speaking: {
                        scale: [1, 1.3, 1],
                        opacity: 0.4,
                        transition: { duration: 1, repeat: Infinity }
                    }
                }}
            />

            {/* Inner Core */}
            <motion.div
                className="absolute w-16 h-16 bg-white rounded-full blur-md"
                animate={state}
                variants={{
                    ...variants,
                    listening: {
                        scale: [1, 0.8, 1],
                        transition: { duration: 0.5, repeat: Infinity }
                    }
                }}
            />
        </div>
    );
};

export default OrganicVoiceVisualizer;
