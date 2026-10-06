import React from 'react';
import { MetricPassport } from '../types/passport';
import { CheckCircle2, AlertTriangle, Clock, ArrowUpRight } from 'lucide-react';

interface MetricCardsProps {
  passports: MetricPassport[];
  selectedId: string;
  onSelectMetric: (id: string) => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  passports,
  selectedId,
  onSelectMetric,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {passports.map((metric) => {
        const isSelected = metric.id === selectedId;
        const trust = metric.trustScore;

        return (
          <button
            key={metric.id}
            onClick={() => onSelectMetric(metric.id)}
            className={`text-left p-4 rounded-lg border transition-all relative ${
              isSelected
                ? 'bg-stone-50 dark:bg-stone-900/90 border-stone-800 dark:border-stone-200 shadow-xs'
                : 'bg-white dark:bg-stone-950 border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-700'
            }`}
          >
            {/* Top metadata line with typographic separators */}
            <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 mb-1">
              <span>{metric.category}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{metric.version}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {metric.freshness.latencyMinutes}m ago
              </span>
            </div>

            {/* Metric Name */}
            <div className="font-medium text-stone-900 dark:text-stone-100 text-sm mb-2 flex items-center justify-between">
              <span>{metric.name}</span>
              {isSelected && <ArrowUpRight className="w-3.5 h-3.5 text-stone-900 dark:text-stone-100" />}
            </div>

            {/* Metric Value */}
            <div className="font-mono font-semibold text-stone-900 dark:text-stone-100 text-2xl tracking-tight mb-3">
              {metric.currentValue}
            </div>

            {/* Bottom Trust & Verification row */}
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  trust.totalScore >= 90 ? 'bg-emerald-500' : trust.totalScore >= 75 ? 'bg-amber-500' : 'bg-red-500'
                }`} />
                <span className="font-mono font-medium text-stone-800 dark:text-stone-200">
                  {trust.totalScore}/100
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  {trust.rating}
                </span>
              </div>

              <div className="text-[11px] text-stone-500 dark:text-stone-400">
                {metric.validationChecks.length} checks
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
