import React, { useState } from 'react';
import { 
  MetricPassport, 
  TrustScoreBreakdown 
} from '../types/passport';
import { 
  DEFAULT_WEIGHTS, 
  TrustScoreWeights, 
  calculateExplainableTrustScore 
} from '../utils/trustScore';
import { 
  X, 
  ShieldCheck, 
  Calculator, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Server, 
  Activity, 
  RotateCcw, 
  SlidersHorizontal,
  AlertCircle
} from 'lucide-react';

interface TrustScoreDetailProps {
  passport: MetricPassport;
  onClose: () => void;
}

export const TrustScoreDetail: React.FC<TrustScoreDetailProps> = ({
  passport,
  onClose,
}) => {
  // Interactive test inputs
  const [latencyMinutes, setLatencyMinutes] = useState<number>(passport.freshness.latencyMinutes);
  const [passedChecks, setPassedChecks] = useState<number>(passport.validationChecks.length);
  const [anomalyCount, setAnomalyCount] = useState<number>(0);
  const [weights, setWeights] = useState<TrustScoreWeights>(DEFAULT_WEIGHTS);
  const [showWeightSliders, setShowWeightSliders] = useState<boolean>(false);

  // Recalculate trust score dynamically
  const simulatedScore: TrustScoreBreakdown = calculateExplainableTrustScore(
    {
      freshnessMinutes: latencyMinutes,
      slaMinutes: passport.freshness.slaMinutes,
      passedChecks,
      totalChecks: passport.validationChecks.length,
      mappedNodes: passport.transformationSteps.length,
      totalNodes: passport.transformationSteps.length,
      sourceUptimePercent: passport.trustScore.factors.sourceReliability.uptimePercent,
      anomalyCountLast14d: anomalyCount,
      daysSinceBreakingChange: passport.trustScore.factors.transformationStability.daysSinceBreakingChange,
    },
    weights
  );

  const resetToProduction = () => {
    setLatencyMinutes(passport.freshness.latencyMinutes);
    setPassedChecks(passport.validationChecks.length);
    setAnomalyCount(0);
    setWeights(DEFAULT_WEIGHTS);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span>Trust Engine</span>
                <span>/</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">100% Explainable Algorithm</span>
              </div>
              <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                Explainable Metric Trust Score: {passport.name}
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
          
          {/* Top Score Banner */}
          <div className="p-5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs text-stone-500 mb-1">
                Deterministic Composite Reliability Index
              </div>
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-4xl font-bold text-stone-900 dark:text-stone-50">
                  {simulatedScore.totalScore}
                </span>
                <span className="text-sm font-mono text-stone-500">/ 100</span>
                <span className={`text-sm font-semibold ${
                  simulatedScore.totalScore >= 90 ? 'text-emerald-600' : simulatedScore.totalScore >= 75 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {simulatedScore.rating}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowWeightSliders(!showWeightSliders)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-stone-200 dark:border-stone-800 rounded-md hover:bg-white dark:hover:bg-stone-900 transition-colors text-stone-700 dark:text-stone-300"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Adjust Weights</span>
              </button>

              <button
                onClick={resetToProduction}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-stone-200 dark:border-stone-800 rounded-md hover:bg-white dark:hover:bg-stone-900 transition-colors text-stone-700 dark:text-stone-300"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Production</span>
              </button>
            </div>
          </div>

          {/* Mathematical Formula Display */}
          <div className="p-4 bg-stone-950 text-stone-100 rounded-lg border border-stone-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                DETERMINISTIC EVALUATION FORMULA
              </span>
              <span>Zero LLM Randomness</span>
            </div>
            <pre className="font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre-wrap">
              {simulatedScore.mathematicalFormula}
            </pre>
            <p className="text-[11px] text-stone-400 pt-1">
              Linear weighted average combining Freshness (20%), Assertions (25%), Lineage completeness (20%), Upstream uptime (15%), Z-score outliers (10%), and Schema stability (10%).
            </p>
          </div>

          {/* Interactive Scenario Sandbox Slider Bar */}
          <div className="p-4 bg-stone-100 dark:bg-stone-900/60 rounded-lg border border-stone-200 dark:border-stone-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-900 dark:text-stone-100">
              <span>Interactive Stress Tester (Test Score Sensitivity)</span>
              <span className="text-stone-500 font-normal">Drag sliders to simulate data pipeline degradation</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              
              {/* Latency Slider */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-stone-600 dark:text-stone-400">Data Latency</span>
                  <span className="font-mono font-semibold">{latencyMinutes}m (SLA: {passport.freshness.slaMinutes}m)</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="300"
                  value={latencyMinutes}
                  onChange={(e) => setLatencyMinutes(Number(e.target.value))}
                  className="w-full accent-stone-900 dark:accent-stone-100"
                />
              </div>

              {/* Passed Checks Slider */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-stone-600 dark:text-stone-400">Passed Assertions</span>
                  <span className="font-mono font-semibold">{passedChecks} / {passport.validationChecks.length}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={passport.validationChecks.length}
                  value={passedChecks}
                  onChange={(e) => setPassedChecks(Number(e.target.value))}
                  className="w-full accent-stone-900 dark:accent-stone-100"
                />
              </div>

              {/* Anomalies Slider */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-stone-600 dark:text-stone-400">Detected 3σ Anomalies</span>
                  <span className="font-mono font-semibold">{anomalyCount}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  value={anomalyCount}
                  onChange={(e) => setAnomalyCount(Number(e.target.value))}
                  className="w-full accent-stone-900 dark:accent-stone-100"
                />
              </div>

            </div>
          </div>

          {/* 6 Component Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 1. Freshness */}
            <div className="p-4 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-500" />
                  1. Freshness & SLA Latency
                </span>
                <span className="font-mono text-xs font-semibold text-stone-900 dark:text-stone-100">
                  {simulatedScore.factors.freshness.score}/100 (Weight: {Math.round(weights.freshness * 100)}%)
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                {simulatedScore.factors.freshness.explanation}
              </p>
              <div className="text-[11px] font-mono text-stone-500">
                Observed: {latencyMinutes}m · Target SLA: &lt; {passport.freshness.slaMinutes}m
              </div>
            </div>

            {/* 2. Validation */}
            <div className="p-4 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-stone-500" />
                  2. Validation Assertions
                </span>
                <span className="font-mono text-xs font-semibold text-stone-900 dark:text-stone-100">
                  {simulatedScore.factors.validation.score}/100 (Weight: {Math.round(weights.validation * 100)}%)
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                {simulatedScore.factors.validation.explanation}
              </p>
              <div className="text-[11px] font-mono text-stone-500">
                Passing: {passedChecks}/{passport.validationChecks.length} Great Expectations suites
              </div>
            </div>

            {/* 3. Lineage Completeness */}
            <div className="p-4 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-stone-500" />
                  3. Lineage Completeness
                </span>
                <span className="font-mono text-xs font-semibold text-stone-900 dark:text-stone-100">
                  {simulatedScore.factors.lineageCompleteness.score}/100 (Weight: {Math.round(weights.lineageCompleteness * 100)}%)
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                {simulatedScore.factors.lineageCompleteness.explanation}
              </p>
              <div className="text-[11px] font-mono text-stone-500">
                Nodes Mapped: {passport.transformationSteps.length}/{passport.transformationSteps.length}
              </div>
            </div>

            {/* 4. Source Reliability */}
            <div className="p-4 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-stone-500" />
                  4. Source Storage Reliability
                </span>
                <span className="font-mono text-xs font-semibold text-stone-900 dark:text-stone-100">
                  {simulatedScore.factors.sourceReliability.score}/100 (Weight: {Math.round(weights.sourceReliability * 100)}%)
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                {simulatedScore.factors.sourceReliability.explanation}
              </p>
              <div className="text-[11px] font-mono text-stone-500">
                Database Uptime: {simulatedScore.factors.sourceReliability.value}
              </div>
            </div>

            {/* 5. Recent Anomalies */}
            <div className="p-4 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-stone-500" />
                  5. Time-Series Stability
                </span>
                <span className="font-mono text-xs font-semibold text-stone-900 dark:text-stone-100">
                  {simulatedScore.factors.recentAnomalies.score}/100 (Weight: {Math.round(weights.recentAnomalies * 100)}%)
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                {simulatedScore.factors.recentAnomalies.explanation}
              </p>
              <div className="text-[11px] font-mono text-stone-500">
                Outliers: {anomalyCount} in trailing 14 daily checkpoints
              </div>
            </div>

            {/* 6. Transformation Stability */}
            <div className="p-4 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
                  6. Transformation Stability
                </span>
                <span className="font-mono text-xs font-semibold text-stone-900 dark:text-stone-100">
                  {simulatedScore.factors.transformationStability.score}/100 (Weight: {Math.round(weights.transformationStability * 100)}%)
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                {simulatedScore.factors.transformationStability.explanation}
              </p>
              <div className="text-[11px] font-mono text-stone-500">
                Days Since Breaking Logic Change: {simulatedScore.factors.transformationStability.daysSinceBreakingChange} days
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-md"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
