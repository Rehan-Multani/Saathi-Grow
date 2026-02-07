import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, ShieldCheck, CheckCircle, XCircle } from 'lucide-react';

const CancelOrderPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [selectedIssue, setSelectedIssue] = useState('');
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const issues = ['Changed my mind', 'Order taking too long', 'Incorrect items ordered', 'Found better price elsewhere'];

    const submitRequest = () => {
        setSubmitted(true);
        setTimeout(() => navigate('/orders'), 3000);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-6 text-red-600 animate-bounce">
                    <CheckCircle size={32} strokeWidth={3} />
                </div>
                <h2 className="text-[17px] md:text-xl font-black text-gray-900 dark:text-gray-100 mb-2 tracking-tight">Order cancelled!</h2>
                <p className="text-[11px] md:text-base text-gray-500 mb-8 max-w-[250px]">Your order #{id} has been successfully cancelled. Your refund will be processed shortly.</p>
                <div className="w-full max-w-[180px] h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-red-600 animate-[shimmer_2s_infinite]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] pb-10">
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-black/60 backdrop-blur-md border-b border-gray-100 dark:border-white/5 p-4 transition-colors">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 dark:bg-white/5 rounded-full shadow-sm text-gray-600 dark:text-gray-300 active:scale-95 transition-all">
                        <ArrowLeft size={16} />
                    </button>
                    <div className="flex items-center gap-2">
                        <XCircle size={14} className="text-red-600" />
                        <h1 className="text-[13.5px] md:text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight leading-none">Cancel order</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-4 md:py-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-6">
                    <div className="bg-red-50 dark:bg-red-500/5 p-4 rounded-2xl border border-red-100 dark:border-red-500/10 mb-2">
                        <p className="text-[10px] md:text-base text-red-600 font-bold tracking-tight">Are you sure you want to cancel? This action cannot be undone.</p>
                    </div>

                    <div>
                        <p className="!text-[8px] md:!text-sm font-black text-gray-400 tracking-[0.2em] mb-4 px-1 uppercase">Select reason for cancellation</p>
                        <div className="divide-y divide-gray-100 dark:divide-white/5 border-y border-gray-100 dark:border-white/5 mx-[-1rem]">
                            {issues.map((issue, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedIssue(issue)}
                                    className={`w-full py-3 md:py-4 px-5 text-left transition-all !text-[10px] md:!text-base font-bold flex items-center justify-between group ${selectedIssue === issue
                                        ? 'bg-red-50/50 dark:bg-red-500/10 text-red-600'
                                        : 'bg-white dark:bg-transparent text-gray-600 dark:text-gray-300'}`}
                                >
                                    <span>{issue}</span>
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${selectedIssue === issue ? 'border-red-600 bg-red-600' : 'border-gray-200 dark:border-white/10'}`}>
                                        {selectedIssue === issue && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-[8.5px] md:text-sm font-black text-gray-400 tracking-[0.2em] mb-4 uppercase">Additional comments (optional)</p>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Please explain why you are cancelling..."
                            className="w-full h-28 p-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-600 text-[11px] md:text-base dark:text-white placeholder:text-gray-400 shadow-sm"
                        />
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-500/10 p-3.5 rounded-xl flex gap-3 text-blue-600 border border-blue-100 dark:border-blue-500/10">
                        <ShieldCheck size={18} className="flex-shrink-0" />
                        <p className="text-[9.5px] md:text-base font-medium leading-relaxed italic">
                            Your full refund will be processed within 1-2 hours for prepaid orders.
                        </p>
                    </div>

                    <button
                        disabled={!selectedIssue}
                        onClick={submitRequest}
                        className={`w-full py-3.5 rounded-xl text-[10.5px] md:text-lg font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${selectedIssue
                            ? 'bg-red-600 text-white shadow-red-500/20'
                            : 'bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed shadow-none'}`}
                    >
                        <Send size={14} />
                        Confirm cancellation
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancelOrderPage;
