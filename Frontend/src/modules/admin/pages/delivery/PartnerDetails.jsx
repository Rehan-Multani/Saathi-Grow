import React, { useState, useEffect } from 'react';
import { 
    User, Phone, MapPin, Truck, Calendar, Wallet, CheckCircle, 
    XCircle, Clock, ArrowLeft, ArrowRight, MoreHorizontal, Edit, 
    ChevronRight, ExternalLink, Map as MapIcon, Package, Info,
    Star, AlertTriangle, Smartphone, Mail, Shield, ShieldCheck, Activity, TrendingUp, RefreshCw, Loader2
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as api from '../../api/adminDeliveryApi';
import Swal from 'sweetalert2';

const PartnerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation('admin_delivery');
    const [partner, setPartner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Role check
    const isVendor = window.location.pathname.startsWith('/vendor');
    const isStoreManager = window.location.pathname.startsWith('/store-manager');
    const portalPrefix = isVendor ? '/vendor' : (isStoreManager ? '/store-manager' : '/admin');

    const fetchDetails = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            const data = await api.getDeliveryPartnerById(id);
            setPartner(data);
        } catch (error) {
            Swal.fire({ title: 'Error', text: 'Failed to find rider details', icon: 'error' });
            navigate(`${portalPrefix}/delivery/partners`);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleSettle = async (partnerData) => {
        if (partnerData.cashInHand <= 0) {
            Swal.fire({
                title: 'No Pending Cash',
                text: 'There is no cash to settle.',
                icon: 'info',
                customClass: { popup: 'rounded-[2rem]' }
            });
            return;
        }

        const result = await Swal.fire({
            title: '<span class="text-xl font-black text-slate-800 tracking-tight uppercase">Handover Verification</span>',
            html: `
                <div class="text-left space-y-3 p-5 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 mt-4 font-sans">
                    <div class="flex justify-between items-center border-b pb-2.5 border-slate-200/60">
                        <span class="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Collector Node</span>
                        <span class="text-slate-800 font-extrabold text-xs uppercase tracking-tight">${partnerData.name}</span>
                    </div>
                    <div class="flex justify-between items-center pt-1">
                        <span class="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Handover Amount</span>
                        <span class="text-emerald-600 font-black text-xl tracking-tighter">₹${partnerData.cashInHand}</span>
                    </div>
                </div>
                
                <div class="mt-8 text-center font-sans px-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Enter Admin PIN</label>
                    <div class="relative max-w-[180px] mx-auto">
                        <input type="password" id="settlementPin" 
                            class="swal2-input !m-0 !w-full !text-center !text-2xl !font-black !tracking-[0.5em] !py-4 !bg-white !border-2 !border-slate-200 !rounded-[1.25rem] !outline-none focus:!border-emerald-500 focus:!ring-4 focus:!ring-emerald-500/10 !transition-all shadow-sm" 
                            placeholder="••••" maxlength="6" autofocus>
                    </div>
                </div>

                <div class="mt-8 py-3 px-4 bg-amber-50 rounded-2xl border border-amber-100/50 flex items-start gap-3">
                    <div class="mt-0.5 shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-amber-600"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    </div>
                    <p class="text-[10px] text-amber-700 font-bold text-left leading-relaxed">Confirm physical cash receipt before proceeding. This action is irreversible.</p>
                </div>
            `,
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Collected',
            cancelButtonText: 'Cancel',
            padding: '2.5rem',
            customClass: {
                popup: 'rounded-[2.5rem] border-none shadow-2xl',
                confirmButton: 'rounded-2xl px-8 py-3 text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 m-2',
                cancelButton: 'rounded-2xl px-8 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-500 m-2'
            },
            preConfirm: () => {
                const pin = Swal.getPopup().querySelector('#settlementPin').value;
                if (!pin) {
                    Swal.showValidationMessage('Please enter the settlement PIN');
                }
                return { pin };
            }
        });

        if (result.isConfirmed) {
            try {
                const { pin } = result.value;
                await api.settleRiderCash(partnerData._id, pin);
                Swal.fire({
                    title: 'Collection Verified',
                    text: `₹${partnerData.cashInHand} added to settlement history`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: {
                        popup: 'rounded-[2rem]'
                    }
                });
                fetchDetails();
            } catch (error) {
                Swal.fire({
                    title: 'Verification Failed',
                    text: error.response?.data?.message || 'Invalid PIN or server error',
                    icon: 'error',
                    customClass: {
                        popup: 'rounded-[2rem]'
                    }
                });
            }
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [id]);

    if (loading && !refreshing) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 size={40} className="text-blue-500 animate-spin" />
                <p className="text-slate-400 text-sm font-medium">Syncing profile...</p>
            </div>
        );
    }

    if (!partner) return null;

    return (
        <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header / Actions Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl transition-all shadow-sm active:scale-95 hover:border-blue-500 hover:text-blue-600"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-bold tracking-tight uppercase tracking-widest">{partner.name}</h1>
                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border uppercase tracking-tight ${
                                partner.dutyStatus === 'Online' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'
                            }`}>
                                {partner.dutyStatus}
                            </span>
                        </div>
                        <p className="text-slate-500 text-[11px] font-bold mt-1 uppercase tracking-tighter opacity-70">Rider ID: {partner.uniqueId}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => fetchDetails(true)}
                        disabled={refreshing}
                        className={`p-2.5 bg-white border border-slate-200 rounded-xl transition-all shadow-sm active:scale-95 ${refreshing ? 'opacity-50' : 'hover:border-blue-500'}`}
                    >
                        <RefreshCw size={18} className={`${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                    {!isVendor && (
                        <button className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all shadow-blue-100 border-none">
                            <Edit size={16} /> Edit Profile
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Essential Profile Card */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-6">
                        <div className="relative inline-block group">
                            <div className="w-32 h-32 rounded-3xl bg-slate-50 border-2 border-slate-100 p-1.5 shadow-inner transition-all group-hover:border-blue-500/20 overflow-hidden">
                                {partner.profileImage ? (
                                    <img src={partner.profileImage} className="w-full h-full object-cover rounded-[1.25rem]" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-200 font-bold text-4xl italic">{partner.name.charAt(0)}</div>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl shadow-lg border-2 border-slate-50 flex items-center justify-center text-blue-600">
                                <ShieldCheck size={20} />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase leading-none">{partner.name}</h2>
                            <span className={`inline-block mt-3 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm ${
                                partner.authStatus === 'Active' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                            }`}>
                                {partner.authStatus}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-8">
                            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Deliveries</span>
                                <span className="text-lg font-black text-slate-800">{partner.totalDeliveries || 0}</span>
                            </div>
                            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Rating</span>
                                <div className="flex items-center justify-center gap-1.5 text-blue-600 font-black text-lg">
                                    <Star size={16} fill="currentColor" />
                                    <span>{partner.rating || '5.0'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <div className="flex items-center gap-4 text-left p-4 bg-white border border-slate-100 rounded-2xl">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Smartphone size={18} /></div>
                                <div>
                                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Contact No</span>
                                    <span className="text-xs font-bold text-slate-700">+91 {partner.phone}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-left p-4 bg-white border border-slate-100 rounded-2xl">
                                <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Mail size={18} /></div>
                                <div>
                                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Email ID</span>
                                    <span className="text-xs font-bold text-slate-700 truncate block w-full">{partner.email || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Dynamic Stats & History */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Performance Dashboard */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group hover:border-blue-200 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <Wallet size={20} />
                                </div>
                                <Activity size={20} className="text-slate-100" />
                            </div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Cash in Hand</span>
                            <div className="text-3xl font-black text-slate-800 tracking-tighter">₹{(partner.cashInHand || 0).toLocaleString()}</div>
                            <div className="mt-6 flex items-center justify-between">
                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic leading-none flex items-center gap-1">
                                    <Info size={12} /> Pending Settlement
                                </span>
                                <button onClick={() => handleSettle(partner)} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase flex items-center gap-1 transition-colors">
                                    Verify Cash <ArrowRight size={12} />
                                </button>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group hover:border-indigo-200 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <Truck size={20} />
                                </div>
                            </div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Vehicle Info</span>
                            <div className="text-xl font-bold text-slate-800 tracking-tight uppercase leading-none">{partner.vehicleType}</div>
                            <div className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter italic leading-none border-t border-slate-50 pt-4">
                                Plate ID: {partner.vehicleNumber || 'NOT ASSIGNED'}
                            </div>
                        </div>
                    </div>

                    {/* KYC Documents */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-100 bg-slate-50/30">
                            <h3 className="text-sm font-bold text-slate-900 border-b-2 border-blue-500 pb-1 inline-block">KYC Documents</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                            {[
                                { label: 'Aadhar Card', url: partner.aadharImage },
                                { label: 'Driving License', url: partner.licenseImage },
                                { label: 'RC Card', url: partner.rcImage },
                            ].map((doc) => (
                                <div key={doc.label} className="space-y-2">
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{doc.label}</span>
                                    {doc.url ? (
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="block group">
                                            <img src={doc.url} alt={doc.label} className="w-full h-40 object-cover rounded-xl border border-slate-200 group-hover:border-blue-400 transition-all" />
                                            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-1 inline-block">View full size</span>
                                        </a>
                                    ) : (
                                        <div className="h-40 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                            Not uploaded
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Duty Log / Real-time Status */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
                            <h3 className="text-sm font-bold text-slate-900 border-b-2 border-blue-500 pb-1">Real-time Status</h3>
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-white border border-slate-100 px-3 py-1.5 rounded-xl shadow-sm italic">
                                <RefreshCw size={12} className="animate-spin-slow" /> Updating live location
                            </div>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div className="flex items-start gap-5">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 shadow-sm"><MapIcon size={20} /></div>
                                    <div className="flex-1">
                                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 italic">Tracking History</span>
                                        <button 
                                            onClick={() => navigate(`${portalPrefix}/delivery/tracking`, { state: { riderId: partner._id }})}
                                            className="w-full text-left bg-slate-50 border border-slate-200 p-4 rounded-2xl hover:border-blue-500 hover:bg-blue-50/30 transition-all group flex items-center justify-between"
                                        >
                                            <span className="text-xs font-bold text-slate-700">Open Map Tracker</span>
                                            <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-center gap-4 text-center">
                                <div className="text-sm font-bold text-slate-500 uppercase tracking-tight italic">Shift Availability</div>
                                <div className="flex justify-center gap-3">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                                        <div key={idx} className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black border transition-colors ${idx < 6 ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' : 'bg-white text-slate-300 border-slate-100 shadow-sm'}`}>
                                            {day[0]}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{partner.dutyStatus === 'Online' ? 'Currently Receiving Orders' : 'Offline / Off-shift'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes spin-slow { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
                .animate-spin-slow { animation: spin-slow 4s linear infinite; }
            `}} />
        </div>
    );
};

export default PartnerDetails;
