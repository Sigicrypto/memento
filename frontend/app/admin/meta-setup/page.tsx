'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Copy, ArrowRight, ShieldCheck, AlertCircle, RefreshCw, KeyRound } from 'lucide-react';

const FacebookIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

function MetaSetupContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error_description') || searchParams.get('error');

  const [appId, setAppId] = useState('37500521126260508');
  const [appSecret, setAppSecret] = useState('625848f4b5a311b8276b1e2804882b9a');
  const [directTokenInput, setDirectTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(errorParam || null);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/admin/meta-setup` : 'http://localhost:3000/admin/meta-setup';

  // Load saved credentials from localStorage if available
  useEffect(() => {
    const savedAppId = localStorage.getItem('memento_meta_app_id');
    const savedAppSecret = localStorage.getItem('memento_meta_app_secret');
    if (savedAppId) setAppId(savedAppId);
    if (savedAppSecret) setAppSecret(savedAppSecret);
  }, []);

  // Handle OAuth redirect code exchange
  useEffect(() => {
    if (code) {
      const savedAppId = localStorage.getItem('memento_meta_app_id') || '37500521126260508';
      const savedAppSecret = localStorage.getItem('memento_meta_app_secret') || '625848f4b5a311b8276b1e2804882b9a';

      if (savedAppId && savedAppSecret) {
        handleExchangeCode(code, savedAppId, savedAppSecret);
      }
    }
  }, [code]);

  const handleSaveCredentials = () => {
    if (appId) localStorage.setItem('memento_meta_app_id', appId.trim());
    if (appSecret) localStorage.setItem('memento_meta_app_secret', appSecret.trim());
  };

  const handleStartOAuth = () => {
    if (!appId || !appSecret) {
      setError('Please enter both your Facebook App ID and Facebook App Secret.');
      return;
    }
    setError(null);
    handleSaveCredentials();

    const scope = 'public_profile,pages_show_list,pages_read_engagement,business_management';
    const oauthUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${appId.trim()}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(scope)}&response_type=code`;

    window.location.href = oauthUrl;
  };

  const handleExchangeCode = async (authCode: string, id: string, secret: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/meta/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: authCode,
          appId: id.trim(),
          appSecret: secret.trim(),
          redirectUri,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to exchange token');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDirectToken = async () => {
    if (!directTokenInput.trim()) {
      setError('Please paste an Access Token to verify.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/meta/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directToken: directTokenInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to verify token');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred during token verification');
    } finally {
      setLoading(false);
    }
  };

  const getEnvContent = () => {
    if (!result || !result.pages || result.pages.length === 0) return '';
    const selectedPage = result.pages[0];
    return `FACEBOOK_APP_ID=${appId.trim()}
FACEBOOK_APP_SECRET=${appSecret.trim()}
INSTAGRAM_BUSINESS_ACCOUNT_ID=${selectedPage.instagramId || '17841473910587567'}
META_PAGE_ACCESS_TOKEN=${selectedPage.pageToken}`;
  };

  const handleCopyEnv = () => {
    const text = getEnvContent();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="border-b border-slate-800 pb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-pink-500 text-white shadow-lg">
                <FacebookIcon className="w-6 h-6 inline-block" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Meta 1-Click Connection Helper</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Connect your Facebook Page & Instagram Business Account to automate posting for <span className="text-blue-400 font-medium">mymementoapp.com</span>
            </p>
          </div>
          <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-mono rounded-full">
            Memento Admin Tool
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-200">Connection Error</p>
              <p className="text-xs mt-1 text-red-300/80">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4 shadow-xl">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
            <h3 className="text-lg font-semibold">Inspecting & Extending Token with Meta...</h3>
            <p className="text-sm text-slate-400">Fetching your Facebook Pages & linked Instagram Business Accounts.</p>
          </div>
        )}

        {/* Result State */}
        {result && !loading && (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6 shadow-xl">
            <div className="flex items-center gap-3 text-emerald-400">
              <CheckCircle className="w-6 h-6 shrink-0" />
              <h2 className="text-lg font-bold text-white">Connected & Validated Successfully!</h2>
            </div>

            {result.pages && result.pages.length > 0 ? (
              <div className="space-y-4">
                {result.pages.map((page: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white flex items-center gap-2">
                        <FacebookIcon className="w-4 h-4 text-blue-400" /> {page.pageName}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Page ID: {page.pageId}</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                      <span className="text-xs text-slate-300 flex items-center gap-2">
                        <InstagramIcon className="w-4 h-4 text-pink-400" /> Linked Instagram ID:
                      </span>
                      <span className="text-xs font-mono text-pink-300 font-medium">
                        {page.instagramId || '17841473910587567 (Default Memento Instagram)'}
                      </span>
                    </div>
                  </div>
                ))}

                {/* ENV Box */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Your Ready Vercel Environment Variables:</span>
                    <button
                      onClick={handleCopyEnv}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md"
                    >
                      {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied to Clipboard!' : 'Copy snippet'}
                    </button>
                  </div>
                  <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-400 overflow-x-auto selection:bg-blue-500/30">
                    {getEnvContent()}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-sm text-amber-300">
                No Facebook Pages were found for this token.
              </p>
            )}

            <button
              onClick={() => setResult(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              🔄 Connect Another Account / Token
            </button>
          </div>
        )}

        {/* Step 1 & Step 2 Form */}
        {!result && !loading && (
          <div className="space-y-6">
            
            {/* Option 1: Direct Token Paste (Fastest) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-5 shadow-xl">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-400" /> Option A: Direct Token Paste & Auto-Converter (Fastest)
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Paste any Meta Access Token below (from Graph API Explorer or Meta Token tool). We will automatically inspect it, link your Instagram Business ID, and format your Vercel Environment Variables!
              </p>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Paste Meta Access Token here (starts with EA...)"
                  value={directTokenInput}
                  onChange={(e) => setDirectTokenInput(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500 transition-colors"
                />

                <button
                  onClick={handleVerifyDirectToken}
                  className="w-full py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <span>Verify Token & Generate Vercel Snippet</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Option 2: 1-Click OAuth Login */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl opacity-90">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" /> Option B: 1-Click Meta OAuth Login
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    1. Facebook App ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 37500521126260508"
                    value={appId}
                    onChange={(e) => {
                      setAppId(e.target.value);
                      if (e.target.value) localStorage.setItem('memento_meta_app_id', e.target.value.trim());
                    }}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    2. Facebook App Secret
                  </label>
                  <input
                    type="password"
                    placeholder="App Secret from Meta Developer Dashboard"
                    value={appSecret}
                    onChange={(e) => {
                      setAppSecret(e.target.value);
                      if (e.target.value) localStorage.setItem('memento_meta_app_secret', e.target.value.trim());
                    }}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-3">
                <button
                  onClick={handleStartOAuth}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 hover:from-blue-500 hover:to-pink-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01]"
                >
                  <span>Connect Facebook & Instagram via OAuth</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default function MetaSetupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-slate-100 p-12 text-center">Loading Helper...</div>}>
      <MetaSetupContent />
    </Suspense>
  );
}
