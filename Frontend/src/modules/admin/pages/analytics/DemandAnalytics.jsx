import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  GoogleMap,
  useJsApiLoader,
  HeatmapLayerF,
  MarkerF
} from '@react-google-maps/api';
import {
  TrendingUp,
  Map as MapIcon,
  AlertCircle,
  Filter,
  Bell,
  MapPin,
  Package,
  Eye,
  RefreshCcw,
  Loader2,
  Box,
  Truck
} from 'lucide-react';
import { fetchDemandAnalytics } from '../../api/demandAnalyticsApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'];
const GOOGLE_MAPS_LIBRARIES = ['places', 'visualization', 'maps'];

const DemandAnalytics = () => {
    const { t } = useTranslation('admin_analytics');
    const { adminUser } = useAdminAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [analytics, setAnalytics] = useState({ topDemandedProducts: [], heatmapData: [] });
    const [filter, setFilter] = useState('ALL'); // ALL, OUT_OF_STOCK, OUT_OF_ZONE
    const [viewMode, setViewMode] = useState('LIST'); // LIST, MAP

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: GOOGLE_MAPS_LIBRARIES
    });

    const loadData = async () => {
        if (!adminUser?.token) return;
        setLoading(true);
        try {
            const params = filter === 'ALL' ? {} : { requestType: filter };
            const res = await fetchDemandAnalytics(adminUser.token, params);
            setData(res.data);
            setAnalytics(res.analytics);
        } catch (error) {
            // toast.error("Failed to load demand data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (adminUser?.token) loadData();
    }, [filter, adminUser?.token]);

    const heatmapPoints = useMemo(() => {
        if (!isLoaded || !analytics.heatmapData || !window.google?.maps?.LatLng) return [];
        return analytics.heatmapData.map(point => new window.google.maps.LatLng(point.lat, point.lng));
    }, [isLoaded, analytics.heatmapData]);

    const mapCenter = { lat: 21.1458, lng: 79.0882 }; // Nagpur Center

    return (
        <div className="container-fluid py-6 bg-slate-50/30 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">{t('demand.title')}</h1>
                        <PageInfoTooltip data={pageInfoData.demandAnalytics} />
                    </div>
                    <p className="text-slate-500 text-xs mt-1 font-bold opacity-70 uppercase tracking-tight">{t('demand.subtitle')}</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                        <button
                            onClick={() => setViewMode('LIST')}
                            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${viewMode === 'LIST' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Box size={14} /> List View
                        </button>
                        <button
                            onClick={() => setViewMode('MAP')}
                            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${viewMode === 'MAP' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <MapIcon size={14} /> Heatmap
                        </button>
                    </div>
                </div>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                            <Bell size={20} />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('finance.tax.reports', { defaultValue: 'Notify Requests' })}</p>
                        <h3 className="text-xl font-black text-slate-800 mt-1">{data.filter(d => d.requestType === 'OUT_OF_STOCK').length}</h3>
                    </div>
                    <span className="bg-amber-100/50 text-amber-600 text-[9px] font-black px-2 py-0.5 rounded-lg uppercase">OOS</span>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                            <MapPin size={20} />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expansion Demands</p>
                        <h3 className="text-xl font-black text-slate-800 mt-1">{data.filter(d => d.requestType === 'OUT_OF_ZONE').length}</h3>
                    </div>
                    <span className="bg-blue-100/50 text-blue-600 text-[9px] font-black px-2 py-0.5 rounded-lg uppercase">Zone</span>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Filter size={14} className="text-blue-600" /> Filter View
                    </label>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] font-black uppercase outline-none focus:border-blue-600"
                    >
                        <option value="ALL">All Requests</option>
                        <option value="OUT_OF_STOCK">Stock Required</option>
                        <option value="OUT_OF_ZONE">New Areas</option>
                    </select>
                </div>
            </div>

            {viewMode === 'LIST' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Top Products */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/10">
                            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest leading-none">Wanted Items</h3>
                            <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Most requested missing products</p>
                        </div>
                        <div className="divide-y divide-slate-100 h-[380px] overflow-y-auto scrollbar-thin">
                            {analytics.topDemandedProducts.length > 0 ? (
                                analytics.topDemandedProducts.map((p, idx) => (
                                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 p-1 flex-shrink-0">
                                                <img src={p.productDetails.image} alt="" className="w-full h-full object-contain" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{p.productDetails.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Requests: {p.count}</p>
                                            </div>
                                        </div>
                                        <div className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl text-[10px] font-black">
                                            #{idx + 1}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-slate-300 font-black text-xs uppercase italic">No Intent Detected</div>
                            )}
                        </div>
                    </div>

                    {/* Chart Distribution */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 flex flex-col">
                        <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-6">Split Analysis</h3>
                        <div className="flex-1 min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Stock (OOS)', value: data.filter(d => d.requestType === 'OUT_OF_STOCK').length },
                                            { name: 'Zone (OZZ)', value: data.filter(d => d.requestType === 'OUT_OF_ZONE').length }
                                        ]}
                                        cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value"
                                    >
                                        <Cell fill="#2563eb" />
                                        <Cell fill="#94a3b8" />
                                    </Pie>
                                    <Tooltip contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase'}} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-6 mt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                                <span className="text-[9px] font-black text-slate-500 uppercase">Stock Wanted</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 bg-slate-400 rounded-full" />
                                <span className="text-[9px] font-black text-slate-500 uppercase">New Area</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Map View */
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden h-[600px] relative mb-8">
                    {!isLoaded ? (
                        <div className="w-full h-full flex items-center justify-center bg-slate-50 animate-pulse text-slate-300 font-black uppercase tracking-widest text-xs">
                            Syncing Visual Records...
                        </div>
                    ) : (
                        <GoogleMap
                            mapContainerStyle={{ width: '100%', height: '100%', borderRadius: '2.5rem' }}
                            center={mapCenter} zoom={12}
                            options={{
                                styles: [{ elementType: "geometry", stylers: [{ color: "#f1f5f9" }] }],
                                disableDefaultUI: true,
                                zoomControl: true
                            }}
                        >
                            <HeatmapLayerF data={heatmapPoints} options={{ radius: 40, opacity: 0.7, gradient: ['rgba(0, 255, 255, 0)', 'rgba(37, 99, 235, 1)', 'rgba(30, 58, 138, 1)'] }} />
                        </GoogleMap>
                    )}
                    <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200 shadow-xl z-10 w-48">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-800 mb-4 border-b border-slate-100 pb-2">Intensity Map</h4>
                        <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase">Blue zones indicate high user demand for products and services in specific areas.</p>
                    </div>
                </div>
            )}

            {/* List Log */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between">
                    <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Entry Records</h5>
                    <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">Live Feedback</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 font-bold text-slate-500 uppercase text-[10px] tracking-widest">
                                <th className="px-8 py-5">Product Name</th>
                                <th className="px-6 py-5">Request Type</th>
                                <th className="px-6 py-5">Store/Location</th>
                                <th className="px-6 py-5">Requested On</th>
                                <th className="px-8 py-5 text-right font-black uppercase">Detail</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-bold">
                            {data.map((item, i) => (
                                <tr key={i} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-8 py-4">
                                        <div className="text-xs uppercase tracking-tight text-slate-800">{item.product?.name || 'Expansion Request'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase border ${item.requestType === 'OUT_OF_STOCK' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                            {item.requestType.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-[10px] text-slate-500 uppercase">
                                        {item.store?.storeName || item.store?.name || 'Local Area'}
                                    </td>
                                    <td className="px-6 py-4 text-[10px] text-slate-400 font-bold">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <button className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DemandAnalytics;
