import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MoreHorizontal, Mail, Phone, MapPin, Eye, Ban, CheckCircle, Send, ChevronLeft, ChevronRight, Filter, X, Loader2, User, ShieldCheck } from 'lucide-react';
import CustomerDetailsModal from '../../../../common/components/customers/CustomerDetailsModal';
import SendMessageModal from '../../../../common/components/customers/SendMessageModal';
import { useAdminAuth } from '../../context/AdminAuthContext';
import * as customerApi from '../../../../common/api/customerManagementApi';
import { toast } from 'react-toastify';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const CustomerStatusBadge = ({ active }) => {
    const { t } = useTranslation('admin_customers');
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${active ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-rose-50 border-rose-200 text-rose-600'}`}>
            {active ? t('all.status.active') : t('all.status.blocked')}
        </span>
    );
};

const AllCustomers = () => {
    const { t } = useTranslation('admin_customers');
    const { adminUser } = useAdminAuth();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [messageType, setMessageType] = useState('Message');
    
    // Pagination & Filters State
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1, limit: 10 });
    
    const [statusFilter, setStatusFilter] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchCustomers = useCallback(async () => {
        if (!adminUser?.token) return;
        try {
            setLoading(true);
            const params = { 
                page, 
                limit, 
                search: debouncedSearch,
                status: statusFilter,
                city: cityFilter,
                startDate,
                endDate,
                includeMeta: 'true'
            };
            const { customers: customerList, pagination: paginationData } = await customerApi.getAllCustomers(
                adminUser.token,
                params,
                { paginated: true }
            );
            setCustomers(Array.isArray(customerList) ? customerList : []);
            setPagination(paginationData || { total: 0, totalPages: 1, page, limit: 10 });
        } catch (error) {
            // toast.error(t('all.errors.fetch_failed'));
        } finally {
            setLoading(false);
        }
    }, [adminUser.token, page, debouncedSearch, statusFilter, cityFilter, startDate, endDate, t, limit]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const clearFilters = () => {
        setStatusFilter('');
        setCityFilter('');
        setStartDate('');
        setEndDate('');
        setSearchTerm('');
        setPage(1);
        setShowFilterMenu(false);
    };

    const activeFiltersCount = [statusFilter, cityFilter, startDate, endDate].filter(Boolean).length;

    const handleViewProfile = async (customer) => {
        try {
            const fullProfile = await customerApi.getCustomerById(adminUser.token, customer._id);
            setSelectedCustomer(fullProfile);
            setShowDetailsModal(true);
        } catch (error) {
            // toast.error(t('all.errors.fetch_profile'));
        }
    };

    const handleSendMessage = (customer, type) => {
        setSelectedCustomer(customer);
        setMessageType(type);
        setShowMessageModal(true);
    };

    const handleStatusToggle = async (customer) => {
        try {
            const formData = new FormData();
            formData.append('isActive', !customer.isActive);
            await customerApi.updateCustomer(adminUser.token, customer._id, formData);
            setCustomers(prev => prev.map(c => c._id === customer._id ? { ...c, isActive: !c.isActive } : c));
            toast.success(customer.isActive ? t('all.alerts.block_success') : t('all.alerts.unblock_success'));
        } catch (error) {
            toast.error(t('all.errors.update_failed'));
        }
    };

    const onMessageSent = async () => {
        setShowMessageModal(false);
    };

    const totalFiltered = pagination.total || 0;
    const totalPages = pagination.totalPages || 1;

    return (
        <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold tracking-tight">{t('all.title')}</h1>
                        <PageInfoTooltip info={pageInfoData.allCustomers} />
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg border border-blue-100">{totalFiltered} Total</span>
                    </div>
                    <p className="text-slate-500 text-xs mt-1 font-medium">{t('all.subtitle')}</p>
                </div>
            </div>

            {/* Main Action Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-3 mb-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-3 items-center">
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                            type="text"
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-blue-500/50 focus:bg-white transition-all text-sm font-medium"
                            placeholder={t('all.search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <button
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${activeFiltersCount > 0 || showFilterMenu ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                        >
                            <Filter size={14} />
                            {activeFiltersCount > 0 ? `Filters (${activeFiltersCount})` : 'Filters'}
                        </button>
                    </div>
                </div>

                {showFilterMenu && (
                    <div className="mt-4 p-5 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block ml-1">Status</label>
                            <select 
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium outline-none focus:border-blue-500"
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            >
                                <option value="">All Customers</option>
                                <option value="active">Active Only</option>
                                <option value="false">Blocked Only</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block ml-1">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                <input
                                    type="text"
                                    className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-xs font-medium outline-none focus:border-blue-500"
                                    placeholder="City name..."
                                    value={cityFilter}
                                    onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block ml-1">Joined From</label>
                            <input 
                                type="date" 
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium outline-none"
                                value={startDate}
                                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                            />
                        </div>
                        <div className="flex items-end gap-2">
                             <div className="flex-1 space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block ml-1">Joined To</label>
                                <input 
                                    type="date" 
                                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium outline-none"
                                    value={endDate}
                                    onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                                    min={startDate}
                                />
                            </div>
                            <button onClick={clearFilters} className="p-2.5 bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg border border-slate-200 mb-[2px] transition-all"><X size={16} /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* List View */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">{t('all.table.customer')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase">{t('all.table.contact')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase">{t('all.table.location')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase text-center">{t('all.table.wallet')}</th>
                                <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase text-center">{t('all.table.status')}</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading && customers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 size={32} className="text-blue-500 animate-spin" />
                                            <span className="text-xs font-medium text-slate-400">Loading customers...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : customers.length > 0 ? customers.map((c) => (
                                <tr key={c._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {c.profileImage ? (
                                                <img src={c.profileImage} alt={c.name} className="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-sm" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                    {c.name ? c.name.charAt(0) : 'U'}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-bold text-slate-900 leading-tight">{c.name || t('all.anonymous')}</div>
                                                <div className="text-[10px] font-medium text-slate-400 mt-0.5">ID: {c._id.slice(-8)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="space-y-0.5">
                                            {c.email && (
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                                                    <Mail size={12} className="text-slate-300" /> {c.email}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                                <Phone size={12} className="text-slate-300" /> +91 {c.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                                            <MapPin size={12} className="text-slate-400" />
                                            <span>{c.addresses?.[0]?.city || 'No City'}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <div className="font-bold text-slate-900">₹{c.walletBalance || 0}</div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <CustomerStatusBadge active={c.isActive} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                            <button 
                                                onClick={() => handleViewProfile(c)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title={t('all.actions.view_profile')}
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <div className="relative group/actions">
                                                <button className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all">
                                                    <MoreHorizontal size={16} />
                                                </button>
                                                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-100 p-1.5 z-50 opacity-0 invisible group-hover/actions:opacity-100 group-hover/actions:visible transition-all">
                                                    <button onClick={() => handleSendMessage(c, 'Email')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-all">
                                                        <Mail size={14} className="text-slate-400" /> {t('all.actions.send_email')}
                                                    </button>
                                                    <button onClick={() => handleSendMessage(c, 'Message')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-all">
                                                        <Send size={14} className="text-slate-400" /> {t('all.actions.send_message')}
                                                    </button>
                                                    <div className="h-px bg-slate-100 my-1"></div>
                                                    <button onClick={() => handleStatusToggle(c)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-bold transition-all ${c.isActive ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>
                                                        {c.isActive ? <Ban size={14} /> : <CheckCircle size={14} />}
                                                        {c.isActive ? t('all.actions.block_user') : t('all.actions.unblock_user')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 text-slate-400">
                                            <Search size={40} strokeWidth={1.5} className="opacity-40" />
                                            <p className="text-xs font-semibold">{t('all.no_customers')}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalFiltered > 0 && (
                    <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-xs font-medium text-slate-500">
                            {t('all.pagination.showing')} {((page - 1) * limit) + 1} to {Math.min(page * limit, totalFiltered)} of {totalFiltered}
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className={`p-2 rounded-lg border transition-all ${page === 1 ? 'text-slate-200 border-slate-100' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600'}`}
                            >
                                <ChevronLeft size={16} />
                            </button>

                            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-500">
                                <span className={page === 1 ? 'text-blue-600' : ''}>1</span>
                                {totalPages > 1 && (
                                    <>
                                        {page > 2 && <span className="text-slate-300">...</span>}
                                        {page !== 1 && page !== totalPages && <span className="text-blue-600">{page}</span>}
                                        {page < totalPages - 1 && <span className="text-slate-300">...</span>}
                                        <span className={page === totalPages ? 'text-blue-600' : ''}>{totalPages}</span>
                                    </>
                                )}
                            </div>

                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className={`p-2 rounded-lg border transition-all ${page === totalPages ? 'text-slate-200 border-slate-100' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600'}`}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <CustomerDetailsModal
                show={showDetailsModal}
                onHide={() => setShowDetailsModal(false)}
                customer={selectedCustomer}
                onSendMessage={(cust, type) => {
                    setShowDetailsModal(false);
                    handleSendMessage(cust, type);
                }}
            />

            <SendMessageModal
                show={showMessageModal}
                onHide={() => setShowMessageModal(false)}
                customer={selectedCustomer}
                type={messageType}
                onSubmit={onMessageSent}
            />
        </div>
    );
};

export default AllCustomers;
