import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Download, ArrowLeft, IndianRupee, Printer, User, CreditCard,
    Wallet, Info, HelpCircle, CheckCircle, Clock, XCircle, AlertCircle,
    ChevronLeft, ChevronRight, History
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getPayoutById, getPayouts } from '../../api/vendorApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PayoutDetails = () => {
    const { id } = useParams();
    const { t } = useTranslation('admin_vendors');
    const navigate = useNavigate();
    const { adminUser } = useAdminAuth();

    const [payout, setPayout] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(false);
    
    // Pagination for history display
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchHistory = useCallback(async (vendorId) => {
        if (!adminUser?.token || !vendorId) return;
        try {
            setHistoryLoading(true);
            const response = await getPayouts(adminUser.token, { vendorId, page, limit: 5 }, { paginated: true });
            setHistory(response.payouts || []);
            setTotalPages(response.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Failed to load history:', error);
        } finally {
            setHistoryLoading(false);
        }
    }, [adminUser?.token, page]);

    useEffect(() => {
        const fetchPayoutData = async () => {
            if (!adminUser?.token || !id) return;
            try {
                setLoading(true);
                const data = await getPayoutById(adminUser.token, id);
                setPayout(data);
                if (data.vendor?._id) {
                    fetchHistory(data.vendor._id);
                }
            } catch (error) {
                // toast.error('Failed to load details');
                navigate('/admin/vendors/payouts');
            } finally {
                setLoading(false);
            }
        };

        fetchPayoutData();
    }, [adminUser?.token, id, navigate]);

    useEffect(() => {
        if (payout?.vendor?._id) {
            fetchHistory(payout.vendor._id);
        }
    }, [page, fetchHistory, payout?.vendor?._id]);

    const handlePrint = () => {
        window.print();
    };

    const handleExport = async () => {
        if (!payout || !adminUser?.token) return;

        try {
            Swal.fire({
                title: t('loading'),
                text: 'Fetching full withdrawal history...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const response = await getPayouts(adminUser.token, { vendorId: payout.vendor._id, limit: 'all' });
            const allPayouts = Array.isArray(response) ? response : (response.payouts || []);

            const doc = new jsPDF();
            const vendor = payout.vendor || {};
            const bank = vendor.bankAccount || {};

            doc.setFillColor(15, 23, 42);
            doc.rect(0, 0, 210, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text(t('payout_report.title'), 20, 25);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`${t('payout_report.id_label')}: #${payout._id.toUpperCase()}`, 20, 32);

            doc.setTextColor(15, 23, 42);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(t('payout_report.sidebar.title'), 20, 55);
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 116, 139);
            doc.text(`${t('payout_report.amount_card.store')}:`, 20, 65);
            doc.text(`${t('details.profile.owner')}:`, 20, 72);
            doc.text(`${t('details.profile.email')}:`, 20, 79);
            doc.text(`${t('details.profile.phone')}:`, 20, 86);

            doc.setTextColor(15, 23, 42);
            doc.text(vendor.storeName || 'N/A', 60, 65);
            doc.text(vendor.ownerName || 'N/A', 60, 72);
            doc.text(vendor.email || 'N/A', 60, 79);
            doc.text(vendor.phone || 'N/A', 60, 86);

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Bank Information', 120, 55);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 116, 139);
            doc.text(`${t('payout_report.sidebar.bank')}:`, 120, 65);
            doc.text(`${t('payout_report.sidebar.account')}:`, 120, 72);
            doc.text(`${t('payout_report.sidebar.ifsc')}:`, 120, 79);
            doc.text(`${t('payout_report.sidebar.upi')}:`, 120, 86);

            doc.setTextColor(15, 23, 42);
            doc.text(bank.bankName || 'N/A', 160, 65);
            doc.text(bank.accountNumber || 'N/A', 160, 72);
            doc.text(bank.ifscCode || 'N/A', 160, 79);
            doc.text(bank.upiId || 'N/A', 160, 86);

            doc.setDrawColor(241, 245, 249);
            doc.line(20, 95, 190, 95);

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(t('payout_report.summary.title'), 20, 110);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 116, 139);
            doc.text(`${t('payout_report.summary.total')}:`, 20, 120);
            doc.text(`${t('payout_report.amount_card.method')}:`, 20, 127);
            doc.text(`${t('payout_report.history.table.status')}:`, 20, 134);
            doc.text(`${t('payout_report.amount_card.date')}:`, 20, 141);

            doc.setTextColor(15, 23, 42);
            doc.setFont('helvetica', 'bold');
            doc.text(`INR ${payout.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 60, 120);
            doc.setFont('helvetica', 'normal');
            doc.text(payout.paymentMethod || 'N/A', 60, 127);
            doc.text(payout.status || 'N/A', 60, 134);
            doc.text(new Date(payout.updatedAt).toLocaleString(), 60, 141);

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(t('payout_report.history.title'), 20, 160);

            const tableRows = allPayouts.map(h => [
                new Date(h.createdAt).toLocaleDateString(),
                h._id.slice(-8).toUpperCase(),
                h.paymentMethod,
                `INR ${h.amount.toLocaleString()}`,
                h.status
            ]);

            doc.autoTable({
                startY: 170,
                head: [[t('payout_report.history.table.date'), t('payout_report.history.table.ref'), t('payouts.table.method'), t('payout_report.history.table.amount'), t('payout_report.history.table.status')]],
                body: tableRows,
                theme: 'striped',
                headStyles: { fillColor: [15, 23, 42] },
                styles: { fontSize: 8 },
                margin: { left: 20, right: 20 }
            });

            const fileName = `${vendor.storeName?.replace(/\s+/g, '_')}_Withdrawal_Report.pdf`;
            doc.save(fileName);
            Swal.close();
        } catch (error) {
            Swal.close();
            toast.error('Could not generate PDF');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-vh-100 gap-4">
                <div className="saathi-spinner"></div>
                <p className="text-slate-400 text-sm font-medium">{t('loading')}</p>
            </div>
        );
    }

    if (!payout) return null;

    const vendor = payout.vendor || {};
    const bank = vendor.bankAccount || {};

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Paid': return { icon: <CheckCircle className="text-emerald-500" size={24} />, text: t('payouts.status.paid'), bg: 'bg-emerald-50', border: 'border-emerald-100', textCol: 'text-emerald-600' };
            case 'Pending': case 'Processing': return { icon: <Clock className="text-amber-500" size={24} />, text: t('payouts.status.pending'), bg: 'bg-amber-50', border: 'border-amber-100', textCol: 'text-amber-600' };
            case 'Rejected': case 'Failed': return { icon: <XCircle className="text-rose-500" size={24} />, text: t('payouts.status.rejected'), bg: 'bg-rose-50', border: 'border-rose-100', textCol: 'text-rose-600' };
            default: return { icon: <AlertCircle className="text-slate-400" size={24} />, text: status, bg: 'bg-slate-50', border: 'border-slate-100', textCol: 'text-slate-600' };
        }
    };

    const statusStyle = getStatusStyles(payout.status);

    return (
        <div className="container-fluid py-8 bg-slate-50/20 min-h-screen px-4 md:px-8 max-w-7xl mx-auto font-sans">
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    .print-card { border: 1px solid #e2e8f0 !important; box-shadow: none !important; }
                }
                .saathi-spinner {
                    width: 32px; height: 32px; border: 3px solid #f3f3f3; border-top: 3px solid #3b82f6; border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}} />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 no-print">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all shadow-sm">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('payout_report.title')}</h1>
                        <p className="text-slate-500 text-sm mt-0.5 font-medium">{t('payout_report.id_label')}: <span className="text-slate-400">#{payout._id.slice(-8).toUpperCase()}</span></p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button onClick={handleExport} className="flex-1 md:flex-none px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm">
                        <Download size={16} /> {t('payout_report.export')}
                    </button>
                    <button onClick={handlePrint} className="flex-1 md:flex-none px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200">
                        <Printer size={16} /> {t('payout_report.print')}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    {/* Main Withdrawal Card */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 print-card relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50/30 rounded-full blur-3xl -mr-24 -mt-24 transition-transform group-hover:scale-110 duration-700" />
                        
                        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                            <div className="flex items-center gap-6">
                                <div className={`w-20 h-20 ${statusStyle.bg} ${statusStyle.textCol} rounded-3xl flex items-center justify-center border ${statusStyle.border} shadow-inner`}>
                                    {statusStyle.icon}
                                </div>
                                <div className="space-y-1">
                                    <div className="text-slate-400 text-xs font-bold uppercase tracking-widest opacity-60">{t('payout_report.amount_card.label')}</div>
                                    <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">₹{payout.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
                                    <div className={`inline-flex items-center px-3 py-1 ${statusStyle.bg} ${statusStyle.textCol} border ${statusStyle.border} rounded-lg text-[10px] font-bold uppercase tracking-wider mt-2`}>
                                        {statusStyle.text}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-left md:text-right space-y-1.5 pt-4 md:pt-0">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block opacity-60">{t('payout_report.amount_card.date')}</span>
                                <span className="text-sm font-bold text-slate-700">{new Date(payout.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                <span className="text-[10px] text-slate-400 block font-medium">{new Date(payout.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-slate-50 grid grid-cols-1 sm:grid-cols-3 gap-8">
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block opacity-60">{t('payout_report.amount_card.method')}</span>
                                <div className="flex items-center gap-2 text-slate-700 font-bold text-sm uppercase">
                                    <Wallet size={14} className="text-slate-400" />
                                    {payout.paymentMethod}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block opacity-60">{t('payout_report.amount_card.store')}</span>
                                <div className="flex items-center gap-2 text-slate-700 font-bold text-sm uppercase">
                                    <User size={14} className="text-slate-400" />
                                    {vendor.storeName}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block opacity-60">{t('payout_report.amount_card.ref')}</span>
                                <div className="flex items-center gap-2 text-slate-600 font-mono text-xs">
                                    <Info size={14} className="text-slate-400 shrink-0" />
                                    {payout.referenceNumber || 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Section */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden print-card">
                        <div className="p-6 border-b border-slate-50 bg-slate-50/30">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">{t('payout_report.summary.title')}</h3>
                        </div>
                        <div className="p-8">
                            <div className="space-y-6">
                                <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                                    <span className="text-sm font-medium text-slate-500">{t('payout_report.summary.total')}</span>
                                    <span className="text-sm font-bold text-slate-900">₹{payout.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                                    <span className="text-sm font-medium text-slate-500">{t('payout_report.summary.fee')}</span>
                                    <span className="text-sm font-bold text-slate-400">₹0.00</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-base font-bold text-slate-900">{t('payout_report.summary.final')}</span>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-blue-600">₹{payout.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider italic">{t('payout_report.summary.via')} {payout.paymentMethod}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {payout.note && (
                                <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 italic">
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{t('payout_report.summary.note')}: {payout.note}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Withdrawal History */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden print-card no-print">
                        <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History size={16} className="text-blue-500" />
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">{t('payout_report.history.title')}</h3>
                            </div>
                            <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">{t('payout_report.history.badge')}</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/20 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                    <tr>
                                        <th className="px-8 py-5">{t('payout_report.history.table.date')}</th>
                                        <th className="px-6 py-5">{t('payout_report.history.table.ref')}</th>
                                        <th className="px-6 py-5 text-center">{t('payout_report.history.table.amount')}</th>
                                        <th className="px-8 py-5 text-right">{t('payout_report.history.table.status')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {historyLoading ? (
                                        <tr>
                                            <td colSpan="4" className="py-12 text-center font-bold text-slate-400 text-[10px] uppercase">{t('loading')}</td>
                                        </tr>
                                    ) : history.length > 0 ? (
                                        history.map((h) => (
                                            <tr key={h._id} className={`hover:bg-slate-50/50 transition-colors ${h._id === payout._id ? 'bg-blue-50/20' : ''} group`}>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-blue-500 transition-colors shrink-0">
                                                            <History size={16} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-slate-800">{new Date(h.createdAt).toLocaleDateString()}</span>
                                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{new Date(h.createdAt).toLocaleTimeString()}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <span className="text-[10px] font-mono text-slate-500 tracking-tighter uppercase font-bold">#{h._id.slice(-8).toUpperCase()}</span>
                                                </td>
                                                <td className="px-6 py-6 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-sm font-bold text-slate-900 tracking-tight">₹{h.amount?.toLocaleString()}</span>
                                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none opacity-60 mt-0.5">{h.paymentMethod}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-widest ${
                                                        h.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                        (h.status === 'Pending' || h.status === 'Requested') ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-500 border-rose-100'
                                                    }`}>
                                                        {h.status === 'Paid' ? t('payouts.status.paid') : (h.status === 'Requested' || h.status === 'Pending' ? t('payouts.status.pending') : h.status)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="py-12 text-center text-slate-400 text-xs italic font-medium">{t('payout_report.history.no_history')}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {totalPages > 1 && (
                            <div className="px-8 py-4 bg-slate-50/30 border-t border-slate-50 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-60">{t('payout_report.history.page')} {page} {t('payout_report.history.of')} {totalPages}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => setPage(prev => Math.max(1, prev - 1))} disabled={page === 1} className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 disabled:opacity-30 hover:border-slate-300">
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button onClick={() => setPage(prev => Math.min(totalPages, prev + 1))} disabled={page === totalPages} className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 disabled:opacity-30 hover:border-slate-300">
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 overflow-hidden sticky top-6 print-card">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">{t('payout_report.sidebar.title')}</h4>
                        <div className="flex items-center gap-4 mb-10 p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center text-blue-600 shrink-0 overflow-hidden">
                                {vendor.logo ? <img src={vendor.logo} className="w-full h-full object-cover" /> : <User size={28} />}
                            </div>
                            <div className="min-w-0">
                                <div className="text-sm font-bold text-slate-900 tracking-tight truncate mb-0.5">{vendor.storeName}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none opacity-60">{vendor.ownerName}</div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {[
                                { label: t('payout_report.sidebar.bank'), value: bank.bankName, icon: <Wallet size={18} /> },
                                { label: t('payout_report.sidebar.account'), value: bank.accountNumber, icon: <CreditCard size={18} /> },
                                { label: t('payout_report.sidebar.ifsc'), value: bank.ifscCode, icon: <Info size={18} /> },
                                { label: t('payout_report.sidebar.upi'), value: bank.upiId, icon: <IndianRupee size={18} />, hideIfEmpty: true }
                            ].map((item, i) => (
                                (!item.hideIfEmpty || item.value) && (
                                    <div key={i} className="flex items-start gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors shrink-0">
                                            {item.icon}
                                        </div>
                                        <div className="pt-0.5 shrink-0 overflow-hidden">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">{item.label}</span>
                                            <span className="text-xs font-bold text-slate-800 tracking-tight uppercase font-mono">{item.value || 'N/A'}</span>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>

                        <div className="mt-12 p-6 bg-slate-100 rounded-3xl text-slate-900 relative overflow-hidden group shadow-inner">
                            <div className="relative">
                                <HelpCircle size={20} className="text-slate-400 mb-4" />
                                <h5 className="text-sm font-bold tracking-tight mb-1">{t('payout_report.sidebar.help_title')}</h5>
                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">{t('payout_report.sidebar.help_text')}</p>
                                <button onClick={() => window.open('mailto:support@Saathigro.com')} className="w-full mt-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all active:scale-95 border-none shadow-lg shadow-slate-200">{t('payout_report.sidebar.contact_btn')}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayoutDetails;
