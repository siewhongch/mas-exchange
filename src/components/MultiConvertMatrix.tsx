import React, { useState, useMemo } from 'react';
import { Currency } from '../types/currency';
import { Copy, Check, Star, ArrowRight } from 'lucide-react';

interface MultiConvertMatrixProps {
  currencies: Currency[];
  favourites: string[];
  onOpenCalculator: (code: string) => void;
}

export const MultiConvertMatrix: React.FC<MultiConvertMatrixProps> = ({
  currencies,
  favourites,
  onOpenCalculator,
}) => {
  const [baseAmount, setBaseAmount] = useState<string>('1000');
  const [matrixFilter, setMatrixFilter] = useState<'favourites' | 'asean' | 'all'>('favourites');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const numAmount = parseFloat(baseAmount) || 0;

  const targetCurrencies = useMemo(() => {
    if (matrixFilter === 'favourites') {
      return currencies.filter((c) => favourites.includes(c.code));
    }
    if (matrixFilter === 'asean') {
      return currencies.filter((c) => c.region === 'ASEAN');
    }
    return currencies;
  }, [currencies, favourites, matrixFilter]);

  const handleCopy = (code: string, value: number) => {
    const text = `${value.toLocaleString('en-SG', { maximumFractionDigits: 2 })} ${code}`;
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Intro Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              SGD Multi-Currency Broadcast Matrix
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Type an amount in Singapore Dollars to calculate the simultaneous converted sum across all your pinned currencies.
            </p>
          </div>

          {/* Amount input & presets */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-within:border-slate-400">
              <span className="text-xs font-bold text-slate-500 mr-2">S$</span>
              <input
                type="number"
                min="0"
                value={baseAmount}
                onChange={(e) => setBaseAmount(e.target.value)}
                className="w-28 text-base font-bold font-mono text-slate-900 bg-transparent focus:outline-hidden"
                placeholder="1000"
              />
            </div>

            {[500, 1000, 2000, 5000].map((val) => (
              <button
                key={val}
                onClick={() => setBaseAmount(val.toString())}
                className={`px-2.5 py-1 text-xs rounded-md border font-medium cursor-pointer transition-colors ${
                  baseAmount === val.toString()
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                S${val.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Filter toggles */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">Show:</span>
          <button
            onClick={() => setMatrixFilter('favourites')}
            className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
              matrixFilter === 'favourites'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            Pinned Favourites ({favourites.length})
          </button>
          <button
            onClick={() => setMatrixFilter('asean')}
            className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
              matrixFilter === 'asean'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            ASEAN Neighbors
          </button>
          <button
            onClick={() => setMatrixFilter('all')}
            className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
              matrixFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            All Currencies ({currencies.length})
          </button>
        </div>
      </div>

      {/* Grid of Converted Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {targetCurrencies.map((c) => {
          const converted = numAmount * c.rateFromSGD;
          const isCopied = copiedCode === c.code;

          return (
            <div
              key={c.code}
              className="bg-white p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{c.flag}</span>
                    <span className="font-bold text-slate-900 text-sm">{c.code}</span>
                    <span className="text-xs text-slate-500 truncate max-w-[100px]">
                      {c.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(c.code, converted)}
                    className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                    title="Copy amount"
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="mt-3">
                  <span className="text-[11px] text-slate-400 block">Converted equivalent:</span>
                  <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                    {converted.toLocaleString('en-SG', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: c.rateFromSGD >= 1000 ? 0 : 2,
                    })}{' '}
                    <span className="text-xs font-semibold text-slate-600">{c.symbol}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block mt-1">
                    Rate: 1 SGD = {c.rateFromSGD.toFixed(4)} {c.code}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  {c.region}
                </span>
                <button
                  onClick={() => onOpenCalculator(c.code)}
                  className="text-slate-900 hover:text-slate-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Convert</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
