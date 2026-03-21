import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  GoogleMap,
  useJsApiLoader,
  HeatmapLayerF,
  MarkerF,
  InfoWindowF
} from '@react-google-maps/api';
import {
  TrendingUp,
  Map as MapIcon,
  AlertCircle,
  Filter,
  Bell,
  MapPin,
  Package,
  ArrowRight,
  Eye,
  RefreshCcw
} from 'lucide-react';
import { fetchDemandAnalytics } from '../../api/demandAnalyticsApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import PageInfoTooltip from '../../components/common/PageInfoTooltip';
import { pageInfoData } from '../../data/pageInfoData';

const COLORS = ['#0c831f', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];
const GOOGLE_MAPS_LIBRARIES = ['places', 'visualization'];

const DemandAnalytics = () => {
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

  const { adminUser } = useAdminAuth();

  const loadData = async () => {
    if (!adminUser?.token) return;
    setLoading(true);
    try {
      const params = filter === 'ALL' ? {} : { requestType: filter };
      const res = await fetchDemandAnalytics(adminUser.token, params);
      setData(res.data);
      setAnalytics(res.analytics);
    } catch (error) {
      console.error("Failed to load demand analytics:", error);
      toast.error("Error fetching demand data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminUser?.token) {
      loadData();
    }
  }, [filter, adminUser?.token]);

  const heatmapPoints = useMemo(() => {
    if (!isLoaded || !analytics.heatmapData || !window.google?.maps?.LatLng) return [];
    return analytics.heatmapData.map(point => new window.google.maps.LatLng(point.lat, point.lng));
  }, [isLoaded, analytics.heatmapData]);

  const mapCenter = { lat: 22.7196, lng: 75.8577 }; // Default Indore

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gray-50 dark:bg-[#09090b] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <TrendingUp className="text-[#0c831f]" />
            Demand Analytics & Lost Sales
            <PageInfoTooltip data={pageInfoData.demandAnalytics} />
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Understand what your users want that you don't have.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setViewMode('LIST')}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${viewMode === 'LIST' ? 'bg-[#0c831f] text-white' : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'}`}
            >
              <Package size={14} /> List View
            </button>
            <button
              onClick={() => setViewMode('MAP')}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${viewMode === 'MAP' ? 'bg-[#0c831f] text-white' : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'}`}
            >
              <MapIcon size={14} /> Heatmap
            </button>
          </div>
          <button
            onClick={loadData}
            className="p-3 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
          >
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-gray-200 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600">
              <Bell size={24} />
            </div>
            <span className="text-[10px] font-black bg-orange-100 dark:bg-orange-900/30 text-orange-600 px-2.5 py-1 rounded-full uppercase tracking-widest">Out of Stock</span>
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-none">
            {data.filter(d => d.requestType === 'OUT_OF_STOCK').length}
          </h3>
          <p className="text-sm font-bold text-gray-500 mt-2">Active Notify Requests</p>
        </div>

        <div className="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-gray-200 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
              <MapPin size={24} />
            </div>
            <span className="text-[10px] font-black bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-2.5 py-1 rounded-full uppercase tracking-widest">Out of Zone</span>
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-none">
            {data.filter(d => d.requestType === 'OUT_OF_ZONE').length}
          </h3>
          <p className="text-sm font-bold text-gray-500 mt-2">New Area Expansion Requests</p>
        </div>

        <div className="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-gray-200 dark:border-white/5 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <Filter size={16} className="text-[#0c831f]" />
            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Filter Insights</span>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm font-bold focus:ring-2 ring-[#0c831f]/20 outline-none"
          >
            <option value="ALL">All Demands</option>
            <option value="OUT_OF_STOCK">Out of Stock Only</option>
            <option value="OUT_OF_ZONE">Out of Zone Only</option>
          </select>
        </div>
      </div>

      {viewMode === 'LIST' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Demanded Products */}
          <div className="bg-white dark:bg-[#18181b] rounded-3xl border border-gray-200 dark:border-white/5 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <h3 className="font-black text-gray-900 dark:text-white tracking-tight">Highly Demanded Products</h3>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Top 10 Potential Revenue</div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {analytics.topDemandedProducts.length > 0 ? (
                analytics.topDemandedProducts.map((p, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 p-1 flex-shrink-0">
                        <img src={p.productDetails.image} alt="" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 dark:text-white">{p.productDetails.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">SKU: {p.productDetails.sku || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-[#0c831f] leading-none">{p.count}</div>
                      <div className="text-[9px] font-bold text-gray-400 uppercase mt-1">Requests</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-400 font-bold">No demands found for this filter.</div>
              )}
            </div>
          </div>

          {/* Request Type Distribution Chart */}
          <div className="bg-white dark:bg-[#18181b] rounded-3xl border border-gray-200 dark:border-white/5 p-6 shadow-sm flex flex-col items-center justify-center">
            <h3 className="font-black text-gray-900 dark:text-white tracking-tight mb-8 self-start">Demand Distribution</h3>
            <div className="w-full h-[300px]" style={{ minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'OOS', value: data.filter(d => d.requestType === 'OUT_OF_STOCK').length },
                      { name: 'OZZ', value: data.filter(d => d.requestType === 'OUT_OF_ZONE').length }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#0c831f" />
                    <Cell fill="#3b82f6" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        /* Heatmap View */
        <div className="bg-white dark:bg-[#18181b] rounded-3xl border border-gray-200 dark:border-white/5 overflow-hidden shadow-sm h-[600px] relative">
          {!isLoaded ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 animate-pulse text-gray-400 font-black uppercase tracking-widest">
              Loading Satellite Maps...
            </div>
          ) : (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={mapCenter}
              zoom={12}
              options={{
                styles: [
                  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                ]
              }}
            >
              <HeatmapLayerF
                data={heatmapPoints}
                options={{
                  radius: 30,
                  opacity: 0.8
                }}
              />
              {analytics.heatmapData.map((point, i) => (
                <MarkerF
                  key={i}
                  position={{ lat: point.lat, lng: point.lng }}
                  icon={isLoaded ? {
                    url: '/assets/store.png',
                    scaledSize: new window.google.maps.Size(32, 32),
                    anchor: new window.google.maps.Point(16, 32)
                  } : undefined}
                />
              ))}
            </GoogleMap>
          )}

          {/* Legend Overlay */}
          <div className="absolute bottom-6 left-6 bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-md p-4 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xl z-10">
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white mb-3 underline underline-offset-4 decoration-[#0c831f]">Map Keys</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">Out of Stock Request</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">New Area Demand</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Table (Bottom) */}
      <div className="bg-white dark:bg-[#18181b] rounded-3xl border border-gray-200 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
          <h3 className="font-black text-gray-900 dark:text-white tracking-tight">Recent Lost Intent Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Branch/Store</th>
                <th className="px-6 py-4">Address</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {data.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-all group">
                  <td className="px-6 py-4">
                    <div className={`w-2 h-2 rounded-full ${item.status === 'PENDING' ? 'bg-orange-500 animate-pulse' : 'bg-gray-300'}`}></div>
                  </td>
                  <td className="px-6 py-4 font-black text-xs text-gray-900 dark:text-white">
                    {item.product?.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${item.requestType === 'OUT_OF_STOCK' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                      {item.requestType.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[11px] font-bold text-gray-500">
                    {item.store?.storeName || item.store?.name || item.store?.branchName || 'Unknown Store'}
                  </td>
                  <td className="px-6 py-4 text-[10px] font-medium text-gray-400 truncate max-w-[200px]">
                    {item.location?.address === 'Unknown Address' ? 'Address Not Found' : item.location?.address}
                  </td>
                  <td className="px-6 py-4 text-[11px] font-bold text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-[#0c831f]/10 rounded-lg text-[#0c831f]">
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
