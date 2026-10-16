import React, { useState, useMemo } from 'react';
import { Currency, RateDisplayMode, ViewMode, CurrencyRegion } from '../types/currency';
import {
  Search,
  Star,
  ArrowUpDown,
  Download,
  LayoutGrid,
  List,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Info,
} from 'lucide-react';

interface CurrencyListProps {
  currencies: Currency[];
  favourites: string[];
  onToggleFavourite: (code: string) => void;
  onOpenCalculator: (code: string) => void;
  onOpenTrend: (currency: Currency) => void;
}

export const CurrencyList: React.FC<CurrencyListProps> = ({
  currencies,
  favourites,
  onToggleFavourite,
  onOpenCalculator,
  onOpenTrend,
}) => {
  const [search, setSearch] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'favourites' | CurrencyRegion>('all');
  const [displayMode, setDisplayMode] = useState<RateDisplayMode>('fromSGD');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [sortBy, setSortBy] = useState<'popularity' | 'change' | 'alphabetical'>('popularity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter & Search logic
  const filteredCurrencies = useMemo(() => {
    let result = [...currencies];

    // Search query filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q)
      );
    }

    // Category / Favourites filter
    if (activeFilter === 'favourites') {
      result = result.filter((c) => favourites.includes(c.code));
    } else if (activeFilter !== 'all') {
      result = result.filter((c) => c.region === activeFilter);
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'popularity') {
        comparison = a.popularityRank - b.popularityRank;
      } else if (sortBy === 'change') {
        comparison = b.change24h - a.change24h;
      } else if (sortBy === 'alphabetical') {
        comparison = a.code.localeCompare(b.code);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [currencies, search, activeFilter, favourites, sortBy, sortOrder]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Currency Code', 'Currency Name', 'Country', 'Rate (1 SGD =)', 'Rate (1 Unit = SGD)', 'MAS Quote Unit', '24h Change %'];
    const rows = filteredCurrencies.map((c) => [
      c.code,
      `"${c.name}"`,
      `"${c.country}"`,
      c.rateFromSGD.toFixed(4),
      c.rateToSGD.toFixed(6),
      c.masUnit,
      c.change24h.toFixed(2),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SGD_Exchange_Rates_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Controls Bar: Search & Display Preferences */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by currency code (MYR, JPY), country, or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* View, Sort & Display Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Rate format selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setDisplayMode('fromSGD')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
                displayMode === 'fromSGD'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1 SGD = Foreign
            </button>
            <button
              onClick={() => setDisplayMode('toSGD')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
                displayMode === 'toSGD'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SGD per 1 Unit
            </button>
            <button
              onClick={() => setDisplayMode('masFormat')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
                displayMode === 'masFormat'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Official Monetary Authority of Singapore convention"
            >
              MAS Standard Quote
            </button>
          </div>

          {/* View Mode */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
              title="Compact Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer whitespace-nowrap font-medium"
            title="Export filtered rates as CSV file"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Segmented Bar (Zero-pill discipline: functional button controls with active states) */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3 overflow-x-auto">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Currencies ({currencies.length})
          </button>
          <button
            onClick={() => setActiveFilter('favourites')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeFilter === 'favourites'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${favourites.length > 0 ? 'fill-amber-400 text-amber-500' : ''}`} />
            <span>Favourites ({favourites.length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('ASEAN')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeFilter === 'ASEAN'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            ASEAN Neighbors
          </button>
          <button
            onClick={() => setActiveFilter('Major')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeFilter === 'Major'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Global Majors
          </button>
          <button
            onClick={() => setActiveFilter('Asia-Pacific')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeFilter === 'Asia-Pacific'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Asia-Pacific
          </button>
          <button
            onClick={() => setActiveFilter('Europe')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeFilter === 'Europe'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Europe
          </button>
        </div>

        {/* Sort dropdown indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-800 cursor-pointer focus:outline-hidden"
          >
            <option value="popularity">Popularity in Singapore</option>
            <option value="change">24h Volatility / Gain</option>
            <option value="alphabetical">Currency Code (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {filteredCurrencies.length === 0 && (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <p className="text-sm font-semibold text-slate-800 mb-1">
            {activeFilter === 'favourites'
              ? 'No favourite currencies pinned yet'
              : `No currencies match "${search}"`}
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            {activeFilter === 'favourites'
              ? 'Click the star icon on any currency card to keep your top travel and trade rates pinned here.'
              : 'Try searching for common codes like MYR, USD, JPY, EUR or countries like Malaysia, Thailand, Australia.'}
          </p>
          {activeFilter === 'favourites' ? (
            <button
              onClick={() => setActiveFilter('all')}
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              Browse All Currencies
            </button>
          ) : (
            <button
              onClick={() => setSearch('')}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 cursor-pointer"
            >
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* View Mode 1: Cards View */}
      {viewMode === 'cards' && filteredCurrencies.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCurrencies.map((curr) => {
            const isFav = favourites.includes(curr.code);
            const isPositive = curr.change24h >= 0;

            // Formatted rate based on display mode
            let mainRateLabel = '';
            let mainRateValue = '';
            let secondaryText = '';

            if (displayMode === 'fromSGD') {
              mainRateLabel = '1 SGD =';
              mainRateValue = `${curr.rateFromSGD >= 100 ? curr.rateFromSGD.toFixed(1) : curr.rateFromSGD >= 10 ? curr.rateFromSGD.toFixed(2) : curr.rateFromSGD.toFixed(4)} ${curr.code}`;
              secondaryText = `1 ${curr.code} = S$${curr.rateToSGD.toFixed(4)}`;
            } else if (displayMode === 'toSGD') {
              mainRateLabel = `1 ${curr.code} =`;
              mainRateValue = `S$${curr.rateToSGD.toFixed(4)}`;
              secondaryText = `1 SGD = ${curr.rateFromSGD.toFixed(2)} ${curr.code}`;
            } else {
              // MAS official format
              if (curr.masUnit === 100) {
                mainRateLabel = `100 ${curr.code} =`;
                mainRateValue = `S$${(curr.rateToSGD * 100).toFixed(4)}`;
                secondaryText = `Official MAS per 100 units quote`;
              } else {
                mainRateLabel = `1 ${curr.code} =`;
                mainRateValue = `S$${curr.rateToSGD.toFixed(4)}`;
                secondaryText = `Official MAS per 1 unit quote`;
              }
            }

            return (
              <div
                key={curr.code}
                className="bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-all p-4.5 flex flex-col justify-between group hover:shadow-xs"
              >
                <div>
                  {/* Top card row: Flag, Name, Star */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl leading-none">{curr.flag}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-slate-900 text-sm">{curr.code}</h3>
                          {curr.isPeggedToSGD && (
                            <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-1 py-0.5 rounded">
                              1:1 Pegged
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 block truncate max-w-[140px]">
                          {curr.name}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavourite(curr.code);
                      }}
                      className={`p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer ${
                        isFav ? 'text-amber-500' : 'text-slate-300 hover:text-slate-500'
                      }`}
                      title={isFav ? 'Remove favourite' : 'Add favourite'}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>

                  {/* Rate display */}
                  <div className="mt-4">
                    <span className="text-xs text-slate-400 block mb-0.5">{mainRateLabel}</span>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xl font-bold font-mono tabular-nums text-slate-900 tracking-tight">
                        {mainRateValue}
                      </span>
                      <div
                        className={`flex items-center text-xs font-semibold tabular-nums shrink-0 ${
                          isPositive ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                        )}
                        {isPositive ? '+' : ''}
                        {curr.change24h.toFixed(2)}%
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-1 font-mono">
                      {secondaryText}
                    </span>
                  </div>

                  {/* Travel Note if available */}
                  {curr.travelNote && (
                    <p className="text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-100 line-clamp-1">
                      {curr.travelNote}
                    </p>
                  )}
                </div>

                {/* Bottom card actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onOpenTrend(curr)}
                    className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                  >
                    7-Day Trend
                  </button>

                  <button
                    onClick={() => onOpenCalculator(curr.code)}
                    className="flex items-center gap-1 text-slate-900 hover:text-slate-700 font-semibold cursor-pointer"
                  >
                    <span>Calculate</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Mode 2: High-Density Table View */}
      {viewMode === 'table' && filteredCurrencies.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4 w-10">Fav</th>
                  <th className="py-3 px-4">Currency</th>
                  <th className="py-3 px-4 text-right">Units per 1 SGD</th>
                  <th className="py-3 px-4 text-right">SGD per 1 Unit</th>
                  <th className="py-3 px-4 text-right">MAS Standard Quote</th>
                  <th className="py-3 px-4 text-right">24h Change</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCurrencies.map((curr) => {
                  const isFav = favourites.includes(curr.code);
                  const isPositive = curr.change24h >= 0;

                  return (
                    <tr
                      key={curr.code}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onToggleFavourite(curr.code)}
                          className={`cursor-pointer ${
                            isFav ? 'text-amber-500' : 'text-slate-300 hover:text-slate-500'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{curr.flag}</span>
                          <div>
                            <span className="font-bold text-slate-900 mr-1.5">{curr.code}</span>
                            <span className="text-slate-500">{curr.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-900 tabular-nums">
                        {curr.rateFromSGD >= 100
                          ? curr.rateFromSGD.toFixed(1)
                          : curr.rateFromSGD.toFixed(4)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700 tabular-nums">
                        S${curr.rateToSGD.toFixed(4)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-800 tabular-nums">
                        S${(curr.rateToSGD * curr.masUnit).toFixed(4)}
                        <span className="text-[10px] text-slate-400 ml-1">
                          /{curr.masUnit}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums">
                        <span
                          className={`inline-flex items-center font-semibold ${
                            isPositive ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {curr.change24h.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onOpenTrend(curr)}
                            className="px-2 py-1 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer font-medium"
                          >
                            Trend
                          </button>
                          <button
                            onClick={() => onOpenCalculator(curr.code)}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium cursor-pointer"
                          >
                            Calculate
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
