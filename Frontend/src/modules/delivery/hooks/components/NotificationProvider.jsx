import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import { createDummyOrder } from '../data/mockDeliveryData';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

const NEW_ORDER_EVENT = 'delivery:new-order';
const OPEN_ORDER_EVENT = 'delivery:open-order';
const ORDER_ACCEPTED_EVENT = 'delivery:order-accepted';

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const handleNewOrder = (event) => {
            const order = event.detail;
            if (!order?._id) return;

            const notification = {
                id: order._id,
                order,
                orderId: order.order?.orderId,
                customerName: order.customer,
                read: false,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

            setNotifications((prev) => [notification, ...prev.filter((item) => item.id !== notification.id)]);

            toast(({ closeToast }) => (
                <div
                    onClick={() => {
                        window.dispatchEvent(new CustomEvent(OPEN_ORDER_EVENT, { detail: order }));
                        navigate('/delivery/dashboard');
                        closeToast();
                    }}
                    className="flex items-start gap-4 cursor-pointer p-1"
                >
                    <div className="w-10 h-10 rounded-2xl bg-lime-500 flex items-center justify-center text-white shrink-0">
                        <Package size={20} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-black text-sm text-slate-900">New Order Assigned!</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                            #{order.order?.orderId} - {order.customer}
                        </p>
                        <p className="text-[10px] text-lime-600 font-bold uppercase tracking-wider mt-1">
                            Tap to view map and accept
                        </p>
                    </div>
                </div>
            ), {
                position: 'top-right',
                autoClose: 10000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                icon: false,
            });
        };

        const handleOrderAccepted = (event) => {
            const orderId = event.detail?.id;
            if (!orderId) return;
            setNotifications((prev) => prev.filter((notification) => notification.id !== orderId));
        };

        window.addEventListener(NEW_ORDER_EVENT, handleNewOrder);
        window.addEventListener(ORDER_ACCEPTED_EVENT, handleOrderAccepted);

        return () => {
            window.removeEventListener(NEW_ORDER_EVENT, handleNewOrder);
            window.removeEventListener(ORDER_ACCEPTED_EVENT, handleOrderAccepted);
        };
    }, [navigate]);

    const pushMockOrder = useCallback(() => {
        const order = createDummyOrder();
        window.dispatchEvent(new CustomEvent(NEW_ORDER_EVENT, { detail: order }));
        return order;
    }, []);

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
                notifications,
                pushMockOrder,
                markAsRead,
                markAllAsRead,
                removeNotification,
                clearNotifications,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

