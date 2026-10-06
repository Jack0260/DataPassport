import React, { useState } from 'react';
import { 
  MetricPassport, 
  MetricImpactScenario, 
  ImpactedEntity 
} from '../types/passport';
import { 
  X, 
  GitCompare, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  FileSpreadsheet, 
  LayoutDashboard, 
  Cpu, 
  Network, 
  Send,
  FileCheck
} from 'lucide-react';

interface ImpactSimulatorProps {
  passport: MetricPassport;
  onClose: () => void;
}

export const ImpactSimulator: React.FC<ImpactSimulatorProps> = ({
  passport,
  onClose,
}) => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const [customDays, setCustomDays] = useState<number>(14);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [prCreatedNotification, setPrCreatedNotification] = useState<string | null>(null);

  const scenario = passport.impactScenarios[selectedScenarioIndex] || passport.impactScenarios[0];

  const handleCreateGovernancePr = () => {
    setPrCreatedNotification(`Created RFC #409: "Update ${passport.name} transformation rules" submitted to Data Governance Board.`);
    setTimeout(() => {
      setPrCreatedNotification(null);
    }, 4500);
  };

  const getSeverityBadge = (sev: ImpactedEntity['severity']) => {
    switch (sev) {
      case 'critical':
        return <span className="text-[10px] font-mono font-medium text-red-600 dark:text-red-400">CRITICAL</span>;
      case 'high':
        return <span className="text-[10px] font-mono font-medium text-amber-600 dark:text-amber-400">HIGH</span>;
      case 'medium':
        return <span className="text-[10px] font-mono font-medium text-blue-600 dark:text-blue-400">MEDIUM</span>;
      default:
        return <span className="text-[10px] font-mono font-medium text-stone-500">LOW</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <GitCompare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span>Transformation Lineage</span>
                <span>/</span>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">Blast Radius Analysis</span>
              </div>
              <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                Metric Change Impact: {passport.name}
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

        {/* PR Notification Toast */}
        {prCreatedNotification && (
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 px-6 py-2.5 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{prCreatedNotification}</span>
            </div>
            <span className="font-mono text-[11px]">Git branch: rfc/metric-rule-update-409</span>
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Scenario Selector */}
          <div>
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-2">
              Select Proposed Rule Modification Scenario:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {passport.impactScenarios.map((scen, idx) => (
                <button
                  key={scen.id}
                  onClick={() => {
                    setSelectedScenarioIndex(idx);
                    setIsCustomMode(false);
                  }}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedScenarioIndex === idx && !isCustomMode
                      ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-500/60 shadow-xs'
                      : 'bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-800 hover:border-stone-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-900 dark:text-stone-100 mb-1">
                    <span>{scen.title}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">
                      {scen.simulatedMetricDelta}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-2">
                    {scen.ruleChangeDescription}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Simulated Impact Scorecard */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-stone-100 dark:bg-stone-900/60 rounded-lg border border-stone-200 dark:border-stone-800">
            <div>
              <span className="text-stone-500 block text-[11px] font-mono uppercase">CURRENT PRODUCTION VALUE</span>
              <span className="font-mono text-2xl font-bold text-stone-900 dark:text-stone-100">
                {passport.currentValue}
              </span>
            </div>

            <div>
              <span className="text-stone-500 block text-[11px] font-mono uppercase">SIMULATED VALUE AFTER RULE CHANGE</span>
              <span className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {selectedScenarioIndex === 0 ? '₹85.26M' : '₹84.36M'}
              </span>
            </div>

            <div>
              <span className="text-stone-500 block text-[11px] font-mono uppercase">NET DELTA IMPACT</span>
              <span className="font-mono text-2xl font-bold text-amber-600 dark:text-amber-400">
                {scenario.simulatedMetricDelta}
              </span>
            </div>
          </div>

          {/* SQL Diff View (Before vs After) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                Transformation Logic Diff (SQL)
              </span>
              <span className="text-[11px] font-mono text-stone-500">
                models/marts/finance/fct_net_revenue.sql
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-lg text-red-300">
                <span className="text-[10px] text-red-400 uppercase block mb-1 font-semibold">
                  - BEFORE (Current Production Rule)
                </span>
                <pre className="whitespace-pre-wrap">{scenario.sqlDiff.before}</pre>
              </div>

              <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-lg text-emerald-300">
                <span className="text-[10px] text-emerald-400 uppercase block mb-1 font-semibold">
                  + AFTER (Proposed Modification)
                </span>
                <pre className="whitespace-pre-wrap">{scenario.sqlDiff.after}</pre>
              </div>
            </div>
          </div>

          {/* Downstream Blast Radius Matrix across 5 Categories */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Identified Downstream Blast Radius
              </h3>
              <p className="text-xs text-stone-500">
                Automated traversal of DAG dependencies, feature stores, and reporting artifacts
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Category 1: Other Metrics Affected */}
              <div className="p-4 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
                  <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-stone-500" />
                    Metrics Affected ({scenario.metricsAffected.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {scenario.metricsAffected.map((item) => (
                    <div key={item.id} className="p-2.5 bg-stone-50 dark:bg-stone-950 rounded border border-stone-200 dark:border-stone-800 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-stone-900 dark:text-stone-100">{item.name}</span>
                        {getSeverityBadge(item.severity)}
                      </div>
                      <div className="text-[11px] text-stone-600 dark:text-stone-400">{item.description}</div>
                      {item.projectedDelta && (
                        <div className="mt-1 font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                          Delta: {item.projectedDelta}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Category 2: Reports Affected */}
              <div className="p-4 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
                  <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-stone-500" />
                    Statutory & Executive Reports ({scenario.reportsAffected.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {scenario.reportsAffected.map((item) => (
                    <div key={item.id} className="p-2.5 bg-stone-50 dark:bg-stone-950 rounded border border-stone-200 dark:border-stone-800 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-stone-900 dark:text-stone-100">{item.name}</span>
                        {getSeverityBadge(item.severity)}
                      </div>
                      <div className="text-[11px] text-stone-600 dark:text-stone-400">{item.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category 3: Dashboards Affected */}
              <div className="p-4 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
                  <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <LayoutDashboard className="w-3.5 h-3.5 text-stone-500" />
                    BI Dashboards Affected ({scenario.dashboardsAffected.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {scenario.dashboardsAffected.map((item) => (
                    <div key={item.id} className="p-2.5 bg-stone-50 dark:bg-stone-950 rounded border border-stone-200 dark:border-stone-800 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-stone-900 dark:text-stone-100">{item.name}</span>
                        {getSeverityBadge(item.severity)}
                      </div>
                      <div className="text-[11px] text-stone-600 dark:text-stone-400">{item.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category 4: ML Features & Models Affected */}
              <div className="p-4 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
                  <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-stone-500" />
                    ML Features & Pipelines Affected ({scenario.mlFeaturesAffected.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {scenario.mlFeaturesAffected.map((item) => (
                    <div key={item.id} className="p-2.5 bg-stone-50 dark:bg-stone-950 rounded border border-stone-200 dark:border-stone-800 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold font-mono text-stone-900 dark:text-stone-100">{item.name}</span>
                        {getSeverityBadge(item.severity)}
                      </div>
                      <div className="text-[11px] text-stone-600 dark:text-stone-400">{item.description}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Downstream Consumers Line */}
            {scenario.downstreamConsumers.length > 0 && (
              <div className="p-3 bg-stone-50 dark:bg-stone-950 rounded-lg border border-stone-200 dark:border-stone-800 text-xs">
                <span className="font-semibold text-stone-900 dark:text-stone-100 block mb-2">
                  External Downstream Pipelines & Integrations:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {scenario.downstreamConsumers.map((item) => (
                    <div key={item.id} className="flex items-start gap-2">
                      <Network className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-stone-800 dark:text-stone-200">{item.name}</div>
                        <div className="text-[11px] text-stone-500">{item.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-stone-500">
            Estimated audit review cycle: 2 business days. Requires FP&A + Data Eng lead sign-off.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateGovernancePr}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-md hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Create Governance RFC PR</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
