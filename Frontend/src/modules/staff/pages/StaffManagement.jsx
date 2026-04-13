import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Mail, Phone, Edit, Trash2, Key, Shield, Eye, EyeOff, CheckCircle, XCircle, Calendar, MapPin, X, MoreHorizontal, User, ShieldAlert, Inbox, ShieldCheck } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useStaffAuth } from '../context/StaffAuthContext';
import { API_BASE_URL } from '../../../config/apiConfig';

const StaffManagement = () => {
    const { staffUser } = useStaffAuth();
    const currentUser = staffUser;

    const isStaff = currentUser?.role === 'Staff';
    const hasPermission = isStaff;

    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDetails, setShowDetails] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);

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
            console.error('Fetch staff error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser?.token) {
            fetchStaff();
        }
    }, [currentUser?.token]);

    const openDetailsModal = (member) => {
        setSelectedStaff(member);
        setShowDetails(true);
    };

    const filteredStaff = (Array.isArray(staff) ? staff : [])
        .filter(s =>
            (s?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

    if (!hasPermission) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 font-black font-black">
                <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[3rem] flex items-center justify-center mb-8 border border-red-100 shadow-inner font-black">
                    <ShieldAlert size={40} />
                </div>
                <h3 className="text-xl font-black text-slate-950 uppercase tracking-[0.4em] leading-none italic font-black font-black">Limited</h3>
                <p className="text-slate-400 font-bold uppercase text-[10px] mt-4 tracking-widest italic font-black leading-none font-black font-black">No access to team management</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 overflow-x-hidden text-left font-black font-black">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left px-1 font-black font-black">
                <div className="space-y-2 text-left font-black font-black">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic leading-none font-black text-left font-black">Team Roster</h1>
                    <div className="flex items-center gap-3 font-black text-left font-black">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100 italic leading-none font-black text-left font-black font-black">
                            <User size={12} className="shrink-0" /> Staff Unit
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5 font-black text-left font-black font-black font-black">Branch members list</p>
                    </div>
                </div>

                <div className="relative group w-full md:w-96 text-left font-black">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search names..."
                        className="w-full pl-14 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none text-sm font-bold transition-all focus:ring-4 focus:ring-blue-400/10 focus:border-blue-400 shadow-sm font-black lowercase tracking-widest text-left font-black font-black font-black"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[500px] flex flex-col group text-left font-black font-black">
                <div className="overflow-x-auto flex-1 custom-scrollbar text-left font-black font-black">
                    <table className="w-full text-left border-collapse font-black font-black font-black font-black">
                        <thead>
                            <tr className="bg-slate-50/50 font-black">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-left font-black font-black">Member</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-left font-black font-black">Contact</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 font-black font-black">Status</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 font-black font-black font-black">Access</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 font-black font-black">View</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 border-0 font-black font-black">
                            {loading ? (
                                Array( 10 ).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse font-black font-black">
                                        <td colSpan="5" className="px-8 py-6 font-black font-black font-black"><div className="h-14 bg-slate-50 rounded-2xl w-full font-black font-black font-black font-black"></div></td>
                                    </tr>
                                ))
                            ) : filteredStaff.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-32 text-center border-0 font-black font-black">
                                        <div className="flex flex-col items-center justify-center text-center mx-auto text-left font-black font-black">
                                            <div className="w-24 h-24 bg-slate-50 rounded-[3rem] flex items-center justify-center mx-auto mb-6 border border-slate-100 text-slate-200 shadow-inner font-black text-left font-black">
                                                <Inbox size={40} />
                                            </div>
                                            <h3 className="font-black text-[10px] text-slate-300 uppercase tracking-[0.4em] italic font-black text-center font-black font-black font-black">No Members</h3>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredStaff.map(member => (
                                <tr key={member._id} className="group/row hover:bg-blue-50/20 transition-all duration-300 font-black font-black">
                                    <td className="px-8 py-5 text-left border-0 font-black font-black font-black">
                                        <div className="flex items-center gap-4 text-left font-black italic font-black">
                                            <div className="w-12 h-12 rounded-xl bg-slate-950 text-white flex items-center justify-center font-black text-xs shadow-xl group-hover/row:scale-110 group-hover/row:bg-blue-600 transition-all duration-500 shrink-0 italic font-black text-left font-black font-black">
                                                {member.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="text-left font-black font-black">
                                                <p className="font-black text-slate-900 text-[12px] uppercase group-hover/row:text-blue-600 transition-colors leading-none font-black text-left font-black font-black">{member.name}</p>
                                                <p className="text-[9px] text-slate-400 font-black mt-2.5 uppercase tracking-widest leading-none font-black text-left font-black font-black font-black">{member.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-left border-0 font-black italic font-black">
                                        <p className="text-[11px] font-black text-slate-950 uppercase tracking-tight leading-none text-left font-black font-black font-black font-black font-black lowercase">{member.email}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-2.5 tracking-[0.1em] leading-none text-left font-black font-black font-black">{member.phone || 'NO PHONE'}</p>
                                    </td>
                                    <td className="px-8 py-5 text-center border-0 font-black uppercase italic italic font-black font-black">
                                        <span className={`px-4 py-2 rounded-xl text-[9px] font-black border uppercase tracking-widest shadow-sm italic font-black leading-none inline-block ${member.isActive !== false ? 'bg-emerald-50 text-emerald-600 border-emerald-100 font-black' : 'bg-red-50 text-red-600 border-red-100 font-black'}`}>
                                            {member.isActive !== false ? 'Active' : 'Blocked'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-left border-0 font-black font-black">
                                        <div className="flex flex-wrap gap-1.5 max-w-[200px] text-left font-black italic font-black">
                                            {member.permissions?.slice(0, 2).map(p => (
                                                <span key={p} className="px-3 py-1.5 rounded-xl bg-slate-50 text-slate-500 border border-slate-200 text-[9px] font-black uppercase tracking-tighter shadow-sm font-black text-left font-black">
                                                    {p.replace(/_/g, ' ')}
                                                </span>
                                            ))}
                                            {member.permissions?.length > 2 && (
                                                <span className="px-2.5 py-1.5 rounded-xl bg-blue-600 text-white text-[8px] font-black uppercase tracking-tighter shadow-lg shadow-blue-500/20 font-black text-left font-black">
                                                    +{member.permissions.length - 2}
                                                </span>
                                            )}
                                            {!member.permissions?.length && <p className="text-[9px] font-black text-slate-200 uppercase tracking-widest italic font-black font-black font-black">Default Access</p>}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right border-0 font-black font-black font-black">
                                        <button 
                                            onClick={() => openDetailsModal(member)}
                                            className="w-10 h-10 bg-white text-slate-400 hover:text-blue-600 rounded-xl border border-slate-200 hover:border-blue-400 transition-all shadow-sm active:scale-95 flex items-center justify-center ml-auto font-black font-black font-black"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showDetails && selectedStaff && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 text-left font-black font-black">
                    <div className="bg-white rounded-[3.5rem] max-w-lg w-full shadow-3xl overflow-hidden relative animate-in zoom-in-95 duration-300 border border-slate-200 text-left font-black font-black">
                        <button 
                            onClick={() => setShowDetails(false)} 
                            className="absolute top-8 right-8 w-11 h-11 bg-slate-50 text-slate-400 hover:text-red-500 rounded-2xl flex items-center justify-center transition-all z-10 font-black shadow-sm font-black"
                        >
                            <X size={22} />
                        </button>

                        <div className="p-10 lg:p-14 space-y-10 text-left font-black italic font-black font-black">
                            <div className="text-center font-black font-black font-black">
                                <div className="w-24 h-24 bg-slate-950 text-white rounded-[3rem] border-4 border-white flex items-center justify-center font-black text-2xl shadow-2xl shadow-slate-200 mx-auto mb-6 italic font-black font-black">
                                    {selectedStaff.name.charAt(0).toUpperCase()}
                                </div>
                                <h3 className="text-2xl font-black text-slate-950 uppercase italic tracking-tight leading-none font-black text-center font-black font-black">{selectedStaff.name}</h3>
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.5em] mt-4 italic font-black text-center font-black font-black">{selectedStaff.role} Hub</p>
                            </div>

                            <div className="grid grid-cols-1 gap-5 text-left overflow-y-auto max-h-[50vh] pr-1 custom-scrollbar font-black italic font-black font-black">
                                <InfoItem icon={<Mail size={18} />} label="Email Unit" value={selectedStaff.email} color="blue" />
                                <InfoItem icon={<Phone size={18} />} label="Phone Line" value={selectedStaff.phone || 'None'} color="emerald" />
                                <InfoItem icon={<MapPin size={18} />} label="Branch Area" value={selectedStaff.branchId?.name || selectedStaff.branchId || 'N/A'} color="amber" />
                                
                                <div className="p-8 bg-slate-50 rounded-[3rem] border border-slate-100 text-left font-black font-black">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2 italic leading-none font-black text-left font-black font-black font-black">
                                        <ShieldCheck size={16} /> Access Scope
                                    </p>
                                    <div className="flex flex-wrap gap-2 text-left font-black font-black font-black font-black">
                                        {selectedStaff.permissions?.map(p => (
                                            <span key={p} className="px-4 py-2 rounded-xl bg-white text-slate-700 border border-slate-100 text-[9px] font-black uppercase tracking-widest shadow-sm leading-none italic font-black text-left font-black font-black font-black">
                                                {p.replace(/_/g, ' ')}
                                            </span>
                                        )) || <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest italic font-black font-black">Standard</p>}
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => setShowDetails(false)}
                                className="w-full py-6 bg-slate-950 text-white rounded-[1.8rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl hover:bg-black transition-all active:scale-95 mt-6 italic font-black font-black font-black"
                            >
                                Close Modal
                            </button>
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

const InfoItem = ({ icon, label, value, color }) => {
    const colors = {
        blue: 'text-blue-600 bg-blue-50 border-blue-100 shadow-blue-500/10',
        emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100 shadow-emerald-500/10',
        amber: 'text-amber-600 bg-amber-50 border-amber-100 shadow-amber-500/10'
    };
    return (
        <div className="flex items-center gap-5 p-5 bg-white border border-slate-100 rounded-[1.8rem] shadow-sm font-black italic">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 shrink-0 shadow-md ${colors[color]} font-black`}>
                {icon}
            </div>
            <div className="text-left min-w-0 font-black">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate leading-none font-black text-left italic">{label}</p>
                <p className="text-[11px] font-black text-slate-950 uppercase lowercase leading-none mt-2.5 truncate font-mono font-black text-left font-black italic">{value}</p>
            </div>
        </div>
    );
};

export default StaffManagement;
