import React from 'react';
import { motion } from 'framer-motion';

const FullPageLoader = () => {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center overflow-hidden"
        >
            <div className="flex flex-col items-center gap-6">
                <div className="relative flex items-center justify-center">
                    {/* Outer Rotating Circle - Heavy Stroke for Premium Feel */}
                    <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                            cx="40"
                            cy="40"
                            r="36"
                            stroke="#f1f5f9"
                            strokeWidth="4"
                            fill="transparent"
                        />
                        <motion.circle
                            cx="40"
                            cy="40"
                            r="36"
                            stroke="#CCFF00"
                            strokeWidth="4"
                            strokeLinecap="round"
                            fill="transparent"
                            strokeDasharray="226"
                            animate={{
                                strokeDashoffset: [226, 60, 226],
                                rotate: [0, 360]
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 1.5,
                                ease: "easeInOut"
                            }}
                            style={{ originX: "40px", originY: "40px" }}
                        />
                    </svg>
                </div>

                <div className="flex flex-col items-center">
                    <motion.span 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-[14px] font-black tracking-[0.3em] text-[#CCFF00] uppercase"
                    >
                        SATHIGRO
                    </motion.span>
                    
                    {/* Loading Progress Bar */}
                    <div className="w-20 h-[3px] bg-gray-100 mt-2 rounded-full overflow-hidden relative">
                        <motion.div 
                            className="absolute inset-0 bg-[#CCFF00]"
                            animate={{ x: [-80, 80] }}
                            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default FullPageLoader;
