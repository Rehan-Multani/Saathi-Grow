import React, { useState } from 'react';
import { Headset, MessageCircle, HelpCircle, Phone, Mail, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const HelpPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [openFaq, setOpenFaq] = useState(null);

    const faqs = [
        {
            q: "How do I track my order?",
            a: "You can track your order in real-time by going to 'My Orders' section in your profile. Once an order is placed, you'll see a 'Track Order' button with the delivery partner's details."
        },
        {
            q: "What is SaathiGro Wallet?",
            a: "SaathiGro Wallet is a secure digital wallet where you can store money for faster checkouts. All refunds are credited instantly to your wallet, and you can also use it to earn and redeem loyalty points."
        },
        {
            q: "What are the delivery hours?",
            a: "We operate from 6:00 AM to 11:00 PM every day, including weekends and public holidays, to ensure you get your essentials whenever you need them."
        },
        {
            q: "Is there a minimum order value?",
            a: "No, there is no minimum order value. However, orders below ₹99 may incur a nominal delivery fee unless you are a Saathi Plus member."
        }
    ];

    const handleChat = () => {
        // Mock WhatsApp integration or live chat
        window.open("https://wa.me/911234567890?text=Hello SaathiGro Support, I need help with my order.", "_blank");
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300 pb-20">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-2 p-3 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-[10px] z-10 border-b border-gray-50 dark:border-white/5">
                    <button
                        onClick={() => navigate(location.state?.from || '/', { state: { openMenu: true } })}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ArrowLeft size={16} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <h1 className="text-sm font-black text-gray-900 dark:text-gray-100 tracking-tight">Help & Support</h1>
                </div>

                {/* Main Contact Section */}
                <div className="mx-4 mt-2 mb-4 bg-[#0c831f] rounded-[20px] p-3 text-white shadow-lg shadow-green-500/10">
                    <div className="flex items-center gap-2 mb-3 text-left">
                        <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Headset size={16} />
                        </div>
                        <div>
                            <h2 className="text-[13px] font-black leading-tight">24/7 Customer Care</h2>
                            <p className="text-[8.5px] opacity-90 font-bold">We're here to help you anytime.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                        <a
                            href="tel:+911234567890"
                            className="flex items-center justify-center gap-1.5 bg-white/20 hover:bg-white/30 p-1.5 rounded-lg transition-all border border-white/10 font-black text-[9.5px] active:scale-95"
                        >
                            <Phone size={10} strokeWidth={3} /> Call Us
                        </a>
                        <button
                            onClick={handleChat}
                            className="flex items-center justify-center gap-1.5 bg-white text-[#0c831f] p-1.5 rounded-lg transition-all hover:scale-[1.02] font-black text-[9.5px] shadow-sm active:scale-95"
                        >
                            <MessageCircle size={10} strokeWidth={3} /> Chat Now
                        </button>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="px-4 mb-6">
                    <h3 className="text-[10px] font-bold text-gray-400 mb-2 px-1">Common Questions</h3>
                    <div className="space-y-1.5">
                        {faqs.map((faq, i) => (
                            <div
                                key={i}
                                className="bg-white dark:bg-[#121212] rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden transition-all"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full p-2 flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${openFaq === i ? 'bg-[#0c831f] text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-400'}`}>
                                            <HelpCircle size={12} />
                                        </div>
                                        <span className={`text-[11px] font-bold text-left tracking-tight ${openFaq === i ? 'text-[#0c831f]' : 'text-gray-800 dark:text-gray-200'}`}>{faq.q}</span>
                                    </div>
                                    {openFaq === i ? <ChevronUp size={12} className="text-[#0c831f]" /> : <ChevronDown size={12} className="text-gray-300" />}
                                </button>

                                {openFaq === i && (
                                    <div className="px-2 pb-2.5 pt-0 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <div className="pl-8 py-1.5 border-t border-gray-50 dark:border-white/5">
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-snug font-medium">
                                                {faq.a}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Email Support */}
                <div className="mx-4 mb-10 bg-white dark:bg-[#121212] p-3.5 rounded-xl border border-dashed border-gray-200 dark:border-white/10 text-center">
                    <Mail size={18} className="mx-auto mb-1 text-gray-300" />
                    <h4 className="text-[11px] font-bold text-gray-900 dark:text-gray-100 mb-0.5">Still need help?</h4>
                    <p className="text-[8.5px] text-gray-500 mb-2.5 font-medium">Drop us an email anytime.</p>
                    <a
                        href="mailto:support@saathigro.com?subject=Support Request - SaathiGro"
                        className="inline-flex items-center justify-center bg-gray-50 dark:bg-white/5 px-4 py-1.5 rounded-lg text-[#0c831f] font-black text-[9.5px] hover:bg-[#0c831f] hover:text-white transition-all border border-[#0c831f]/10"
                    >
                        Send Email
                    </a>
                </div>
            </div>
        </div>
    );
};

export default HelpPage;
