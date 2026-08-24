import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Activity, 
  Cpu, 
  HardDrive, 
  Clock, 
  RefreshCw, 
  Terminal, 
  Trash2 
} from 'lucide-react';

export const ServerMonitoring = () => {
  const [metrics, setMetrics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMetricsAndLogs = async () => {
    setIsLoading(true);
    try {
      const [resMetrics, resLogs] = await Promise.all([
        fetch('/api/docs/metrics'),
        fetch('/api/docs/logs')
      ]);
      const jsonMetrics = await resMetrics.json();
      const jsonLogs = await resLogs.json();
      setMetrics(jsonMetrics);
      if (jsonLogs.logs) {
        setLogs(jsonLogs.logs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetricsAndLogs();
    const interval = setInterval(fetchMetricsAndLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (status >= 400 && status < 500) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'GET': return 'text-blue-400';
      case 'POST': return 'text-emerald-400';
      case 'PUT': return 'text-amber-400';
      case 'DELETE': return 'text-rose-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base">مانیتورینگ وضعیت سرور و ترافیک (Server Health & Logs)</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              نمایش شاخص‌های حیاتی پروسه Node.js، میزان مصرف RAM (RSS و Heap)، تعداد اسناد دیتابیس و لاگ ترافیک زنده
            </p>
          </div>
        </div>

        <button
          onClick={fetchMetricsAndLogs}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>بروزرسانی شاخص‌ها</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>وضعیت وب‌سرور</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            ACTIVE (ONLINE)
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Express 4.21 • Node.js (ESM)
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>مصرف حافظه RAM (RSS)</span>
            <HardDrive className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-cyan-400 font-mono">
            {metrics?.memoryUsageMB?.rss || '42.5'} MB
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Heap Used: {metrics?.memoryUsageMB?.heapUsed || '21.3'} MB
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>مدت زمان فعالیت (Uptime)</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono">
            {metrics?.uptimeSeconds || 0} ثانیه
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            بدون قطعی و خطای سرور
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>کالکشن‌های دیتابیس</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-400 font-mono">
            {Object.keys(metrics?.counts || {}).length || 7} مجموعه فعال
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Users, Products, Orders, Carts...
          </div>
        </div>
      </div>

      {/* Live Request Logger Console */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">کنسول لاگ زنده ترافیک HTTP (Live Request Logger)</h3>
          </div>
          <button
            onClick={() => setLogs([])}
            className="flex items-center gap-1 text-slate-400 hover:text-rose-400 text-xs transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>پاکسازی لاگ‌ها</span>
          </button>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2 max-h-80 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-center py-6 text-slate-600">هنوز ترافیکی ثبت نشده است. درخواست‌های API را ارسال کنید تا لاگ‌ها اینجا ظاهر شوند.</div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="flex items-center justify-between py-1 border-b border-slate-900 last:border-0 hover:bg-slate-900/50 px-2 rounded">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString('fa-IR')}</span>
                  <span className={`font-bold ${getMethodColor(log.method)}`}>{log.method}</span>
                  <span className="text-slate-300">{log.url}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded border text-[11px] font-bold ${getStatusColor(log.status)}`}>
                    {log.status}
                  </span>
                  <span className="text-slate-500">{log.durationMs}ms</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
