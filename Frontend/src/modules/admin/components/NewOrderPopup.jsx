import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, ChevronRight, BellRing } from 'lucide-react';
import newOrderSound from '../../../assets/Sound/sound.mpeg';

const NewOrderPopup = ({ baseRoute = '/admin/orders/online' }) => {
    const [orders, setOrders] = useState([]);
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

            // Check if it's a new order notification
            if (title.toLowerCase().includes('new') && title.toLowerCase().includes('order')) {
                const newOrder = {
                    id: Date.now().toString(),
                    title: title,
                    body: body,
                    orderId: data.orderId || null,
                    time: new Date()
                };

                setOrders(prev => [...prev, newOrder]);
                
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
                    removeOrder(newOrder.id);
                }, 15000);
            }
        };

        window.addEventListener('onFirebaseMessage', handleFirebaseMessage);

        return () => {
            window.removeEventListener('onFirebaseMessage', handleFirebaseMessage);
        };
    }, []);

    const removeOrder = (id) => {
        setOrders(prev => prev.filter(order => order.id !== id));
    };

    const handleViewOrder = (order) => {
        removeOrder(order.id);
        if (order.orderId) {
            // Navigate to order details or online orders list
            navigate(`${baseRoute}?search=${order.orderId}`);
        } else {
            navigate(baseRoute);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {orders.map((order) => (
                    <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="pointer-events-auto bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden w-80 sm:w-96"
                    >
                        {/* Header bar */}
                        <div className="bg-blue-600 px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-white">
                                <div className="bg-white/20 p-1.5 rounded-lg animate-pulse">
                                    <BellRing size={16} className="text-white" />
                                </div>
                                <span className="font-bold text-sm tracking-wide">New Order Received!</span>
                            </div>
                            <button 
                                onClick={() => removeOrder(order.id)}
                                className="text-white/70 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        
                        {/* Content */}
                        <div className="p-4 bg-white">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-1">
                                    <ShoppingBag size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 mb-1">{order.title}</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        {order.body}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-2 font-medium">
                                        {order.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action footer */}
                        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                            <button 
                                onClick={() => removeOrder(order.id)}
                                className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors"
                            >
                                Dismiss
                            </button>
                            <button 
                                onClick={() => handleViewOrder(order)}
                                className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-200 transition-colors flex items-center gap-1"
                            >
                                View Order <ChevronRight size={14} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default NewOrderPopup;
