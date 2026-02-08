import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, ShieldCheck, CheckCircle, RefreshCw } from 'lucide-react';

const ReturnOrderPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [selectedIssue, setSelectedIssue] = useState('');
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const issues = ['Item is damaged', 'Expired product', 'Quality not good', 'Wrong item delivered'];

    const submitRequest = () => {
        setSubmitted(true);
        setTimeout(() => navigate('/orders'), 3000);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-r from-[#e8f5e9] to-[#ffffff] md:bg-none md:bg-white md:dark:bg-black dark:from-[#141414] dark:to-[#141414] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mb-6 text-blue-600 animate-bounce">
                    <CheckCircle size={32} strokeWidth={3} />
                </div>
                <h2 className="text-[17px] md:text-xl font-black text-gray-900 dark:text-gray-100 mb-2 tracking-tight">Return request received!</h2>
                <p className="text-[11px] md:text-base text-gray-500 mb-8 max-w-[250px]">Your return request for Order #{id} has been submitted. Pick-up will be scheduled shortly.</p>
                <div className="w-full max-w-[180px] h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 animate-[shimmer_2s_infinite]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-r from-[#e8f5e9] to-[#ffffff] md:bg-none md:bg-white md:dark:bg-black dark:from-[#141414] dark:to-[#141414] pb-10">
            <div className="sticky top-0 z-40 bg-white/20 dark:bg-black/20 md:bg-none md:bg-white md:dark:bg-black backdrop-blur-md border-b border-gray-100 dark:border-white/5 p-4 transition-colors">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 dark:bg-white/5 rounded-full shadow-sm text-gray-600 dark:text-gray-300 active:scale-95 transition-all">
                        <ArrowLeft size={16} />
                    </button>
                    <div className="flex items-center gap-2">
                        <RefreshCw size={14} className="text-blue-600" />
                        <h1 className="text-[13.5px] md:text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight leading-none">Return items</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-4 md:py-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-6">
                    <div>
                        <p className="!text-[8px] md:!text-sm font-black text-gray-400 tracking-[0.2em] mb-4 px-1 uppercase">Select reason for return</p>
                        <div className="divide-y divide-gray-100 dark:divide-white/5 md:border-y md:border-gray-100 md:dark:border-white/5 mx-[-1rem]">
                            {issues.map((issue, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedIssue(issue)}
                                    className={`w-full py-4 px-5 text-left transition-all !text-[10px] md:!text-base font-bold flex items-center justify-between group ${selectedIssue === issue
                                        ? 'bg-blue-500/10 text-blue-600'
                                        : 'bg-transparent text-gray-600 dark:text-gray-300'}`}
                                >
                                    <span>{issue}</span>
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${selectedIssue === issue ? 'border-blue-600 bg-blue-600' : 'border-gray-200 dark:border-white/10'}`}>
                                        {selectedIssue === issue && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-[8.5px] md:text-sm font-black text-gray-400 tracking-[0.2em] mb-4 uppercase">Additional details (optional)</p>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Please explain the issue with the item..."
                            className="w-full h-28 p-3.5 bg-white/20 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 text-[11px] md:text-base dark:text-white placeholder:text-gray-400 shadow-sm"
                        />
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-500/10 p-3.5 rounded-xl flex gap-3 text-blue-600 border border-blue-100 dark:border-blue-500/10">
                        <ShieldCheck size={18} className="flex-shrink-0" />
                        <p className="text-[9.5px] md:text-base font-medium leading-relaxed italic">
                            Returns are verified on-spot. Refunds take 3-5 business days after inspection.
                        </p>
                    </div>

                    <button
                        disabled={!selectedIssue}
                        onClick={submitRequest}
                        className={`w-full py-3.5 rounded-xl text-[10.5px] md:text-lg font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${selectedIssue
                            ? 'bg-blue-600 text-white shadow-blue-500/20'
                            : 'bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed shadow-none'}`}
                    >
                        <Send size={14} />
                        Submit return request
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReturnOrderPage;
