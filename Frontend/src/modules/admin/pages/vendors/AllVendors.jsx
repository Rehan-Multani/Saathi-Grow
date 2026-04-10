import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreHorizontal, Store, Mail, Phone, CheckCircle, Ban, Edit, Trash2, ChevronLeft, ChevronRight, Package, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import VendorDetailsModal from '../../components/vendors/VendorDetailsModal';
import VendorEditModal from '../../components/vendors/VendorEditModal';
import { getVendors, deleteVendor } from '../../api/vendorApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const AllVendors = () => {
    const { adminUser } = useAdminAuth();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [showActionDropdown, setShowActionDropdown] = useState(null);

    // Pagination State
    const [page, setPage] = useState(1);
    const limit = 10;
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1, limit });

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const { vendors: vendorList, pagination: paginationData } = await getVendors(
                adminUser.token,
                { page, limit, search: searchTerm },
                { paginated: true }
            );
            setVendors(Array.isArray(vendorList) ? vendorList : []);
            setPagination(paginationData || { total: 0, totalPages: 1, page, limit });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch vendors');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (adminUser?.token) fetchVendors();
    }, [adminUser?.token, page, searchTerm]);

    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

    const handleViewDetails = (vendor) => {
        setSelectedVendor(vendor);
        setShowDetailsModal(true);
        setShowActionDropdown(null);
    };

    const handleEdit = (vendor) => {
        setSelectedVendor(vendor);
        setShowEditModal(true);
        setShowActionDropdown(null);
    };

    const handleSave = () => {
        fetchVendors();
        setShowEditModal(false);
    };

    const handleDelete = (id, name) => {
        setShowActionDropdown(null);
        Swal.fire({
            title: 'Terminate Partnership?',
            text: `Are you sure you want to remove ${name}? All associated product listings will be archived.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f43f5e',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Terminate'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteVendor(adminUser.token, id);
                    toast.success('Vendor de-registered successfully');
                    fetchVendors();
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Failed to terminate partnership');
                }
            }
        });
    };

    const totalFiltered = pagination.total || 0;
    const totalPages = pagination.totalPages || 1;

    return (
        <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-purple-600">Merchant Network</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Vendor Registry</h1>
                        <PageInfoTooltip data={pageInfoData.allVendors} />
                    </div>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Managing third-party supply chain partners</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search store name, owner or email..."
                            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all shadow-sm shadow-slate-200/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Link
                        to="/admin/vendors/add"
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-purple-200 active:scale-95"
                    >
                        <Plus size={18} /> Add Merchant
                    </Link>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5">Merchant Entity</th>
                                <th className="px-8 py-5">Principal Contact</th>
                                <th className="px-8 py-5 text-center">SKU Portfolio</th>
                                <th className="px-8 py-5 text-center">Protocol Status</th>
                                <th className="px-8 py-5 text-right">Strategic Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-8 py-6">
                                            <div className="h-12 bg-slate-100 rounded-2xl w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : vendors.length > 0 ? (
                                vendors.map((v) => (
                                    <tr key={v._id} className="group hover:bg-slate-50/50 transition-colors duration-300">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm overflow-hidden p-1 relative group-hover:rotate-2 transition-transform">
                                                    {v.logo ? (
                                                        <img src={v.logo} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                                    ) : (
                                                        <Store size={24} className="text-slate-300" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-slate-900 leading-tight mb-1">{v.storeName}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter bg-slate-100 px-2 py-0.5 rounded-lg w-fit">
                                                        ID: {v._id.slice(-8).toUpperCase()}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="space-y-1">
                                                <div className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{v.ownerName}</div>
                                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold tracking-tight">
                                                    <Mail size={12} className="text-slate-300" /> {v.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold tracking-tight">
                                                    <Phone size={12} className="text-slate-300" /> {v.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <span className="text-sm font-black text-slate-900">{v.products || 0}</span>
                                                <span className="text-[8px] font-black uppercase text-slate-400 tracking-[0.2em]">Listing SKUS</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`inline-flex px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                                                v.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-900/5' :
                                                v.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' : 
                                                'bg-rose-50 text-rose-500 border-rose-100'
                                            }`}>
                                                {v.status || 'Offline'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right relative">
                                            <div className="flex justify-end gap-2.5">
                                                <button
                                                    onClick={() => handleEdit(v)}
                                                    className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center justify-center border border-blue-100 group-hover:scale-110 active:scale-95"
                                                    title="Modify Profile"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(v._id, v.storeName)}
                                                    className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all duration-300 flex items-center justify-center border border-rose-100 group-hover:scale-110 active:scale-95"
                                                    title="Terminate Access"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setShowActionDropdown(showActionDropdown === v._id ? null : v._id)}
                                                        className={`w-10 h-10 rounded-2xl transition-all duration-300 flex items-center justify-center border group-hover:scale-110 active:scale-95 ${showActionDropdown === v._id ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-900 hover:text-white'}`}
                                                    >
                                                        <MoreHorizontal size={18} />
                                                    </button>
                                                    
                                                    {showActionDropdown === v._id && (
                                                        <div className="absolute right-0 top-12 w-48 bg-white rounded-3xl shadow-2xl border border-slate-100 p-2 z-[50] animate-in fade-in zoom-in-95 duration-200">
                                                            <button 
                                                                onClick={() => handleViewDetails(v)}
                                                                className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase text-slate-600 hover:bg-slate-50 rounded-2xl transition-all"
                                                            >
                                                                <Activity size={16} className="text-blue-500" /> Intelligence
                                                            </button>
                                                            <div className="h-px bg-slate-50 my-1 mx-2" />
                                                            {v.status !== 'Active' && (
                                                                <button 
                                                                    onClick={() => toast.info('Protocol: Finalizing Verification...')}
                                                                    className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all"
                                                                >
                                                                    <CheckCircle size={16} /> Approve Access
                                                                </button>
                                                            )}
                                                            {v.status !== 'Inactive' && (
                                                                <button 
                                                                    onClick={() => toast.info('Protocol: Initiating Lockdown...')}
                                                                    className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                                                                >
                                                                    <Ban size={16} /> Lock Identity
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-300">
                                            <Store size={64} strokeWidth={1.5} className="animate-spin-slow opacity-20 mb-4" />
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Merchants Registered In Network</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {!loading && totalFiltered > 0 && (
                    <div className="bg-slate-50/50 border-t border-slate-100 px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Showing <span className="text-slate-900">{vendors.length}</span> of <span className="text-slate-900">{totalFiltered}</span> active merchants
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                            >
                                <ChevronLeft size={16} /> Previous
                            </button>
                            <div className="flex items-center gap-1.5">
                                {[...Array(totalPages)].map((_, i) => {
                                    const p = i + 1;
                                    if (p === 1 || p === totalPages || Math.abs(page - p) <= 1) {
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`w-10 h-10 rounded-2xl text-xs font-black transition-all ${page === p ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-slate-400 hover:bg-slate-100'}`}
                                            >
                                                {p}
                                            </button>
                                        );
                                    } else if (p === page - 2 || p === page + 2) {
                                        return <span key={p} className="text-slate-300 font-bold px-1">...</span>;
                                    }
                                    return null;
                                })}
                            </div>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <VendorDetailsModal
                show={showDetailsModal}
                onHide={() => setShowDetailsModal(false)}
                vendor={selectedVendor}
            />

            <VendorEditModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                vendor={selectedVendor}
                onSave={handleSave}
            />

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
            `}} />
        </div>
    );
};

export default AllVendors;
