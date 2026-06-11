import React, { useState, useEffect } from 'react';
import { getProducts } from '../../../modules/admin/api/productApi';
import { getAllOrdersAdmin } from '../../../modules/admin/api/orderApi';
import { Download, RefreshCw, FileText, ShoppingCart, Package } from 'lucide-react';
import * as XLSX from 'xlsx';
import { downloadCSV } from '../../utils/formatUtils';

const VyaparReport = ({ token }) => {
    const [data, setData] = useState([]);
    const [reportType, setReportType] = useState('catalog'); // 'catalog' or 'sales'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (reportType === 'catalog') {
                const result = await getProducts(token, { limit: 5000, page: 1 });
                setData(result.products || (Array.isArray(result) ? result : []));
            } else {
                // Today's Sales
                const today = new Date().toISOString().split('T')[0];
                const result = await getAllOrdersAdmin({ startDate: today, endDate: today, limit: 1000 });
                
                // Aggregate items from orders
                const orders = result.orders || (Array.isArray(result) ? result : []);
                const itemsMap = {};
                
                orders.forEach(order => {
                    order.items.forEach(item => {
                        const id = item.productId || item._id;
                        if (!itemsMap[id]) {
                            itemsMap[id] = {
                                ...item,
                                name: item.name,
                                sku: item.sku || '',
                                quantity: 0,
                                totalRevenue: 0,
                                productRef: item.product // Store product ref for details if needed
                            };
                        }
                        itemsMap[id].quantity += item.quantity;
                        itemsMap[id].totalRevenue += item.price * item.quantity;
                    });
                });
                setData(Object.values(itemsMap));
            }
            setError(null);
        } catch (err) {
            console.error('Failed to load Vyapar Report data', err);
            setError('Failed to load report data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token, reportType]);

    const formatData = () => {
        return data.map(item => {
            // For catalog mode, item is the product. For sales mode, item is aggregated from orders.
            const mrp = item.mrp || item.price || 0;
            const basePrice = item.basePrice || item.price || 0;
            const discountPercent = mrp > 0 && mrp > basePrice 
                ? ((mrp - basePrice) / mrp * 100).toFixed(2) 
                : 0;

            let currentStock = item.stock || 0;
            let minStock = item.lowStockThreshold || 0;
            
            // Extract branch-specific stock if available (for branch managers)
            if (item.branchStocks && item.branchStocks.length > 0) {
                currentStock = item.branchStocks[0].stock || 0;
                minStock = item.branchStocks[0].lowStockThreshold || 0;
            }

            // In sales mode, quantity sold overrides
            if (item.quantity !== undefined) {
                currentStock = item.quantity;
            }

            return {
                'Item name*': item.name || '',
                'Item code': item.sku || item.itemCode || '',
                'Category': item.category?.name || item.category || '',
                'HSN': item.hsnCode || '',
                'Default Mrp': mrp,
                'Sale price': basePrice,
                'Purchase price': item.purchasePrice || 0,
                'Discount Type': 'Discount %',
                'Sale Discount': discountPercent,
                'Current stock': currentStock,
                'Minimum stock': minStock,
                'Item Location': item.physicalLocation || '0',
                'Tax Rate': 0,
                'Inclusive Of Tax': '0',
                'Base Unit (x)': item.unitType || '',
                'Secondary Unit': '',
                'Conversion Rate (n)': item.unitValue || ''
            };
        });
    };

    const handleExportExcel = () => {
        const formattedData = formatData();
        const ws = XLSX.utils.json_to_sheet(formattedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        const filename = reportType === 'catalog' ? "Vyapar_Item_List.xlsx" : `Vyapar_Daily_Sales_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        downloadCSV(blob, filename);
    };

    return (
        <div className="p-6 bg-slate-50 h-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Vyapar Report</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {reportType === 'catalog' ? 'Export your complete product catalog' : 'Export items sold today'} in Vyapar format
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    {/* Report Type Toggle */}
                    <div className="flex bg-slate-200 p-1 rounded-xl">
                        <button 
                            onClick={() => setReportType('catalog')}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${reportType === 'catalog' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Package size={14} /> Catalog
                        </button>
                        <button 
                            onClick={() => setReportType('sales')}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${reportType === 'sales' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <ShoppingCart size={14} /> Daily Sales
                        </button>
                    </div>

                    <button 
                        onClick={fetchData}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button 
                        onClick={handleExportExcel}
                        disabled={loading || data.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        <Download size={18} />
                        Export
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-3 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-red-600"></div>
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col min-h-0">
                {loading ? (
                    <div className="py-20 text-center text-slate-500 flex-1 flex flex-col justify-center items-center">
                        <RefreshCw size={32} className="animate-spin mx-auto mb-4 text-blue-600" />
                        <p className="text-lg font-medium">Loading {reportType === 'catalog' ? 'catalog' : 'sales'} data...</p>
                        <p className="text-sm text-slate-400">This might take a moment depending on your catalog size</p>
                    </div>
                ) : data.length === 0 ? (
                    <div className="py-20 text-center text-slate-500 flex-1 flex flex-col justify-center items-center">
                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText size={32} className="text-slate-400" />
                        </div>
                        <p className="text-lg font-medium text-slate-700">No data found</p>
                        <p className="text-sm text-slate-400 mt-1">We couldn't find any {reportType === 'catalog' ? 'products' : 'sales'} for this report.</p>
                        {reportType === 'sales' && (
                            <button 
                                onClick={() => setReportType('catalog')}
                                className="mt-4 text-blue-600 font-medium hover:underline text-sm"
                            >
                                Check full catalog instead
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left text-sm whitespace-nowrap relative">
                            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-6 py-4">Item name*</th>
                                    <th className="px-6 py-4">Item code</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">HSN</th>
                                    <th className="px-6 py-4">Default Mrp</th>
                                    <th className="px-6 py-4">Sale price</th>
                                    <th className="px-6 py-4">Purchase price</th>
                                    <th className="px-6 py-4">Discount Type</th>
                                    <th className="px-6 py-4">Sale Discount</th>
                                    <th className="px-6 py-4">{reportType === 'catalog' ? 'Current stock' : 'Qty Sold'}</th>
                                    <th className="px-6 py-4">Minimum stock</th>
                                    <th className="px-6 py-4">Item Location</th>
                                    <th className="px-6 py-4">Tax Rate</th>
                                    <th className="px-6 py-4">Inclusive Of Tax</th>
                                    <th className="px-6 py-4">Base Unit (x)</th>
                                    <th className="px-6 py-4">Secondary Unit</th>
                                    <th className="px-6 py-4">Conversion Rate (n)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {formatData().map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-3 font-medium text-slate-800">{row['Item name*']}</td>
                                        <td className="px-6 py-3 text-slate-600">{row['Item code']}</td>
                                        <td className="px-6 py-3 text-slate-600">{row['Category']}</td>
                                        <td className="px-6 py-3 text-slate-600">{row['HSN']}</td>
                                        <td className="px-6 py-3 text-slate-600">{row['Default Mrp']}</td>
                                        <td className="px-6 py-3 text-slate-600">{row['Sale price']}</td>
                                        <td className="px-6 py-3 text-slate-600">{row['Purchase price']}</td>
                                        <td className="px-6 py-3 text-slate-600">{row['Discount Type']}</td>
                                        <td className="px-6 py-3 text-slate-600">{row['Sale Discount']}</td>
                                        <td className="px-6 py-3 text-slate-600">{row['Current stock']}</td>
                                        <td className="px-6 py-3 text-slate-600">{row['Minimum stock']}</td>
                                        <td className="px-6 py-3 text-slate-600">{row['Item Location']}</td>
                                        <td className="px-6 py-3 text-slate-600">{row['Tax Rate']}</td>
                                        <td className="px-6 py-3 text-slate-600">{row['Inclusive Of Tax']}</td>
                                        <td className="px-6 py-3 text-slate-600">{row['Base Unit (x)']}</td>
                                        <td className="px-6 py-3 text-slate-600">{row['Secondary Unit']}</td>
                                        <td className="px-6 py-3 text-slate-600">{row['Conversion Rate (n)']}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default VyaparReport;
