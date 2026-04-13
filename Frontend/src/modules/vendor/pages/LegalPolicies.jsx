import React, { useState, useEffect } from 'react';
import { Shield, ChevronRight, FileText, Info } from 'lucide-react';
import { getPoliciesList, getPolicyContent } from '../../../common/utils/legalUtils';

const LegalPolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    const fetchList = async () => {
      const list = await getPoliciesList('Vendor');
      setPolicies(list);
      if (list.length > 0) {
        handleSelectPolicy(list[0].slug);
      }
      setLoading(false);
    };
    fetchList();
  }, []);

  const handleSelectPolicy = async (slug) => {
    setSelectedSlug(slug);
    setContentLoading(true);
    const data = await getPolicyContent(slug, 'Vendor');
    setContent(data);
    setContentLoading(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#0c831f] rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Policies...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium">
        <span>Dashboard</span>
        <ChevronRight size={14} className="text-gray-300" />
        <span className="text-gray-900 font-bold">Legal & Policies</span>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
          <Shield size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Vendor Policies</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Legal agreements and guidelines for Vendors.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
            <div className="divide-y divide-gray-100">
              {policies.map(p => (
                <button
                  key={p._id}
                  onClick={() => handleSelectPolicy(p.slug)}
                  className={`w-full flex items-center justify-between p-4 transition-colors ${
                    selectedSlug === p.slug 
                      ? 'bg-[#0c831f] text-white hover:bg-[#0a6b19]' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText size={18} className={selectedSlug === p.slug ? 'text-white/80' : 'text-[#0c831f]'} />
                    <span className="text-sm font-bold tracking-tight">{p.title}</span>
                  </div>
                  <ChevronRight size={16} className={selectedSlug === p.slug ? 'text-white/60' : 'text-gray-400'} />
                </button>
              ))}
              {policies.length === 0 && (
                <div className="p-6 text-center text-sm text-gray-500 font-medium">
                  No policies available.
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 flex gap-3 items-start border border-gray-100">
            <Info size={18} className="text-[#0c831f] shrink-0 mt-0.5" />
            <div>
              <h6 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-1">Need Help?</h6>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                If you have questions regarding these policies, please contact support.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[500px]">
            <div className="p-6 md:p-8">
              {contentLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-[#0c831f] rounded-full animate-spin mb-4"></div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fetching Content...</span>
                </div>
              ) : content ? (
                <div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{content.title}</h2>
                    <span className="inline-flex py-1 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-500">
                      Last Updated: {new Date(content.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-600 prose-headings:text-gray-900 prose-headings:font-bold prose-p:leading-relaxed">
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {content.content}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <FileText size={48} className="opacity-20 mb-4" />
                  <p className="text-sm font-bold text-gray-500">Select a policy to view content</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalPolicies;
