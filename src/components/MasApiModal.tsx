import React, { useState } from 'react';
import { Copy, Check, Terminal, ExternalLink, ShieldCheck, Database, Key, Play, Activity } from 'lucide-react';

export const MasApiModal: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [keyId, setKeyId] = useState<string>(() => {
    return localStorage.getItem('mas_key_id') || '';
  });
  const [queryDate, setQueryDate] = useState<string>('2026-10-14');
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [healthResult, setHealthResult] = useState<any>(null);

  const handleSaveKey = () => {
    localStorage.setItem('mas_key_id', keyId);
  };

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const testHealthEndpoint = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealthResult(data);
    } catch (err: any) {
      setHealthResult({ error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const testExchangeRatesEndpoint = async () => {
    setIsLoading(true);
    setTestResult(null);
    try {
      const headers: Record<string, string> = {};
      if (keyId.trim()) {
        headers['KeyId'] = keyId.trim();
      }

      const res = await fetch(`/api/exchangerates?end_of_day=${encodeURIComponent(queryDate)}`, {
        headers,
      });
      const data = await res.json();
      setTestResult({ status: res.status, ok: res.ok, body: data });
    } catch (err: any) {
      setTestResult({ error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const curlExample = `curl -X GET "https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily?end_of_day=2026-10-14" \\
  -H "KeyId: <YOUR_MAS_KEY_ID>" \\
  -H "Accept: application/json"`;

  const serverlessRouteInfo = `// /api/exchangerates.ts
GET /api/exchangerates?end_of_day=2026-10-14
Headers:
  KeyId: <MAS_KEY_ID> (or configured via process.env.MAS_KEY_ID)`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Intro Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>MAS API Catalogue</span>
              <span aria-hidden="true">·</span>
              <span>Serverless Connection at /api</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              MAS Exchange Rates Serverless API Architecture
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Serverless functions located in the project root <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">/api</code> directory connecting to the Monetary Authority of Singapore API Catalogue endpoint.
            </p>
          </div>

          <a
            href="https://eservices.mas.gov.sg/apimg-gw/"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 whitespace-nowrap"
          >
            <span>MAS API Gateway</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>

        {/* Directory Blueprint */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-900 font-mono block mb-1">/api/health.ts</span>
            <p className="text-slate-600">
              Health check and service status endpoint. Verifies server status and configuration readiness.
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-900 font-mono block mb-1">/api/exchangerates.ts</span>
            <p className="text-slate-600">
              Connects to MAS API Catalogue with query date and <code className="font-mono">KeyId</code> header.
            </p>
          </div>
        </div>
      </div>

      {/* Upstream MAS Catalogue Spec */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              Live Upstream MAS Endpoint
            </h3>
          </div>
          <button
            onClick={() => copyToClipboard(curlExample, 'curl')}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 cursor-pointer"
          >
            {copiedSection === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy cURL</span>
          </button>
        </div>

        <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
          <div className="text-emerald-400 font-bold mb-1">GET</div>
          <div className="text-slate-300 break-all mb-2">
            https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily?end_of_day=2026-10-14
          </div>
          <div className="text-slate-400"># Header: KeyId: &lt;MAS_KEY_ID&gt;</div>
        </div>
      </div>

      {/* Interactive Serverless Sandbox */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              Serverless API Tester (/api/exchangerates)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            Keys are never hardcoded; enter or set in .env
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              MAS KeyId (Header: KeyId)
            </label>
            <input
              type="password"
              placeholder="Paste MAS KeyId to test (or configure MAS_KEY_ID in .env)"
              value={keyId}
              onChange={(e) => {
                setKeyId(e.target.value);
                handleSaveKey();
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-hidden focus:bg-white focus:border-slate-400"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Date (end_of_day)
            </label>
            <input
              type="date"
              value={queryDate}
              onChange={(e) => setQueryDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-hidden focus:bg-white focus:border-slate-400"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={testExchangeRatesEndpoint}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isLoading ? 'Querying...' : 'Test /api/exchangerates'}</span>
          </button>

          <button
            onClick={testHealthEndpoint}
            disabled={isLoading}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Activity className="w-3.5 h-3.5 text-slate-600" />
            <span>Check /api/health</span>
          </button>
        </div>

        {/* Health result display */}
        {healthResult && (
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono">
            <span className="text-[11px] text-slate-500 block mb-1 font-sans font-semibold">
              Health Check Response:
            </span>
            <pre className="text-slate-800 overflow-x-auto text-[11px]">
              {JSON.stringify(healthResult, null, 2)}
            </pre>
          </div>
        )}

        {/* Test Result Display */}
        {testResult && (
          <div className="p-4 bg-slate-900 text-slate-200 rounded-lg text-xs font-mono overflow-x-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 font-sans">
              <span className="font-semibold text-white">
                Status: {testResult.status || 'Response'} {testResult.ok ? '✓' : ''}
              </span>
              <button
                onClick={() => copyToClipboard(JSON.stringify(testResult, null, 2), 'result')}
                className="text-[11px] text-slate-400 hover:text-white"
              >
                {copiedSection === 'result' ? 'Copied' : 'Copy Response'}
              </button>
            </div>
            <pre className="text-[11px] leading-relaxed max-h-80 overflow-y-auto">
              {JSON.stringify(testResult.body || testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
