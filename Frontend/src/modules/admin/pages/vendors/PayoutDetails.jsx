import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Download, ArrowLeft, IndianRupee, Calendar, CheckCircle,
    FileText, CreditCard, Printer, User, Check, Wallet,
    ArrowUpRight, Info, AlertCircle, TrendingUp, HelpCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';

const PayoutDetails = () => {
    const { id } = useParams();
    const { t } = useTranslation('admin_vendors');
    const navigate = useNavigate();

    // Mock data for a specific payout detail
    const payoutData = {
        id: id || 'PAY-8801',
        vendor: 'Fresh Farms Ltd',
        vendorId: 'VND-302',
        amount: '₹1,250.00',
        date: 'Nov 01, 2023',
        status: 'Paid',
        method: 'Online Transfer',
        utr: 'UTR98324123849',
        bankDetails: {
            bank: 'HDFC Bank',
            account: '**** 5678',
            ifsc: 'HDFC0001234'
        },
        orders: [
            { id: '#ORD-9021', date: 'Oct 28', amount: '₹450', commission: '₹45', net: '₹405' },
            { id: '#ORD-9035', date: 'Oct 29', amount: '₹950', commission: '₹95', net: '₹845' },
        ]
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadCSV = () => {
        Swal.fire({
            title: 'Report Generated',
            text: 'Transaction breakdown saved successfully.',
            icon: 'success',
            confirmButtonColor: '#2563eb'
        });
    };

    return (
        <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    body { background: white !important; font-size: 10pt; }
                }
            `}} />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 no-print">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all border-none bg-transparent">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Settlement Report</h1>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest leading-none italic">ID: #{payoutData.id}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={handleDownloadCSV}
                        className="flex-1 md:flex-none px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2"
                    >
                        <Download size={16} /> Export
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex-1 md:flex-none px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold tracking-tight hover:bg-black active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 border-none"
                    >
                        <Printer size={16} /> Print Receipt
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-2">
                <div className="lg:col-span-2 space-y-8">
                    {/* Status Card */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 transition-opacity" />
                        
                        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                    <CheckCircle size={32} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 tracking-tighter">{payoutData.amount}</h2>
                                    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-sm">
                                        Payment Settled
                                    </div>
                                </div>
                            </div>
                            <div className="text-left md:text-right shrink-0">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 opacity-60">Payout Date</span>
                                <span className="text-xs font-bold text-slate-800 uppercase tracking-tight">{payoutData.date}</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-50 grid grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block opacity-60">Payment Method</span>
                                <span className="text-[11px] font-bold text-slate-700 uppercase">{payoutData.method}</span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block opacity-60">Bank Name</span>
                                <span className="text-[11px] font-bold text-slate-700 uppercase">{payoutData.bankDetails.bank}</span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block opacity-60">Reference ID</span>
                                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight italic">{payoutData.utr}</span>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown Ledger */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-700">
                        <div className="p-6 border-b border-slate-50 bg-slate-50/20">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Transaction Summary</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-medium">
                                <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-8 py-5">Order ID</th>
                                        <th className="px-6 py-5">Date</th>
                                        <th className="px-6 py-5 text-center">Amount</th>
                                        <th className="px-6 py-5 text-center">Fee</th>
                                        <th className="px-8 py-5 text-right font-bold">Net Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {payoutData.orders.map((o, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/20 transition-colors group">
                                            <td className="px-8 py-5">
                                                <span className="text-xs font-bold text-blue-600 hover:underline cursor-pointer tracking-tight uppercase">{o.id}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase italic opacity-70">{o.date}</span>
                                            </td>
                                            <td className="px-6 py-5 text-center font-bold text-xs uppercase tracking-tighter">
                                                {o.amount}
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="text-xs font-bold text-rose-500">-{o.commission}</span>
                                            </td>
                                            <td className="px-8 py-5 text-right font-bold text-slate-900">
                                                {o.net}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-slate-900 text-white">
                                        <td colSpan="4" className="px-8 py-5 text-right text-[10px] font-bold uppercase tracking-widest opacity-60">Total Disbursed Amount</td>
                                        <td className="px-8 py-5 text-right">
                                            <span className="text-lg font-bold tracking-tighter">{payoutData.amount}</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Recipient Details */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 overflow-hidden sticky top-6">
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">Recipient Info</h4>
                        <div className="flex items-center gap-4 mb-8 p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-blue-600 shrink-0">
                                <User size={24} />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[11px] font-bold text-slate-900 uppercase tracking-tight truncate mb-0.5">{payoutData.vendor}</div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic leading-none opacity-60">ID: {payoutData.vendorId}</div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {[
                                { label: 'Bank Name', value: payoutData.bankDetails.bank, icon: <Wallet size={14} /> },
                                { label: 'Account number', value: payoutData.bankDetails.account, icon: <CreditCard size={14} /> },
                                { label: 'Routing Link (IFSC)', value: payoutData.bankDetails.ifsc, icon: <Info size={14} /> }
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center group">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-blue-500 transition-colors shadow-inner">
                                            {item.icon}
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{item.label}</span>
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight italic opacity-90">{item.value}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 p-5 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-100 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500 cursor-pointer">
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
                            <div className="relative space-y-4">
                                <HelpCircle size={24} className="text-white/80" />
                                <div>
                                    <h5 className="text-sm font-bold uppercase tracking-tight">Need Help?</h5>
                                    <p className="text-[10px] text-white/60 font-medium leading-relaxed mt-1 italic">Contact support for payment related queries.</p>
                                </div>
                                <button className="w-full py-2 bg-white text-blue-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-50 transition-colors border-none">Get Support</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayoutDetails;
