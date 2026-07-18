import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Mail, Phone, Edit, Trash2, Shield, Eye, CheckCircle, Calendar, MapPin, X, Loader2, ShieldCheck, UserCheck, Check } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useStoreManagerAuth } from './context/StoreManagerAuthContext';
import { API_BASE_URL } from '../../config/apiConfig';
import { showDeleteConfirmation } from '../../common/utils/alertUtils';

const StaffManagement = () => {
    const { managerUser } = useStoreManagerAuth();
    const currentUser = managerUser;

    const isBranchManager = currentUser?.role === 'Store Manager';
    const hasPermission = isBranchManager;
    const canPerformActions = isBranchManager;

    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [selectedStaff, setSelectedStaff] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        permissions: []
    });

    const AVAILABLE_PERMISSIONS = [
        { id: 'VIEW_ORDERS', label: 'View Orders' },
        { id: 'MANAGE_ORDERS', label: 'Manage Orders' },
        { id: 'MANAGE_REFUNDS_RETURNS', label: 'Manage Returns' },
        { id: 'MANAGE_PRODUCTS', label: 'Manage Products' },
        { id: 'MANAGE_INVENTORY', label: 'Update Stock' },
        { id: 'VIEW_CUSTOMERS', label: 'View Customers' },
        { id: 'MANAGE_POS_BILLING', label: 'POS Billing' }
    ];

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const token = currentUser?.token;
            if (!token) return;

            const { data } = await axios.get(`${API_BASE_URL}/admin/staff`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStaff(data);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser?.token) {
            fetchStaff();
        }
    }, [currentUser?.token]);

    useEffect(() => {
        if (showModal || showDetails) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showModal, showDetails]);

    const handlePermissionToggle = (perm) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(perm)
                ? prev.permissions.filter(p => p !== perm)
                : [...prev.permissions, perm]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate Full Name: must not contain digits or special characters
        if (/[^a-zA-Z\s\u0900-\u097F]/.test(formData.name)) {
            Swal.fire('Error', 'Full name must only contain English or Hindi letters and spaces.', 'error');
            return;
        }

        // Validate Phone Number: must be exactly 10 digits if provided
        if (formData.phone && formData.phone.length !== 10) {
            Swal.fire('Error', 'Phone number must be exactly 10 digits.', 'error');
            return;
        }

        if (!editingStaff && formData.password.length < 8) {
            Swal.fire('Error', 'Password must be at least 8 characters.', 'error');
            return;
        }
        if (editingStaff && formData.password && formData.password.length < 8) {
            Swal.fire('Error', 'Password must be at least 8 characters.', 'error');
            return;
        }

        try {
            const token = currentUser?.token;
            if (editingStaff) {
                await axios.put(`${API_BASE_URL}/admin/staff/${editingStaff._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire('Success', 'Staff member updated successfully.', 'success');
            } else {
                await axios.post(`${API_BASE_URL}/admin/staff`, { ...formData, role: 'Staff' }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire('Success', 'New staff member added.', 'success');
            }
            setShowModal(false);
            fetchStaff();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed', 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await showDeleteConfirmation(
            'Remove Staff?',
            'This action will permanently remove this member from the branch.'
        );

        if (result.isConfirmed) {
            try {
                const token = currentUser?.token;
                await axios.delete(`${API_BASE_URL}/admin/staff/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire('Removed!', 'Staff member has been removed.', 'success');
                fetchStaff();
            } catch (error) {
                Swal.fire('Error', 'Delete failed', 'error');
            }
        }
    };

    const openEditModal = (member) => {
        setEditingStaff(member);
        setFormData({
            name: member.name,
            email: member.email,
            phone: member.phone || '',
            password: '',
            permissions: member.permissions || []
        });
        setShowModal(true);
    };

    const trimmedSearchTerm = searchTerm.trim().toLowerCase();

    const filteredStaff = (Array.isArray(staff) ? staff : [])
        .filter(s =>
            (s?.name || '').toLowerCase().includes(trimmedSearchTerm) ||
            (s?.email || '').toLowerCase().includes(trimmedSearchTerm)
        );

    if (!hasPermission) {
        return (
            <div className="p-6 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6 border border-red-100 shadow-inner">
                    <Shield size={40} />
                </div>
                <h1 className="text-2xl font-bold text-slate-800">Access Restricted</h1>
                <p className="text-slate-500 mt-2 max-w-sm">Only branch managers are permitted to access staff management records.</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Manage your team and their access permissions.</p>
                </div>
                {canPerformActions && (
                    <button
                        onClick={() => { setEditingStaff(null); setFormData({ name: '', email: '', phone: '', password: '', permissions: [] }); setShowModal(true); }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-md shadow-blue-100 transition-all active:scale-95"
                    >
                        <UserPlus size={16} /> Add New Member
                    </button>
                )}
            </div>

            {/* List Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
                    <div className="relative w-full max-w-md group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 font-medium shadow-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value.trimStart())}
                        />
                    </div>
                    <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5 shadow-sm">
                        <UserCheck size={16} className="text-blue-600" />
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{currentUser?.branchId?.name || 'Assigned Branch'}</span>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Contact Info</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Permissions</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <Loader2 size={32} className="animate-spin text-blue-600 mx-auto" />
                                        <p className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-widest">Loading staff...</p>
                                    </td>
                                </tr>
                            ) : filteredStaff.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                            <ShieldCheck size={24} className="text-slate-200" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No staff records found</p>
                                    </td>
                                </tr>
                            ) : filteredStaff.map(member => (
                                <tr key={member._id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-sm border border-blue-100 shadow-sm uppercase group-hover:scale-110 transition-transform">
                                                {member.name.slice(0, 2)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors uppercase">{member.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{member.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                            <Mail size={14} className="text-slate-400" /> {member.email}
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold mt-1 uppercase">
                                            <Phone size={14} className="text-slate-300" /> {member.phone || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border flex items-center gap-1.5 w-fit mx-auto ${member.isActive !== false ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                            <span className={`w-1 h-1 rounded-full ${member.isActive !== false ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
                                            {member.isActive !== false ? 'Active' : 'Locked'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                            {member.permissions?.slice(0, 2).map(p => (
                                                <span key={p} className="px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-md text-[9px] font-bold uppercase tracking-tighter">{p.replace(/_/g, ' ')}</span>
                                            ))}
                                            {member.permissions?.length > 2 && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-black">+{member.permissions.length - 2}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => { setSelectedStaff(member); setShowDetails(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white border border-slate-200 bg-white rounded-xl transition-all shadow-sm active:scale-95" title="View Detail">
                                                <Eye size={16} />
                                            </button>
                                            {canPerformActions && (
                                                <>
                                                    <button onClick={() => openEditModal(member)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white border border-slate-200 bg-white rounded-xl transition-all shadow-sm active:scale-95" title="Modify">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(member._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-white border border-slate-200 bg-white rounded-xl transition-all shadow-sm active:scale-95" title="Remove">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Details Modal */}
            {showDetails && selectedStaff && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Staff Info</h3>
                            <button onClick={() => setShowDetails(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-8">
                            <div className="text-center mb-8">
                                <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center font-black text-3xl mx-auto mb-4 border border-blue-100 shadow-inner">
                                    {selectedStaff.name.slice(0, 2).toUpperCase()}
                                </div>
                                <h4 className="font-bold text-slate-900 text-xl uppercase">{selectedStaff.name}</h4>
                                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest mt-2 border border-slate-200">{selectedStaff.role}</span>
                            </div>
                            
                            <div className="space-y-4 rounded-3xl border border-slate-100 p-6 bg-slate-50/30 shadow-inner">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                                        <Mail size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email Address</p>
                                        <p className="text-sm font-bold text-slate-800 truncate">{selectedStaff.email}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Phone Number</p>
                                        <p className="text-sm font-bold text-slate-800">{selectedStaff.phone || 'No Phone'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                                        <Shield size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Permissions</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedStaff.permissions?.map(p => (
                                                <span key={p} className="px-2 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-tighter">{p.replace(/_/g, ' ')}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upsert Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3 uppercase tracking-tight">
                                <UserPlus size={20} className="text-blue-600" /> 
                                {editingStaff ? 'Edit Staff Member' : 'Add New Member'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        
                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <form id="staffForm" onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                        <input 
                                            required 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:bg-white focus:border-blue-400 transition-all outline-none" 
                                            value={formData.name} 
                                            onChange={e => {
                                                const cleanValue = e.target.value.replace(/[^a-zA-Z\s\u0900-\u097F]/g, ''); // keep only English/Hindi letters and spaces
                                                setFormData({ ...formData, name: cleanValue });
                                            }} 
                                            placeholder="Ex: Rahul Sharma" 
                                        />
                                    </div>
                                     <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Work Email</label>
                                        <input required type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:bg-white focus:border-blue-400 transition-all outline-none" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="email@store.com" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                                        <input 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:bg-white focus:border-blue-400 transition-all outline-none" 
                                            value={formData.phone} 
                                            onChange={e => {
                                                const cleanValue = e.target.value.replace(/\D/g, ''); // keep only numbers
                                                if (cleanValue.length <= 10) {
                                                    setFormData({ ...formData, phone: cleanValue });
                                                }
                                            }} 
                                            placeholder="Internal phone" 
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password {editingStaff && '(Optional)'}</label>
                                        <input type="password" required={!editingStaff} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:bg-white focus:border-blue-400 transition-all outline-none" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="Min. 8 characters" />
                                    </div>
                                </div>
                                
                                <div className="pt-6 border-t border-slate-100">
                                    <div className="flex items-center justify-between mb-6">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <ShieldCheck size={16} className="text-blue-600" /> Permissions
                                        </label>
                                        <span className="text-[10px] font-bold text-blue-600 px-2.5 py-1 bg-blue-50 rounded-lg border border-blue-100">Pick any</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {AVAILABLE_PERMISSIONS.map(perm => {
                                            const isActive = formData.permissions.includes(perm.id);
                                            return (
                                                <div
                                                    key={perm.id}
                                                    className={`p-4 border-2 rounded-2xl cursor-pointer transition-all flex items-center gap-4 ${isActive ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-100' : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
                                                    onClick={() => handlePermissionToggle(perm.id)}
                                                >
                                                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${isActive ? 'bg-white border-white' : 'border-slate-200'}`}>
                                                        {isActive && <Check size={12} className="text-blue-600 font-black" />}
                                                    </div>
                                                    <span className={`text-xs font-bold uppercase tracking-tighter ${isActive ? 'text-white' : 'text-slate-600'}`}>{perm.label}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </form>
                        </div>
                        
                        <div className="p-8 border-t border-slate-100 bg-slate-50/50 shrink-0 flex justify-end gap-4">
                            <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-white border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                            <button type="submit" form="staffForm" className="px-8 py-3 bg-blue-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95">{editingStaff ? 'Update Staff Info' : 'Add Staff'}</button>
                        </div>
                    </div>
                </div>
            )}
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default StaffManagement;
