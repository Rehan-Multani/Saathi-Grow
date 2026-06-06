import React, {useRef , useState, useEffect}from 'react';
import { User, Mail, Phone, MapPin, Camera, ArrowLeft, ChevronRight, ShoppingBag, CreditCard, LogOut, Shield, Moon, Sun, Bell, HelpCircle, Heart, MessageCircle, Tag, BellRing, Edit2, X, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-toastify';
import { getUserTags } from '../../api/orderApi';
import axios from 'axios';
import { API_BASE_URL } from '../../../../config/apiConfig';
import ImageSourceModal from '../../../../common/components/modals/ImageSourceModal';

const ProfilePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const auth = useAuth();
    const { user, updateUser, loading, refreshProfile } = auth;

    const { isDarkMode, toggleTheme } = useTheme();
    const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const fileInputRef = React.useRef(null);
    const [userTags, setUserTags] = useState([]);
    const { token } = auth;

    React.useEffect(() => {
        if (typeof refreshProfile === 'function') {
            refreshProfile();
        }
    }, []);

    React.useEffect(() => {
        if (token) {
            getUserTags(token).then(setUserTags).catch(() => {});
        }
    }, [token]);

    const [unreadCount, setUnreadCount] = useState(0);

    React.useEffect(() => {
        const fetchUnreadCount = async () => {
            if (!token) return;
            try {
                const res = await axios.get(`${API_BASE_URL}/notifications/unread-count`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    setUnreadCount(res.data.count);
                }
            } catch (err) {
                console.error('Error fetching unread notifications in profile:', err);
            }
        };

        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [token]);

    // Edit Profile State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const handleImageSelect = async (file) => {
        if (file) {
            const formData = new FormData();
            formData.append('image', file);

            const result = await updateUser(formData);
            if (result.success) {
                toast.success('Profile picture updated');
            }
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        if (editName.trim()) formData.append('name', editName.trim());
        if (editEmail.trim()) formData.append('email', editEmail.trim());

        const result = await updateUser(formData);
        if (result.success) {
            toast.success('Profile updated successfully');
            setShowEditModal(false);
        }
    };

    const openEditModal = () => {
        setEditName(user?.name || '');
        setEditEmail(user?.email || '');
        setShowEditModal(true);
    };

    const sections = [
        { icon: ShoppingBag, label: "My Orders", subtitle: "Track and manage your orders", path: "/orders" },
        { icon: MessageCircle, label: "My Complaints", subtitle: "Check status of your grievances", path: "/my-complaints" },
        { icon: Bell, label: "Notifications", subtitle: "View your alerts and updates", path: "/notifications" },
        ...userTags.map(t => ({
            icon: Tag,
            label: `${t.tagName.charAt(0).toUpperCase() + t.tagName.slice(1)} (${t.orderCount})`,
            subtitle: `${t.orderCount} tagged order${t.orderCount > 1 ? 's' : ''}`,
            path: `/orders/tagged/${encodeURIComponent(t.tagName)}`
        })),
        { icon: MapPin, label: "Saved Addresses", subtitle: "Manage your delivery locations", path: "/saved-addresses" },
        { icon: Heart, label: "My Wishlist", subtitle: "Your favorite items", path: "/wishlist" },
        { icon: CreditCard, label: "sathiGro Wallet", subtitle: `₹${Number(user?.walletBalance || 0).toFixed(2)} Balance available`, path: "/wallet" },
        { icon: HelpCircle, label: "FAQs & Help Center", subtitle: "Find answers and guides", path: "/help" },
        { icon: MessageCircle, label: "Raise a Complaint", subtitle: "Raise a ticket for any issue", path: "/support/raise-ticket" },
        { icon: Shield, label: "Legal & Policies", subtitle: "Terms, Privacy and more", path: "/settings" }
    ];


    return (
        <div className="min-h-screen bg-gradient-to-r from-[#e8f5e9] to-[#ffffff] dark:from-[#141414] dark:to-[#141414] md:bg-none md:bg-white md:dark:bg-black pt-24 px-0 pb-0 md:p-2">
            <div className="max-w-2xl md:max-w-6xl mx-auto">
                {/* Header */}
                <div className="hidden md:flex items-center gap-3 p-4 md:p-0 mb-0 md:mb-1 bg-gradient-to-br from-[#f6fbf7] to-[#e8f5e9] md:bg-none md:bg-white md:dark:bg-black border-b border-gray-50 md:border-none">
                    <button
                        onClick={() => {
                            if (window.innerWidth >= 768) {
                                navigate('/');
                            } else {
                                const from = location.state?.from || '/';
                                navigate(from);
                            }
                        }}
                        className="p-1.5 md:p-2 bg-white/50 dark:bg-[#141414] rounded-full hover:bg-gray-100 transition-colors md:bg-gray-50"
                    >
                        <ArrowLeft size={16} className="md:w-6 md:h-6" />
                    </button>
                    <h1 className="!text-[16px] md:!text-[18px] font-bold text-gray-900 dark:text-gray-100 uppercase tracking-widest flex-1">My Profile</h1>
                    <button 
                        onClick={openEditModal}
                        className="p-1.5 md:p-2 bg-[#eefaf1] text-[#0c831f] rounded-full hover:bg-[#0c831f] hover:text-white transition-colors"
                        title="Edit Profile"
                    >
                        <Edit2 size={16} className="md:w-5 md:h-5" />
                    </button>

                </div>

                {/* Mobile top-left back button */}
                <button
                    onClick={() => {
                        const from = location.state?.from || '/';
                        navigate(from);
                    }}
                    className="fixed top-4 left-4 z-50 md:hidden flex items-center justify-center w-8 h-8 bg-white dark:bg-[#141414] text-gray-800 dark:text-gray-200 rounded-full shadow-lg border border-gray-100 dark:border-white/10 active:scale-95 transition-transform"
                >
                    <ArrowLeft size={18} />
                </button>



                <div className="md:grid md:grid-cols-3 md:gap-4">
                    {/* Profile Section - Integrated */}
                    <div className="mb-0 md:bg-white md:dark:bg-black md:rounded-2xl md:border md:border-gray-100 dark:md:border-white/5 md:p-2 bg-transparent md:bg-gradient-to-b md:from-[#f6fbf7] md:to-white dark:md:from-black dark:md:to-black">
                        <div className="flex flex-col items-center pt-1 pb-2 md:py-0">
                            <div className="relative mb-1 md:mb-2">
                                <div className="w-24 h-24 md:w-24 md:h-24 bg-[#eefaf1] dark:bg-[#0c831f]/10 rounded-full flex items-center justify-center border-4 border-white md:border-gray-50 dark:border-white/5 overflow-hidden shadow-sm">
                                    {loading ? (
                                        <Loader2 className="animate-spin text-[#0c831f]" size={30} />
                                    ) : (
                                        user?.profileImage ? (
                                            <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={36} className="text-[#556b2f] md:w-12 md:h-12" />
                                        )
                                    )}
                                </div>
                                <button
                                    onClick={() => setIsImageModalOpen(true)}
                                    disabled={loading}
                                    className="absolute -bottom-1 -right-1 p-2 md:p-2.5 bg-[#556b2f] text-white rounded-full md:rounded-lg shadow-lg border-2 border-white dark:border-[#141414] active:scale-95 transition-transform hover:bg-[#0a6b19] disabled:opacity-50"
                                >
                                    <Camera size={14} className="md:w-5 md:h-5" />
                                </button>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <h2 className="!text-[20px] md:!text-[18px] font-bold text-gray-900 dark:text-gray-100">{user?.name || "Saathi Member"}</h2>
                                <button onClick={openEditModal} className="text-[#0c831f] p-1 rounded-full hover:bg-[#e8f5e9] md:hidden">
                                    <Edit2 size={14} />
                                </button>
                            </div>
                            <p className="!text-[12px] md:!text-xs text-gray-400 font-bold tracking-widest mt-1.5 md:mt-2">{user?.email || (user?.phone ? `+91 ${user.phone}` : "member@sathiGro.com")}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-2 md:py-3 border-y border-gray-100 dark:border-white/5 max-w-lg mx-auto md:max-w-none md:mx-0 bg-transparent md:bg-transparent">
                            <div className="text-center">
                                <p className="!text-[16px] md:!text-[18px] font-bold text-gray-900 dark:text-gray-100">{user?.totalOrders || 0}</p>
                                <p className="!text-[9px] md:!text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Orders</p>
                            </div>
                            <div className="text-center">
                                <p className="!text-[16px] md:!text-[18px] font-bold text-gray-900 dark:text-gray-100">₹{Number(user?.walletBalance || 0).toFixed(2)}</p>
                                <p className="!text-[9px] md:!text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Savings</p>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 bg-transparent md:bg-transparent">
                        <div className="space-y-0 md:space-y-1 mb-0 md:mb-2 max-w-none mx-auto md:mx-0">
                            <h3 className="!text-[10px] md:!text-[9px] font-bold text-gray-400 px-6 py-3 md:px-2 md:mb-1 tracking-widest uppercase bg-transparent md:bg-transparent border-t md:border-t-0 border-gray-100 dark:border-white/5">My Information</h3>
                            <div className="divide-y divide-gray-100 dark:divide-white/5 bg-transparent md:bg-white md:dark:bg-black md:rounded-2xl md:border md:border-gray-50 dark:md:border-white/5 overflow-hidden">
                                {sections.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => navigate(item.path, { state: { from: '/profile' } })}
                                        className="w-full py-3 px-6 md:py-1.5 md:px-4 flex items-center justify-between hover:bg-[#e8f5e9] md:hover:bg-gray-50 dark:hover:bg-white/5 transition-all group"
                                    >
                                        <div className="flex items-center gap-4 md:gap-6">
                                            <div className="w-9 h-9 md:w-9 md:h-9 bg-gray-50/50 md:bg-white dark:bg-white/5 md:border border-gray-100 dark:border-white/10 rounded-full md:rounded-lg flex items-center justify-center text-[#556b2f] md:shadow-sm group-hover:bg-[#eefaf1] transition-colors">
                                                <item.icon size={18} className="md:w-4.5 md:h-4.5" />
                                            </div>
                                            <div className="text-left leading-tight">
                                                <div className="flex items-center gap-2 mb-1 md:mb-1.5">
                                                    <h4 className="!text-[14px] font-semibold text-gray-800 dark:text-gray-100 leading-none">{item.label}</h4>
                                                    {item.label === "Notifications" && unreadCount > 0 && (
                                                        <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                                                    )}
                                                </div>
                                                <p className="!text-[10px] md:!text-[11px] text-gray-400 font-medium">{item.subtitle}</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-gray-300 group-hover:text-[#556b2f] transition-colors md:w-5 md:h-5" />
                                    </button>
                                ))}
                            </div>

                            <h3 className="!text-[10px] md:!text-[9px] font-bold text-gray-400 px-6 py-3 md:px-2 md:mt-1 md:mb-0.5 tracking-widest uppercase bg-transparent md:bg-transparent border-t md:border-t-0 border-gray-100 dark:border-white/5">App Preferences</h3>
                            <div className="divide-y divide-gray-100 dark:divide-white/5 bg-transparent md:bg-white md:dark:bg-black md:rounded-2xl md:border border-gray-50 dark:md:border-white/5 overflow-hidden">
                                {/* Theme Toggle */}
                                <button 
                                    onClick={toggleTheme}
                                    className="w-full py-3 px-6 md:py-1.5 md:px-4 flex items-center justify-between hover:bg-[#e8f5e9] md:hover:bg-gray-50 dark:hover:bg-white/5 transition-all group"
                                >
                                    <div className="flex items-center gap-4 md:gap-6">
                                        <div className="w-9 h-9 md:w-9 md:h-9 bg-purple-50 dark:bg-purple-500/10 md:border border-gray-100 dark:border-white/10 rounded-full md:rounded-lg flex items-center justify-center md:shadow-sm">
                                            {isDarkMode ? <Moon size={18} className="text-purple-600 md:w-4.5 md:h-4.5" /> : <Sun size={18} className="text-orange-500 md:w-4.5 md:h-4.5" />}
                                        </div>
                                        <div className="text-left leading-tight">
                                            <h4 className="!text-[14px] font-semibold text-gray-800 dark:text-gray-100 leading-none mb-0 md:mb-0.5">Dark Mode</h4>
                                            <p className="!text-[10px] md:!text-[11px] text-gray-400 font-medium">Toggle app appearance</p>
                                        </div>
                                    </div>
                                    <div className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 ${isDarkMode ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </div>
                                </button>


                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={() => navigate('/logout-confirmation')}
                                className="w-full py-3 px-6 md:py-1.5 md:px-4 flex items-center justify-between bg-transparent md:bg-white md:dark:bg-black hover:bg-red-50 dark:hover:bg-red-900/10 transition-all group border-t border-gray-100 dark:border-white/5 md:mt-1 md:rounded-2xl md:border"
                            >
                                <div className="flex items-center gap-4 md:gap-6">
                                    <div className="w-9 h-9 md:w-9 md:h-9 bg-red-50 dark:bg-red-900/20 md:border border-red-100 dark:border-red-500/10 rounded-full md:rounded-lg flex items-center justify-center text-red-500 md:shadow-sm">
                                        <LogOut size={18} className="md:w-4.5 md:h-4.5" />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="!text-[14px] font-semibold text-red-600 dark:text-red-400 leading-none mb-1 md:mb-1.5">Log Out</h4>
                                        <p className="!text-[10px] md:!text-sm text-red-400/70 font-medium">Sign out of your account</p>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-red-200 group-hover:text-red-500 transition-colors md:w-5 md:h-5" />
                            </button>
                        </div>

                        {/* Support Info */}
                        <div className="bg-gray-50 dark:bg-zinc-900/50 md:bg-[#eefaf1] md:dark:bg-zinc-900/30 md:rounded-2xl p-4 md:p-2 border-none md:border border-[#0c831f]/10 dark:border-white/5 text-center max-w-none mx-auto md:max-w-none md:mx-0 mt-3 md:mt-2">
                            <p className="text-[10px] md:text-sm text-gray-400 dark:text-zinc-500 md:text-[#0c831f] dark:md:text-[#0c831f] font-bold">sathiGro App v1.0.0</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#141414] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-white/10">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 uppercase tracking-widest">Edit Profile</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-red-500 transition-colors bg-gray-50 dark:bg-white/5 p-2 rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input 
                                        type="text" 
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold text-gray-900 dark:text-gray-100 focus:border-[#0c831f] focus:ring-1 focus:ring-[#0c831f] outline-none transition-all"
                                        placeholder="Enter your name"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input 
                                        type="email" 
                                        value={editEmail}
                                        onChange={(e) => setEditEmail(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold text-gray-900 dark:text-gray-100 focus:border-[#0c831f] focus:ring-1 focus:ring-[#0c831f] outline-none transition-all"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 opacity-60">
                                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input 
                                        type="text" 
                                        value={user?.phone ? `+91 ${user.phone}` : ''}
                                        disabled
                                        className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold text-gray-500 dark:text-gray-500 cursor-not-allowed outline-none"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 font-medium ml-1">Phone number cannot be changed.</p>
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full mt-2 py-4 bg-[#0c831f] text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-[#0a6b19] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-[#0c831f]/20 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 size={20} className="animate-spin" /> : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {isImageModalOpen && (
                <ImageSourceModal 
                    isOpen={isImageModalOpen}
                    onClose={() => setIsImageModalOpen(false)}
                    onSelect={handleImageSelect}
                />
            )}
        </div>
    );
};

export default ProfilePage;
