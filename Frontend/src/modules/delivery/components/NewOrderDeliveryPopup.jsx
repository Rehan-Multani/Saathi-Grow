import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PackageOpen, X, ChevronRight, BellRing } from 'lucide-react';
import newOrderSound from '../../../assets/Sound/sound.mpeg';

const NewOrderDeliveryPopup = () => {
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();
    const audioRef = useRef(null);

    useEffect(() => {
        // Create an audio element for the notification chime
        audioRef.current = new Audio(newOrderSound);
        audioRef.current.volume = 0.5;

        const handleFirebaseMessage = (event) => {
            const payload = event.detail;
            const title = payload?.notification?.title || payload?.data?.title || '';
            const body = payload?.notification?.body || payload?.data?.body || '';
            const data = payload?.data || {};

            // Check if it's related to an order assignment or pickup
            const isAssignment = title.toLowerCase().includes('assign') || title.toLowerCase().includes('pickup');
            
            if (isAssignment) {
                const newNotification = {
                    id: Date.now().toString(),
                    title: title,
                    body: body,
                    runId: data.runId || null,
                    orderId: data.orderId || null,
                    time: new Date()
                };

                setNotifications(prev => [...prev, newNotification]);
                
                // Play sound
                try {
                    if (audioRef.current) {
                        audioRef.current.play().catch(e => console.log('Audio play prevented by browser:', e));
                    }
                } catch (err) {
                    console.log('Error playing notification sound:', err);
                }

                // Auto-remove after 15 seconds if not interacted with
                setTimeout(() => {
                    removeNotification(newNotification.id);
                }, 15000);
            }
        };

        window.addEventListener('onFirebaseMessage', handleFirebaseMessage);

        return () => {
            window.removeEventListener('onFirebaseMessage', handleFirebaseMessage);
        };
    }, []);

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleViewRun = (notification) => {
        removeNotification(notification.id);
        if (notification.runId) {
            navigate(`/delivery/run/${notification.runId}`);
        } else {
            navigate('/delivery/dashboard');
        }
    };

    return (
        <div className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {notifications.map((notification) => (
                    <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -100, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="pointer-events-auto bg-white rounded-2xl shadow-2xl border border-lime-100 overflow-hidden w-80 sm:w-96"
                    >
                        {/* Header bar */}
                        <div className="bg-lime-500 px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-white">
                                <div className="bg-white/20 p-1.5 rounded-lg animate-pulse">
                                    <BellRing size={16} className="text-white" />
                                </div>
                                <span className="font-bold text-sm tracking-wide">New Assignment!</span>
                            </div>
                            <button 
                                onClick={() => removeNotification(notification.id)}
                                className="text-white/70 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        
                        {/* Content */}
                        <div className="p-4 bg-white">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-lime-100 text-lime-600 flex items-center justify-center flex-shrink-0 mt-1">
                                    <PackageOpen size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 mb-1">{notification.title}</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        {notification.body}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-2 font-medium">
                                        {notification.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action footer */}
                        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                            <button 
                                onClick={() => removeNotification(notification.id)}
                                className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors"
                            >
                                Dismiss
                            </button>
                            <button 
                                onClick={() => handleViewRun(notification)}
                                className="px-3 py-1.5 text-xs font-bold text-white bg-lime-500 hover:bg-lime-600 rounded-lg shadow-sm shadow-lime-200 transition-colors flex items-center gap-1"
                            >
                                View Details <ChevronRight size={14} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default NewOrderDeliveryPopup;
