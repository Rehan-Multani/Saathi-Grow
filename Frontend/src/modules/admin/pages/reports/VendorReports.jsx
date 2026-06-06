import React, { useState, useEffect, useCallback } from 'react';
import { Star, Download, Users, ChevronLeft, ChevronRight, Search, Phone, User, Store, Package, TrendingUp, DollarSign, Filter, Loader2, ArrowRight, RefreshCw, BarChart3 } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getVendorReports, exportVendorCSV } from '../../api/reportApi';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';
import VendorPerformanceModal from './VendorPerformanceModal';
import { downloadCSV } from '../../../../common/utils/formatUtils';

const VendorReports = () => {
    const { t } = useTranslation('admin_reports');
    const { adminUser } = useAdminAuth();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalVendors, setTotalVendors] = useState(0);
    const limit = 10;

    const fetchVendors = useCallback(async () => {
        if (!adminUser?.token) return;
        setLoading(true);
        try {
            const params = { page, limit, search: searchTerm };
            const res = await getVendorReports(adminUser.token, params);
            if (res.success) {
                setVendors(res.vendors || []);
                setTotalPages(res.pagination?.totalPages || 1);
                setTotalVendors(res.pagination?.total || 0);
            }
        } catch (error) {
            // toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    }, [adminUser, page, searchTerm]);

    useEffect(() => {
        fetchVendors();
    }, [fetchVendors]);

    useEffect(() => {
        const timer = setTimeout(() => { setPage(1); }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleExport = async () => {
        if (!adminUser?.token) return;
        setExporting(true);
        try {
            const params = { search: searchTerm };
            const blob = await exportVendorCSV(adminUser.token, params);
            const fileName = `Vendor_Report_${new Date().toISOString().split('T')[0]}.csv`;
            downloadCSV(blob, fileName);
            toast.success('Report exported successfully');
        } catch (error) {
            toast.error('Export failed');
        } finally {
            setExporting(false);
        }
    };

    const handleShowDetails = (vendor) => {
        setSelectedVendor(vendor);
        setShowModal(true);
    };

    return (
        <div className="container-fluid py-6 bg-slate-50/30 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">{t('vendor.title')}</h1>
                        <PageInfoTooltip data={pageInfoData.vendorReports} />
                    </div>
                    <p className="text-slate-500 text-xs mt-1 font-bold opacity-70 uppercase tracking-tight">{t('vendor.subtitle')}</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search vendor or owner..."
                            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm mr-2"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-[0.98] disabled:opacity-50 whitespace-nowrap"
                    >
                        {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        <span>{t('common.export')}</span>
                    </button>
                </div>
            </div>

            {/* Vendor List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                 <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
                            <Store size={20} />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Active Vendors</h3>
                    </div>
                    <button onClick={fetchVendors} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                 </div>

                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 font-bold text-slate-500 uppercase text-[10px] tracking-widest">
                                <th className="px-8 py-5">Vendor Info</th>
                                <th className="px-6 py-5">Contact</th>
                                <th className="px-6 py-5 text-center">Items</th>
                                <th className="px-6 py-5">Income</th>
                                <th className="px-6 py-5 text-center">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                            {loading && vendors.length === 0 ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-8 py-6">
                                            <div className="h-4 bg-slate-50 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : vendors.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                                                <Store size={32} className="text-slate-200" />
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No vendor records found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                vendors.map((vendor, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all group-hover:border-blue-600 shadow-sm shrink-0">
                                                    {vendor.vendorName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-xs font-bold text-slate-800 uppercase tracking-tight truncate">{vendor.vendorName}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{vendor.owner}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="text-[11px] font-bold text-slate-700 uppercase">{vendor.contact}</div>
                                            <div className="text-[10px] text-slate-400">{vendor.email}</div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold border border-blue-100">
                                                {vendor.productsListed || 0} ITEMS
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="text-xs font-black text-slate-800">₹{vendor.totalSales?.toLocaleString()}</div>
                                            <div className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{vendor.orderCount} Orders</div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight border whitespace-nowrap ${
                                                vendor.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                vendor.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-500 border-rose-100'
                                            }`}>
                                                {vendor.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button 
                                                onClick={() => handleShowDetails(vendor)}
                                                className="bg-white border border-slate-200 text-slate-500 px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-tight hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm active:scale-95"
                                            >
                                                {t('vendor.table.actions')}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                 </div>

                 {/* Pagination Toolbar */}
                 {!loading && totalVendors > 0 && totalPages > 1 && (
                     <div className="px-8 py-6 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, totalVendors)} of {totalVendors} vendors
                        </div>
                        <div className="flex items-center gap-2">
                             <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 bg-white border rounded-xl disabled:opacity-30 hover:border-blue-500 shadow-sm transition-all">
                                <ChevronLeft size={16} />
                            </button>
                            <div className="flex items-center gap-1.5 px-3">
                                <span className="text-xs font-bold text-slate-500">{page} of {totalPages}</span>
                            </div>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 bg-white border rounded-xl disabled:opacity-30 hover:border-blue-500 shadow-sm transition-all">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                     </div>
                 )}
            </div>

            <VendorPerformanceModal
                show={showModal}
                onHide={() => { setShowModal(false); setSelectedVendor(null); }}
                vendor={selectedVendor}
            />
        </div>
    );
};

export default VendorReports;
