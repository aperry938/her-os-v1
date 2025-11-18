import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

const VoiceIndicator = ({ state = 'idle' }) => {
    // state: 'idle' | 'listening' | 'speaking' | 'processing'
    const controls = useAnimation();
    const glowControls = useAnimation();

    useEffect(() => {
        const animate = async () => {
            if (state === 'idle') {
                controls.start({
                    scale: [1, 1.02, 1],
                    opacity: [0.8, 0.9, 0.8],
                    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                });
                glowControls.start({
                    scale: [1, 1.1, 1],
                    opacity: [0.1, 0.15, 0.1],
                    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                });
            } else if (state === 'listening') {
                controls.start({
                    scale: [1, 1.1, 1],
                    opacity: 1,
                    transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                });
                glowControls.start({
                    scale: [1.2, 1.4, 1.2],
                    opacity: 0.3,
                    transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                });
            } else if (state === 'speaking') {
                controls.start({
                    scale: [1, 1.3, 0.9, 1.4, 1],
                    opacity: [0.9, 1, 0.9, 1, 0.9],
                    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                });
                glowControls.start({
                    scale: [1.1, 1.5, 1.1],
                    opacity: [0.2, 0.4, 0.2],
                    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                });
            } else if (state === 'processing') {
                controls.start({
                    rotate: 360,
                    scale: [0.9, 1.1, 0.9],
                    transition: { rotate: { duration: 2, repeat: Infinity, ease: "linear" }, scale: { duration: 1, repeat: Infinity } }
                });
            }
        };
        animate();
    }, [state, controls, glowControls]);

    return (
        <div className="relative flex items-center justify-center w-64 h-64">
            {/* Outer Glow */}
            <motion.div
                className="absolute w-full h-full rounded-full bg-her-cream blur-3xl"
                animate={glowControls}
            />

            {/* Core Circle */}
            <motion.div
                className="w-32 h-32 rounded-full bg-gradient-to-br from-her-cream to-white shadow-[0_0_50px_rgba(255,255,255,0.4)]"
                animate={controls}
            />

            {/* Inner Detail */}
            <motion.div
                className="absolute w-28 h-28 rounded-full bg-white opacity-40 mix-blend-overlay"
                animate={controls}
            />
        </div>
    );
};

export default VoiceIndicator;
