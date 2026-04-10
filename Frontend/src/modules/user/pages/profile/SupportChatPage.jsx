import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, AlertCircle, MessageSquare } from 'lucide-react';

const SupportChatPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [chatMessages, setChatMessages] = useState([
        { id: 1, text: "Hi! How can I help you with Order #" + (id || 'SG-1234') + "?", sender: 'bot' }
    ]);
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;
        const msg = { id: Date.now(), text: newMessage, sender: 'user' };
        setChatMessages(prev => [...prev, msg]);
        setNewMessage('');

        setTimeout(() => {
            setChatMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "Thanks for reaching out! A support executive will be with you shortly to resolve this.",
                sender: 'bot'
            }]);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-black/60 backdrop-blur-md border-b border-gray-100 dark:border-white/5 p-4 transition-colors">
                <div className="max-w-2xl mx-auto w-full flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 dark:bg-white/5 rounded-full shadow-sm text-gray-600 dark:text-gray-300 active:scale-95 transition-all">
                            <ArrowLeft size={16} />
                        </button>
                        <div>
                            <h1 className="text-[13.5px] font-black text-gray-900 dark:text-gray-100 tracking-tight leading-none mb-1">Support chat</h1>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Order #{id}</p>
                            </div>
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
                        <MessageSquare size={16} />
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 w-full max-w-2xl mx-auto overflow-y-auto px-4 py-6 space-y-4 scrollbar-hide">
                {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`max-w-[85%] p-3.5 rounded-2xl text-[11px] font-medium leading-relaxed shadow-sm ${msg.sender === 'user'
                            ? 'bg-[#0c831f] text-white rounded-tr-none'
                            : 'bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-200/20 dark:border-white/5'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-white/80 dark:bg-black/60 backdrop-blur-md border-t border-gray-100 dark:border-white/5 pb-8">
                <div className="max-w-2xl mx-auto flex gap-2 items-center p-2 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-inner">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Describe your issue..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-[11.5px] dark:text-white px-2 placeholder:text-gray-400"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-95 ${newMessage.trim()
                            ? 'bg-[#0c831f] text-white shadow-green-500/20'
                            : 'bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed shadow-none'}`}
                    >
                        <Send size={16} />
                    </button>
                </div>
                <div className="mt-4 flex items-center justify-center gap-2">
                    <AlertCircle size={12} className="text-gray-400" />
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Typically replies in 5 minutes</span>
                </div>
            </div>
        </div>
    );
};

export default SupportChatPage;
