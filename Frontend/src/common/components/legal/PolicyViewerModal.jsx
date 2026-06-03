import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { getPolicyContent } from '../../utils/legalUtils';

const PolicyViewerModal = ({ isOpen, onClose, policySlug, audience, title }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && policySlug) {
      const fetchPolicy = async () => {
        setLoading(true);
        const data = await getPolicyContent(policySlug, audience);
        if (data && data.content) {
          setContent(data.content);
        } else {
          setContent('<p>Content not available at the moment. Please contact support.</p>');
        }
        setLoading(false);
      };
      fetchPolicy();
    }
  }, [isOpen, policySlug, audience]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl relative z-10 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 dark:border-white/10 shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {title || 'Policy'}
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 bg-gray-100 dark:bg-white/5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-gray-50 dark:bg-slate-900/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-4">
              <Loader2 size={32} className="animate-spin text-[var(--saathi-green)]" />
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Loading document...</p>
            </div>
          ) : (
            <div 
              className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>
        
        <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-white/10 shrink-0 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-[var(--saathi-green)] text-white font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default PolicyViewerModal;
