import React, { useEffect } from 'react';
import { X, Store, Award, Package, DollarSign, TrendingUp, Calendar, User, Phone, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const VendorPerformanceModal = ({ show, onHide, vendor }) => {
    const { t } = useTranslation();
    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [show]);

    if (!show || !vendor) return null;

    return (
        <div className="fixed inset-0 z-[1060] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onHide}></div>
            <div className="bg-white rounded-xl shadow-2xl w-[95%] sm:w-full max-w-2xl z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 m-4">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 text-dark">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                            <Store size={32} />
                        </div>
                        <div>
                            <h5 className="text-xl font-bold text-gray-800 m-0">{vendor.vendorName}</h5>
                            <div className="text-sm text-gray-500">{t('stock.reports.vendors.performance_modal.id')}: {vendor.id}</div>
                        </div>
                    </div>
                    <button onClick={onHide} className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-500 border-0 bg-transparent">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar text-dark">
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <div className="text-sm text-blue-800 font-medium">{t('stock.reports.vendors.performance_modal.lifetime_sales')}</div>
                                <div className="text-2xl font-bold text-gray-800">₹{vendor.totalSales?.toLocaleString()}</div>
                            </div>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-center gap-4">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                                <Package size={24} />
                            </div>
                            <div>
                                <div className="text-sm text-purple-800 font-medium">{t('stock.reports.vendors.performance_modal.catalog_size')}</div>
                                <div className="text-2xl font-bold text-gray-800">{vendor.productsListed} <span className="text-sm font-normal text-gray-500">{t('stock.reports.vendors.performance_modal.items')}</span></div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Vendor Info Section */}
                        <section>
                            <h6 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                                <User size={18} className="text-gray-400" /> {t('stock.reports.vendors.performance_modal.admin_details')}
                            </h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-500">
                                        <User size={16} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase text-gray-400 font-bold">{t('stock.reports.vendors.performance_modal.store_owner')}</div>
                                        <div className="text-sm font-medium">{vendor.owner}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-500">
                                        <Calendar size={16} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase text-gray-400 font-bold">{t('stock.reports.vendors.performance_modal.onboarded_on')}</div>
                                        <div className="text-sm font-medium">{vendor.memberSince}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-500">
                                        <Phone size={16} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase text-gray-400 font-bold">{t('stock.reports.vendors.performance_modal.phone_number')}</div>
                                        <div className="text-sm font-medium">{vendor.contact}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-500">
                                        <TrendingUp size={16} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase text-gray-400 font-bold">{t('stock.reports.vendors.performance_modal.total_orders')}</div>
                                        <div className="text-sm font-medium">{vendor.orderCount}</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Status Alert */}
                        <div className={`p-4 rounded-lg flex items-center gap-3 ${vendor.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                           <Award size={20} />
                           <div className="text-sm font-medium">{t('stock.reports.vendors.performance_modal.status_msg', { status: t(`stock.reports.vendors.statuses.${vendor.status?.toLowerCase()}`) })}</div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button onClick={onHide} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors border-0">
                        {t('stock.reports.vendors.performance_modal.close')}
                    </button>
                    <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors border-0 shadow-sm">
                        {t('stock.reports.vendors.performance_modal.refresh_stats')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VendorPerformanceModal;
