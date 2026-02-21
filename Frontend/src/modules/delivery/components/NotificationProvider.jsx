import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

const SOCKET_URL = 'http://localhost:5000';

export const NotificationProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.on('new_order', (data) => {
            console.log('New Order Received:', data);

            // Add to internal list
            const newNotif = {
                id: Date.now(),
                ...data,
                read: false,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setNotifications(prev => [newNotif, ...prev]);

            // Show custom toast notification
            toast(({ closeToast }) => (
                <div
                    onClick={() => {
                        navigate(`/delivery/tracking/${data.id}`);
                        closeToast();
                    }}
                    className="flex items-start gap-4 cursor-pointer p-1"
                >
                    <div className="w-10 h-10 rounded-2xl bg-pink-500 flex items-center justify-center text-white shrink-0">
                        <Package size={20} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-black text-sm text-slate-900">New Order Assigned!</h4>
                        <p className="text-xs text-slate-500 mt-0.5">#{data.orderId} • {data.customerName}</p>
                        <p className="text-[10px] text-pink-600 font-bold uppercase tracking-wider mt-1">Tap to view map & accept</p>
                    </div>
                </div>
            ), {
                position: "top-right",
                autoClose: 10000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                icon: false
            });

            // Play sound (optional)
            try {
                const audio = new Audio('/assets/notification.mp3');
                audio.play().catch(() => { });
            } catch (e) { }
        });

        return () => newSocket.close();
    }, [navigate]);

    const markAsRead = useCallback((notificationId) => {
        setNotifications((prev) =>
            prev.map((notification) =>
                notification.id === notificationId
                    ? { ...notification, read: true }
                    : notification
            )
        );
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications((prev) =>
            prev.map((notification) =>
                notification.read ? notification : { ...notification, read: true }
            )
        );
    }, []);

    const removeNotification = useCallback((notificationId) => {
        setNotifications((prev) =>
            prev.filter((notification) => notification.id !== notificationId)
        );
    }, []);

    const clearNotifications = useCallback(() => setNotifications([]), []);

    return (
        <NotificationContext.Provider
            value={{
                socket,
                notifications,
                markAsRead,
                markAllAsRead,
                removeNotification,
                clearNotifications
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};
