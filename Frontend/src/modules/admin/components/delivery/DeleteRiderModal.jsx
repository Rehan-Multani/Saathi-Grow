import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Trash2, Loader2 } from 'lucide-react';

const DeleteRiderModal = ({ show, onHide, riderName, onConfirm, loading = false }) => {
    const [confirmText, setConfirmText] = useState('');

    useEffect(() => {
        if (show) setConfirmText('');
    }, [show]);

    if (!show) return null;

    const canDelete = confirmText.trim().toUpperCase() === 'DELETE';

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!canDelete || loading) return;
        onConfirm();
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={loading ? undefined : onHide}
            />

            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-sm">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Remove Rider?</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 italic">This action cannot be undone</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onHide}
                        disabled={loading}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                        Do you want to remove{' '}
                        <span className="font-bold text-slate-900 uppercase">{riderName}</span>{' '}
                        from the fleet?
                    </p>

                    <div className="space-y-2">
                        <p className="text-[11px] font-bold text-rose-600 uppercase tracking-widest">
                            Type <span className="font-mono tracking-wider">DELETE</span> to confirm
                        </p>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="Type DELETE"
                            autoFocus
                            autoCapitalize="off"
                            autoComplete="off"
                            spellCheck={false}
                            disabled={loading}
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-rose-400 focus:bg-white transition-all text-sm font-bold text-slate-800 text-center font-mono tracking-widest shadow-inner"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onHide}
                            disabled={loading}
                            className="flex-1 py-3.5 text-slate-500 font-bold text-[10px] uppercase tracking-widest bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!canDelete || loading}
                            className={`flex-1 py-3.5 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border-none transition-all ${
                                canDelete && !loading
                                    ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-100'
                                    : 'bg-rose-200 text-white cursor-not-allowed'
                            }`}
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            Delete
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DeleteRiderModal;
