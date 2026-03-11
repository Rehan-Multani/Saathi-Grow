import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RotateCcw, Search, Eye, X, Loader2, User, Phone, CheckCircle, XCircle, AlertCircle, Image } from 'lucide-react';
import { API_BASE_URL } from '../../../../config/apiConfig';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

const getStaffAuth = () => {
    try {
        const a = localStorage.getItem('sathiGro_admin') || localStorage.getItem('saathigro_admin');
        return a ? JSON.parse(a) : null;
    } catch { return null; }
};

const StaffReturns = () => {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selected, setSelected] = useState(null);
    const [processing, setProcessing] = useState(false);

    const fetchReturns = async () => {
        const auth = getStaffAuth();
        if (!auth) return;
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_BASE_URL}/orders/admin/returns`, {
                headers: { Authorization: `Bearer ${auth.token}` }
            });
            setReturns(Array.isArray(data) ? data : []);
        } catch (err) {
            toast.error('Failed to load returns');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReturns(); }, []);

    const handleAction = async (id, action) => {
        const auth = getStaffAuth();
        let reason = null;
        if (action === 'Rejected') {
            const { value } = await Swal.fire({
                title: 'Reject Return Request',
                input: 'textarea',
                inputLabel: 'Reason',
                placeholder: 'Explain why...',
                showCancelButton: true,
                inputValidator: (v) => !v && 'Reason is required'
            });
            if (!value) return;
            reason = value;
        } else {
            const confirm = await Swal.fire({
                title: 'Accept Return?',
                text: 'This will notify Admin to schedule pickup.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#16a34a'
            });
            if (!confirm.isConfirmed) return;
        }

        try {
            setProcessing(true);
            await axios.put(`${API_BASE_URL}/orders/admin/${id}/return/accept`, { action, rejectionReason: reason }, {
                headers: { Authorization: `Bearer ${auth.token}` }
            });
            toast.success(`Return ${action} successfully`);
            setSelected(null);
            fetchReturns();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        } finally {
            setProcessing(false);
        }
    };

    const filtered = returns.filter(r => r.orderId?.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-xl shadow-sm border border-gray-100 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-600 rounded-xl text-white">
                        <RotateCcw size={20} />
                    </div>
                    <div>
                        <h5 className="font-bold text-gray-800 text-lg">Branch Return Requests</h5>
                        <p className="text-xs text-gray-400">Manage returns for items fulfilled by your branch</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search Order ID..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg outline-none text-sm transition-all focus:bg-white focus:ring-2 focus:ring-indigo-100"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" /></div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 text-center text-gray-400 text-sm">No return requests found</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[10px]">Order ID</th>
                                <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[10px]">Customer</th>
                                <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[10px]">Amount</th>
                                <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[10px]">Status</th>
                                <th className="px-6 py-4 text-center font-bold text-gray-500 uppercase tracking-wider text-[10px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map(r => (
                                <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-indigo-600">{r.orderId}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-800">{r.user?.name}</p>
                                        <p className="text-[10px] text-gray-400">{r.user?.phone}</p>
                                    </td>
                                    <td className="px-6 py-4 font-bold">₹{r.totalAmount}</td>
                                    <td className="px-6 py-4">
                                         <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                             r.returnRequest.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                                             ['Accepted', 'Approved'].includes(r.returnRequest.status) ? 'bg-green-100 text-green-700' : 
                                             r.returnRequest.status === 'Rejected' ? 'bg-orange-100 text-orange-700' :
                                             'bg-red-100 text-red-700'
                                         }`}>
                                             {r.returnRequest.status === 'FinalRejected' ? 'Final Rejected' : r.returnRequest.status}
                                         </span>
                                     </td>
                                    <td className="px-6 py-4 text-center text-gray-400">
                                        <button onClick={() => setSelected(r)} className="hover:text-indigo-600 transition-colors"><Eye size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {selected && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden relative">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-800">Return Details</h3>
                            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600"><X /></button>
                        </div>
                        
                        <div className="p-6 space-y-5">
                            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Order Amount</p>
                                    <p className="text-2xl font-black text-gray-800">₹{selected.totalAmount}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">{selected.user?.name}</p>
                                        <p className="text-xs text-gray-500">{selected.user?.phone}</p>
                                    </div>
                                    <a href={`tel:${selected.user?.phone}`} className="ml-auto p-2 bg-green-100 text-green-600 rounded-lg"><Phone size={14} /></a>
                                </div>
                                <div className="pt-3 border-t border-gray-200">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Return reason</p>
                                    <p className="text-sm font-bold text-gray-700 italic">"{selected.returnRequest.reason}"</p>
                                </div>
                                
                                {/* Image Proof Display */}
                                {selected.returnRequest.images && selected.returnRequest.images.length > 0 && (
                                    <div className="pt-3 border-t border-gray-200">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Image Proof</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selected.returnRequest.images.map((img, i) => (
                                                <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-100 group">
                                                    <img src={img} alt="proof" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <Image size={14} className="text-white" />
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {selected.returnRequest.status === 'Pending' && (
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => handleAction(selected._id, 'Accepted')}
                                        disabled={processing}
                                        className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-100 transition-all active:scale-95 disabled:opacity-30 disabled:shadow-none"
                                    >
                                        Accept Return
                                    </button>
                                    <button
                                        onClick={() => handleAction(selected._id, 'Rejected')}
                                        disabled={processing}
                                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-100 transition-all active:scale-95 disabled:opacity-30 disabled:shadow-none"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}

                            {['Accepted', 'Approved'].includes(selected.returnRequest.status) && (
                                <div className="p-4 bg-blue-50 text-blue-700 rounded-xl text-center text-xs font-bold border border-blue-100">
                                    <p>{selected.returnRequest.status === 'Approved' ? 'Admin overrule & approved.' : 'Accepted.'}</p>
                                    <p className="text-[10px] mt-1 opacity-70 italic">Waiting for Admin scheduled pickup.</p>
                                </div>
                            )}

                            {selected.returnRequest.status === 'Rejected' && (
                                <div className="p-4 bg-orange-50 text-orange-700 rounded-xl text-center text-xs font-bold border border-orange-100">
                                    <p>Rejected by Branch Staff</p>
                                    <p className="text-[10px] mt-1 opacity-70 italic">Admin will review this recommendation.</p>
                                </div>
                            )}

                            {selected.returnRequest.status === 'FinalRejected' && (
                                <div className="p-4 bg-red-50 text-red-700 rounded-xl text-center text-xs font-bold border border-red-100">
                                    <p>Final Rejected by Admin</p>
                                    <p className="text-[10px] mt-1 opacity-70 italic">Return request closed.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffReturns;
