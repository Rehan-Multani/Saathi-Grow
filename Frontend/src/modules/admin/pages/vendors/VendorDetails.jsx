import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Store, Phone, Mail, MapPin, Calendar, Package,
    Star, ChevronLeft, IndianRupee, Activity, FileText,
    TrendingUp, ShoppingBag, Users, Clock, Edit, MessageSquare,
    ArrowLeft, ExternalLink, ShieldCheck, Download, MoreVertical,
    CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import VendorEditModal from '../../components/vendors/VendorEditModal';
import ContactVendorModal from '../../components/vendors/ContactVendorModal';
import { getVendorDetails } from '../../api/vendorApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';

const VendorDetails = () => {
    const { id } = useParams();
    const { t } = useTranslation('admin_vendors');
    const { adminUser } = useAdminAuth();
    const navigate = useNavigate();
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);

    const fetchVendorDetails = async () => {
        try {
            setLoading(true);
            const data = await getVendorDetails(adminUser.token, id);
            setVendor(data);
        } catch (error) {
            toast.error('Failed to load vendor details');
            navigate('/admin/vendors');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (adminUser?.token && id) fetchVendorDetails();
    }, [adminUser?.token, id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-vh-100 gap-4">
                <Loader2 size={40} className="text-blue-500 animate-spin" />
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest leading-none">Loading details...</p>
            </div>
        );
    }

    if (!vendor) return <div className="p-8 text-center font-bold text-slate-400 uppercase tracking-widest italic animate-pulse">Vendor Not Found</div>;

    return (
        <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/vendors')} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all border-none bg-transparent">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden shrink-0">
                            {vendor.logo ? <img src={vendor.logo} className="w-full h-full object-cover" /> : <Store size={24} className="text-slate-200" />}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 leading-tight uppercase tracking-tight">{vendor.storeName}</h1>
                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest italic leading-none">
                                <span>ID: #{vendor._id.slice(-8)}</span>
                                <span className={`flex items-center gap-1 ${vendor.status === 'Active' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${vendor.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    {vendor.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setShowContactModal(true)}
                        className="flex-1 md:flex-none px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2"
                    >
                        <MessageSquare size={16} /> Contact
                    </button>
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="flex-1 md:flex-none px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold tracking-wider hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-2 border-none"
                    >
                        <Edit size={16} /> Edit Vendor
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8 mt-2">
                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Earnings', value: `₹0`, icon: <TrendingUp size={18} />, color: 'emerald' },
                            { label: 'Rating', value: '4.8', icon: <Star size={18} fill="currentColor" />, color: 'amber' },
                            { label: 'Total Products', value: vendor.products || 0, icon: <Package size={18} />, color: 'blue' },
                            { label: 'Pending Payment', value: `₹0`, icon: <IndianRupee size={18} />, color: 'rose' }
                        ].map((stat, i) => (
                            <div key={i} className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-sm group hover:border-slate-300 transition-all`}>
                                <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                                    <span className={`text-${stat.color}-500`}>{stat.icon}</span>
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{stat.label}</span>
                                <div className="text-lg font-bold text-slate-900 tracking-tight leading-none">{stat.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Products Table */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
                        <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center shrink-0">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Best Selling Products</h3>
                            <button onClick={() => navigate('/admin/vendors/products')} className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1.5 border-none bg-transparent">
                                View All <ExternalLink size={12} />
                            </button>
                        </div>
                        <div className="overflow-x-auto scrollbar-thin">
                            <table className="w-full text-left font-medium">
                                <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-8 py-5">Product Name</th>
                                        <th className="px-6 py-5 text-center">Price</th>
                                        <th className="px-6 py-5 text-center">Sales</th>
                                        <th className="px-6 py-5 text-center">Stock</th>
                                        <th className="px-8 py-5 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {(vendor.topProducts || []).map((p, i) => (
                                        <tr key={i} className="hover:bg-slate-50/20 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="text-xs font-bold text-slate-800 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{p.name}</div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter italic">{p.price}</span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="text-xs font-bold text-blue-600 tracking-tight">{p.sales} <span className="text-[9px] text-slate-400 uppercase tracking-tighter">Units</span></span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={`text-xs font-bold tracking-tight ${p.stock < 20 ? 'text-rose-500 italic' : 'text-slate-500'}`}>{p.stock}</span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border uppercase tracking-tight ${p.stock > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
                                                    {p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!vendor.topProducts || vendor.topProducts.length === 0) && (
                                        <tr>
                                            <td colSpan="5" className="py-12 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest italic leading-none">No products listed by this vendor yet</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Store Card */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden sticky top-6">
                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">Store Profile</h3>
                        <div className="space-y-6">
                            {[
                                { icon: <User size={16} />, label: 'Owner Name', value: vendor.ownerName },
                                { icon: <Mail size={16} />, label: 'Email Address', value: vendor.email, lowercase: true },
                                { icon: <Phone size={16} />, label: 'Phone Number', value: vendor.phone },
                                { icon: <MapPin size={16} />, label: 'Address', value: vendor.address?.street || vendor.address },
                                { icon: <Calendar size={16} />, label: 'Joined On', value: new Date(vendor.createdAt).toLocaleDateString() }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-400">
                                        {item.icon}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-0.5">{item.label}</div>
                                        <div className={`text-xs font-bold text-slate-800 tracking-tight uppercase ${item.lowercase ? 'lowercase' : ''} truncate`}>{item.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Status Section */}
                        <div className="mt-10 space-y-6 border-t border-slate-50 pt-8">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Operations Status</h4>
                            <div className="space-y-5">
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Success Rate</span>
                                        <span className="text-emerald-600 text-xs font-bold tracking-tighter">96%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                        <div className="h-full bg-emerald-500 rounded-full w-[96%]" />
                                    </div>
                                </div>
                                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-3">
                                    <TrendingUp size={16} className="text-blue-500 shrink-0" />
                                    <p className="text-[9px] text-blue-700 font-bold italic leading-relaxed opacity-80 uppercase tracking-tighter">Business is doing well. Growth expected this month.</p>
                                </div>
                            </div>
                        </div>

                        {/* Documents */}
                        <div className="mt-8 pt-8 border-t border-slate-50">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Documents</h4>
                            <div className="space-y-2">
                                {[
                                    { name: 'Trade_License.pdf', size: '1.2 MB' },
                                    { name: 'VAT_Registration.pdf' },
                                ].map((doc, i) => (
                                    <div key={i} className="group p-2.5 rounded-xl border border-dotted border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer flex items-center justify-between">
                                        <div className="flex items-center gap-2.5 overflow-hidden">
                                            <FileText size={14} className="text-slate-300 group-hover:text-blue-400 transition-colors shrink-0" />
                                            <span className="text-[10px] font-bold text-slate-500 group-hover:text-blue-700 transition-colors truncate">{doc.name}</span>
                                        </div>
                                        <Download size={14} className="text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <VendorEditModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                vendor={vendor}
                onSave={fetchVendorDetails}
            />

            <ContactVendorModal
                show={showContactModal}
                onHide={() => setShowContactModal(false)}
                vendor={vendor}
                onSubmit={() => console.log('Message sent')}
            />

            <style dangerouslySetInnerHTML={{ __html: `
                .scrollbar-thin::-webkit-scrollbar { width: 4px; border-radius: 10px; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default VendorDetails;
