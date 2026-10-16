import React, { useState, useEffect } from 'react';
import { Currency } from '../types/currency';
import { ArrowUpRight, ArrowDownRight, Clock, ShieldCheck, Info } from 'lucide-react';

interface MarketBarometerProps {
  currencies: Currency[];
  onSelectCurrency: (code: string) => void;
}

export const MarketBarometer: React.FC<MarketBarometerProps> = ({
  currencies,
  onSelectCurrency,
}) => {
  const [sgtTime, setSgtTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Singapore is UTC+8
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Singapore',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      setSgtTime(new Intl.DateTimeFormat('en-SG', options).format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const topPairs = ['MYR', 'USD', 'JPY', 'THB'];
  const featured = topPairs.map((code) => currencies.find((c) => c.code === code)).filter(Boolean) as Currency[];

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Singapore Financial Center Context Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Singapore Monetary Authority Reference</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 font-mono text-slate-700">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                SGT {sgtTime || '08:00:00'} (UTC+8)
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 font-medium">Interbank Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Singapore Dollar (SGD) Exchange Rates
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Live spot conversions and reference rates against global & ASEAN currencies. S$NEER policy-aligned pricing with zero markups.
            </p>
          </div>

          <div className="flex items-center gap-6 shrink-0 text-xs text-slate-600 bg-slate-50 px-4 py-3 rounded-lg border border-slate-200/80">
            <div>
              <span className="text-slate-400 block text-[11px]">SGD Anchor</span>
              <span className="font-semibold text-slate-800">Trade-Weighted Basket</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-slate-400 block text-[11px]">BND Parity</span>
              <span className="font-semibold text-emerald-700">1.0000 Pegged (CIA)</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-slate-400 block text-[11px]">MAS Convention</span>
              <span className="font-semibold text-slate-800">Per 1 & 100 units</span>
            </div>
          </div>
        </div>

        {/* 4 Primary Currency Barometer Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          {featured.map((curr) => {
            const isPositive = curr.change24h >= 0;
            return (
              <div
                key={curr.code}
                onClick={() => onSelectCurrency(curr.code)}
                className="group p-4 bg-slate-50/70 hover:bg-slate-100/90 rounded-lg border border-slate-200/80 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{curr.flag}</span>
                    <div>
                      <span className="text-xs text-slate-500 font-medium block">SGD / {curr.code}</span>
                      <span className="text-sm font-bold text-slate-900">{curr.name}</span>
                    </div>
                  </div>
                  <div className={`flex items-center text-xs font-semibold tabular-nums ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {isPositive ? (
                      <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                    )}
                    {isPositive ? '+' : ''}
                    {curr.change24h.toFixed(2)}%
                  </div>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-400 mr-1.5">1 SGD =</span>
                    <span className="text-lg font-bold font-mono tabular-nums text-slate-900 tracking-tight">
                      {curr.rateFromSGD >= 100
                        ? curr.rateFromSGD.toFixed(1)
                        : curr.rateFromSGD >= 10
                        ? curr.rateFromSGD.toFixed(2)
                        : curr.rateFromSGD.toFixed(4)}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 ml-1">{curr.symbol}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    MAS: S${(curr.rateToSGD * curr.masUnit).toFixed(4)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
