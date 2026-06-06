import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getBranches } from '../../api/branchApi';
import POSBilling from './POSBilling';
import { Store, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminPOSBillingPage = () => {
    const { adminUser } = useAdminAuth();
    const { t } = useTranslation(['admin_orders', 'common']);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedBranchId, setSelectedBranchId] = useState(null);

    // If the logged in user is a Store Manager or Staff, they already have a branchId assigned.
    const isSuperAdmin = adminUser?.role === 'Admin';
    const assignedBranchId = adminUser?.branchId;

    useEffect(() => {
        if (isSuperAdmin) {
            fetchBranches();
        } else if (assignedBranchId) {
            setSelectedBranchId(assignedBranchId);
        }
    }, [isSuperAdmin, assignedBranchId]);

    const fetchBranches = async () => {
        setLoading(true);
        try {
            const data = await getBranches(adminUser.token);
            setBranches(data || []);
        } catch (error) {
            console.error('Failed to fetch branches:', error);
        } finally {
            setLoading(false);
        }
    };

    // If branch is selected, render the POSBilling component directly.
    if (selectedBranchId) {
        return (
            <POSBilling
                storeId={selectedBranchId}
                storeType="branch"
                onExit={isSuperAdmin ? () => setSelectedBranchId(null) : null}
            />
        );
    }

    return (
        <div className="container-fluid px-0 py-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                            <Zap className="text-blue-600 fill-blue-600 animate-pulse" size={32} />
                            Point of Sale (POS) Billing
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Select a physical branch to launch the point-of-sale checkout register.
                        </p>
                    </div>
                    <button
                        onClick={fetchBranches}
                        className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 transition-all hover:shadow-sm"
                        title="Refresh Branches List"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Array(4).fill(0).map((_, i) => (
                            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-pulse h-40"></div>
                        ))}
                    </div>
                ) : branches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {branches.map((branch) => (
                            <div
                                key={branch._id}
                                onClick={() => setSelectedBranchId(branch._id)}
                                className="bg-white border-2 border-slate-100 hover:border-blue-500 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between h-44"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <Store size={22} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-slate-800 text-lg leading-snug group-hover:text-blue-600 transition-colors truncate">
                                            {branch.name}
                                        </h3>
                                        <p className="text-xs text-slate-400 font-semibold mt-0.5 truncate uppercase tracking-wider">
                                            Branch Code: {branch.branchCode || 'N/A'}
                                        </p>
                                        <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                                            {branch.address ? `${branch.address.street || ''}, ${branch.address.city || ''}` : 'No address specified'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        Launch Checkout
                                    </span>
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                        <Store size={48} className="text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-800">No Active Branches Found</h3>
                        <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
                            Please create a physical branch in the Location Settings before launching the POS register.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPOSBillingPage;
