import React, { useState, useEffect } from 'react';
import { Search, MoreHorizontal, Mail, Phone, MapPin, Eye, Ban, CheckCircle, Send, Loader2, ChevronDown, UserSquare, ShieldAlert, ShoppingBag, CreditCard } from 'lucide-react';
import { useStoreManagerAuth } from './context/StoreManagerAuthContext';
import * as customerApi from '../../common/api/customerManagementApi';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

import CustomerDetailsModal from '../../common/components/customers/CustomerDetailsModal';
import SendMessageModal from '../../common/components/customers/SendMessageModal';

const ManagerCustomers = () => {
    const { managerUser } = useStoreManagerAuth();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [messageType, setMessageType] = useState('Message');
    const [activeDropdown, setActiveDropdown] = useState(null);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const token = managerUser?.token;
            if (!token) return;
            const data = await customerApi.getAllCustomers(token);
            setCustomers(data);
        } catch (error) {
            toast.error(error.message || 'Failed to fetch customer list');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [managerUser?.token]);

    const trimmedSearchTerm = searchTerm.trim().toLowerCase();

    const filtered = customers.filter(c =>
        (c.name || '').toLowerCase().includes(trimmedSearchTerm) ||
        (c.email || '').toLowerCase().includes(trimmedSearchTerm) ||
        (c.phone || '').includes(searchTerm.trim())
    );

    const toggleDropdown = (id) => {
        if (activeDropdown === id) setActiveDropdown(null);
        else setActiveDropdown(id);
    };

    const handleViewProfile = async (customer) => {
        setActiveDropdown(null);
        try {
            setLoading(true);
            const detailedCustomer = await customerApi.getCustomerById(managerUser.token, customer._id);
            setSelectedCustomer(detailedCustomer);
            setShowDetailsModal(true);
        } catch (error) {
            toast.error(error.message || 'Failed to fetch customer details');
            setSelectedCustomer(customer);
            setShowDetailsModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = (customer, type) => {
        setSelectedCustomer(customer);
        setMessageType(type);
        setShowMessageModal(true);
        setActiveDropdown(null);
    };

    const handleStatusToggle = async (customer) => {
        setActiveDropdown(null);
        try {
            const formData = new FormData();
            formData.append('isActive', !customer.isActive);
            await customerApi.updateCustomer(managerUser.token, customer._id, formData);
            setCustomers(prev => prev.map(c => c._id === customer._id ? { ...c, isActive: !c.isActive } : c));
            toast.success(`User ${customer.isActive ? 'blocked' : 'unblocked'} successfully`);
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">List of customers in your store.</p>
                </div>
                <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5 shadow-sm">
                    <UserSquare size={16} className="text-blue-600" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{managerUser?.role}: {managerUser?.branchId?.name || 'Store'}</span>
                </div>
            </div>

            {/* List Container */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50">
                    <div className="relative w-full md:max-w-md group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Find by name, email or mobile..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 font-medium shadow-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value.trimStart())}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[450px]">
                    <table className="w-full text-left">
                        <thead className="bg-white border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Customer</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Contact Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Wallet Balance</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <Loader2 size={32} className="animate-spin text-blue-600 mx-auto" />
                                        <p className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-widest">Loading customers...</p>
                                    </td>
                                </tr>
                            ) : filtered.length > 0 ? (
                                filtered.map((c, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                {c.profileImage ? (
                                                    <img src={c.profileImage} alt={c.name} className="w-11 h-11 rounded-2xl object-cover shrink-0 border border-slate-200" />
                                                ) : (
                                                    <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-sm border border-blue-100 uppercase">
                                                        {c.name ? c.name.charAt(0) : 'U'}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase text-sm">{c.name || 'No Name'}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-wider">ID: {c._id?.slice(-8)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium mb-1">
                                                <Mail size={14} className="text-slate-400 shrink-0" /> <span className="truncate max-w-[150px]">{c.email || 'No email'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                                                <Phone size={14} className="text-slate-300 shrink-0" /> +91 {c.phone}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-sm text-slate-700 font-medium max-w-[200px]" title={c.addresses?.[0] ? [c.addresses[0].street, c.addresses[0].city, c.addresses[0].state].filter(Boolean).join(', ') : 'Location N/A'}>
                                                <MapPin size={14} className="text-slate-400 shrink-0" /> 
                                                <span className="truncate">
                                                    {c.addresses?.[0] ? [c.addresses[0].street, c.addresses[0].city, c.addresses[0].state].filter(Boolean).join(', ') : 'Location N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <CreditCard size={12} className="text-slate-400" />
                                                <span className="font-black text-slate-900">₹{c.walletBalance?.toLocaleString() || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border inline-flex items-center gap-1.5 ${c.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                <span className={`w-1 h-1 rounded-full ${c.isActive ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
                                                {c.isActive ? 'Active' : 'Blocked'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right relative">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => toggleDropdown(c._id)}
                                                    className={`px-3 py-1.5 border rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95 shadow-sm ${activeDropdown === c._id ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'}`}
                                                >
                                                    Actions <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === c._id ? 'rotate-180' : ''}`} />
                                                </button>

                                                {activeDropdown === c._id && (
                                                    <>
                                                        <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)}></div>
                                                        <div className="absolute right-0 mt-10 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                            <div className="p-1">
                                                                <button 
                                                                    onClick={() => handleViewProfile(c)} 
                                                                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-3 rounded-xl transition-colors"
                                                                >
                                                                    <Eye size={16} /> View Profile
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleSendMessage(c, 'Email')} 
                                                                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-3 rounded-xl transition-colors"
                                                                >
                                                                    <Mail size={16} /> Email Customer
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleSendMessage(c, 'Message')} 
                                                                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-3 rounded-xl transition-colors"
                                                                >
                                                                    <Send size={16} /> Message Customer
                                                                </button>
                                                                <div className="border-t border-slate-100 my-1"></div>
                                                                  <button 
                                                                    onClick={() => handleStatusToggle(c)} 
                                                                    className={`w-full text-left px-4 py-2.5 text-xs font-bold flex items-center gap-3 rounded-xl transition-colors ${c.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                                                >
                                                                    {c.isActive ? (
                                                                        <><ShieldAlert size={16} /> Block</>
                                                                    ) : (
                                                                        <><CheckCircle size={16} /> Unblock</>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                            <ShoppingBag size={24} className="text-slate-200" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No local customers registered</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <CustomerDetailsModal
                show={showDetailsModal}
                onHide={() => setShowDetailsModal(false)}
                customer={selectedCustomer}
                onSendMessage={(customer, type) => {
                    setShowDetailsModal(false);
                    handleSendMessage(customer, type);
                }}
            />

            <SendMessageModal
                show={showMessageModal}
                onHide={() => setShowMessageModal(false)}
                customer={selectedCustomer}
                type={messageType}
            />
        </div>
    );
};

export default ManagerCustomers;
