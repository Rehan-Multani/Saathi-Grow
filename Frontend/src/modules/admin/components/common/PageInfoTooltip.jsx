import React, { useState, useRef, useEffect } from 'react';
import { Info, X, CheckCircle2, ArrowRight } from 'lucide-react';

/**
 * PageInfoTooltip — A reusable contextual help panel for admin pages.
 * 
 * @param {Object} info - Info object from pageInfoData.js
 * @param {string} info.title - Page title
 * @param {string} info.description - What the page does
 * @param {string[]} info.keyPoints - Bullet points of key features/actions
 * @param {string[]} info.workflow - Step-by-step workflow guide
 */
const PageInfoTooltip = ({ info }) => {
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef(null);
    const buttonRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                panelRef.current && !panelRef.current.contains(e.target) &&
                buttonRef.current && !buttonRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') setIsOpen(false); };
        if (isOpen) document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen]);

    if (!info) return null;

    return (
        <>
            {/* Trigger Button */}
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Page information"
                className={`relative flex items-center justify-center w-6 h-6 rounded-full transition-all duration-200 flex-shrink-0
                    ${isOpen
                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                        : 'text-slate-400 hover:text-violet-500 hover:bg-violet-50'
                    }`}
            >
                <Info size={15} />
            </button>

            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-[200] lg:hidden animate-in fade-in duration-200"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Info Panel */}
            {isOpen && (
                <div
                    ref={panelRef}
                    className={`
                        fixed z-[210] bg-white shadow-2xl border border-slate-100 overflow-hidden
                        animate-in fade-in slide-in-from-top-2 duration-200
                        
                        /* Mobile: Bottom Sheet */
                        bottom-0 left-0 right-0 rounded-t-[28px] max-h-[80vh] overflow-y-auto
                        
                        /* Desktop: Floating Card anchored top-right */
                        lg:bottom-auto lg:left-auto lg:right-8 lg:top-[72px] lg:w-[400px] lg:max-h-[85vh] lg:rounded-2xl lg:overflow-y-auto
                    `}
                >
                    {/* Mobile Drag Handle */}
                    <div className="lg:hidden flex justify-center pt-3 pb-1">
                        <div className="w-10 h-1 bg-slate-200 rounded-full" />
                    </div>

                    {/* Header */}
                    <div className="flex items-start justify-between p-5 pb-4 border-b border-slate-50 sticky top-0 bg-white z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-violet-300">
                                <Info size={16} className="text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest">Page Guide</p>
                                <h3 className="text-sm font-bold text-slate-800 leading-tight">{info.title}</h3>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors mt-0.5"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    <div className="p-5 space-y-5">
                        {/* Description */}
                        <div>
                            <p className="text-[13px] text-slate-600 leading-relaxed">{info.description}</p>
                        </div>

                        {/* Key Points */}
                        {info.keyPoints && info.keyPoints.length > 0 && (
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">What you can do</p>
                                <ul className="space-y-2">
                                    {info.keyPoints.map((point, i) => (
                                        <li key={i} className="flex items-start gap-2.5">
                                            <CheckCircle2 size={14} className="text-violet-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-[12px] text-slate-600 leading-snug">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Workflow */}
                        {info.workflow && info.workflow.length > 0 && (
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">How it works</p>
                                <ol className="space-y-2.5">
                                    {info.workflow.map((step, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-violet-600 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                                                {i + 1}
                                            </div>
                                            <span className="text-[12px] text-slate-600 leading-snug">{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default PageInfoTooltip;
