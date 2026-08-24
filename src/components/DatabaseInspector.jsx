import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Download, 
  RefreshCw, 
  FileJson, 
  ChevronRight, 
  Copy, 
  Check
} from 'lucide-react';

export const DatabaseInspector = () => {
  const [activeCollection, setActiveCollection] = useState('products');
  const [collectionData, setCollectionData] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [copied, setCopied] = useState(false);

  const collections = [
    { id: 'products', name: 'محصولات (products)', countKey: 'products' },
    { id: 'users', name: 'کاربران (users)', countKey: 'users' },
    { id: 'orders', name: 'سفارشات (orders)', countKey: 'orders' },
    { id: 'categories', name: 'دسته‌بندی‌ها (categories)', countKey: 'categories' },
    { id: 'carts', name: 'سبدهای خرید (carts)', countKey: 'carts' },
    { id: 'reviews', name: 'نظرات و امتیازات (reviews)', countKey: 'reviews' },
    { id: 'slides', name: 'اسلایدرها (slides)', countKey: 'slides' }
  ];

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/docs/metrics');
      const json = await res.json();
      setMetrics(json);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCollection = async (collName) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/docs/collections/${collName}`);
      const json = await res.json();
      if (json.documents) {
        setCollectionData(json.documents);
        setSelectedDoc(json.documents[0] || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchCollection(activeCollection);
  }, [activeCollection]);

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(collectionData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mongodb_${activeCollection}_collection.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredDocs = collectionData.filter(doc => {
    const jsonStr = JSON.stringify(doc).toLowerCase();
    return jsonStr.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base">بازرس پایگاه داده MongoDB (Collections & Schema Inspector)</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              مشاهده مستقیم اسناد ذخیره شده، ساختار Schema و کالکشن‌های دیتابیس در حافظه به همراه خروجی JSON
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchMetrics(); fetchCollection(activeCollection); }}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>بروزرسانی داده‌ها</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs px-3 py-2 rounded-xl transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>خروجی JSON کالکشن</span>
          </button>
        </div>
      </div>

      {/* Collection Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {collections.map(coll => {
          const isSelected = activeCollection === coll.id;
          const count = metrics?.counts?.[coll.countKey] ?? collectionData.length;
          return (
            <button
              key={coll.id}
              onClick={() => setActiveCollection(coll.id)}
              className={`p-3 rounded-xl border text-right transition flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-lg'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/60'
              }`}
            >
              <span className="text-xs font-mono font-medium truncate">{coll.name}</span>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">اسناد:</span>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-cyan-400'
                }`}>
                  {count}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Collection Viewer Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Document List */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="جستجو در اسناد این مجموعه..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <span className="text-xs font-mono text-slate-400 shrink-0">
              {filteredDocs.length} سند
            </span>
          </div>

          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {isLoading ? (
              <div className="text-center py-12 text-slate-500 font-mono text-xs">در حال بارگذاری اسناد...</div>
            ) : filteredDocs.length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-mono text-xs">هیچ سندی یافت نشد.</div>
            ) : (
              filteredDocs.map((doc, idx) => {
                const isSelected = selectedDoc?._id === doc._id;
                return (
                  <button
                    key={doc._id || idx}
                    onClick={() => setSelectedDoc(doc)}
                    className={`w-full text-right p-3 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-500/60 shadow-md'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="space-y-1 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono font-bold text-cyan-400">
                          {doc._id || `#${idx + 1}`}
                        </span>
                        {doc.role && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            doc.role === 'admin' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-700 text-slate-300'
                          }`}>
                            {doc.role}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-300 font-medium truncate">
                        {doc.title || doc.name || doc.orderNumber || doc.userName || JSON.stringify(doc).substring(0, 40)}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Document JSON & Schema Viewer */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileJson className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white text-sm font-mono">
                جزئیات سند انتخاب شده {selectedDoc?._id ? `(${selectedDoc._id})` : ''}
              </h3>
            </div>

            {selectedDoc && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selectedDoc, null, 2));
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg text-xs transition cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>کپی سند JSON</span>
              </button>
            )}
          </div>

          {selectedDoc ? (
            <div className="space-y-4">
              <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-cyan-300 overflow-x-auto max-h-[500px] leading-relaxed">
                {JSON.stringify(selectedDoc, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 font-mono text-xs">
              یک سند را از ستون کناری انتخاب کنید.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
