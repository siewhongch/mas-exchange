import React from 'react';
import { RefreshCw } from 'lucide-react';

interface HeaderProps {
  activeTab: 'rates' | 'calculator' | 'matrix' | 'mas-api' | 'talk-to-us';
  setActiveTab: (tab: 'rates' | 'calculator' | 'matrix' | 'mas-api' | 'talk-to-us') => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: Date;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onRefresh,
  isRefreshing,
  lastUpdated,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 h-16">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-xs">
            <span className="font-bold text-sm tracking-tighter">S$</span>
          </div>
          <button
            onClick={() => setActiveTab('rates')}
            className="text-left cursor-pointer group"
          >
            <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap block leading-tight">
              LionRate SGD
            </span>
          </button>
        </div>

        {/* Zone 2: 5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('rates')}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'rates'
                ? 'text-slate-900 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Exchange Rates
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'calculator'
                ? 'text-slate-900 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            SGD Calculator
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'matrix'
                ? 'text-slate-900 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Multi-Convert
          </button>
          <button
            onClick={() => setActiveTab('mas-api')}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'mas-api'
                ? 'text-slate-900 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            MAS API Specs
          </button>
          <button
            onClick={() => setActiveTab('talk-to-us')}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'talk-to-us'
                ? 'text-slate-900 font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Talk to Us
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
            title="Refresh exchange rates against SGD"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-red-600' : 'text-slate-600'}`}
            />
            <span>{isRefreshing ? 'Updating...' : 'Live Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 px-2 py-1.5 bg-slate-50 text-xs font-medium overflow-x-auto">
        <button
          onClick={() => setActiveTab('rates')}
          className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
            activeTab === 'rates' ? 'bg-white shadow-xs text-slate-900 font-semibold' : 'text-slate-600'
          }`}
        >
          Rates
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
            activeTab === 'calculator' ? 'bg-white shadow-xs text-slate-900 font-semibold' : 'text-slate-600'
          }`}
        >
          Calculator
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
            activeTab === 'matrix' ? 'bg-white shadow-xs text-slate-900 font-semibold' : 'text-slate-600'
          }`}
        >
          Multi-Convert
        </button>
        <button
          onClick={() => setActiveTab('mas-api')}
          className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
            activeTab === 'mas-api' ? 'bg-white shadow-xs text-slate-900 font-semibold' : 'text-slate-600'
          }`}
        >
          MAS API
        </button>
        <button
          onClick={() => setActiveTab('talk-to-us')}
          className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
            activeTab === 'talk-to-us' ? 'bg-white shadow-xs text-slate-900 font-semibold' : 'text-slate-600'
          }`}
        >
          Talk to Us
        </button>
      </div>
    </header>
  );
};
