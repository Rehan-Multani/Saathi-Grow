import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Banknote, QrCode, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as walletApi from '../../api/walletApi';
import { toast } from 'react-toastify';

const loadRazorpaySDK = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const AddMoneyPage = () => {
    const navigate = useNavigate();
    const { token, user } = useAuth();
    const [amount, setAmount] = useState('');
    const [selectedOption, setSelectedOption] = useState('upi'); // Default to UPI for quick checkout
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleAddMoney = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        try {
            setIsProcessing(true);
            const numAmount = parseFloat(amount);

            const res = await loadRazorpaySDK();
            if (!res) {
                toast.error('Razorpay SDK failed to load. Are you online?');
                setIsProcessing(false);
                return;
            }

            // 1. Initiate Topup on Backend
            const orderData = await walletApi.initiateTopup(token, numAmount);

            // 2. Open Razorpay Check-out
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "saathigro Wallet",
                description: `Topup for ${user.phone}`,
                order_id: orderData.razorpayOrderId,
                handler: async (response) => {
                    try {
                        // 3. Verify Payment
                        await walletApi.verifyTopup(token, {
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature
                        });

                        setIsSuccess(true);
                        toast.success("Wallet topped up successfully!");
                        setTimeout(() => navigate('/wallet'), 2000);
                    } catch (err) {
                        toast.error(err.message || "Verification failed");
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: user.phone,
                    method: selectedOption === 'upi' ? 'upi' : 'card'
                },
                config: {
                    display: {
                        blocks: selectedOption === 'upi'
                            ? { upi: { name: 'UPI', instruments: [{ method: 'upi' }] } }
                            : { card: { name: 'Card', instruments: [{ method: 'card' }] } },
                        sequence: selectedOption === 'upi' ? ['block.upi'] : ['block.card'],
                        preferences: { show_default_blocks: false }
                    }
                },
                theme: { color: "#0c831f" }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', () => {
                toast.error("Payment failed. Please try again.");
                setIsProcessing(false);
            });
            rzp.open();

        } catch (err) {
            toast.error(err.message || 'Failed to initiate payment');
            setIsProcessing(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6 text-[#0c831f] animate-bounce">
                    <CheckCircle size={40} strokeWidth={3} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-2 uppercase tracking-tight">Success!</h2>
                <p className="text-gray-500 dark:text-gray-400 font-bold max-w-[280px]">Your amount has been added to saathigro Wallet successfully.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black p-0 pt-6 pb-24 md:p-8 md:pb-8">
            <div className="max-w-2xl md:max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-6 md:mb-10 px-4 md:px-0">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-1.5 md:p-2 bg-gray-50 dark:bg-white/5 rounded-full shadow-sm hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft size={16} className="md:w-6 md:h-6" />
                    </button>
                    <div>
                        <h1 className="!text-[14px] md:!text-3xl font-black text-gray-900 dark:text-gray-100 leading-none tracking-tight">Add Money to Wallet</h1>
                    </div>
                </div>

                <div className="px-5 py-10 bg-gray-50/50 dark:bg-white/5 mb-6 md:bg-white dark:md:bg-[#141414] md:rounded-3xl md:border md:border-gray-100 dark:md:border-white/5 md:p-12">
                    <div className="flex flex-col items-center justify-center">
                        <span className="!text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Enter Amount to Add</span>
                        <div className="relative w-full max-w-[260px] mb-10">
                            <span className="absolute left-0 bottom-3 text-3xl font-black text-gray-400">₹</span>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full text-center !text-[44px] font-black text-gray-900 dark:text-white leading-none tracking-tighter bg-transparent border-b-4 border-gray-100 dark:border-white/10 focus:border-[#0c831f] focus:outline-none transition-all pb-2 pl-6"
                            />
                        </div>

                        <div className="w-full max-w-[340px] space-y-4">
                            <button
                                className={`flex items-center justify-between w-full p-5 rounded-2xl border-2 transition-all ${selectedOption === 'upi' ? 'border-[#0c831f] bg-green-50 dark:bg-green-900/10' : 'border-gray-100 dark:border-white/5 bg-white dark:bg-[#111] hover:border-gray-200'}`}
                                onClick={() => setSelectedOption('upi')}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedOption === 'upi' ? 'bg-[#0c831f] text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-400'}`}>
                                        <QrCode size={20} />
                                    </div>
                                    <span className="font-black !text-[12px] uppercase tracking-tight text-gray-900 dark:text-white">UPI / Google Pay</span>
                                </div>
                                {selectedOption === 'upi' && <div className="w-5 h-5 bg-[#0c831f] rounded-full flex items-center justify-center"><CheckCircle size={14} className="text-white" /></div>}
                            </button>

                            <button
                                className={`flex items-center justify-between w-full p-5 rounded-2xl border-2 transition-all ${selectedOption === 'card' ? 'border-[#0c831f] bg-green-50 dark:bg-green-900/10' : 'border-gray-100 dark:border-white/5 bg-white dark:bg-[#111] hover:border-gray-200'}`}
                                onClick={() => setSelectedOption('card')}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedOption === 'card' ? 'bg-[#0c831f] text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-400'}`}>
                                        <CreditCard size={20} />
                                    </div>
                                    <span className="font-black !text-[12px] uppercase tracking-tight text-gray-900 dark:text-white">Debit / Credit Card</span>
                                </div>
                                {selectedOption === 'card' && <div className="w-5 h-5 bg-[#0c831f] rounded-full flex items-center justify-center"><CheckCircle size={14} className="text-white" /></div>}
                            </button>
                        </div>

                        <button
                            onClick={handleAddMoney}
                            disabled={isProcessing || !amount}
                            className="mt-10 w-full max-w-[340px] bg-[#0c831f] text-white flex items-center justify-center gap-2 py-4 rounded-2xl !text-sm font-black uppercase tracking-[0.15em] active:scale-95 transition-all shadow-xl shadow-green-500/20 hover:bg-[#0a6b19] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                        >
                            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : 'Pay & Add Cash'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddMoneyPage;
