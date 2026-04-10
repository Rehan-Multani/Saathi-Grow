import React, { useState, useEffect } from 'react';
import { Search, Plus, ExternalLink, Mail, Phone, MapPin, MoreVertical, RefreshCw, Filter, User, Store, Package, Trash2, Edit, CheckCircle, ChevronLeft, ChevronRight, LayoutGrid, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getVendors, deleteVendor } from '../../api/vendorApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import VendorDetailsModal from '../../components/vendors/VendorDetailsModal';
import VendorEditModal from '../../components/vendors/VendorEditModal';
import ContactVendorModal from '../../components/vendors/ContactVendorModal';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const AllVendors = () => {
    const { t } = useTranslation('admin_vendors');
    const navigate = useNavigate();
    const { adminUser } = useAdminAuth();
    
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showContact, setShowContact] = useState(false);

    // Pagination
    const [page, setPage] = useState(1);
    const limit = 10;

    const fetchVendors = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            const data = await getVendors(adminUser.token);
            setVendors(Array.isArray(data) ? data : (data.vendors || []));
        } catch (error) {
            toast.error('Failed to load vendors');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (adminUser?.token) fetchVendors();
    }, [adminUser.token]);

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Delete Vendor?',
            text: "This will remove the vendor from the list.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Yes, delete',
            customClass: {
                popup: 'rounded-3xl border-none shadow-2xl',
                confirmButton: 'rounded-xl px-6 py-2.5 font-bold uppercase text-xs tracking-widest',
                cancelButton: 'rounded-xl px-6 py-2.5 font-bold uppercase text-xs tracking-widest'
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteVendor(adminUser.token, id);
                    toast.success('Vendor deleted successfully');
                    fetchVendors();
                } catch (error) {
                    toast.error('Failed to delete vendor');
                }
            }
        });
    };

    const filteredVendors = vendors.filter(v => 
        v.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginatedVendors = filteredVendors.slice((page - 1) * limit, page * limit);
    const totalPages = Math.ceil(filteredVendors.length / limit) || 1;

    if (loading && !refreshing) {
        return (
            <div className="flex flex-col items-center justify-center min-vh-100 gap-4">
                <Loader2 size={40} className="text-blue-500 animate-spin" />
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">Loading Vendors...</p>
            </div>
        );
    }

    return (
        <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">Vendor List</h1>
                        <PageInfoTooltip data={pageInfoData.allVendors} />
                    </div>
                    <p className="text-slate-500 text-xs mt-1 font-medium italic">Manage all registered store partners</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search name, owner or email..."
                            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-xs font-bold text-slate-700 outline-none focus:border-blue-500/50 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => fetchVendors(true)}
                        disabled={refreshing}
                        className={`p-2.5 bg-white border border-slate-200 rounded-xl transition-all shadow-sm active:scale-95 ${refreshing ? 'opacity-50' : 'hover:border-blue-500'}`}
                    >
                        <RefreshCw size={18} className={`${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => navigate('/admin/vendors/add')}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold tracking-tight hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-100 uppercase border-none"
                    >
                        <Plus size={18} /> Add Vendor
                    </button>
                </div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
                <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-left font-medium">
                        <thead>
                            <tr className="bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                <th className="px-8 py-5">Store Details</th>
                                <th className="px-6 py-5">Owner Info</th>
                                <th className="px-6 py-5 text-center">Products</th>
                                <th className="px-6 py-5 text-center">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedVendors.length > 0 ? (
                                paginatedVendors.map((vendor, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                                                    {vendor.logo ? <img src={vendor.logo} className="w-full h-full object-cover" /> : <Store size={22} className="text-slate-200" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-bold text-slate-900 leading-none uppercase tracking-tight truncate group-hover:text-blue-600 transition-colors">{vendor.storeName}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter leading-none opacity-60">ID: {vendor._id.slice(-8)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700 uppercase leading-none">
                                                    <User size={12} className="text-slate-300" /> {vendor.ownerName}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 lowercase leading-none opacity-70">
                                                    <Mail size={12} className="text-slate-200" /> {vendor.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 leading-none opacity-70">
                                                    <Phone size={12} className="text-slate-200" /> {vendor.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-sm font-bold text-slate-800 leading-none tracking-tight">{vendor.products || 0}</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-60">Items</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${
                                                vendor.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                vendor.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-500 border-rose-100'
                                            }`}>
                                                {vendor.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button 
                                                    onClick={() => navigate(`/admin/vendors/${vendor._id}`)}
                                                    className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-95 border-none bg-transparent"
                                                    title="View Details"
                                                >
                                                    <ArrowRight size={20} />
                                                </button>
                                                <button 
                                                    onClick={() => { setSelectedVendor(vendor); setShowEdit(true); }}
                                                    className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all active:scale-95 border-none bg-transparent"
                                                    title="Edit"
                                                >
                                                    <Edit size={20} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(vendor._id)}
                                                    className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-95 border-none bg-transparent"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )).reverse()
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner">
                                                <Store size={32} className="text-slate-200" />
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest italic leading-none">No vendors found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && filteredVendors.length > 0 && (
                    <div className="px-8 py-5 bg-slate-50/40 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                            Showing <span className="text-slate-900">{paginatedVendors.length}</span> of <span className="text-slate-900">{filteredVendors.length}</span> vendors
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-white disabled:opacity-30 border-none bg-transparent">
                                <ChevronLeft size={18} />
                            </button>
                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button 
                                        key={i+1} 
                                        onClick={() => setPage(i+1)} 
                                        className={`w-8 h-8 rounded-xl text-[10px] font-bold transition-all border-none ${page === i+1 ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'text-slate-400 hover:bg-slate-100 bg-transparent'}`}
                                    >
                                        {i+1}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-white disabled:opacity-30 border-none bg-transparent">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <VendorDetailsModal
                show={showDetails}
                onHide={() => setShowDetails(false)}
                vendor={selectedVendor}
            />
            
            <VendorEditModal
                show={showEdit}
                onHide={() => setShowEdit(false)}
                vendor={selectedVendor}
                onSave={fetchVendors}
            />
            
            <ContactVendorModal
                show={showContact}
                onHide={() => setShowContact(false)}
                vendor={selectedVendor}
            />

            <style dangerouslySetInnerHTML={{ __html: `
                .scrollbar-thin::-webkit-scrollbar { height: 4px; border-radius: 10px; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default AllVendors;
