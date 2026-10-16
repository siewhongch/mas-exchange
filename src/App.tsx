import React, { useState, useEffect, useCallback } from 'react';
import { Currency } from './types/currency';
import { INITIAL_CURRENCIES, DEFAULT_FAVOURITES } from './data/currencies';
import { Header } from './components/Header';
import { MarketBarometer } from './components/MarketBarometer';
import { CurrencyList } from './components/CurrencyList';
import { Calculator } from './components/Calculator';
import { MultiConvertMatrix } from './components/MultiConvertMatrix';
import { CurrencyDetailModal } from './components/CurrencyDetailModal';
import { MasApiModal } from './components/MasApiModal';

export default function App() {
  const [currencies, setCurrencies] = useState<Currency[]>(INITIAL_CURRENCIES);
  const [activeTab, setActiveTab] = useState<'rates' | 'calculator' | 'matrix' | 'mas-api'>('rates');
  const [selectedCalcCurrency, setSelectedCalcCurrency] = useState<string>('MYR');
  const [trendCurrency, setTrendCurrency] = useState<Currency | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Favourites state from localStorage
  const [favourites, setFavourites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sgd_fx_favourites');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_FAVOURITES;
  });

  // Persist favourites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sgd_fx_favourites', JSON.stringify(favourites));
    } catch {
      // ignore
    }
  }, [favourites]);

  const toggleFavourite = useCallback((code: string) => {
    setFavourites((prev) => {
      if (prev.includes(code)) {
        return prev.filter((c) => c !== code);
      } else {
        return [...prev, code];
      }
    });
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Simulate micro-fluctuation in spot rate to provide real-time market feedback
      setCurrencies((prev) =>
        prev.map((c) => {
          if (c.isPeggedToSGD) return c; // Brunei dollar is pegged 1:1
          const fluctuation = (Math.random() - 0.49) * 0.002;
          const newRateFromSGD = +(c.rateFromSGD * (1 + fluctuation)).toFixed(4);
          const newRateToSGD = +(1 / newRateFromSGD).toFixed(6);
          const newChange24h = +(c.change24h + (Math.random() - 0.5) * 0.05).toFixed(2);
          const newSparkline = [...c.sparkline.slice(1), newRateFromSGD];

          return {
            ...c,
            rateFromSGD: newRateFromSGD,
            rateToSGD: newRateToSGD,
            change24h: newChange24h,
            sparkline: newSparkline,
          };
        })
      );
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 500);
  }, []);

  const handleSelectCurrencyForCalc = (code: string) => {
    setSelectedCalcCurrency(code);
    setActiveTab('calculator');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-red-500 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {/* Singapore Financial Market Barometer */}
        <MarketBarometer
          currencies={currencies}
          onSelectCurrency={handleSelectCurrencyForCalc}
        />

        {/* Tab Routing */}
        {activeTab === 'rates' && (
          <CurrencyList
            currencies={currencies}
            favourites={favourites}
            onToggleFavourite={toggleFavourite}
            onOpenCalculator={handleSelectCurrencyForCalc}
            onOpenTrend={(curr) => setTrendCurrency(curr)}
          />
        )}

        {activeTab === 'calculator' && (
          <div className="py-2">
            <Calculator
              currencies={currencies}
              selectedCode={selectedCalcCurrency}
              onSelectCurrency={(code) => setSelectedCalcCurrency(code)}
              favourites={favourites}
              onToggleFavourite={toggleFavourite}
            />
          </div>
        )}

        {activeTab === 'matrix' && (
          <MultiConvertMatrix
            currencies={currencies}
            favourites={favourites}
            onOpenCalculator={handleSelectCurrencyForCalc}
          />
        )}

        {activeTab === 'mas-api' && <MasApiModal />}
      </main>

      {/* Currency 7-Day Trend Modal */}
      {trendCurrency && (
        <CurrencyDetailModal
          currency={trendCurrency}
          onClose={() => setTrendCurrency(null)}
          isFavourite={favourites.includes(trendCurrency.code)}
          onToggleFavourite={toggleFavourite}
          onOpenCalculator={handleSelectCurrencyForCalc}
        />
      )}

      {/* Footer conforming to Universal Frontend Design Guidelines */}
      <footer className="border-t border-slate-200 bg-white mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-800">LionRate SGD</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>Singapore Exchange Rate Portal & MAS Quotation Reference</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>BND Pegged 1:1 via CIA</span>
            <span aria-hidden="true">·</span>
            <span>S$NEER Managed Float</span>
            <span aria-hidden="true">·</span>
            <span>MAS API Datastore Compatible</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
