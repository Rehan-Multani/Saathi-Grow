import React, { useState, useEffect, useCallback } from 'react';
import { Star, Download, Users, ChevronLeft, ChevronRight, Search, Phone, User, Store, Package, TrendingUp, DollarSign, Filter, Loader2, ArrowRight } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getVendorReports, exportVendorCSV } from '../../api/reportApi';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';
import VendorPerformanceModal from './VendorPerformanceModal';

const VendorReports = () => {
    const { t } = useTranslation('admin_vendors');
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
            console.error('Fetch Vendor Reports Error:', error);
            toast.error('Failed to load reports');
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
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Vendor_Analysis_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Report exported successfully');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Export failed');
        } finally {
            setExporting(false);
        }
    };

    const handleShowDetails = (vendor) => {
        setSelectedVendor(vendor);
        setShowModal(true);
    };

    if (loading && vendors.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-vh-100 gap-4">
                <Loader2 size={40} className="text-blue-500 animate-spin" />
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest leading-none">Scanning Partner Records...</p>
            </div>
        );
    }

    return (
        <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase tracking-tight leading-none">Vendor Analysis</h1>
                        <PageInfoTooltip data={pageInfoData.vendorReports} />
                    </div>
                    <p className="text-slate-500 text-xs mt-2 font-medium italic">Comprehensive performance metrics for store partners</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Find store or owner..."
                            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold tracking-tight hover:bg-black active:scale-95 transition-all shadow-lg border-none shrink-0"
                    >
                        {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        Export PDF/CSV
                    </button>
                </div>
            </div>

            {/* Main Table Card */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-6 duration-700">
                 <div className="p-8 border-b border-slate-50 bg-slate-50/10 flex flex-col md:flex-row justify-between items-md-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-inner group">
                            <Users size={20} className="group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                             <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Active Multi-Vendor Matrix</h3>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Marketplace Overview</p>
                        </div>
                    </div>
                 </div>

                 <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-left font-medium">
                        <thead>
                            <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 italic">
                                <th className="px-8 py-5">Partner Profile</th>
                                <th className="px-6 py-5">Contact Hub</th>
                                <th className="px-6 py-5 text-center">Listed Items</th>
                                <th className="px-6 py-5">Gross Revenue</th>
                                <th className="px-6 py-5">Registry Date</th>
                                <th className="px-6 py-5 text-center">Lifecycle</th>
                                <th className="px-8 py-5 text-right uppercase">Audit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {vendors.length > 0 ? vendors.map((vendor, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-400 shadow-inner group-hover:border-blue-300 group-hover:text-blue-600 transition-all shrink-0">
                                                {vendor.vendorName.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-bold text-slate-900 leading-none uppercase tracking-tight truncate group-hover:text-blue-600 transition-colors">{vendor.vendorName}</div>
                                                <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic opacity-70">
                                                    <User size={12} className="text-slate-300" /> {vendor.owner}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex flex-col gap-1.5 min-w-[140px]">
                                            <div className="text-[11px] font-bold text-slate-800 tracking-tight leading-none uppercase">{vendor.contact}</div>
                                            <div className="text-[10px] font-bold text-slate-400 lowercase leading-none tracking-tighter italic opacity-60 truncate underline underline-offset-2 decoration-slate-100">{vendor.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                         <div className="inline-flex flex-col items-center p-2 bg-blue-50/50 rounded-xl border border-blue-50/80 min-w-[60px]">
                                            <span className="text-sm font-bold text-blue-600 leading-none">{vendor.productsListed || 0}</span>
                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] mt-1.5 text-blue-400">SKUs</span>
                                         </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex flex-col">
                                            <div className="text-sm font-black text-emerald-600 tracking-tighter leading-none italic">₹{vendor.totalSales?.toLocaleString()}</div>
                                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-60">From {vendor.orderCount} Orders</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 whitespace-nowrap">
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight opacity-90 italic">{vendor.memberSince}</span>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold border uppercase tracking-widest ${
                                            vendor.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-50' :
                                            vendor.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100 shadow-sm shadow-amber-50' : 'bg-rose-50 text-rose-500 border-rose-100 shadow-sm shadow-rose-50'
                                        }`}>
                                            {vendor.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button 
                                            onClick={() => handleShowDetails(vendor)}
                                            className="px-5 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-blue-500 hover:text-blue-600 transition-all active:scale-95 shadow-sm group-hover:shadow-md"
                                        >
                                            View Stats
                                        </button>
                                    </td>
                                </tr>
                            )).reverse() : (
                                <tr>
                                    <td colSpan="7" className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner">
                                                <Store size={32} className="text-slate-200 animate-pulse" />
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest italic leading-none">No partner analysis available</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                 </div>

                 {/* Pagination */}
                 {totalVendors > 0 && (
                     <div className="px-8 py-6 bg-slate-50/40 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none">
                            Displaying <span className="text-slate-900 border-b border-slate-200 italic">{((page - 1) * limit) + 1} - {Math.min(page * limit, totalVendors)}</span> of <span className="text-slate-900 font-black">{totalVendors}</span> Entities
                        </div>
                        <div className="flex items-center gap-2">
                             <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-10 h-10 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-white hover:shadow-sm disabled:opacity-30 border-none bg-transparent transition-all">
                                <ChevronLeft size={20} />
                            </button>
                            <div className="flex items-center gap-1.5">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button 
                                        key={i+1} 
                                        onClick={() => setPage(i+1)} 
                                        className={`w-10 h-10 rounded-2xl text-[11px] font-black transition-all border-none ${page === i+1 ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-400 hover:bg-slate-100 bg-transparent'}`}
                                    >
                                        {i+1}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-10 h-10 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-white hover:shadow-sm disabled:opacity-30 border-none bg-transparent transition-all">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                     </div>
                 )}
            </div>

            <VendorPerformanceModal
                show={showModal}
                onHide={() => setShowModal(false)}
                vendor={selectedVendor}
            />

            <style dangerouslySetInnerHTML={{ __html: `
                .scrollbar-thin::-webkit-scrollbar { height: 4px; border-radius: 10px; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default VendorReports;
