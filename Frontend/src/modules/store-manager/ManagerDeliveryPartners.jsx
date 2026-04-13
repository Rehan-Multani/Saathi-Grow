import React, { useState, useEffect } from 'react';
import { Search, Phone, Star, Truck, Edit, RefreshCcw, Loader2, ShieldCheck, Navigation, UserCheck } from 'lucide-react';
import DeliveryPartnerEditModal from '../../common/components/delivery/DeliveryPartnerEditModal';
import Swal from 'sweetalert2';
import * as api from '../../common/api/adminDeliveryApi';
import { useStoreManagerAuth } from './context/StoreManagerAuthContext';

const ManagerDeliveryPartners = () => {
    const { managerUser } = useStoreManagerAuth();
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState(null);

    const fetchPartners = async () => {
        try {
            setLoading(true);
            const data = await api.getDeliveryPartners();
            setPartners(data);
        } catch (error) {
            Swal.fire('Error', 'Failed to load delivery partners', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPartners();
    }, []);

    const filtered = partners.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone.includes(searchTerm) ||
        p.uniqueId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (partner) => {
        setSelectedPartner(partner);
        setShowEditModal(true);
    };

    const handleSave = async (updatedPartner) => {
        try {
            const apiRes = await api.updateDeliveryPartnerStatus(updatedPartner._id, updatedPartner.authStatus);
            setPartners(partners.map(p => p._id === apiRes._id ? apiRes : p));
            Swal.fire({
                title: 'Record Updated',
                text: 'Partner authorization status has been saved.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                confirmButtonColor: '#2563eb'
            });
            setShowEditModal(false);
        } catch (e) {
            Swal.fire('Error', 'Failed to save changes', 'error');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Delivery Staff</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Manage delivery partners and their status for your store.</p>
                </div>
                <button
                    onClick={fetchPartners}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                    <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} /> Refresh List
                </button>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50">
                    <div className="relative w-full md:max-w-md group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Find partners by name, ID or phone..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 font-medium shadow-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5 shadow-sm">
                        <UserCheck size={16} className="text-blue-600" />
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{managerUser?.branchId?.name || 'Assigned Branch'}</span>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[450px]">
                    <table className="w-full text-left">
                        <thead className="bg-white border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Partner Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Vehicle Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Duty</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Rating</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <Loader2 size={32} className="animate-spin text-blue-600 mx-auto" />
                                        <p className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Partners...</p>
                                    </td>
                                </tr>
                            ) : filtered.length > 0 ? filtered.map((p) => (
                                <tr key={p._id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm group-hover:scale-110 transition-transform">
                                                <Truck size={20} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-sm uppercase">{p.name}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                                                    <span className="text-slate-300">ID:</span> {p.uniqueId}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                                <Navigation size={12} className="text-slate-400" /> {p.vehicleType}
                                            </div>
                                            <div className="text-[10px] font-black text-blue-600 uppercase tracking-tighter px-2 py-0.5 bg-blue-50 rounded-md w-fit border border-blue-100">
                                                {p.vehicleNumber || 'NO PLATE'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-1.5 h-1.5 rounded-full ${p.dutyStatus === 'Online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse' : 'bg-slate-300'}`}></span>
                                                <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">{p.dutyStatus}</span>
                                            </div>
                                            {p.assignmentStatus === 'Busy' && (
                                                <span className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-md text-[9px] font-black uppercase tracking-tighter">In-Transit</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <div className="inline-flex items-center gap-1.5 text-amber-600 font-bold text-xs bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-100">
                                            <Star size={12} fill="currentColor" /> {p.rating || '5.0'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-widest ${p.authStatus === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                            {p.authStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button
                                            onClick={() => handleEdit(p)}
                                            className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-white border border-slate-200 bg-white rounded-xl transition-all shadow-sm active:scale-95"
                                            title="Edit Status"
                                        >
                                            <Edit size={16} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                            <Navigation size={24} className="text-slate-200" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No partners found for this store</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <DeliveryPartnerEditModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                partner={selectedPartner}
                onSave={handleSave}
            />
        </div>
    );
};

export default ManagerDeliveryPartners;
