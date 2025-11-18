import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ title, children, icon }) => {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="w-64 p-4 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg text-her-cream"
        >
            <div className="flex items-center gap-2 mb-3 opacity-80">
                {icon}
                <h3 className="text-xs font-semibold uppercase tracking-widest">{title}</h3>
            </div>
            <div className="font-light leading-relaxed">
                {children}
            </div>
        </motion.div>
    );
};

export default Card;
