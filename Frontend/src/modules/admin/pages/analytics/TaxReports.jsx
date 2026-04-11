import React, { useState } from 'react';
import { Download, FileText, Printer, Calculator, AlertTriangle, FileSearch, ShieldCheck, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import TaxDocModal from './TaxDocModal';

const TAX_DATA = [
    { id: 'TX-40121', period: 'Nov 2023', taxable: '₹25,000.00', gst: '₹1,250.00', status: 'Filed' },
    { id: 'TX-39281', period: 'Oct 2023', taxable: '₹22,500.00', gst: '₹1,125.00', status: 'Filed' },
    { id: 'TX-38102', period: 'Sep 2023', taxable: '₹18,000.00', gst: '₹900.00', status: 'Pending' },
];

const TaxReports = () => {
    const { t } = useTranslation('admin_analytics');
    const [showModal, setShowModal] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);

    const handleViewDoc = (doc) => {
        setSelectedDoc(doc);
        setShowModal(true);
    };

    return (
        <div className="container-fluid py-6 bg-slate-50/30 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">{t('finance.tax.title')}</h1>
                    <p className="text-slate-500 text-xs mt-1 font-bold opacity-70 uppercase tracking-tight">{t('finance.tax.subtitle')}</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
                    >
                        <Download size={16} />
                        <span>{t('sales.download', { ns: 'admin_reports' })} 1099-K</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/10">
                            <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                <FileSearch size={16} className="text-blue-600" /> {t('finance.tax.history')}
                            </h5>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100 font-bold text-slate-500 uppercase text-[10px] tracking-widest">
                                        <th className="px-8 py-5 text-blue-600">Record ID</th>
                                        <th className="px-6 py-5">Month</th>
                                        <th className="px-6 py-5">Sales Money</th>
                                        <th className="px-6 py-5">GST Paid</th>
                                        <th className="px-6 py-5 text-center">State</th>
                                        <th className="px-8 py-5 text-right uppercase">Files</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-bold">
                                    {TAX_DATA.map((t, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/30 transition-colors group">
                                            <td className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">#{t.id}</td>
                                            <td className="px-6 py-5 text-[11px] text-slate-800 uppercase tracking-tight">{t.period}</td>
                                            <td className="px-6 py-5 text-[11px] text-slate-500">{t.taxable}</td>
                                            <td className="px-6 py-5 text-[11px] text-slate-900">{t.gst}</td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight border ${
                                                    t.status === 'Filed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                                }`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button 
                                                    onClick={() => handleViewDoc(t)}
                                                    className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                >
                                                    <FileText size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar Config */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
                        <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-4">
                            <Calculator size={20} className="text-blue-600" />
                            <h6 className="text-[11px] font-black text-slate-800 uppercase tracking-widest leading-none">Tax Controls</h6>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">Tax Rate (%)</label>
                                <input 
                                    type="number" 
                                    defaultValue="5.0" 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-blue-600 outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-[10px] font-bold text-slate-600 uppercase">Auto Calculate</span>
                                <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer">
                                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full translate-x-0" />
                                </div>
                            </div>
                            
                            <button className="w-full py-3.5 bg-blue-600 text-white rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                                Apply Changes
                            </button>
                        </div>
                    </div>

                    <div className="bg-amber-50 rounded-[2rem] border border-amber-100 p-8 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-amber-200/20 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-amber-300/30 transition-all duration-700" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 text-amber-600 mb-3">
                                <AlertTriangle size={18} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Urgent Notice</span>
                            </div>
                            <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase tracking-tight">
                                Quarter 4 details are due by Jan 15th. Please check all money records before filing.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <TaxDocModal
                show={showModal}
                onHide={() => setShowModal(false)}
                doc={selectedDoc}
            />
        </div>
    );
};

export default TaxReports;
