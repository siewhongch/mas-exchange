import React, { useState, useMemo } from 'react';
import { Currency } from '../types/currency';
import {
  ArrowLeftRight,
  Copy,
  Check,
  Building2,
  CreditCard,
  Banknote,
  Sparkles,
  Info,
  ChevronDown,
  Search,
} from 'lucide-react';
import { calculateSpreadRate } from '../data/currencies';

interface CalculatorProps {
  currencies: Currency[];
  selectedCode: string;
  onSelectCurrency: (code: string) => void;
  favourites: string[];
  onToggleFavourite: (code: string) => void;
}

export const Calculator: React.FC<CalculatorProps> = ({
  currencies,
  selectedCode,
  onSelectCurrency,
  favourites,
  onToggleFavourite,
}) => {
  const [direction, setDirection] = useState<'fromSGD' | 'toSGD'>('fromSGD');
  const [amount, setAmount] = useState<string>('1000');
  const [copied, setCopied] = useState<boolean>(false);
  const [selectorOpen, setSelectorOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<
    'interbank' | 'moneychanger' | 'travelcard' | 'creditcard'
  >('interbank');

  const activeCurrency = useMemo(() => {
    return (
      currencies.find((c) => c.code === selectedCode) ||
      currencies.find((c) => c.code === 'MYR') ||
      currencies[0]
    );
  }, [currencies, selectedCode]);

  const numAmount = parseFloat(amount) || 0;

  // Rate logic:
  // If direction is 'fromSGD': SGD amount * rateFromSGD
  // If direction is 'toSGD': Foreign amount * rateToSGD
  const spreadInfo = calculateSpreadRate(
    direction === 'fromSGD' ? activeCurrency.rateFromSGD : activeCurrency.rateToSGD,
    selectedChannel
  );

  const convertedValue = useMemo(() => {
    if (direction === 'fromSGD') {
      return numAmount * spreadInfo.rate;
    } else {
      // Foreign to SGD
      // In reverse, a retail spread costs more foreign currency or gives less SGD
      if (selectedChannel === 'interbank') {
        return numAmount * activeCurrency.rateToSGD;
      }
      // With bank markup, 1 unit of foreign gives less SGD
      return numAmount * activeCurrency.rateToSGD * (1 - spreadInfo.feePercent / 100);
    }
  }, [numAmount, direction, spreadInfo.rate, activeCurrency, selectedChannel]);

  const handleSwapDirection = () => {
    setDirection((prev) => (prev === 'fromSGD' ? 'toSGD' : 'fromSGD'));
  };

  const handleCopy = () => {
    const textToCopy = `${convertedValue.toLocaleString('en-SG', {
      maximumFractionDigits: 2,
    })} ${direction === 'fromSGD' ? activeCurrency.code : 'SGD'}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredCurrencies = useMemo(() => {
    if (!searchQuery.trim()) return currencies;
    const q = searchQuery.toLowerCase();
    return currencies.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
    );
  }, [currencies, searchQuery]);

  // Denominations travel cash estimate (for top Asian currencies)
  const denominationBreakdown = useMemo(() => {
    if (direction !== 'fromSGD' || convertedValue <= 0) return null;
    if (activeCurrency.code === 'MYR') {
      const val = Math.floor(convertedValue);
      const rm100 = Math.floor(val / 100);
      const rm50 = Math.floor((val % 100) / 50);
      const rm20 = Math.floor((val % 50) / 20);
      const rm10 = Math.floor((val % 20) / 10);
      return { rm100, rm50, rm20, rm10 };
    }
    if (activeCurrency.code === 'JPY') {
      const val = Math.floor(convertedValue);
      const jpy10000 = Math.floor(val / 10000);
      const jpy5000 = Math.floor((val % 10000) / 5000);
      const jpy1000 = Math.floor((val % 5000) / 1000);
      return { jpy10000, jpy5000, jpy1000 };
    }
    if (activeCurrency.code === 'THB') {
      const val = Math.floor(convertedValue);
      const thb1000 = Math.floor(val / 1000);
      const thb500 = Math.floor((val % 1000) / 500);
      const thb100 = Math.floor((val % 500) / 100);
      return { thb1000, thb500, thb100 };
    }
    return null;
  }, [direction, convertedValue, activeCurrency.code]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Container */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Header ribbon */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 text-base">
              Currency Converter
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500">
              Singapore Mid-Market Spot Rate
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleFavourite(activeCurrency.code)}
              className={`p-1.5 rounded-md hover:bg-slate-100 transition-colors text-xs flex items-center gap-1 cursor-pointer ${
                favourites.includes(activeCurrency.code)
                  ? 'text-amber-500 font-semibold'
                  : 'text-slate-400'
              }`}
              title="Pin to favourites"
            >
              <span>★</span>
              <span className="hidden sm:inline">
                {favourites.includes(activeCurrency.code) ? 'Favourited' : 'Add Favourite'}
              </span>
            </button>
          </div>
        </div>

        {/* Main interactive calculator body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Conversion Grid */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
            {/* Input Box 1 (Source) */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                {direction === 'fromSGD' ? 'You Send (SGD)' : `You Send (${activeCurrency.code})`}
              </label>

              <div className="flex items-center justify-between gap-3">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 bg-transparent focus:outline-hidden"
                  placeholder="0.00"
                />

                {direction === 'fromSGD' ? (
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-slate-200 shrink-0">
                    <span className="text-xl">🇸🇬</span>
                    <span className="font-bold text-sm text-slate-900">SGD</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectorOpen(true)}
                    className="flex items-center gap-2 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200 shrink-0 cursor-pointer"
                  >
                    <span className="text-xl">{activeCurrency.flag}</span>
                    <span className="font-bold text-sm text-slate-900">{activeCurrency.code}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                )}
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center -my-2 md:my-0">
              <button
                onClick={handleSwapDirection}
                className="w-10 h-10 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shadow-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                title="Swap Direction"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
            </div>

            {/* Output Box 2 (Target) */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                {direction === 'fromSGD' ? `You Receive (${activeCurrency.code})` : 'You Receive (SGD)'}
              </label>

              <div className="flex items-center justify-between gap-3">
                <div className="w-full text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-800 truncate">
                  {convertedValue.toLocaleString('en-SG', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: activeCurrency.rateFromSGD >= 1000 ? 0 : 2,
                  })}
                </div>

                {direction === 'fromSGD' ? (
                  <button
                    onClick={() => setSelectorOpen(true)}
                    className="flex items-center gap-2 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200 shrink-0 cursor-pointer"
                  >
                    <span className="text-xl">{activeCurrency.flag}</span>
                    <span className="font-bold text-sm text-slate-900">{activeCurrency.code}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-slate-200 shrink-0">
                    <span className="text-xl">🇸🇬</span>
                    <span className="font-bold text-sm text-slate-900">SGD</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Presets for SGD */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-500 mr-1 font-medium">Quick Amount:</span>
            {[50, 100, 500, 1000, 2500, 5000].map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset.toString())}
                className={`px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer ${
                  amount === preset.toString()
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                S${preset.toLocaleString()}
              </button>
            ))}
            <button
              onClick={() => setAmount('100')}
              className="text-xs text-slate-400 hover:text-slate-600 underline ml-auto cursor-pointer"
            >
              Reset
            </button>
          </div>

          {/* Rate Breakdown & MAS official conversion reference */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">Spot Exchange Rate:</span>
                <span className="font-mono tabular-nums text-slate-800">
                  1 SGD = {activeCurrency.rateFromSGD.toFixed(4)} {activeCurrency.code}
                </span>
                <span className="text-slate-400">|</span>
                <span className="font-mono tabular-nums text-slate-800">
                  1 {activeCurrency.code} = S${activeCurrency.rateToSGD.toFixed(4)}
                </span>
              </div>

              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 cursor-pointer self-start sm:self-auto"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy result'}</span>
              </button>
            </div>

            {/* MAS Official Quotation Notice */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-800">
                  MAS Quotation Standard:
                </span>{' '}
                {activeCurrency.masUnit === 100 ? (
                  <span>
                    The Monetary Authority of Singapore officially publishes this currency{' '}
                    <strong>per 100 {activeCurrency.code}</strong> units. Official MAS benchmark:{' '}
                    <strong className="font-mono text-slate-900">
                      S${(activeCurrency.rateToSGD * 100).toFixed(4)} per 100 {activeCurrency.code}
                    </strong>
                    .
                  </span>
                ) : (
                  <span>
                    The Monetary Authority of Singapore quotes this rate as{' '}
                    <strong className="font-mono text-slate-900">
                      S${activeCurrency.rateToSGD.toFixed(4)} per 1 {activeCurrency.code}
                    </strong>
                    .
                  </span>
                )}
                {activeCurrency.isPeggedToSGD && (
                  <span className="block mt-1 text-emerald-800 font-medium">
                    Note: Brunei Dollar and Singapore Dollar circulate interchangeably at 1:1 par value under the bilateral Currency Interchangeability Agreement (CIA).
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Channel / Spread Simulator (Singapore Context: Mustafa, Arcade, Multi-currency cards) */}
          <div className="pt-2 space-y-2">
            <span className="text-xs font-semibold text-slate-700 block">
              Singapore Exchange Channel Comparison:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'interbank', label: 'Interbank Mid-Market', markup: '0.0% fee', icon: Banknote },
                { id: 'travelcard', label: 'Multi-Currency Card', markup: '~0.4% (YouTrip/Trust)', icon: CreditCard },
                { id: 'moneychanger', label: 'The Arcade / Mustafa', markup: '~0.6% Cash Spread', icon: Building2 },
                { id: 'creditcard', label: 'Local Bank Credit Card', markup: '~3.0% FX Fee', icon: CreditCard },
              ].map((ch) => {
                const isSelected = selectedChannel === ch.id;
                const IconComponent = ch.icon;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setSelectedChannel(ch.id as any)}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                      <span className="text-xs font-semibold truncate">{ch.label}</span>
                    </div>
                    <span className={`text-[11px] block ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {ch.markup}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Travel Cash Breakdown Helper for Top Currencies */}
          {denominationBreakdown && (
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <span className="font-semibold text-slate-900 block mb-1">
                Travel Cash Estimator ({activeCurrency.name}):
              </span>
              <p className="text-slate-600 mb-2">
                Rough banknote breakdown for physical cash exchange of S${numAmount.toLocaleString()} at money changers:
              </p>
              <div className="flex flex-wrap gap-3">
                {activeCurrency.code === 'MYR' && denominationBreakdown.rm100 !== undefined && (
                  <>
                    <span className="bg-white px-2 py-1 rounded border border-slate-200 font-mono">
                      <strong>{denominationBreakdown.rm100}</strong> × RM100 note
                    </span>
                    <span className="bg-white px-2 py-1 rounded border border-slate-200 font-mono">
                      <strong>{denominationBreakdown.rm50}</strong> × RM50 note
                    </span>
                    <span className="bg-white px-2 py-1 rounded border border-slate-200 font-mono">
                      <strong>{denominationBreakdown.rm20}</strong> × RM20 note
                    </span>
                    <span className="bg-white px-2 py-1 rounded border border-slate-200 font-mono">
                      <strong>{denominationBreakdown.rm10}</strong> × RM10 note
                    </span>
                  </>
                )}
                {activeCurrency.code === 'JPY' && denominationBreakdown.jpy10000 !== undefined && (
                  <>
                    <span className="bg-white px-2 py-1 rounded border border-slate-200 font-mono">
                      <strong>{denominationBreakdown.jpy10000}</strong> × ¥10,000 note
                    </span>
                    <span className="bg-white px-2 py-1 rounded border border-slate-200 font-mono">
                      <strong>{denominationBreakdown.jpy5000}</strong> × ¥5,000 note
                    </span>
                    <span className="bg-white px-2 py-1 rounded border border-slate-200 font-mono">
                      <strong>{denominationBreakdown.jpy1000}</strong> × ¥1,000 note
                    </span>
                  </>
                )}
                {activeCurrency.code === 'THB' && denominationBreakdown.thb1000 !== undefined && (
                  <>
                    <span className="bg-white px-2 py-1 rounded border border-slate-200 font-mono">
                      <strong>{denominationBreakdown.thb1000}</strong> × ฿1,000 note
                    </span>
                    <span className="bg-white px-2 py-1 rounded border border-slate-200 font-mono">
                      <strong>{denominationBreakdown.thb500}</strong> × ฿500 note
                    </span>
                    <span className="bg-white px-2 py-1 rounded border border-slate-200 font-mono">
                      <strong>{denominationBreakdown.thb100}</strong> × ฿100 note
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Currency Selector Modal */}
      {selectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Select Foreign Currency</h3>
              <button
                onClick={() => setSelectorOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search currency code, country..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:bg-white focus:border-slate-400"
                  autoFocus
                />
              </div>
            </div>

            <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
              {filteredCurrencies.map((c) => {
                const isSelected = c.code === activeCurrency.code;
                const isFav = favourites.includes(c.code);
                return (
                  <button
                    key={c.code}
                    onClick={() => {
                      onSelectCurrency(c.code);
                      setSelectorOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full p-3 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer ${
                      isSelected ? 'bg-slate-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{c.flag}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-xs">{c.code}</span>
                          {isFav && <span className="text-amber-500 text-xs">★</span>}
                          <span className="text-xs text-slate-500">· {c.name}</span>
                        </div>
                        <span className="text-[11px] text-slate-400">{c.country}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-slate-800 tabular-nums block">
                        {c.rateFromSGD >= 100
                          ? c.rateFromSGD.toFixed(1)
                          : c.rateFromSGD.toFixed(3)}
                      </span>
                      <span className="text-[10px] text-slate-400">per 1 SGD</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
