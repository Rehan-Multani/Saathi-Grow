import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Form, InputGroup, Badge, Spinner, Button, Row, Col } from 'react-bootstrap';
import { Search, MapPin, Package, ChevronLeft, ChevronRight, Filter, RefreshCcw } from 'lucide-react';
import { getBranchWiseStock } from '../../api/productApi';
import { getBranches } from '../../api/branchApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';

const BranchStock = () => {
    const { adminUser } = useAdminAuth();
    const [stockData, setStockData] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [branchFilter, setBranchFilter] = useState('');
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });
    const limit = 10;

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchBranches = useCallback(async () => {
        try {
            const data = await getBranches(adminUser.token);
            setBranches(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    }, [adminUser.token]);

    const fetchStock = useCallback(async () => {
        if (!adminUser?.token) return;
        
        try {
            setLoading(true);
            const params = {
                page,
                limit,
                search: debouncedSearch,
                status: statusFilter,
                branchId: branchFilter
            };
            const response = await getBranchWiseStock(adminUser.token, params);
            if (response.success) {
                setStockData(response.data || []);
                setPagination(response.pagination);
            }
        } catch (error) {
            console.error('Error fetching stock:', error);
            toast.error('Failed to load stock data');
        } finally {
            setLoading(false);
        }
    }, [adminUser.token, page, debouncedSearch, statusFilter, branchFilter]);

    useEffect(() => {
        fetchStock();
    }, [fetchStock]);

    useEffect(() => {
        if (adminUser?.token && adminUser.role === 'Admin') {
            fetchBranches();
        }
    }, [adminUser, fetchBranches]);

    return (
        <div className="p-4 space-y-4">
            {/* Header section with Context */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <div>
                    <h4 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                        <Package className="text-purple-600" size={24} />
                        Branch-wise Stock Monitoring
                    </h4>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Logistics Control</span>
                        <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                        <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">{pagination.total} Active Records</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="light" 
                        size="sm" 
                        className="bg-white border border-gray-100 text-gray-500 hover:text-purple-600 shadow-sm flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
                        onClick={() => fetchStock()}
                        disabled={loading}
                    >
                        <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Refresh</span>
                    </Button>
                </div>
            </div>

            {/* Filters Section: Sleek & Modern */}
            <Card className="border-0 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] mb-4 bg-white rounded-xl">
                <Card.Body className="p-3">
                    <Row className="g-3">
                        <Col lg={5} md={6}>
                            <InputGroup className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-0.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                                <Search className="text-gray-400 mt-2" size={16} />
                                <Form.Control
                                    placeholder="Search by SKU, Product or Branch..."
                                    className="bg-transparent border-none shadow-none text-xs font-medium placeholder:text-gray-300 py-2 ms-1"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        
                        <Col lg={3} md={3}>
                            <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-2 py-0.5 transition-all">
                                <Filter size={14} className="text-gray-400 shrink-0" />
                                <Form.Select 
                                    className="bg-transparent border-none shadow-none text-[11px] font-bold uppercase tracking-wider text-gray-600 py-2"
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                >
                                    <option value="">Status: All</option>
                                    <option value="In Stock">In Stock</option>
                                    <option value="Low Stock">Critically Low</option>
                                    <option value="Out of Stock">Out of Stock</option>
                                </Form.Select>
                            </div>
                        </Col>

                        {adminUser.role === 'Admin' && (
                            <Col lg={4} md={3}>
                                <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-2 py-0.5 transition-all">
                                    <MapPin size={14} className="text-gray-400 shrink-0" />
                                    <Form.Select 
                                        className="bg-transparent border-none shadow-none text-[11px] font-bold uppercase tracking-wider text-gray-600 py-2"
                                        value={branchFilter}
                                        onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }}
                                    >
                                        <option value="">Branch: Global View</option>
                                        {branches.map(b => (
                                            <option key={b._id} value={b._id}>{b.name}</option>
                                        ))}
                                    </Form.Select>
                                </div>
                            </Col>
                        )}
                    </Row>
                </Card.Body>
            </Card>

            {/* Main Data Table: Dense & Professional */}
            <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
                <Card.Body className="p-0">
                    <div className="overflow-x-auto">
                        <Table hover className="mb-0 text-xs">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="ps-4 py-3">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-loose">Inventory Item</span>
                                    </th>
                                    <th className="py-3">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-loose">Deployment point</span>
                                    </th>
                                    <th className="py-3 text-center">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-loose">Current Level</span>
                                    </th>
                                    <th className="py-3">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-loose">Operational status</span>
                                    </th>
                                    <th className="pe-4 py-3 text-right">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-loose">Command</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    Array(limit).fill(0).map((_, i) => (
                                        <tr key={i}>
                                            <td colSpan="5" className="py-4 px-4 text-center">
                                                <div className="flex items-center justify-center gap-2 text-gray-200">
                                                    <Spinner animation="border" size="sm" className="opacity-20" />
                                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30">Decrypting Stock Data...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : stockData.length > 0 ? stockData.map((item, idx) => (
                                    <tr key={`${item.productId}-${idx}`} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="ps-4 py-2.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-white rounded-lg border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden shrink-0 group-hover:border-purple-200 transition-colors">
                                                    {item.image ? (
                                                        <img src={item.image} alt="" className="w-full h-full object-contain p-1" />
                                                    ) : (
                                                        <Package size={14} className="text-gray-200" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-gray-800 text-[11px] truncate leading-tight uppercase">{item.productName}</div>
                                                    <div className="text-[9px] text-gray-400 font-mono font-bold tracking-tight mt-0.5">{item.sku}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-2.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]"></div>
                                                <div className="min-w-0">
                                                    <div className="text-[11px] font-bold text-gray-700 truncate">{item.branchName}</div>
                                                    <div className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">{item.branchCode}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-2.5 text-center">
                                            <div className={`text-xs font-black ${item.stock <= item.lowStockThreshold ? 'text-red-600' : 'text-gray-800'}`}>
                                                {item.stock}
                                                <span className="text-[8px] text-gray-400 font-normal ml-0.5 uppercase tracking-tighter">Units</span>
                                            </div>
                                            <div className="text-[8px] text-gray-300 font-bold uppercase mt-0.5">Alert @ {item.lowStockThreshold}</div>
                                        </td>
                                        <td className="py-2.5">
                                            <Badge className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border border-transparent shadow-sm ${
                                                item.status === 'In Stock' 
                                                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                                                    : item.status === 'Low Stock' 
                                                        ? 'bg-amber-100 text-amber-700 border-amber-200' 
                                                        : 'bg-rose-100 text-rose-700 border-rose-200'
                                            }`}>
                                                {item.status}
                                            </Badge>
                                        </td>
                                        <td className="pe-4 py-2.5 text-right">
                                            <Button 
                                                variant="light" 
                                                size="sm" 
                                                className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all border border-transparent hover:border-purple-100"
                                                onClick={() => window.location.href = `/admin/stock/adjustments?productId=${item.productId}&branchId=${item.branchId}`}
                                                title="Adjust Inventory"
                                            >
                                                <RefreshCcw size={14} />
                                            </Button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center">
                                            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-100">
                                                <Package className="text-gray-200" size={20} />
                                            </div>
                                            <h4 className="font-bold text-gray-800 text-sm">Quiet Moment</h4>
                                            <p className="text-[11px] text-gray-400 italic">No stock data found in this filter.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>

                {/* Pagination: Compact & Modern */}
                {!loading && pagination.total > 0 && (
                    <div className="bg-white border-t border-gray-50 px-4 py-2.5 flex items-center justify-between shadow-sm">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Showing <span className="text-gray-700">{((page - 1) * limit) + 1}-{Math.min(page * limit, pagination.total)}</span> of {pagination.total}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-1.5 rounded-md border border-gray-100 text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all shadow-sm"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <div className="px-3">
                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-tighter">Page {page} / {pagination.totalPages}</span>
                            </div>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={page >= pagination.totalPages}
                                className="p-1.5 rounded-md border border-gray-100 text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all shadow-sm"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default BranchStock;
