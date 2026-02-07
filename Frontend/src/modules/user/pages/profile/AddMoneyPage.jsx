import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Banknote, QrCode, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddMoneyPage = () => {
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    const [selectedOption, setSelectedOption] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleAddMoney = () => {
        if (!amount || parseFloat(amount) <= 0 || !selectedOption) {
            alert('कृपया राशि दर्ज करें और भुगतान विकल्प चुनें।');
            return;
        }

        setIsProcessing(true);
        // Simulate API call
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
            setTimeout(() => {
                navigate('/profile/wallet', { state: { from: '/add-money' } });
            }, 2000);
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black p-0 pt-6 pb-24 md:p-8 md:pb-8">
            <div className="max-w-2xl md:max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 md:mb-10 px-4 md:px-0">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-1.5 md:p-2 bg-gray-50 dark:bg-white/5 rounded-full shadow-sm hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft size={16} className="md:w-6 md:h-6" />
                    </button>
                    <div>
                        <h1 className="!text-[13px] md:!text-3xl font-black text-gray-900 dark:text-gray-100 leading-none tracking-tight">Add Money to Wallet</h1>
                    </div>
                </div>

                <div className="px-5 py-8 bg-gray-50 dark:bg-white/5 mb-6 md:bg-white dark:md:bg-[#141414] md:rounded-2xl md:border md:border-gray-100 dark:md:border-white/5 md:p-6">
                    <div className="flex flex-col items-center justify-center">
                        <span className="!text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">राशि दर्ज करें</span>
                        <input
                            type="number"
                            placeholder="₹ 100"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full max-w-[200px] text-center !text-[28px] font-black text-gray-900 dark:text-white leading-none tracking-tighter mb-6 bg-transparent border-b-2 border-gray-200 dark:border-white/10 focus:border-[#0c831f] focus:outline-none transition-colors"
                        />

                        <div className="w-full max-w-[300px] space-y-3">
                            <button
                                className={`flex items-center justify-between w-full p-4 rounded-xl border-2 ${selectedOption === 'card' ? 'border-[#0c831f] bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#111]'}`}
                                onClick={() => setSelectedOption('card')}
                            >
                                <div className="flex items-center gap-3">
                                    <CreditCard size={20} className={`${selectedOption === 'card' ? 'text-[#0c831f]' : 'text-gray-500 dark:text-gray-400'}`} />
                                    <span className="font-medium text-gray-900 dark:text-white">क्रेडिट/डेबिट कार्ड</span>
                                </div>
                                {selectedOption === 'card' && <CheckCircle size={20} className="text-[#0c831f]" />}
                            </button>
                            <button
                                className={`flex items-center justify-between w-full p-4 rounded-xl border-2 ${selectedOption === 'upi' ? 'border-[#0c831f] bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#111]'}`}
                                onClick={() => setSelectedOption('upi')}
                            >
                                <div className="flex items-center gap-3">
                                    <QrCode size={20} className={`${selectedOption === 'upi' ? 'text-[#0c831f]' : 'text-gray-500 dark:text-gray-400'}`} />
                                    <span className="font-medium text-gray-900 dark:text-white">UPI</span>
                                </div>
                                {selectedOption === 'upi' && <CheckCircle size={20} className="text-[#0c831f]" />}
                            </button>
                            <button
                                className={`flex items-center justify-between w-full p-4 rounded-xl border-2 ${selectedOption === 'netbanking' ? 'border-[#0c831f] bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#111]'}`}
                                onClick={() => setSelectedOption('netbanking')}
                            >
                                <div className="flex items-center gap-3">
                                    <Banknote size={20} className={`${selectedOption === 'netbanking' ? 'text-[#0c831f]' : 'text-gray-500 dark:text-gray-400'}`} />
                                    <span className="font-medium text-gray-900 dark:text-white">नेटबैंकिंग</span>
                                </div>
                                {selectedOption === 'netbanking' && <CheckCircle size={20} className="text-[#0c831f]" />}
                            </button>
                        </div>

                        <button
                            onClick={handleAddMoney}
                            disabled={isProcessing || isSuccess}
                            className="mt-6 w-full max-w-[300px] bg-[#0c831f] text-white flex items-center justify-center gap-2 py-3 rounded-full !text-sm font-black uppercase tracking-wider active:scale-95 transition-all shadow-lg shadow-green-500/20 hover:bg-[#0a6b19] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? 'Processing...' : isSuccess ? 'Success!' : 'Add Money'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddMoneyPage;
