import React, { useEffect, useMemo, useState } from 'react';
import { Store, MapPin, ArrowRight, RefreshCw } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getBranches } from '../../api/branchApi';
import { getVendors } from '../../api/vendorApi';
import PosOrders from './PosOrders';

const POSBillingPage = () => {
  const { adminUser } = useAdminAuth();
  const [storeType, setStoreType] = useState('branch');
  const [storeId, setStoreId] = useState('');
  const [branches, setBranches] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const stores = useMemo(() => (storeType === 'branch' ? branches : vendors), [storeType, branches, vendors]);

  useEffect(() => {
    setStoreId('');
    setError('');
  }, [storeType]);

  useEffect(() => {
    const loadStores = async () => {
      if (!adminUser?.token) return;
      setLoading(true);
      setError('');
      try {
        const [{ branches: branchList }, { vendors: vendorList }] = await Promise.all([
          getBranches(adminUser.token, { page: 1, limit: 200 }, { paginated: true }),
          getVendors(adminUser.token, { page: 1, limit: 200, includeMeta: true }, { paginated: true })
        ]);
        setBranches(Array.isArray(branchList) ? branchList : []);
        setVendors(Array.isArray(vendorList) ? vendorList : []);
      } catch (err) {
        setError(err.message || 'Failed to load stores');
      } finally {
        setLoading(false);
      }
    };
    loadStores();
  }, [adminUser?.token]);

  if (storeId) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3 mb-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
            <div className="p-2 rounded-lg bg-violet-50 text-violet-600">
              {storeType === 'branch' ? <MapPin size={16} /> : <Store size={16} />}
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-gray-400">POS Billing Store</div>
              <div>
                {storeType === 'branch' ? 'Branch' : 'Vendor'}:{' '}
                <span className="text-gray-900 font-black">
                  {stores.find(s => String(s._id) === String(storeId))?.name || stores.find(s => String(s._id) === String(storeId))?.storeName || storeId}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setStoreId('')}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
          >
            Change Store
          </button>
        </div>
        <PosOrders storeId={storeId} storeType={storeType} onExit={() => setStoreId('')} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200">
            <Store size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-800">POS Billing</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Select a Store to Start</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm font-bold border border-red-100">
            {error}
          </div>
        )}

        <div className="flex gap-2 mb-4">
          {['branch', 'vendor'].map((type) => (
            <button
              key={type}
              onClick={() => setStoreType(type)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${storeType === type ? 'bg-violet-600 text-white shadow-lg shadow-violet-200' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
            >
              {type === 'branch' ? 'Branch' : 'Vendor'}
            </button>
          ))}
          <button
            onClick={() => {
              setStoreId('');
              setError('');
              setLoading(true);
              if (adminUser?.token) {
                Promise.all([
                  getBranches(adminUser.token, { page: 1, limit: 200 }, { paginated: true }),
                  getVendors(adminUser.token, { page: 1, limit: 200, includeMeta: true }, { paginated: true })
                ])
                  .then(([b, v]) => {
                    setBranches(Array.isArray(b.branches) ? b.branches : []);
                    setVendors(Array.isArray(v.vendors) ? v.vendors : []);
                  })
                  .catch((err) => setError(err.message || 'Failed to load stores'))
                  .finally(() => setLoading(false));
              } else {
                setLoading(false);
              }
            }}
            className="ml-auto px-3 py-2 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
            title="Refresh Stores"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
            {storeType === 'branch' ? 'Select Branch' : 'Select Vendor'}
          </label>
          <select
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-violet-500"
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            disabled={loading}
          >
            <option value="">{loading ? 'Loading...' : `Choose ${storeType === 'branch' ? 'a branch' : 'a vendor'}`}</option>
            {stores.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name || s.storeName}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => {
            if (!storeId) setError('Please select a store to continue');
          }}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-violet-200 transition-all active:scale-95"
        >
          Start POS Billing <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default POSBillingPage;
