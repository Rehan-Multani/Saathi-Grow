import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit2, MapPin, RefreshCw, Search, Package, Layers } from 'lucide-react';
import { useVendor } from '../contexts/VendorContext';
import {
  getVendorLocations,
  createVendorLocation,
  updateVendorLocation,
  deleteVendorLocation
} from '../api/vendorLocationApi';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const VendorLocations = () => {
  const { vendor } = useVendor();

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editLocation, setEditLocation] = useState(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkLabels, setBulkLabels] = useState('');
  const [form, setForm] = useState({ label: '', description: '' });

  const fetchLocations = useCallback(async (isRefresh = false) => {
    if (!vendor?.token) return;
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const data = await getVendorLocations(vendor.token);
      setLocations(Array.isArray(data) ? data : []);
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, [vendor?.token]);

  useEffect(() => { fetchLocations(); }, [fetchLocations]);

  const handleCreate = async () => {
    if (!form.label.trim()) return toast.warning('Label is required');
    try {
      await createVendorLocation(vendor.token, form);
      toast.success('Location created');
      setForm({ label: '', description: '' });
      setShowModal(false);
      fetchLocations(true);
    } catch (e) { toast.error(e.message); }
  };

  const handleBulkCreate = async () => {
    const labels = bulkLabels.split('\n').map(l => l.trim()).filter(Boolean);
    if (!labels.length) return toast.warning('Enter at least one label');
    try {
      let created = 0;
      for (const label of labels) {
        try { await createVendorLocation(vendor.token, { label }); created++; }
        catch (_) {} // skip duplicates silently
      }
      toast.success(`${created} location(s) created`);
      setBulkLabels('');
      setBulkMode(false);
      setShowModal(false);
      fetchLocations(true);
    } catch (e) { toast.error(e.message); }
  };

  const handleEdit = async () => {
    if (!editLocation || !form.label.trim()) return toast.warning('Label is required');
    try {
      await updateVendorLocation(vendor.token, editLocation._id, form);
      toast.success('Location updated');
      setEditLocation(null);
      setForm({ label: '', description: '' });
      setShowModal(false);
      fetchLocations(true);
    } catch (e) { toast.error(e.message); }
  };

  const handleDelete = async (loc) => {
    const result = await Swal.fire({
      title: loc.assignedProduct ? 'Location Occupied' : 'Delete Location?',
      text: loc.assignedProduct ? 'Unassign the product before deleting this location.' : `"${loc.label}" will be permanently removed.`,
      icon: loc.assignedProduct ? 'error' : 'warning',
      confirmButtonText: loc.assignedProduct ? 'OK' : 'Delete',
      showCancelButton: !loc.assignedProduct,
      confirmButtonColor: loc.assignedProduct ? '#3b82f6' : '#ef4444'
    });
    if (!result.isConfirmed || loc.assignedProduct) return;
    try {
      await deleteVendorLocation(vendor.token, loc._id);
      toast.success('Location deleted');
      fetchLocations(true);
    } catch (e) { toast.error(e.message); }
  };

  const openEditModal = (loc) => {
    setEditLocation(loc);
    setForm({ label: loc.label, description: loc.description || '' });
    setBulkMode(false);
    setShowModal(true);
  };

  const filtered = locations.filter(l => l.label.toLowerCase().includes(search.toLowerCase()));
  const available = filtered.filter(l => !l.assignedProduct);
  const occupied = filtered.filter(l => l.assignedProduct);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <MapPin size={24} className="text-[#0c831f]" /> Store Locations
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Manage your store shelf & rack locations</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => fetchLocations(true)} disabled={refreshing}
              className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-green-600 hover:border-green-200 transition-all">
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => { setBulkMode(false); setEditLocation(null); setForm({ label: '', description: '' }); setShowModal(true); }}
              className="flex items-center gap-1.5 bg-[#0c831f] text-white px-3 py-2 rounded-lg text-xs font-bold">
              <Plus size={14} /> Add Location
            </button>
            <button onClick={() => { setBulkMode(true); setShowModal(true); }}
              className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-xs font-bold">
              <Layers size={14} /> Bulk
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <div className="text-lg font-bold text-gray-800">{filtered.length}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase">Total</div>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
            <div className="text-lg font-bold text-green-700">{available.length}</div>
            <div className="text-[10px] font-bold text-green-500 uppercase">Available</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
            <div className="text-lg font-bold text-amber-700">{occupied.length}</div>
            <div className="text-[10px] font-bold text-amber-500 uppercase">Occupied</div>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-green-400 transition-all">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search locations..."
            className="flex-1 bg-transparent text-sm outline-none" />
        </div>

        {/* List */}
        <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50">
          {loading ? (
            <div className="p-10 text-center text-gray-400 text-sm">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center">
              <MapPin size={32} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400 font-medium">No locations yet</p>
              <p className="text-xs text-gray-300">Tap "Add Location" to get started</p>
            </div>
          ) : (
            filtered.map(loc => (
              <div key={loc._id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${loc.assignedProduct ? 'bg-amber-400' : 'bg-green-400'}`} />
                  <div>
                    <div className="text-sm font-bold text-gray-800">{loc.label}</div>
                    {loc.description && <div className="text-[10px] text-gray-400">{loc.description}</div>}
                  </div>
                  {loc.assignedProduct && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-100 rounded-md">
                      <Package size={9} className="text-amber-500" />
                      <span className="text-[10px] font-bold text-amber-600">{loc.assignedProduct.name || 'In use'}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => openEditModal(loc)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => handleDelete(loc)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 space-y-5">
            <h3 className="text-base font-bold text-gray-900">
              {bulkMode ? 'Bulk Add Locations' : (editLocation ? 'Edit Location' : 'New Location')}
            </h3>
            {bulkMode ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600">Labels (one per line)</label>
                  <textarea value={bulkLabels} onChange={e => setBulkLabels(e.target.value)} rows={6}
                    placeholder={"Rack 1\nRack 2\nShelf A\nBin B-3"}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-mono outline-none focus:border-green-400 resize-none" />
                </div>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => { setBulkMode(false); setShowModal(false); }} className="px-4 py-2 text-sm text-gray-500 font-semibold">Cancel</button>
                  <button onClick={handleBulkCreate} className="px-5 py-2 bg-[#0c831f] text-white rounded-xl text-sm font-bold">Create All</button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600">Label *</label>
                    <input type="text" value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
                      placeholder="e.g. Rack 1, Shelf A-2"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-green-400 font-semibold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600">Description (optional)</label>
                    <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                      placeholder="e.g. Near entrance, behind counter"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-green-400" />
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => { setShowModal(false); setEditLocation(null); setForm({ label: '', description: '' }); }}
                    className="px-4 py-2 text-sm text-gray-500 font-semibold">Cancel</button>
                  <button onClick={editLocation ? handleEdit : handleCreate}
                    className="px-5 py-2 bg-[#0c831f] text-white rounded-xl text-sm font-bold">
                    {editLocation ? 'Update' : 'Create'}
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

export default VendorLocations;
