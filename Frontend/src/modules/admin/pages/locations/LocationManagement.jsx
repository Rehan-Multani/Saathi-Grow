import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit2, MapPin, RefreshCw, Search, CheckCircle, Package, XCircle, Layers } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getBranches } from '../../api/branchApi';
import {
  getAdminLocations,
  createAdminLocation,
  bulkCreateAdminLocations,
  updateAdminLocation,
  deleteAdminLocation
} from '../../api/physicalLocationApi';
import { toast } from 'react-toastify';
import { showDeleteConfirmation } from '../../../../common/utils/alertUtils';

const LocationManagement = () => {
  const { adminUser } = useAdminAuth();

  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editLocation, setEditLocation] = useState(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkLabels, setBulkLabels] = useState('');

  // Form state
  const [form, setForm] = useState({ label: '', description: '' });

  // Fetch branches on mount
  useEffect(() => {
    if (!adminUser?.token) return;
    getBranches(adminUser.token)
      .then(data => {
        const arr = Array.isArray(data) ? data : (data.branches || []);
        setBranches(arr.filter(b => b.isActive));
        if (arr.length > 0 && !selectedBranch) setSelectedBranch(arr[0]._id);
      })
      .catch(e => toast.error(e.message));
  }, [adminUser?.token]);

  const fetchLocations = useCallback(async (isRefresh = false) => {
    if (!adminUser?.token || !selectedBranch) return;
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const data = await getAdminLocations(adminUser.token, { branchId: selectedBranch });
      setLocations(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [adminUser?.token, selectedBranch]);

  useEffect(() => { fetchLocations(); }, [fetchLocations]);

  const handleCreate = async () => {
    if (!form.label.trim()) return toast.warning('Label is required');
    try {
      await createAdminLocation(adminUser.token, { ...form, branchId: selectedBranch });
      toast.success('Location created');
      setForm({ label: '', description: '' });
      setShowAddModal(false);
      fetchLocations(true);
    } catch (e) { toast.error(e.message); }
  };

  const handleBulkCreate = async () => {
    const labels = bulkLabels.split('\n').map(l => l.trim()).filter(Boolean);
    if (labels.length === 0) return toast.warning('Enter at least one label');
    try {
      const res = await bulkCreateAdminLocations(adminUser.token, { branchId: selectedBranch, labels });
      toast.success(`${res.created} locations created`);
      setBulkLabels('');
      setBulkMode(false);
      fetchLocations(true);
    } catch (e) { toast.error(e.message); }
  };

  const handleEdit = async () => {
    if (!editLocation || !form.label.trim()) return toast.warning('Label is required');
    try {
      await updateAdminLocation(adminUser.token, editLocation._id, { label: form.label, description: form.description });
      toast.success('Location updated');
      setEditLocation(null);
      setForm({ label: '', description: '' });
      fetchLocations(true);
    } catch (e) { toast.error(e.message); }
  };

  const handleDelete = async (loc) => {
    if (loc.assignedProduct) {
      toast.error('This location is occupied. Unassign the product first.');
      return;
    }
    const result = await showDeleteConfirmation(
      'Delete Location?',
      `"${loc.label}" will be permanently deleted.`
    );
    if (!result.isConfirmed) return;
    try {
      await deleteAdminLocation(adminUser.token, loc._id);
      toast.success('Location deleted');
      fetchLocations(true);
    } catch (e) { toast.error(e.message); }
  };

  const openEditModal = (loc) => {
    setEditLocation(loc);
    setForm({ label: loc.label, description: loc.description || '' });
    setShowAddModal(true);
  };

  const selectedBranchObj = branches.find(b => b._id === selectedBranch);
  const filtered = locations.filter(l => l.label.toLowerCase().includes(search.toLowerCase()));
  const occupied = filtered.filter(l => l.assignedProduct);
  const available = filtered.filter(l => !l.assignedProduct);

  return (
    <div className="min-h-screen bg-slate-50/30 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <MapPin size={20} className="text-blue-600" />
              Physical Location Management
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Manage shelf/rack locations for each branch store</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => fetchLocations(true)} disabled={refreshing}
              className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-400 transition-all">
              <RefreshCw size={16} className={refreshing ? 'animate-spin text-blue-500' : 'text-slate-400'} />
            </button>
            <button onClick={() => { setBulkMode(false); setEditLocation(null); setForm({ label: '', description: '' }); setShowAddModal(true); }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-100 hover:bg-blue-700 transition-all">
              <Plus size={16} /> Add Location
            </button>
            <button onClick={() => { setBulkMode(true); setShowAddModal(true); }}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:border-blue-400 transition-all">
              <Layers size={16} /> Bulk Add
            </button>
          </div>
        </div>

        {/* Branch Selector + Search */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase">Select Branch</label>
              <select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 transition-all">
                {branches.map(b => <option key={b._id} value={b._id}>{b.name} ({b.code})</option>)}
              </select>
            </div>
            <div className="flex-1 relative">
              <label className="text-[11px] font-bold text-slate-500 uppercase">Search</label>
              <div className="relative mt-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search locations..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all" />
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
              <div className="text-xl font-bold text-slate-900">{filtered.length}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Total</div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 text-center">
              <div className="text-xl font-bold text-emerald-700">{available.length}</div>
              <div className="text-[10px] font-bold text-emerald-500 uppercase mt-0.5">Available</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 text-center">
              <div className="text-xl font-bold text-amber-700">{occupied.length}</div>
              <div className="text-[10px] font-bold text-amber-500 uppercase mt-0.5">Occupied</div>
            </div>
          </div>
        </div>

        {/* Location Grid */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-400">Loading locations...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <MapPin size={40} className="text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-400">No locations found</p>
              <p className="text-xs text-slate-300 mt-1">Add locations using the buttons above</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map(loc => (
                <div key={loc._id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${loc.assignedProduct ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                    <div>
                      <div className="text-sm font-bold text-slate-800">{loc.label}</div>
                      {loc.description && <div className="text-[10px] text-slate-400 font-medium">{loc.description}</div>}
                    </div>
                    {loc.assignedProduct && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-100 rounded-lg">
                        <Package size={10} className="text-amber-500" />
                        <span className="text-[10px] font-bold text-amber-600">{loc.assignedProduct.name || 'Product'}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => openEditModal(loc)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(loc)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6">
            <h3 className="text-lg font-bold text-slate-900">
              {bulkMode ? 'Bulk Add Locations' : (editLocation ? 'Edit Location' : 'Add Location')}
            </h3>
            {bulkMode ? (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600">Location Labels (one per line)</label>
                  <textarea value={bulkLabels} onChange={e => setBulkLabels(e.target.value)} rows={8}
                    placeholder={"Shelf A-1\nShelf A-2\nRack B-1\nBin C-12"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-mono outline-none focus:border-blue-500 resize-none" />
                  <p className="text-[10px] text-slate-400">Enter each location label on a separate line.</p>
                </div>
                <div className="flex justify-end gap-3">
                  <button onClick={() => { setBulkMode(false); setShowAddModal(false); }}
                    className="px-5 py-2.5 text-sm text-slate-500 hover:text-slate-700 font-semibold">Cancel</button>
                  <button onClick={handleBulkCreate}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all">
                    Create All
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Label <span className="text-rose-500">*</span></label>
                    <input type="text" value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
                      placeholder="e.g. Shelf A-1, Rack B-3, Bin C-12"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-blue-500 font-semibold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Description (optional)</label>
                    <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                      placeholder="e.g. Cold aisle, near entrance"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-blue-500" />
                  </div>
                  {selectedBranchObj && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 font-semibold">
                      Branch: {selectedBranchObj.name} ({selectedBranchObj.code})
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-3">
                  <button onClick={() => { setShowAddModal(false); setEditLocation(null); setForm({ label: '', description: '' }); }}
                    className="px-5 py-2.5 text-sm text-slate-500 hover:text-slate-700 font-semibold">Cancel</button>
                  <button onClick={editLocation ? handleEdit : handleCreate}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all">
                    {editLocation ? 'Update' : 'Create Location'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationManagement;
