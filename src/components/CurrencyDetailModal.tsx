import React, { useState } from 'react';
import { Currency } from '../types/currency';
import { X, TrendingUp, TrendingDown, Star, ArrowRight, Code } from 'lucide-react';

interface CurrencyDetailModalProps {
  currency: Currency | null;
  onClose: () => void;
  isFavourite: boolean;
  onToggleFavourite: (code: string) => void;
  onOpenCalculator: (code: string) => void;
}

export const CurrencyDetailModal: React.FC<CurrencyDetailModalProps> = ({
  currency,
  onClose,
  isFavourite,
  onToggleFavourite,
  onOpenCalculator,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!currency) return null;

  const isPositive = currency.change24h >= 0;
  const sparkline = currency.sparkline;
  const minVal = Math.min(...sparkline);
  const maxVal = Math.max(...sparkline);
  const range = maxVal - minVal || 1;

  // Generate SVG path for 7-day sparkline
  const width = 360;
  const height = 120;
  const padding = 20;

  const points = sparkline.map((val, idx) => {
    const x = padding + (idx / (sparkline.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((val - minVal) / range) * (height - 2 * padding);
    return { x, y, val };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  const hoveredPoint = hoverIndex !== null ? points[hoverIndex] : points[points.length - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl leading-none">{currency.flag}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{currency.code}</h3>
                <span className="text-xs text-slate-500">· {currency.name}</span>
              </div>
              <span className="text-xs text-slate-400">{currency.country}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavourite(currency.code)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isFavourite
                  ? 'border-amber-300 bg-amber-50 text-amber-500'
                  : 'border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
              title={isFavourite ? 'Unpin favourite' : 'Pin to favourites'}
            >
              <Star className={`w-4 h-4 ${isFavourite ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Main Key Figures */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
              <span className="text-xs text-slate-500 block">Current Spot Rate</span>
              <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                1 SGD = {currency.rateFromSGD.toFixed(4)} {currency.code}
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                1 {currency.code} = S${currency.rateToSGD.toFixed(4)}
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 block">24h Movement</span>
              <div
                className={`text-xl font-bold font-mono tabular-nums flex items-center justify-end ${
                  isPositive ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {isPositive ? '+' : ''}
                {currency.change24h.toFixed(2)}%
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Range: {currency.low24h.toFixed(2)} - {currency.high24h.toFixed(2)}
              </span>
            </div>
          </div>

          {/* 7-Day Sparkline Trend Chart */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-700">7-Day Rate Trajectory</span>
              <span className="font-mono text-slate-500 tabular-nums">
                {hoverIndex !== null ? `Day ${hoverIndex + 1}: ` : 'Latest: '}
                1 SGD = {hoveredPoint.val.toFixed(4)} {currency.code}
              </span>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-28 overflow-visible"
              >
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Subtle Gridlines */}
                <line
                  x1={padding}
                  y1={height - padding}
                  x2={width - padding}
                  y2={height - padding}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <line
                  x1={padding}
                  y1={padding}
                  x2={width - padding}
                  y2={padding}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />

                {/* Shaded Area */}
                <path d={areaD} fill="url(#trendGradient)" />

                {/* Stroke line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Interactive Points */}
                {points.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={hoverIndex === i ? 5 : 3}
                    fill={hoverIndex === i ? '#0369a1' : '#0284c7'}
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoverIndex(i)}
                    onMouseLeave={() => setHoverIndex(null)}
                  />
                ))}
              </svg>

              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
                <span>7 Days Ago</span>
                <span>3 Days Ago</span>
                <span>Today</span>
              </div>
            </div>
          </div>

          {/* MAS API Field & Quotation Details */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Code className="w-3.5 h-3.5 text-slate-600" />
              <span>Monetary Authority of Singapore (MAS) Data Standard</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <div>
                <span className="text-[11px] text-slate-400 block">MAS Datastore Column:</span>
                <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px] text-slate-800">
                  {currency.masFieldKey}
                </code>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Quotation Base:</span>
                <span className="font-medium text-slate-800">
                  Per {currency.masUnit} {currency.code} unit{currency.masUnit > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 pt-1">
              Official MAS quotation value:{' '}
              <strong className="text-slate-800 font-mono">
                S${(currency.rateToSGD * currency.masUnit).toFixed(4)}
              </strong>{' '}
              per {currency.masUnit} {currency.code}.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => {
              onOpenCalculator(currency.code);
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            <span>Open in Calculator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
