import React, { useState } from 'react';
import { Truck, Package, CheckCircle, XCircle, Clock, Search, Printer, MapPin, Calendar } from 'lucide-react';

const ShippingManagement = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Mock shipping data
    const shipments = [
        { id: 1, orderId: 'ORD-001', customer: 'Rahul Sharma', address: 'Delhi, 110001', courier: 'Delhivery', awb: 'DLV1234567', status: 'pending', date: '2024-02-09', items: 3 },
        { id: 2, orderId: 'ORD-002', customer: 'Priya Singh', address: 'Mumbai, 400001', courier: 'BlueDart', awb: 'BDT9876543', status: 'in-transit', date: '2024-02-08', items: 2 },
        { id: 3, orderId: 'ORD-003', customer: 'Amit Kumar', address: 'Bangalore, 560001', courier: 'DTDC', awb: 'DTC5647382', status: 'delivered', date: '2024-02-07', items: 5 },
        { id: 4, orderId: 'ORD-004', customer: 'Neha Patel', address: 'Chennai, 600001', courier: 'FedEx', awb: 'FDX1928374', status: 'failed', date: '2024-02-06', items: 1 },
        { id: 5, orderId: 'ORD-005', customer: 'Sanjay Verma', address: 'Pune, 411001', courier: 'Delhivery', awb: 'DLV5738291', status: 'in-transit', date: '2024-02-09', items: 4 },
    ];

    const filteredShipments = shipments.filter(shipment => {
        const matchesSearch = shipment.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            shipment.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            shipment.awb.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || shipment.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const statusColors = {
        'pending': 'bg-yellow-50 text-yellow-700 border-yellow-100',
        'in-transit': 'bg-blue-50 text-blue-700 border-blue-100',
        'delivered': 'bg-green-50 text-green-700 border-green-100',
        'failed': 'bg-red-50 text-red-700 border-red-100',
    };

    const pendingPickup = shipments.filter(s => s.status === 'pending').length;
    const inTransit = shipments.filter(s => s.status === 'in-transit').length;
    const delivered = shipments.filter(s => s.status === 'delivered').length;
    const failed = shipments.filter(s => s.status === 'failed').length;

    return (
        <div className="space-y-6 lg:space-y-5 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Shipping Management</h1>
                    <p className="text-sm text-gray-500">Track and manage all shipments</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors">
                        <Printer size={16} />
                        Print Labels
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="premium-card p-5 lg:p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-yellow-50 text-yellow-600 rounded-lg">
                            <Clock size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Pending Pickup</p>
                            <h3 className="text-2xl font-extrabold text-gray-900">{pendingPickup}</h3>
                        </div>
                    </div>
                </div>
                <div className="premium-card p-5 lg:p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                            <Truck size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">In Transit</p>
                            <h3 className="text-2xl font-extrabold text-gray-900">{inTransit}</h3>
                        </div>
                    </div>
                </div>
                <div className="premium-card p-5 lg:p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-green-50 text-green-600 rounded-lg">
                            <CheckCircle size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Delivered</p>
                            <h3 className="text-2xl font-extrabold text-gray-900">{delivered}</h3>
                        </div>
                    </div>
                </div>
                <div className="premium-card p-5 lg:p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red-50 text-red-600 rounded-lg">
                            <XCircle size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Failed</p>
                            <h3 className="text-2xl font-extrabold text-gray-900">{failed}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="premium-card p-4 lg:p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by order ID, customer, or AWB..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-[#0c831f] focus:outline-none text-sm"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                        {['all', 'pending', 'in-transit', 'delivered', 'failed'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold capitalize whitespace-nowrap border transition-colors ${filterStatus === status
                                    ? 'bg-[#0c831f] text-white border-[#0c831f]'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {status === 'in-transit' ? 'In Transit' : status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Shipments List */}
            <div className="premium-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 lg:px-4 lg:py-2 text-xs font-bold text-gray-500 uppercase">Order ID</th>
                                <th className="px-6 py-3 lg:px-4 lg:py-2 text-xs font-bold text-gray-500 uppercase">Customer</th>
                                <th className="px-6 py-3 lg:px-4 lg:py-2 text-xs font-bold text-gray-500 uppercase">Destination</th>
                                <th className="px-6 py-3 lg:px-4 lg:py-2 text-xs font-bold text-gray-500 uppercase">Courier</th>
                                <th className="px-6 py-3 lg:px-4 lg:py-2 text-xs font-bold text-gray-500 uppercase">AWB Number</th>
                                <th className="px-6 py-3 lg:px-4 lg:py-2 text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 lg:px-4 lg:py-2 text-xs font-bold text-gray-500 uppercase">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredShipments.map(shipment => (
                                <tr key={shipment.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 lg:px-4 lg:py-3">
                                        <span className="text-sm font-bold text-gray-900">{shipment.orderId}</span>
                                    </td>
                                    <td className="px-6 py-4 lg:px-4 lg:py-3">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{shipment.customer}</p>
                                            <p className="text-xs text-gray-500">{shipment.items} item(s)</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 lg:px-4 lg:py-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <MapPin size={14} />
                                            {shipment.address}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 lg:px-4 lg:py-3 text-sm font-medium text-gray-900">{shipment.courier}</td>
                                    <td className="px-6 py-4 lg:px-4 lg:py-3">
                                        <span className="text-xs font-mono font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                            {shipment.awb}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 lg:px-4 lg:py-3">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusColors[shipment.status]}`}>
                                            {shipment.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 lg:px-4 lg:py-3 text-sm text-gray-600">{shipment.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ShippingManagement;
