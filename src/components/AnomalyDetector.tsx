import React, { useState } from 'react';
import { 
  MetricPassport, 
  TimeSeriesPoint 
} from '../types/passport';
import { 
  X, 
  Activity, 
  AlertCircle, 
  TrendingUp, 
  CheckCircle2, 
  Info,
  Calendar
} from 'lucide-react';

interface AnomalyDetectorProps {
  passport: MetricPassport;
  onClose: () => void;
}

export const AnomalyDetector: React.FC<AnomalyDetectorProps> = ({
  passport,
  onClose,
}) => {
  const [selectedPoint, setSelectedPoint] = useState<TimeSeriesPoint | null>(
    passport.timeSeriesData.find(p => p.isAnomaly) || passport.timeSeriesData[passport.timeSeriesData.length - 1]
  );

  const points = passport.timeSeriesData;
  const anomaliesCount = points.filter(p => p.isAnomaly).length;

  // SVG dimensions
  const width = 800;
  const height = 260;
  const padding = 45;

  const minVal = Math.min(...points.map(p => p.lowerBound3Sigma)) * 0.98;
  const maxVal = Math.max(...points.map(p => p.upperBound3Sigma)) * 1.02;

  const scaleX = (index: number) => padding + (index / (points.length - 1)) * (width - 2 * padding);
  const scaleY = (val: number) => height - padding - ((val - minVal) / (maxVal - minVal)) * (height - 2 * padding);

  // Generate paths for expected mean, 2-sigma band, and actual points
  const meanPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(p.expectedMean)}`).join(' ');
  const actualPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(p.value)}`).join(' ');

  // 3-sigma band polygon
  const upper3 = points.map((p, i) => `${scaleX(i)} ${scaleY(p.upperBound3Sigma)}`);
  const lower3 = points.slice().reverse().map((p, i) => `${scaleX(points.length - 1 - i)} ${scaleY(p.lowerBound3Sigma)}`);
  const band3Path = `M ${upper3.join(' L ')} L ${lower3.join(' L ')} Z`;

  // 2-sigma band polygon
  const upper2 = points.map((p, i) => `${scaleX(i)} ${scaleY(p.upperBound2Sigma)}`);
  const lower2 = points.slice().reverse().map((p, i) => `${scaleX(points.length - 1 - i)} ${scaleY(p.lowerBound2Sigma)}`);
  const band2Path = `M ${upper2.join(' L ')} L ${lower2.join(' L ')} Z`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span>Data Science Layer</span>
                <span>/</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">Gaussian Process & Z-Score Filter</span>
              </div>
              <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                Time-Series Anomaly Detection: {passport.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-md hover:bg-stone-200 dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Summary Metric Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-stone-50 dark:bg-stone-950 rounded-lg border border-stone-200 dark:border-stone-800">
            <div>
              <span className="text-[11px] font-mono text-stone-500 block uppercase">DETECTED ANOMALIES (LAST 30D)</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-mono text-2xl font-bold text-stone-900 dark:text-stone-100">
                  {anomaliesCount}
                </span>
                <span className="text-xs text-stone-500">
                  {anomaliesCount === 0 ? 'Clean historical baseline' : 'Flagged & annotated'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-mono text-stone-500 block uppercase">CURRENT ROLLING Z-SCORE</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  +0.01σ
                </span>
                <span className="text-xs text-stone-500">&lt; 2.0σ threshold</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-mono text-stone-500 block uppercase">CONFIDENCE ENVELOPE</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-mono text-2xl font-bold text-stone-900 dark:text-stone-100">
                  99.7% (3σ)
                </span>
                <span className="text-xs text-stone-500">Normal distribution</span>
              </div>
            </div>
          </div>

          {/* SVG Chart */}
          <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl space-y-2">
            <div className="flex flex-wrap items-center justify-between text-xs text-stone-500 gap-2 mb-2">
              <span className="font-medium text-stone-900 dark:text-stone-100">
                Daily Metric Value vs Statistical Expected Bands (30-Day Window)
              </span>
              <div className="flex items-center gap-4 text-[11px] font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Actual Metric
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-stone-400" /> Rolling Mean
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-stone-200 dark:bg-stone-800" /> 3σ Tolerance Band
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Anomaly Outlier
                </span>
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
                {/* 3-Sigma Band */}
                <path d={band3Path} fill="currentColor" className="text-stone-100 dark:text-stone-900" />

                {/* 2-Sigma Band */}
                <path d={band2Path} fill="currentColor" className="text-stone-200/60 dark:text-stone-800/60" />

                {/* Mean Path */}
                <path d={meanPath} fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" className="text-stone-400" />

                {/* Actual Line */}
                <path d={actualPath} fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-500" />

                {/* Points */}
                {points.map((p, i) => {
                  const cx = scaleX(i);
                  const cy = scaleY(p.value);
                  const isSelected = selectedPoint?.date === p.date;

                  return (
                    <g key={p.date} onClick={() => setSelectedPoint(p)} className="cursor-pointer">
                      {p.isAnomaly && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isSelected ? 10 : 7}
                          className="fill-red-500/20 stroke-red-500 stroke-2 animate-pulse"
                        />
                      )}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isSelected ? 6 : p.isAnomaly ? 5 : 3.5}
                        className={
                          p.isAnomaly
                            ? 'fill-red-600 stroke-white dark:stroke-stone-900 stroke-1'
                            : isSelected
                            ? 'fill-emerald-600 stroke-white stroke-2'
                            : 'fill-emerald-500 hover:fill-emerald-600'
                        }
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="flex justify-between text-[11px] font-mono text-stone-400 px-2 pt-1 border-t border-stone-100 dark:border-stone-800">
              <span>{points[0].date}</span>
              <span>Click any checkpoint dot to inspect statistical telemetry</span>
              <span>{points[points.length - 1].date}</span>
            </div>
          </div>

          {/* Selected Point Inspection Detail */}
          {selectedPoint && (
            <div className={`p-4 rounded-lg border text-xs space-y-3 ${
              selectedPoint.isAnomaly
                ? 'bg-red-50/70 dark:bg-red-950/30 border-red-200 dark:border-red-900/60 text-red-900 dark:text-red-200'
                : 'bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-stone-500" />
                  <span className="font-semibold text-sm">
                    Observation: {selectedPoint.date}
                  </span>
                  {selectedPoint.isAnomaly ? (
                    <span className="text-[11px] font-mono font-semibold text-red-600 dark:text-red-400">
                      [ANOMALY DETECTED: {selectedPoint.zScore}σ]
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                      [NOMINAL: {selectedPoint.zScore}σ]
                    </span>
                  )}
                </div>

                <span className="font-mono font-semibold text-sm">
                  Observed: ₹{(selectedPoint.value / 1000000).toFixed(2)}M
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                <div className="p-2 bg-white/60 dark:bg-stone-900/60 rounded">
                  <span className="text-stone-500 block text-[10px]">EXPECTED MEAN</span>
                  <span>₹{(selectedPoint.expectedMean / 1000000).toFixed(2)}M</span>
                </div>
                <div className="p-2 bg-white/60 dark:bg-stone-900/60 rounded">
                  <span className="text-stone-500 block text-[10px]">UPPER 3σ BOUND</span>
                  <span>₹{(selectedPoint.upperBound3Sigma / 1000000).toFixed(2)}M</span>
                </div>
                <div className="p-2 bg-white/60 dark:bg-stone-900/60 rounded">
                  <span className="text-stone-500 block text-[10px]">LOWER 3σ BOUND</span>
                  <span>₹{(selectedPoint.lowerBound3Sigma / 1000000).toFixed(2)}M</span>
                </div>
                <div className="p-2 bg-white/60 dark:bg-stone-900/60 rounded">
                  <span className="text-stone-500 block text-[10px]">Z-SCORE RESIDUAL</span>
                  <span className="font-semibold">{selectedPoint.zScore}σ</span>
                </div>
              </div>

              {selectedPoint.note && (
                <div className="p-2.5 bg-white dark:bg-stone-900 rounded border border-red-200 dark:border-red-900/40 text-xs">
                  <span className="font-semibold block mb-0.5 text-stone-900 dark:text-stone-100">
                    FP&A Root-Cause Analysis Note:
                  </span>
                  {selectedPoint.note}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-md"
          >
            Close Anomaly View
          </button>
        </div>

      </div>
    </div>
  );
};
