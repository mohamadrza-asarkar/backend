import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Terminal, 
  ShieldCheck, 
  Database, 
  FileCode, 
  Download, 
  RefreshCw, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

export const BackendHeader = ({
  activeTab,
  setActiveTab,
  token,
  currentUser,
  onLogout,
  onResetDb
}) => {
  const [serverHealth, setServerHealth] = useState('checking');
  const [uptime, setUptime] = useState(0);
  const [copiedLink, setCopiedLink] = useState(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          setServerHealth('online');
        } else {
          setServerHealth('error');
        }
      } catch {
        setServerHealth('error');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setUptime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + 'h ' : ''}${mins}m ${secs}s`;
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 text-slate-100">
      {/* Top status bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Server Info */}
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Server className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-white font-mono tracking-tight">Express REST API Server</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Node.js • JavaScript (ESM)
              </span>
            </div>
            <p className="text-xs text-slate-400">ساختار استاندارد ماژولار: پوشه مجزا برای هر روت، کنترلرها، اعتبارسنجی‌ها، مدل‌ها و میدلورها</p>
          </div>
        </div>

        {/* Server Metrics Quick Badges & Actions */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-slate-400">وضعیت سرور:</span>
            <span className={`font-semibold flex items-center gap-1 ${
              serverHealth === 'online' ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${serverHealth === 'online' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              {serverHealth === 'online' ? 'HTTP 200 OK' : 'در حال بررسی'}
            </span>
          </div>

          <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300">
            <span className="text-slate-400">آپتایم: </span>
            <span className="text-cyan-400">{formatUptime(uptime)}</span>
          </div>

          {/* Direct API Endpoints Links */}
          <a
            href="/api/docs/openapi.json"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 px-2.5 py-1.5 rounded-lg transition"
            title="مشاهده OpenAPI 3.0 JSON خام"
          >
            <span>OpenAPI.json</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <a
            href="/api/docs/postman.json"
            download="ecommerce_postman_collection.json"
            className="flex items-center gap-1 bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-700/50 px-2.5 py-1.5 rounded-lg transition"
            title="دانلود کالکشن پست‌من"
          >
            <Download className="w-3 h-3" />
            <span>Postman v2.1</span>
          </a>

          <button
            onClick={onResetDb}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
            title="بازنشانی پایگاه‌داده به مقادیر اولیه"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset DB</span>
          </button>
        </div>
      </div>

      {/* Auth Status & Quick Token Bar */}
      <div className="bg-slate-950/80 border-t border-slate-800/60 px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-mono">وضعیت احراز هویت:</span>
          {token ? (
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded font-mono font-medium ${
                currentUser?.role === 'admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                نقش: {currentUser?.role === 'admin' ? '👑 ادمین (Admin)' : '👤 کاربر (User)'} • {currentUser?.email}
              </span>
              <button
                onClick={() => copyToClipboard(`Bearer ${token}`, 'token')}
                className="flex items-center gap-1 text-slate-400 hover:text-slate-200 bg-slate-800 px-2 py-0.5 rounded"
              >
                {copiedLink === 'token' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>کپی هدر Bearer</span>
              </button>
              <button
                onClick={onLogout}
                className="text-rose-400 hover:text-rose-300 underline mr-2"
              >
                خروج از حساب
              </button>
            </div>
          ) : (
            <span className="text-slate-400 font-mono">بدون توکن (مهمان) - برای تست روت‌های ادمین وارد شوید</span>
          )}
        </div>

        <div className="font-mono text-slate-500">
          پورت اصلی: <span className="text-emerald-400">:3000/api</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto space-x-1 space-x-reverse border-t border-slate-800/80">
        <button
          onClick={() => setActiveTab('api')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition ${
            activeTab === 'api'
              ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>کاوشگر و تست زنده API</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition ${
            activeTab === 'database'
              ? 'border-cyan-500 text-cyan-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>بازرس دیتابیس MongoDB</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition ${
            activeTab === 'security'
              ? 'border-amber-500 text-amber-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>آزمایشگاه امنیت (JWT & Bcrypt)</span>
        </button>

        <button
          onClick={() => setActiveTab('monitoring')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition ${
            activeTab === 'monitoring'
              ? 'border-purple-500 text-purple-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>مانیتورینگ سرور و لاگ‌ها</span>
        </button>

        <button
          onClick={() => setActiveTab('source')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition ${
            activeTab === 'source'
              ? 'border-blue-500 text-blue-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>سورس‌کد کامل بک‌اند (JavaScript)</span>
        </button>

        <button
          onClick={() => setActiveTab('deployment')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition ${
            activeTab === 'deployment'
              ? 'border-teal-500 text-teal-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>راهنمای راه‌اندازی و داکر</span>
        </button>
      </div>
    </header>
  );
};
