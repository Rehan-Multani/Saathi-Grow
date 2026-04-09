import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, InputGroup, Badge, Dropdown, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Search, MoreHorizontal, Mail, Phone, MapPin, Eye, Ban, CheckCircle, Upload, Download, Send, Plus, ChevronLeft, ChevronRight, Filter, X, Calendar } from 'lucide-react';
import CustomerDetailsModal from '../../components/customers/CustomerDetailsModal';
import SendMessageModal from '../../components/customers/SendMessageModal';
import { showSuccessAlert } from '../../../../common/utils/alertUtils';
import { useAdminAuth } from '../../context/AdminAuthContext';
import * as customerApi from '../../api/customerManagementApi';
import { toast } from 'react-toastify';
import PageInfoTooltip from '../../components/common/PageInfoTooltip';
import { pageInfoData } from '../../data/pageInfoData';

const AllCustomers = () => {
    const { t } = useTranslation();
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
    const limit = 10;
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1, limit });
    
    const [statusFilter, setStatusFilter] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    // For debounced searching
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        const fetchCustomers = async () => {
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
                setPagination(paginationData || { total: 0, totalPages: 1, page, limit });
            } catch (error) {
                toast.error(error.message || t('customers.all.errors.fetch_failed', { defaultValue: 'Failed to load customers' }));
            } finally {
                setLoading(false);
            }
        };

        if (adminUser?.token) {
            fetchCustomers();
        }
    }, [adminUser.token, page, debouncedSearch, statusFilter, cityFilter, startDate, endDate, t]);

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
            // Fetch complete profile before showing modal
            const fullProfile = await customerApi.getCustomerById(adminUser.token, customer._id);
            setSelectedCustomer(fullProfile);
            setShowDetailsModal(true);
        } catch (error) {
            toast.error(t('customers.all.errors.fetch_profile'));
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
            toast.success(customer.isActive ? t('customers.all.alerts.block_success') : t('customers.all.alerts.unblock_success'));
        } catch (error) {
            toast.error(error.message || t('customers.all.errors.update_failed', { defaultValue: 'Failed to update user status' }));
        }
    };

    const onMessageSent = async () => {
        setShowMessageModal(false);
        await showSuccessAlert(t('customers.all.alerts.sent_success', { type: messageType }), t('customers.all.alerts.delivered_success', { type: messageType.toLowerCase(), name: selectedCustomer?.name }));
    };

    if (loading && customers.length === 0) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    const totalFiltered = pagination.total || 0;
    const totalPages = pagination.totalPages || 1;
    const paginatedCustomers = customers;

    return (
        <div className="p-6 bg-[#FDFDFF] min-h-screen">
            <div className="flex items-center gap-3 mb-6">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">{t('customers.all.title')}</h1>
                <PageInfoTooltip data={pageInfoData.allCustomers} />
                <Badge bg="primary" className="rounded-2xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest">{totalFiltered}</Badge>
            </div>

            {/* Action Toolbar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 p-4">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                    <div className="flex flex-col md:flex-row gap-3 w-full lg:flex-1 relative">
                        <div className="w-full md:max-w-md">
                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                                <div className="pl-4 text-gray-400">
                                    <Search size={18} />
                                </div>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 font-medium"
                                    placeholder={t('customers.all.search_placeholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex w-full lg:w-auto gap-3">
                        <div className="relative w-full sm:w-auto z-30">
                            <button
                                onClick={() => setShowFilterMenu(!showFilterMenu)}
                                className={`w-full flex justify-center items-center gap-2 px-6 py-2.5 bg-white border ${showFilterMenu || activeFiltersCount > 0 ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-gray-200 text-gray-700'} rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm`}
                            >
                                <Filter size={16} />
                                <span>{t('dashboard.filters')} {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
                            </button>

                            {showFilterMenu && (
                                <div className="absolute top-14 right-0 z-50 w-full sm:w-80 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 p-6 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="flex justify-between items-center mb-5">
                                        <h6 className="font-black text-gray-900 text-xs uppercase tracking-widest">{t('dashboard.advanced_filters')}</h6>
                                        <button onClick={clearFilters} className="text-[10px] font-black text-rose-500 hover:scale-110 transition-transform uppercase tracking-widest">{t('dashboard.clear_all')}</button>
                                    </div>

                                    <div className="space-y-4 text-start">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('dashboard.status')}</label>
                                            <select 
                                                className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
                                                value={statusFilter} 
                                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                            >
                                                <option value="">{t('dashboard.all_status')}</option>
                                                <option value="active">{t('customers.all.status.active')}</option>
                                                <option value="false">{t('customers.all.status.blocked')}</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('customers.all.table.location')}</label>
                                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                                                <MapPin size={14} className="text-gray-400" />
                                                <input
                                                    type="text"
                                                    className="bg-transparent border-none outline-none text-xs font-bold text-gray-700 w-full ml-2"
                                                    placeholder="e.g. Noida"
                                                    value={cityFilter}
                                                    onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('dashboard.start_date')}</label>
                                                <input 
                                                    type="date" 
                                                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-[10px] font-bold rounded-xl p-2 outline-none focus:ring-2 focus:ring-blue-500" 
                                                    value={startDate} 
                                                    onChange={(e) => { setStartDate(e.target.value); setPage(1); }} 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('dashboard.end_date')}</label>
                                                <input 
                                                    type="date" 
                                                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-[10px] font-bold rounded-xl p-2 outline-none focus:ring-2 focus:ring-blue-500" 
                                                    value={endDate} 
                                                    onChange={(e) => { setEndDate(e.target.value); setPage(1); }} 
                                                    min={startDate} 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => setShowFilterMenu(false)} 
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl text-xs uppercase tracking-widest mt-6 shadow-lg shadow-blue-100 transition-all active:scale-95"
                                    >
                                        {t('dashboard.apply_filters')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Card className="border-0 shadow-sm rounded-2xl min-h-[600px] flex flex-col">
                <Card.Body className="p-0">
                    <div className="overflow-x-auto">
                        <Table hover responsive className="mb-0 align-middle border-collapse">
                            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest sticky top-0 z-10">
                                <tr>
                                    <th className="ps-6 border-0 py-4">{t('customers.all.table.customer')}</th>
                                    <th className="border-0 py-4">{t('customers.all.table.contact')}</th>
                                    <th className="border-0 py-4">{t('customers.all.table.location')}</th>
                                    <th className="border-0 py-4 text-center">{t('customers.all.table.wallet')}</th>
                                    <th className="border-0 py-4 text-center">{t('dashboard.status')}</th>
                                    <th className="border-0 py-4 text-center">{t('dashboard.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading && customers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-24 text-muted">
                                            <div className="flex flex-col items-center gap-2">
                                                <Spinner animation="border" variant="primary" size="sm" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{t('dashboard.loading')}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedCustomers.length > 0 ? paginatedCustomers.map((c) => (
                                    <tr key={c._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="ps-6 py-4">
                                            <div className="d-flex align-items-center gap-3">
                                                {c.profileImage ? (
                                                    <img src={c.profileImage} alt={c.name} className="rounded-circle object-fit-cover border-2 border-white shadow-sm" style={{ width: 44, height: 44 }} />
                                                ) : (
                                                    <div className="bg-blue-50 text-blue-600 rounded-circle d-flex align-items-center justify-content-center fw-bold border-2 border-white shadow-sm" style={{ width: 44, height: 44 }}>
                                                        {c.name ? c.name.charAt(0) : 'U'}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="fw-black text-gray-900 text-sm tracking-tight">{c.name || t('customers.all.anonymous')}</div>
                                                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">ID: {c._id.slice(-8)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="d-flex flex-column gap-1">
                                                {c.email && (
                                                    <div className="d-flex align-items-center gap-2 text-xs font-bold text-gray-600">
                                                        <Mail size={12} className="text-gray-300" /> {c.email}
                                                    </div>
                                                )}
                                                <div className="d-flex align-items-center gap-2 text-xs font-bold text-gray-400">
                                                    <Phone size={12} className="text-gray-300" /> {c.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 text-secondary">
                                            <div className="d-flex align-items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-tight">
                                                <MapPin size={12} className="text-gray-300" /> {c.addresses?.[0]?.city || 'Global Site'}
                                            </div>
                                        </td>
                                        <td className="py-4 text-center">
                                            <div className="fw-black text-gray-900">₹{c.walletBalance || 0}</div>
                                            <div className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{t('dashboard.total_credits')}</div>
                                        </td>
                                        <td className="py-4 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border
                                                ${c.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                                                {c.isActive ? t('customers.all.status.active') : t('customers.all.status.blocked')}
                                            </span>
                                        </td>
                                        <td className="py-4 text-center">
                                            <Dropdown align="end">
                                                <Dropdown.Toggle variant="link" className="text-gray-400 p-2 hover:bg-gray-100 rounded-xl shadow-none no-caret transition-all">
                                                    <MoreHorizontal size={20} />
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu className="border-0 shadow-[0_10px_40px_rgba(0,0,0,0.1)] p-2 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <Dropdown.Item onClick={() => handleViewProfile(c)} className="rounded-xl py-2.5 d-flex align-items-center gap-3 text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                                                        <Eye size={16} className="text-blue-500" />
                                                        {t('customers.all.actions.view_profile')}
                                                    </Dropdown.Item>
                                                    <Dropdown.Item onClick={() => handleSendMessage(c, 'Email')} className="rounded-xl py-2.5 d-flex align-items-center gap-3 text-xs font-bold text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">
                                                        <Mail size={16} className="text-indigo-500" />
                                                        {t('customers.all.actions.send_email')}
                                                    </Dropdown.Item>
                                                    <Dropdown.Item onClick={() => handleSendMessage(c, 'Message')} className="rounded-xl py-2.5 d-flex align-items-center gap-3 text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:text-emerald-600">
                                                        <Send size={16} className="text-emerald-500" />
                                                        {t('customers.all.actions.send_message')}
                                                    </Dropdown.Item>
                                                    <Dropdown.Divider className="my-2 opacity-50" />
                                                    <Dropdown.Item onClick={() => handleStatusToggle(c)} className={`rounded-xl py-2.5 d-flex align-items-center gap-3 text-xs font-bold ${c.isActive ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>
                                                        {c.isActive ? <Ban size={16} /> : <CheckCircle size={16} />}
                                                        {c.isActive ? t('customers.all.actions.block_user') : t('customers.all.actions.unblock_user')}
                                                    </Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-24">
                                            <div className="flex flex-col items-center gap-3 text-gray-300">
                                                <Search size={48} strokeWidth={1} />
                                                <span className="text-xs font-black uppercase tracking-widest">{t('customers.all.no_customers')}</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>

                {/* Pagination Controls */}
                {!loading && totalFiltered > 0 && (
                    <div className="bg-white border-top px-8 py-6 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-4">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {t('customers.all.pagination.showing')} <span className="text-gray-900">{((page - 1) * limit) + 1}</span> {t('customers.all.pagination.to')} <span className="text-gray-900">{Math.min(page * limit, totalFiltered)}</span> {t('customers.all.pagination.of')} <span className="text-gray-900">{totalFiltered}</span> {t('customers.all.title')}
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            <Button
                                variant="link"
                                className={`p-2 rounded-xl border-2 transition-all ${page === 1 ? 'border-gray-50 text-gray-200 cursor-not-allowed' : 'border-gray-100 text-gray-600 hover:border-blue-200 hover:bg-blue-50'}`}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft size={18} strokeWidth={2.5} />
                            </Button>

                            <div className="d-flex align-items-center gap-2">
                                {[...Array(totalPages)].map((_, i) => {
                                    const p = i + 1;
                                    const isFirstPage = p === 1;
                                    const isLastPage = p === totalPages;
                                    const isNearCurrent = Math.abs(page - p) <= 1;

                                    if (isFirstPage || isLastPage || isNearCurrent) {
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`w-10 h-10 flex items-center justify-center rounded-xl text-xs font-black transition-all ${page === p ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-400 hover:bg-gray-50'}`}
                                            >
                                                {p}
                                            </button>
                                        );
                                    } else if (p === page - 2 || p === page + 2) {
                                        return <span key={p} className="text-gray-300 font-black">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <Button
                                variant="link"
                                className={`p-2 rounded-xl border-2 transition-all ${page === totalPages ? 'border-gray-50 text-gray-200 cursor-not-allowed' : 'border-gray-100 text-gray-600 hover:border-blue-200 hover:bg-blue-50'}`}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                <ChevronRight size={18} strokeWidth={2.5} />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

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
