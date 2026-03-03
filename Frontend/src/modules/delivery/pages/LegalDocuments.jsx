import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Shield, FileText, ChevronRight, Info } from 'lucide-react';
import { getPoliciesList, getPolicyContent } from '../../../common/utils/legalUtils';

const LegalDocuments = () => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchList = async () => {
      const list = await getPoliciesList('Delivery Partner');
      setPolicies(list);
      setLoading(false);
    };
    fetchList();
  }, []);

  const viewPolicy = async (slug) => {
    const data = await getPolicyContent(slug, 'Delivery Partner');
    setSelectedPage(data);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (selectedPage) {
    return (
      <div className="min-h-screen bg-white">
        <header className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center gap-4 z-40">
          <button onClick={() => setSelectedPage(null)} className="p-2 bg-gray-50 rounded-full">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-gray-900">{selectedPage.title}</h1>
        </header>
        <div className="p-5 overflow-y-auto">
          <div
            className="text-gray-700 leading-relaxed font-medium"
            style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}
          >
            {selectedPage.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 p-4 flex items-center gap-4 sticky top-0 z-40">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 rounded-full">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Legal & Privacy</h1>
      </header>

      <div className="p-4">
        <div className="bg-blue-600 rounded-2xl p-6 text-white mb-6 shadow-lg shadow-blue-900/10">
          <div className="flex items-center gap-3 mb-2">
            <Shield size={24} />
            <h2 className="text-xl font-bold">Partner Safety</h2>
          </div>
          <p className="text-blue-100 text-sm mb-0">Your privacy and security are important to us. Review our terms below.</p>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Available Documents</h3>
          {policies.map(p => (
            <button
              key={p._id}
              onClick={() => viewPolicy(p.slug)}
              className="w-full bg-white p-4 rounded-xl flex items-center justify-between border border-gray-100 shadow-sm active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <FileText size={18} />
                </div>
                <span className="font-bold text-gray-800 text-sm">{p.title}</span>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          ))}
          {policies.length === 0 && (
            <div className="text-center py-10 bg-white rounded-xl border border-dashed">
              <Info size={32} className="text-gray-300 mb-2 mx-auto" />
              <p className="text-gray-500 text-sm">No documents found.</p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center px-4">
          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
            Saathi-Grow Delivery Partner Ecosystem
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegalDocuments;
