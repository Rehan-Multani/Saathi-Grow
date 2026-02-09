import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, Download, ArrowRight, FileSpreadsheet, Info, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BulkUpload = () => {
    const navigate = useNavigate();
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [step, setStep] = useState(1);

    const handleFile = (file) => {
        if (file.type === "text/csv" || file.name.endsWith('.xlsx')) {
            setFile(file);
            setStep(2);
        } else {
            alert("Please upload a CSV or Excel file");
        }
    };

    return (
        <div className="min-h-screen bg-white pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/vendor/products')} className="p-1.5 hover:bg-gray-100 rounded-lg md:hidden">
                        <ArrowRight className="rotate-180" size={18} />
                    </button>
                    <div>
                        <h1 className="text-base font-bold text-gray-900 tracking-tight">Bulk upload products</h1>
                        <p className="text-[10px] text-gray-500 font-medium">Import items quickly via CSV or Excel</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-600 hover:bg-gray-100 transition-all">
                        <Download size={12} /> Download template
                    </button>
                    {step > 1 && (
                        <button onClick={() => setStep(1)} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-500 hover:bg-gray-50 transition-all">
                            Reset
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
                {/* Steps Navigator */}
                <div className="flex items-center gap-4 mb-4 overflow-x-auto pb-1 no-scrollbar border-b border-gray-50">
                    {[
                        { id: 1, label: 'Upload file' },
                        { id: 2, label: 'Preview' },
                        { id: 3, label: 'Done' }
                    ].map((s, i) => (
                        <div key={s.id} className="flex items-center gap-2 shrink-0 pb-1.5 relative">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${step >= s.id ? 'bg-[#0c831f] text-white shadow-sm' : 'bg-gray-100 text-gray-400'}`}>
                                {s.id}
                            </div>
                            <span className={`text-[10px] font-bold tracking-tight ${step >= s.id ? 'text-gray-900' : 'text-gray-400'}`}>
                                {s.label}
                            </span>
                            {i < 2 && <div className={`w-6 h-[1px] ${step > s.id ? 'bg-[#0c831f]' : 'bg-gray-200'}`} />}
                        </div>
                    ))}
                </div>

                <div className="space-y-4">
                    {step === 1 && (
                        <div className="space-y-3">
                            <div
                                className={`w-full py-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${dragActive ? 'bg-green-50 border-[#0c831f]/30' : 'bg-gray-50/50 border-gray-100 hover:border-gray-200'
                                    }`}
                                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                                onDragLeave={() => setDragActive(false)}
                                onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files[0]); }}
                                onClick={() => document.getElementById('file-upload').click()}
                            >
                                <input id="file-upload" type="file" className="hidden" accept=".csv,.xlsx" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#0c831f] mb-3 shadow-sm">
                                    <FileSpreadsheet size={20} />
                                </div>
                                <p className="text-xs font-bold text-gray-800 mb-0.5">Click to browse or drag and drop</p>
                                <p className="text-[10px] text-gray-400">Supported types: .csv, .xlsx (max 5MB)</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {[
                                    { title: 'Data format', desc: 'Ensure mandatory fields (SKU, Price, Category) are filled.', icon: Info },
                                    { title: 'Image support', desc: 'Provide public URLs for product images in the sheet.', icon: FileText },
                                    { title: 'Limit', desc: 'Maximum 500 products per upload for best performance.', icon: CheckCircle2 }
                                ].map((box, i) => (
                                    <div key={i} className="bg-white p-3 rounded-lg border border-gray-50 flex items-start gap-3">
                                        <div className="w-7 h-7 shrink-0 rounded-md bg-green-50 text-[#0c831f] flex items-center justify-center mt-0.5">
                                            <box.icon size={14} />
                                        </div>
                                        <div>
                                            <h4 className="text-[11px] font-bold text-gray-700 tracking-tight">{box.title}</h4>
                                            <p className="text-[10px] text-gray-500 font-medium leading-tight">{box.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                            <div className="p-3 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white border border-gray-100 rounded-md flex items-center justify-center text-gray-400 shadow-sm">
                                        <FileText size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-800">{file?.name}</p>
                                        <p className="text-[9px] text-gray-400 font-bold tracking-tight">Ready to import • {(file?.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>
                                <button onClick={() => setStep(3)} className="px-4 py-1.5 bg-[#0c831f] text-white rounded-lg text-xs font-bold hover:bg-[#0a6b19] transition-all flex items-center gap-2 shadow-md shadow-green-900/10">
                                    Continue <ArrowRight size={12} />
                                </button>
                            </div>

                            <div className="overflow-x-manual overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            {['SKU', 'Product name', 'Category', 'Price', 'Stocks'].map(h => (
                                                <th key={h} className="px-4 py-2.5 text-[9px] font-bold text-gray-400 tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="text-[11px] font-medium text-gray-600">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                                <td className="px-4 py-2.5 text-gray-400 font-mono">SG-B-{i + 100}</td>
                                                <td className="px-4 py-2.5 font-bold text-gray-800">Sample row {i} - Bulk item</td>
                                                <td className="px-4 py-2.5 text-gray-500">Groceries</td>
                                                <td className="px-4 py-2.5 font-bold">₹199.00</td>
                                                <td className="px-4 py-2.5">
                                                    <span className="px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded-[4px] text-[8px] font-bold tracking-tighter">VALID</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="bg-white py-12 px-6 rounded-xl border border-gray-100 flex flex-col items-center text-center space-y-4">
                            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-[#0c831f] shadow-inner">
                                <CheckCircle2 size={24} />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-base font-bold text-gray-900">Import successful!</h2>
                                <p className="text-[11px] text-gray-500 max-w-[240px] leading-relaxed mx-auto">Your items have been added to the catalog and will be visible shortly.</p>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button onClick={() => setStep(1)} className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100">
                                    Upload another
                                </button>
                                <button onClick={() => navigate('/vendor/products')} className="px-4 py-2 bg-[#0c831f] text-white rounded-lg text-xs font-bold hover:bg-[#0a6b19] shadow-sm">
                                    Go to catalog
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkUpload;
