import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Key, 
  Lock, 
  Unlock, 
  Copy, 
  Check, 
  Cpu, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const SecurityLab = () => {
  // JWT Generator State
  const [jwtUserId, setJwtUserId] = useState('user-admin-1');
  const [jwtRole, setJwtRole] = useState('admin');
  const [jwtExpiresIn, setJwtExpiresIn] = useState('7d');
  const [generatedToken, setGeneratedToken] = useState('');
  const [tokenCopied, setTokenCopied] = useState(false);

  // JWT Decoder State
  const [tokenToVerify, setTokenToVerify] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);

  // Bcrypt State
  const [rawPassword, setRawPassword] = useState('secretPass123');
  const [saltRounds, setSaltRounds] = useState(10);
  const [hashResult, setHashResult] = useState(null);
  const [isHashing, setIsHashing] = useState(false);

  // Bcrypt Compare State
  const [comparePassword, setComparePassword] = useState('secretPass123');
  const [compareHash, setCompareHash] = useState('');
  const [compareResult, setCompareResult] = useState(null);

  // Generate JWT
  const handleGenerateJwt = async () => {
    try {
      const res = await fetch('/api/docs/lab/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: jwtUserId, role: jwtRole, expiresIn: jwtExpiresIn })
      });
      const data = await res.json();
      if (data.token) {
        setGeneratedToken(data.token);
        setTokenToVerify(data.token);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Verify JWT
  const handleVerifyJwt = async () => {
    if (!tokenToVerify.trim()) return;
    try {
      const res = await fetch('/api/docs/lab/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenToVerify.trim() })
      });
      const data = await res.json();
      setVerifyResult(data);
    } catch (e) {
      setVerifyResult({ valid: false, error: e.message });
    }
  };

  // Hash with Bcrypt
  const handleHashPassword = async () => {
    setIsHashing(true);
    const start = performance.now();
    try {
      const res = await fetch('/api/docs/lab/hash-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: rawPassword, rounds: saltRounds })
      });
      const data = await res.json();
      const end = performance.now();
      data.durationMs = Math.round(end - start);
      setHashResult(data);
      setCompareHash(data.hash);
    } catch (e) {
      console.error(e);
    } finally {
      setIsHashing(false);
    }
  };

  // Compare Bcrypt
  const handleCompareBcrypt = async () => {
    try {
      const res = await fetch('/api/docs/lab/hash-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: comparePassword, compareWithHash: compareHash })
      });
      const data = await res.json();
      const isMatch = data.compareResult?.includes('Match ✅');
      setCompareResult({
        isMatch,
        message: isMatch ? 'رمز عبور با موفقیت و درستی تطبیق داده شد (Password Matched)' : 'رمز عبور با رشته هش همخوانی ندارد (Invalid Password)'
      });
    } catch (e) {
      setCompareResult({ isMatch: false, message: e.message });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base">آزمایشگاه امنیت بک‌اند (JWT Tokens & Bcrypt Hashing Lab)</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              تولید، بازگشایی و اعتبارسنجی توکن‌های استاندارد JSON Web Token و تست هش امن Bcrypt با تعداد راندهای قابل تنظیم
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* JWT Generator Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Key className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm">تولیدکننده توکن JWT (Token Signer)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-mono block mb-1">شناسه کاربر (User ID):</label>
              <input
                type="text"
                value={jwtUserId}
                onChange={e => setJwtUserId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-mono block mb-1">نقش کاربری (Role):</label>
              <select
                value={jwtRole}
                onChange={e => setJwtRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-amber-500 focus:outline-none"
              >
                <option value="admin">admin (دسترسی کامل مدیریت)</option>
                <option value="user">user (دسترسی مشتری)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-mono block mb-1">مدت اعتبار (Expires In):</label>
              <select
                value={jwtExpiresIn}
                onChange={e => setJwtExpiresIn(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-amber-500 focus:outline-none"
              >
                <option value="1h">1 ساعت (1h)</option>
                <option value="1d">1 روز (1d)</option>
                <option value="7d">7 روز (7d)</option>
                <option value="30d">30 روز (30d)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerateJwt}
            className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Key className="w-4 h-4" />
            <span>امضا و صدور JWT توکن جدید (Sign Token)</span>
          </button>

          {generatedToken && (
            <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">توکن صادر شده (Bearer JWT):</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedToken);
                    setTokenCopied(true);
                    setTimeout(() => setTokenCopied(false), 2000);
                  }}
                  className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 px-2 py-1 rounded cursor-pointer"
                >
                  {tokenCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>کپی توکن</span>
                </button>
              </div>
              <p className="font-mono text-xs text-amber-300 break-all bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                {generatedToken}
              </p>
            </div>
          )}
        </div>

        {/* JWT Decoder & Verifier Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Unlock className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-sm">اعتبارسنج و دیکودر JWT (Token Verifier)</h3>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-mono block mb-1">متن توکن JWT برای اعتبارسنجی:</label>
            <textarea
              rows={3}
              value={tokenToVerify}
              onChange={e => setTokenToVerify(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <button
            onClick={handleVerifyJwt}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>بررسی امضا و دیکود محتوای توکن (Verify & Decode)</span>
          </button>

          {verifyResult && (
            <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                {verifyResult.valid ? (
                  <span className="flex items-center gap-1 text-emerald-400 text-xs font-mono">
                    <CheckCircle2 className="w-4 h-4" />
                    امضای توکن معتبر است (Signature Valid)
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-rose-400 text-xs font-mono">
                    <AlertCircle className="w-4 h-4" />
                    توکن نامعتبر یا منقضی شده است
                  </span>
                )}
              </div>
              <pre className="font-mono text-xs text-cyan-300 overflow-x-auto bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                {JSON.stringify(verifyResult.decoded || verifyResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Bcrypt Hashing Lab */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">تولید هش Bcrypt (Password Hasher)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-mono block mb-1">رمز عبور خام (Plain Password):</label>
              <input
                type="text"
                value={rawPassword}
                onChange={e => setRawPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-mono block mb-1">تعداد راندهای Salt (Salt Rounds):</label>
              <select
                value={saltRounds}
                onChange={e => setSaltRounds(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-emerald-500 focus:outline-none"
              >
                <option value={10}>10 راند (پیش‌فرض استاندارد)</option>
                <option value={11}>11 راند (امنیت بالاتر)</option>
                <option value={12}>12 راند (فوق امن)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleHashPassword}
            disabled={isHashing}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
          >
            {isHashing ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Cpu className="w-4 h-4" />
            )}
            <span>محاسبه هش یک‌طرفه با Bcrypt</span>
          </button>

          {hashResult && (
            <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>هش تولید شده (Bcrypt Hash):</span>
                <span className="text-cyan-400">⏱️ زمان محاسبه: {hashResult.durationMs} ms</span>
              </div>
              <p className="font-mono text-xs text-emerald-400 break-all bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                {hashResult.hash}
              </p>
            </div>
          )}
        </div>

        {/* Bcrypt Compare & Verify */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-white text-sm">تطبیق و راستی‌آزمایی رمز عبور (Bcrypt Compare)</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 font-mono block mb-1">رمز عبور ورودی (Entered Password):</label>
              <input
                type="text"
                value={comparePassword}
                onChange={e => setComparePassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-mono block mb-1">هش ذخیره شده در دیتابیس (Hashed String):</label>
              <input
                type="text"
                value={compareHash}
                onChange={e => setCompareHash(e.target.value)}
                placeholder="$2a$10$..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleCompareBcrypt}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>بررسی تطبیق هش با bcrypt.compare()</span>
          </button>

          {compareResult && (
            <div className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${
              compareResult.isMatch
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
            }`}>
              {compareResult.isMatch ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{compareResult.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
