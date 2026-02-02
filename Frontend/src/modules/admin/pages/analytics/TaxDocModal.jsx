import React, { useEffect } from 'react';
import { X, FileText, Download, Printer, Eye } from 'lucide-react';

const TaxDocModal = ({ show, onHide, doc }) => {
    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [show]);

    if (!show || !doc) return null;

    return (
        <div className="fixed inset-0 z-[1060] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onHide}></div>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                    <h5 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <FileText size={20} className="text-primary" /> Tax Document
                    </h5>
                    <button onClick={onHide} className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 flex flex-col items-center justify-center text-center">
                        <FileText size={48} className="text-gray-300 mb-3" />
                        <h6 className="font-bold text-gray-700">{doc.id}_Report.pdf</h6>
                        <p className="text-sm text-gray-500 mb-0">Generated on {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="mb-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Filing Period</label>
                            <div className="font-medium text-gray-800">{doc.period}</div>
                        </div>
                        <div className="mb-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                            <div className={`font-medium ${doc.status === 'Filed' ? 'text-green-600' : 'text-amber-600'}`}>{doc.status}</div>
                        </div>
                        <div className="mb-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Taxable Amount</label>
                            <div className="font-medium text-gray-800">{doc.taxable}</div>
                        </div>
                        <div className="mb-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Tax Collected</label>
                            <div className="font-medium text-gray-800">{doc.gst}</div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        <Printer size={16} /> Print
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Download size={16} /> Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaxDocModal;
