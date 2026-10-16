import React, { useState } from 'react';
import { Copy, Check, Terminal, ExternalLink, ShieldCheck, Database, Key } from 'lucide-react';

export const MasApiModal: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('mas_api_key') || '';
  });
  const [testStatus, setTestStatus] = useState<'idle' | 'success'>('idle');

  const handleSaveKey = () => {
    localStorage.setItem('mas_api_key', apiKey);
    setTestStatus('success');
    setTimeout(() => setTestStatus('idle'), 2500);
  };

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const expressProxySnippet = `// server.ts (Express proxy snippet ready for MAS API integration)
import express from 'express';
import axios from 'axios';

const app = express();
const MAS_API_KEY = process.env.MAS_API_KEY || '';
const MAS_RESOURCE_ID = '225b4486-4529-4118-8881-4299b90c1f59';

let cachedRates = null;
let lastFetch = 0;

app.get('/api/mas/rates', async (req, res) => {
  try {
    const now = Date.now();
    // Cache for 15 minutes to avoid hitting MAS rate limits
    if (cachedRates && (now - lastFetch < 15 * 60 * 1000)) {
      return res.json({ success: true, cached: true, data: cachedRates });
    }

    const response = await axios.get('https://eservices.mas.gov.sg/api/action/datastore/search.json', {
      params: {
        resource_id: MAS_RESOURCE_ID,
        limit: 1,
        sort: 'end_of_day desc'
      },
      headers: {
        ...(MAS_API_KEY ? { 'apikey': MAS_API_KEY } : {})
      }
    });

    const record = response.data.result.records[0];
    cachedRates = record;
    lastFetch = now;
    
    return res.json({ success: true, data: record });
  } catch (error) {
    console.error('Error fetching MAS rates:', error);
    res.status(500).json({ error: 'Failed to fetch MAS exchange rates' });
  }
});`;

  const sampleJsonResponse = `{
  "help": "https://eservices.mas.gov.sg/api/action/help_show",
  "success": true,
  "result": {
    "resource_id": "225b4486-4529-4118-8881-4299b90c1f59",
    "fields": [
      { "id": "end_of_day", "type": "date" },
      { "id": "usd_sgd", "type": "numeric" },
      { "id": "myr_sgd_100", "type": "numeric" },
      { "id": "jpy_sgd_100", "type": "numeric" },
      { "id": "eur_sgd", "type": "numeric" },
      { "id": "gbp_sgd", "type": "numeric" },
      { "id": "aud_sgd", "type": "numeric" },
      { "id": "thb_sgd_100", "type": "numeric" },
      { "id": "idr_sgd_100", "type": "numeric" },
      { "id": "cny_sgd_100", "type": "numeric" }
    ],
    "records": [
      {
        "end_of_day": "2026-10-15",
        "usd_sgd": "1.3465",
        "myr_sgd_100": "30.12",
        "jpy_sgd_100": "0.8760",
        "eur_sgd": "1.4580",
        "gbp_sgd": "1.7120",
        "aud_sgd": "0.8790",
        "thb_sgd_100": "3.78",
        "idr_sgd_100": "0.00845",
        "cny_sgd_100": "18.56"
      }
    ]
  }
}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Intro Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Integration Architecture</span>
              <span aria-hidden="true">·</span>
              <span>Monetary Authority of Singapore Datastore API</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              MAS Exchange Rates Backend Integration Specs
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              This app is pre-structured with the official MAS Datastore API schema conventions (including standard 100-unit quotations for MYR, JPY, THB, IDR). When ready to hook up your backend proxy, use the reference implementation below.
            </p>
          </div>

          <a
            href="https://eservices.mas.gov.sg/statistics/msb-xml/ExchangeRates.aspx"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 whitespace-nowrap"
          >
            <span>MAS Statistics Portal</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>

      {/* API Key Staging Sandbox */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-slate-700" />
          <h3 className="font-bold text-slate-900 text-sm">
            MAS API Key Staging
          </h3>
        </div>
        <p className="text-xs text-slate-600">
          Save your MAS API Key locally to prepare for backend proxy verification. Keys entered here are stored in your browser session for development testing and are never leaked.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="password"
            placeholder="Enter your MAS API Key (e.g., mas_live_...)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full sm:flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-slate-400 focus:bg-white font-mono"
          />
          <button
            onClick={handleSaveKey}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            {testStatus === 'success' ? 'Saved to Local State ✓' : 'Save Key Config'}
          </button>
        </div>

        {apiKey && (
          <div className="text-[11px] text-emerald-800 bg-emerald-50 px-3 py-2 rounded-md border border-emerald-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Key staged: <strong className="font-mono">••••••••{apiKey.slice(-4)}</strong>. Ready to inject into your server proxy.
            </span>
          </div>
        )}
      </div>

      {/* Integration Code Snippet */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <Terminal className="w-4 h-4 text-slate-400" />
            <span className="font-semibold font-mono">server.ts / Express Proxy Implementation</span>
          </div>
          <button
            onClick={() => copyToClipboard(expressProxySnippet, 'express')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded cursor-pointer transition-colors"
          >
            {copiedSection === 'express' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Snippet</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-5 text-xs font-mono bg-slate-950 text-slate-200 overflow-x-auto leading-relaxed max-h-80">
          {expressProxySnippet}
        </pre>
      </div>

      {/* Official MAS Schema Specification */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
            <Database className="w-4 h-4 text-slate-600" />
            <span>MAS Official Datastore Response Schema</span>
          </div>
          <button
            onClick={() => copyToClipboard(sampleJsonResponse, 'schema')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border border-slate-200 hover:bg-slate-50 text-slate-700 rounded cursor-pointer transition-colors"
          >
            {copiedSection === 'schema' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy JSON</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-5 text-xs font-mono bg-slate-50 text-slate-800 overflow-x-auto leading-relaxed max-h-72">
          {sampleJsonResponse}
        </pre>
      </div>

      {/* MAS Quotation Rules Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
        <h3 className="font-bold text-slate-900 text-sm">
          Monetary Authority of Singapore (MAS) Quotation Conventions
        </h3>
        <p className="text-xs text-slate-600">
          When parsing MAS API outputs, note the distinction in quotation base:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">
              Quoted Per 1 Foreign Unit (SGD per 1 Unit)
            </span>
            <p className="text-slate-600">
              USD, EUR, GBP, AUD, NZD, CAD, CHF, BND (1:1), AED, SAR, QAR.
            </p>
            <span className="font-mono text-[11px] text-slate-500 block mt-1.5">
              Formula: rateToSGD = quote_value
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">
              Quoted Per 100 Foreign Units (SGD per 100 Units)
            </span>
            <p className="text-slate-600">
              JPY, MYR, THB, IDR, CNY, HKD, KRW, TWD, INR, VND, PHP, SEK, NOK, ZAR, TRY, DKK.
            </p>
            <span className="font-mono text-[11px] text-slate-500 block mt-1.5">
              Formula: rateToSGD = quote_value / 100
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
