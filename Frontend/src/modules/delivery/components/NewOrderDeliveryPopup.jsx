import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PackageOpen, X, ChevronRight, BellRing, Navigation, ShoppingBag } from 'lucide-react';
import newOrderSound from '../../../assets/Sound/sound.mpeg';

const NewOrderDeliveryPopup = () => {
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();
    const audioRef = useRef(null);

    useEffect(() => {
        // Create an audio element for the notification chime
        audioRef.current = new Audio(newOrderSound);
        audioRef.current.volume = 0.85;
        audioRef.current.loop = true; // Loop the sound until dismissed/acted upon

        const handleFirebaseMessage = (event) => {
            const payload = event.detail;
            const title = payload?.notification?.title || payload?.data?.title || '';
            const body = payload?.notification?.body || payload?.data?.body || '';
            const data = payload?.data || {};

            // Check if it's related to an order assignment, run, or pickup
            const isAssignment = 
                title.toLowerCase().includes('assign') || 
                title.toLowerCase().includes('pickup') ||
                ['assignment', 'run_assignment', 'return_batch'].includes(data.type);
            
            if (isAssignment) {
                const newNotification = {
                    id: Date.now().toString(),
                    title: title || 'New Assignment Received',
                    body: body || 'You have a new delivery run request.',
                    runId: data.runId || null,
                    orderId: data.orderId || null,
                    totalAmount: data.totalAmount || null,
                    paymentMethod: data.paymentMethod || null,
                    time: new Date()
                };

                setNotifications(prev => {
                    const updated = [...prev, newNotification];
                    // Play sound if we have active notifications
                    if (updated.length > 0) {
                        try {
                            if (audioRef.current) {
                                audioRef.current.play().catch(e => console.log('Audio play prevented:', e));
                            }
                        } catch (err) {
                            console.log('Error playing sound:', err);
                        }
                        
                        // Mobile haptics / vibration
                        if (navigator.vibrate) {
                            navigator.vibrate([400, 200, 400, 200, 400]);
                        }
                    }
                    return updated;
                });

                // Auto-remove after 60 seconds (extended from 15s to make it prominent)
                setTimeout(() => {
                    removeNotification(newNotification.id);
                }, 60000);
            }
        };

        window.addEventListener('onFirebaseMessage', handleFirebaseMessage);

        return () => {
            window.removeEventListener('onFirebaseMessage', handleFirebaseMessage);
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []);

    const removeNotification = (id) => {
        setNotifications(prev => {
            const remaining = prev.filter(n => n.id !== id);
            if (remaining.length === 0 && audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            return remaining;
        });
    };

    const handleViewRun = (notification) => {
        removeNotification(notification.id);
        if (notification.runId) {
            navigate(`/delivery/run/${notification.runId}`);
        } else {
            navigate('/delivery/dashboard');
        }
    };

    if (notifications.length === 0) return null;

    // Use the latest notification for the modal overlay
    const activeNotification = notifications[notifications.length - 1];

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(132,204,22,0.3)] border border-lime-400/30"
                >
                    {/* Glowing pulse ring in backdrop */}
                    <div className="absolute inset-0 bg-gradient-to-b from-lime-500/5 to-transparent pointer-events-none" />

                    {/* Header with animated ringing bell */}
                    <div className="bg-gradient-to-r from-lime-500 to-emerald-600 px-6 py-6 text-white text-center relative">
                        <div className="absolute top-4 right-4">
                            <button
                                onClick={() => removeNotification(activeNotification.id)}
                                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all duration-200"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="mx-auto w-16 h-16 bg-white/15 rounded-full flex items-center justify-center mb-3 animate-bounce">
                            <BellRing size={32} className="text-white animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight uppercase">New Delivery Task!</h2>
                        <p className="text-xs text-lime-100 font-medium tracking-wide mt-1">Immediate action requested</p>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 space-y-6">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex gap-4 items-start">
                            <div className="p-3 bg-lime-100 dark:bg-lime-950/50 text-lime-600 dark:text-lime-400 rounded-xl flex-shrink-0">
                                <PackageOpen size={24} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                                    {activeNotification.title}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                                    {activeNotification.body}
                                </p>
                            </div>
                        </div>

                        {/* Quick details */}
                        <div className="grid grid-cols-2 gap-3 text-center">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
                                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Assigned Time</div>
                                <div className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5">
                                    {activeNotification.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </div>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
                                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Task Type</div>
                                <div className="text-sm font-bold text-lime-600 dark:text-lime-400 mt-0.5 flex items-center justify-center gap-1">
                                    <ShoppingBag size={14} /> {activeNotification.paymentMethod?.toLowerCase().includes('return') ? 'Return Batch' : 'Active Run'}
                                </div>
                            </div>
                            {activeNotification.totalAmount && (
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
                                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Value</div>
                                    <div className="text-sm font-extrabold text-slate-800 dark:text-white mt-0.5">
                                        ₹{activeNotification.totalAmount}
                                    </div>
                                </div>
                            )}
                            {activeNotification.paymentMethod && (
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
                                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Payment Type</div>
                                    <div className={`text-sm font-extrabold mt-0.5 uppercase ${
                                        activeNotification.paymentMethod.toUpperCase() === 'COD' 
                                            ? 'text-amber-600 dark:text-amber-400' 
                                            : 'text-emerald-600 dark:text-emerald-400'
                                    }`}>
                                        {activeNotification.paymentMethod}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Animated progress bar for auto-dismiss */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <span>Responding window</span>
                                <span className="text-lime-500 animate-pulse">Ringing...</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: "100%" }}
                                    animate={{ width: "0%" }}
                                    transition={{ duration: 60, ease: "linear" }}
                                    className="h-full bg-gradient-to-r from-lime-500 to-emerald-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="p-6 pt-0 flex gap-3">
                        <button
                            onClick={() => removeNotification(activeNotification.id)}
                            className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold transition-all duration-200 text-sm shadow-sm"
                        >
                            Decline / Close
                        </button>
                        <button
                            onClick={() => handleViewRun(activeNotification)}
                            className="flex-1 py-4 bg-gradient-to-r from-lime-500 to-emerald-600 hover:shadow-lg hover:shadow-lime-500/20 text-white rounded-2xl font-black transition-all duration-200 text-sm flex items-center justify-center gap-2 transform active:scale-95"
                        >
                            View Details <ChevronRight size={18} />
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default NewOrderDeliveryPopup;
