import React, { useState } from 'react';
import { BackendHeader } from './components/BackendHeader.jsx';
import { ApiWorkbench } from './components/ApiWorkbench.jsx';
import { DatabaseInspector } from './components/DatabaseInspector.jsx';
import { SecurityLab } from './components/SecurityLab.jsx';
import { ServerMonitoring } from './components/ServerMonitoring.jsx';
import { SourceCodeExplorer } from './components/SourceCodeExplorer.jsx';
import { DeploymentGuide } from './components/DeploymentGuide.jsx';

export function App() {
  const [activeTab, setActiveTab] = useState('api');
  const [token, setToken] = useState(() => localStorage.getItem('backend_auth_token'));
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('backend_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleSetToken = (newToken, user) => {
    setToken(newToken);
    setCurrentUser(user);
    localStorage.setItem('backend_auth_token', newToken);
    localStorage.setItem('backend_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('backend_auth_token');
    localStorage.removeItem('backend_user');
  };

  const handleResetDb = async () => {
    if (!window.confirm('آیا از بازنشانی داده‌های دیتابیس به مقادیر اولیه اطمینان دارید؟')) return;
    try {
      const res = await fetch('/api/docs/reset-db', { method: 'POST' });
      const data = await res.json();
      alert(data.message || 'پایگاه داده بازنشانی شد.');
      window.location.reload();
    } catch (e) {
      alert('خطا در بازنشانی دیتابیس');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Backend Top Console Header */}
      <BackendHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        token={token}
        currentUser={currentUser}
        onLogout={handleLogout}
        onResetDb={handleResetDb}
      />

      {/* Main View Area */}
      <main className="pb-16">
        {activeTab === 'api' && (
          <ApiWorkbench token={token} onSetToken={handleSetToken} />
        )}

        {activeTab === 'database' && (
          <DatabaseInspector />
        )}

        {activeTab === 'security' && (
          <SecurityLab />
        )}

        {activeTab === 'monitoring' && (
          <ServerMonitoring />
        )}

        {activeTab === 'source' && (
          <SourceCodeExplorer />
        )}

        {activeTab === 'deployment' && (
          <DeploymentGuide />
        )}
      </main>

      {/* Developer Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            🚀 Node.js Express REST API Server • ES Modules • MongoDB Ready • Clean Modular Structure
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <a href="/api/health" target="_blank" rel="noreferrer" className="hover:text-emerald-400">/api/health</a>
            <a href="/api/docs/openapi.json" target="_blank" rel="noreferrer" className="hover:text-cyan-400">/api/docs/openapi.json</a>
            <a href="/api/docs/postman.json" target="_blank" rel="noreferrer" className="hover:text-amber-400">/api/docs/postman.json</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
