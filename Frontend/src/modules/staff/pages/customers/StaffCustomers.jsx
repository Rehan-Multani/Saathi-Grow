import React, { useState, useEffect } from 'react';
import { Search, MoreHorizontal, Mail, Phone, MapPin, Eye, Ban, CheckCircle, Send, ChevronLeft, ChevronRight, User, X, Loader2 } from 'lucide-react';
import { useStaffAuth } from '../../context/StaffAuthContext';
import * as customerApi from '../../../../common/api/customerManagementApi';
import { toast } from 'react-toastify';

// Reuse modals from admin
import CustomerDetailsModal from '../../../../common/components/customers/CustomerDetailsModal';
import SendMessageModal from '../../../../common/components/customers/SendMessageModal';

const StaffCustomers = () => {
  const { staffUser } = useStaffAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [messageType, setMessageType] = useState('Message');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeRow, setActiveRow] = useState(null);
  const itemsPerPage = 8;

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = staffUser?.token;
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
  }, [staffUser?.token]);

  const filtered = customers.filter(c =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone || '').includes(searchTerm)
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedCustomers = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleViewProfile = async (customer) => {
    setActiveRow(null);
    try {
      setLoading(true);
      const detailedCustomer = await customerApi.getCustomerById(staffUser.token, customer._id);
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
    setActiveRow(null);
  };

  const handleStatusToggle = async (customer) => {
    try {
      const formData = new FormData();
      formData.append('isActive', !customer.isActive);
      await customerApi.updateCustomer(staffUser.token, customer._id, formData);
      setCustomers(prev => prev.map(c => c._id === customer._id ? { ...c, isActive: !c.isActive } : c));
      toast.success(`User access updated`);
      setActiveRow(null);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 overflow-x-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left px-1">
          <div className="space-y-2">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Customers</h1>
              <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-blue-100 italic font-black">
                      <User size={12} /> Live Network
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filtered.length} total users</p>
              </div>
          </div>

          <div className="relative group w-full md:w-96 text-left">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                  type="text"
                  placeholder="Find by name or phone..."
                  className="w-full pl-14 pr-6 py-3.5 bg-white border border-slate-200 rounded-[2rem] outline-none text-sm font-bold transition-all focus:ring-4 focus:ring-blue-400/10 focus:border-blue-400 shadow-sm font-black lowercase tracking-widest"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[500px] flex flex-col group">
          <div className="overflow-x-auto flex-1 custom-scrollbar">
              <table className="w-full text-left border-collapse">
                  <thead>
                      <tr className="bg-slate-50/50 text-left">
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-left">Subscriber</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-left">Contact Point</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-left">City</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-center">Identity</th>
                          <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Action</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                      {loading ? (
                          Array(8).fill(0).map((_, i) => (
                              <tr key={i} className="animate-pulse">
                                  <td colSpan="5" className="px-8 py-6"><div className="h-12 bg-slate-50 rounded-2xl w-full"></div></td>
                              </tr>
                          ))
                      ) : paginatedCustomers.length === 0 ? (
                          <tr>
                              <td colSpan="5" className="py-24 text-center">
                                  <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-slate-100 text-slate-200 shadow-sm">
                                      <User size={32} />
                                  </div>
                                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">No users found</h3>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest italic px-4">Database is empty for this branch</p>
                              </td>
                          </tr>
                      ) : paginatedCustomers.map((c, i) => (
                          <tr key={c._id} className="group/row hover:bg-blue-50/20 transition-all duration-300">
                              <td className="px-8 py-5 text-left">
                                  <div className="flex items-center gap-4">
                                      <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm group-hover/row:scale-110 transition-transform shrink-0">
                                          {c.profileImage ? <img src={c.profileImage} className="w-full h-full object-cover" /> : <div className="font-black text-blue-600 text-lg uppercase italic">{c.name?.charAt(0) || 'U'}</div>}
                                      </div>
                                      <div className="min-w-0">
                                          <p className="font-black text-slate-900 text-[12px] uppercase group-hover/row:text-blue-600 transition-colors leading-none truncate w-32">{c.name || 'Anonymous User'}</p>
                                          <p className="text-[9px] text-slate-300 font-mono mt-2 uppercase leading-none truncate w-24">#{c._id?.slice(-8)}</p>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-8 py-5 text-left">
                                  <p className="text-[11px] font-black text-slate-900 uppercase lowercase leading-none truncate max-w-[150px]">{c.email || 'no-mail'}</p>
                                  <p className="text-[10px] font-bold text-slate-400 mt-2 tracking-widest leading-none">+91 {c.phone}</p>
                              </td>
                              <td className="px-8 py-5 text-left">
                                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-tight italic max-w-[200px] truncate" title={c.addresses?.[0] ? [c.addresses[0].street, c.addresses[0].city, c.addresses[0].state].filter(Boolean).join(', ') : 'Local Area'}>
                                     <MapPin size={12} className="text-slate-200 shrink-0" /> 
                                     <span className="truncate">
                                        {c.addresses?.[0] ? [c.addresses[0].street, c.addresses[0].city, c.addresses[0].state].filter(Boolean).join(', ') : 'Local Area'}
                                     </span>
                                  </div>
                              </td>
                              <td className="px-8 py-5 text-center">
                                  <span className={`px-4 py-2 rounded-xl text-[9px] font-black border uppercase tracking-widest shadow-sm inline-block ${c.isActive ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                      {c.isActive ? 'Verified' : 'Limited'}
                                  </span>
                              </td>
                              <td className="px-8 py-5 text-right relative">
                                  <div className="flex justify-end gap-2 text-left">
                                      <button 
                                          onClick={() => handleViewProfile(c)}
                                          className="w-10 h-10 bg-white text-slate-400 hover:text-blue-600 rounded-xl border border-slate-200 hover:border-blue-400 transition-all shadow-sm active:scale-95 flex items-center justify-center"
                                          title="Details"
                                      >
                                          <Eye size={18} />
                                      </button>
                                      
                                      <div className="relative">
                                          <button 
                                              onClick={() => setActiveRow(activeRow === c._id ? null : c._id)}
                                              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all shadow-sm active:scale-95 ${activeRow === c._id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border border-slate-100 hover:text-slate-950'}`}
                                          >
                                              <MoreHorizontal size={18} />
                                          </button>
                                          
                                          {activeRow === c._id && (
                                              <>
                                                  <div className="fixed inset-0 z-[60]" onClick={() => setActiveRow(null)}></div>
                                                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl p-2 z-[70] animate-in fade-in zoom-in-95 duration-200">
                                                      <div className="px-3 py-2 border-b border-slate-50 mb-1 text-left">
                                                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none italic">Communication</p>
                                                      </div>
                                                      <div className="grid grid-cols-1 gap-1">
                                                          <button onClick={() => handleSendMessage(c, 'Email')} className="w-full text-left px-4 py-2 rounded-xl text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 italic">
                                                              <Mail size={14} className="text-blue-500" /> Send Email
                                                          </button>
                                                          <button onClick={() => handleSendMessage(c, 'Message')} className="w-full text-left px-4 py-2 rounded-xl text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 italic">
                                                              <Send size={14} className="text-blue-500" /> Send SMS
                                                          </button>
                                                          <div className="border-t border-slate-50 my-1 pt-1 opacity-50"></div>
                                                          <button onClick={() => handleStatusToggle(c)} className={`w-full text-left px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 italic ${c.isActive ? 'text-red-500 hover:bg-red-50' : 'text-emerald-500 hover:bg-emerald-50'}`}>
                                                              {c.isActive ? <><Ban size={14} /> Deny access</> : <><CheckCircle size={14} /> Grant access</>}
                                                          </button>
                                                      </div>
                                                  </div>
                                              </>
                                          )}
                                      </div>
                                  </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>

          {/* Pagination */}
          {filtered.length > itemsPerPage && (
              <div className="px-8 py-6 border-t border-slate-50 bg-slate-50/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                      Showing <span className="text-slate-900">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of {filtered.length}
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                      <button 
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-20 shadow-sm shrink-0"
                      >
                          <ChevronLeft size={18} />
                      </button>
                      <div className="flex items-center gap-1 mx-2 shrink-0">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                              <button
                                  key={p}
                                  onClick={() => setCurrentPage(p)}
                                  className={`min-w-[40px] h-10 rounded-xl text-[11px] font-black transition-all shadow-sm ${currentPage === p ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white text-slate-400 border border-slate-200 hover:border-blue-200'}`}
                              >
                                  {p}
                              </button>
                          ))}
                      </div>
                      <button 
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-20 shadow-sm shrink-0"
                      >
                          <ChevronRight size={18} />
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
      />
      
      <style dangerouslySetInnerHTML={{ __html: `
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}} />
    </div>
  );
};

export default StaffCustomers;
