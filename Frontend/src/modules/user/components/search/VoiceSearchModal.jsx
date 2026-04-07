import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, Search, Sparkles, Volume2, ArrowRight } from 'lucide-react';
import { useSearch } from '../../context/SearchContext';

const VoiceSearchModal = ({ isOpen, onClose, onResult }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState(null);
    const recognitionRef = useRef(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-IN';

            recognition.onstart = () => {
                setIsListening(true);
                setError(null);
                setTranscript('');
            };

            recognition.onresult = (event) => {
                let currentTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    currentTranscript += event.results[i][0].transcript;
                }
                setTranscript(currentTranscript);
                
                // Clear existing timeout
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                
                // Set new timeout to finalize search after 1.5s of silence
                timeoutRef.current = setTimeout(() => {
                    handleFinalize(currentTranscript);
                }, 1500);
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                if (event.error === 'not-allowed') {
                    setError('Camera/Mic permission denied');
                } else {
                    setError('Could not hear you. Try again.');
                }
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            startListening();
        } else {
            stopListening();
        }
        return () => stopListening();
    }, [isOpen]);

    const startListening = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
            } catch (err) {
                console.error('Failed to start:', err);
            }
        } else {
            setError('Speech recognition not supported');
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    const handleFinalize = (finalText) => {
        if (finalText && finalText.trim().length > 0) {
            onResult(finalText.trim());
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-end md:justify-center p-0 md:p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-white dark:bg-[#111] rounded-t-[2.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-white/5 rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="px-8 pt-12 pb-10 flex flex-col items-center">
                    {/* Visualizer Ring */}
                    <div className="relative mb-10">
                        {isListening && (
                            <div className="absolute inset-0 rounded-full bg-[#0c831f]/20 animate-ping"></div>
                        )}
                        <div className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${isListening ? 'bg-[#0c831f] scale-110 shadow-lg shadow-green-500/30' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                            {isListening ? (
                                <Mic size={36} className="text-white" />
                            ) : (
                                <Search size={36} />
                            )}
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 text-center">
                        {isListening ? 'Listening...' : 'Search with Voice'}
                    </h2>
                    
                    <p className="text-gray-500 dark:text-gray-400 text-center text-sm font-medium mb-8 max-w-[280px]">
                        {error ? (
                            <span className="text-red-500 font-bold">{error}</span>
                        ) : isListening ? (
                            transcript || 'Say "Milk", "Bread", or "Butter"...'
                        ) : (
                            'Tap the mic to try again'
                        )}
                    </p>

                    {/* Waveform placeholder */}
                    {isListening && (
                        <div className="flex items-center gap-1.5 h-8 mb-8">
                            {[1, 2, 3, 4, 5, 6, 4, 3, 2].map((h, i) => (
                                <div 
                                    key={i} 
                                    className="w-1 bg-[#0c831f] rounded-full animate-bounce" 
                                    style={{ 
                                        height: `${h * 4}px`,
                                        animationDelay: `${i * 0.1}s`,
                                        animationDuration: '0.8s'
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    <div className="w-full flex flex-col gap-3">
                        {!isListening && (
                            <button 
                                onClick={startListening}
                                className="w-full py-4 bg-[#0c831f] text-white font-black rounded-2xl shadow-xl shadow-green-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <Mic size={20} />
                                Try Again
                            </button>
                        )}
                        
                        {transcript && !isListening && (
                            <button 
                                onClick={() => handleFinalize(transcript)}
                                className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-black rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <Search size={20} />
                                Search "{transcript}"
                            </button>
                        )}
                    </div>
                </div>

                {/* Suggestions Strip */}
                <div className="bg-gray-50/50 dark:bg-white/5 px-8 py-6 border-t border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles size={14} className="text-yellow-500" />
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Try saying</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {['Fresh Milk', 'Paneer', 'Cooking Oil', 'Soft Drinks'].map(text => (
                            <button 
                                key={text}
                                onClick={() => handleFinalize(text)}
                                className="px-4 py-2 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-full text-xs font-bold text-gray-700 dark:text-gray-300 hover:border-[#0c831f] transition-all"
                            >
                                "{text}"
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoiceSearchModal;
