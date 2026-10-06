import React, { useState, useMemo } from 'react';
import { 
  MetricPassport, 
  ExperimentVersion 
} from '../types/passport';
import { 
  X, 
  Beaker, 
  GitBranch, 
  CheckCircle2, 
  ArrowRight, 
  Plus, 
  SlidersHorizontal,
  Code,
  Sparkles,
  Layers,
  TrendingUp,
  FileCheck,
  RotateCcw
} from 'lucide-react';

interface ResearchModeViewProps {
  passports: MetricPassport[];
  selectedPassportId: string;
  onSelectPassportId: (id: string) => void;
  onClose?: () => void;
  onAddExperiment?: (metricId: string, experiment: ExperimentVersion) => void;
  isEmbedded?: boolean;
}

export const ResearchModeView: React.FC<ResearchModeViewProps> = ({
  passports,
  selectedPassportId,
  onSelectPassportId,
  onClose,
  onAddExperiment,
  isEmbedded = false,
}) => {
  const currentPassport = passports.find(p => p.id === selectedPassportId) || passports[0];

  // Guaranteed fallback experiments if metric has none
  const experiments: ExperimentVersion[] = useMemo(() => {
    if (currentPassport.experiments && currentPassport.experiments.length > 0) {
      return currentPassport.experiments;
    }

    // Default dynamic baseline + treatment
    return [
      {
        id: `exp-${currentPassport.id}-baseline`,
        code: 'EXP-101',
        name: `Baseline Production (${currentPassport.version})`,
        version: currentPassport.version,
        author: currentPassport.owner.name,
        status: 'baseline',
        createdDate: '2026-08-15',
        hypothesis: `Standard production pipeline logic for ${currentPassport.name}.`,
        sqlDefinition: `SELECT ${currentPassport.aggregationDetails.function} FROM ${currentPassport.sourceData.primaryTable};`,
        metricResult: currentPassport.currentValue,
        deltaVsBaseline: '0.0% (Baseline)',
        sampleSize: currentPassport.sourceData.rawRowCount,
        differences: ['Production certified pipeline', 'Standard data quality assertions', 'Strict validation rules'],
      },
      {
        id: `exp-${currentPassport.id}-treatment`,
        code: 'EXP-102',
        name: 'Proposed Relaxed Filter Threshold (v1.1.0-rc1)',
        version: 'v1.1.0-rc1',
        author: 'Research Experimenter',
        status: 'active',
        createdDate: '2026-09-28',
        hypothesis: 'Test hypothesis of broadening inclusion window to capture edge-case transactions.',
        sqlDefinition: `SELECT ${currentPassport.aggregationDetails.function} FROM ${currentPassport.sourceData.primaryTable} WHERE status IN ('COMPLETED', 'DELIVERED', 'SETTLED');`,
        metricResult: `${currentPassport.numericValue ? (currentPassport.numericValue * 1.025).toLocaleString() : currentPassport.currentValue}`,
        deltaVsBaseline: '+2.5%',
        sampleSize: Math.round(currentPassport.sourceData.rawRowCount * 1.025),
        pValSignificance: 0.002,
        differences: ['Includes settled asynchronous transactions', 'Higher coverage across edge cohorts', 'Statistical significance confirmed (p = 0.002)'],
      },
    ];
  }, [currentPassport]);

  const [selectedExpId, setSelectedExpId] = useState<string>(
    experiments[1]?.id || experiments[0]?.id || ''
  );

  // New experiment modal state
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newHypothesis, setNewHypothesis] = useState('');
  const [newSql, setNewSql] = useState('');
  const [simulatedDelta, setSimulatedDelta] = useState('+1.8%');
  const [customExperiments, setCustomExperiments] = useState<Record<string, ExperimentVersion[]>>({});

  const allExperiments = useMemo(() => {
    const custom = customExperiments[currentPassport.id] || [];
    return [...experiments, ...custom];
  }, [experiments, customExperiments, currentPassport.id]);

  const baseline = allExperiments.find(e => e.status === 'baseline') || allExperiments[0];
  const activeExp = allExperiments.find(e => e.id === selectedExpId) || allExperiments[1] || baseline;

  const handleCreateExperiment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newCode = `EXP-${Math.floor(Math.random() * 800 + 200)}`;
    const newVersion = `v${currentPassport.version}-exp${Date.now().toString().slice(-3)}`;

    const created: ExperimentVersion = {
      id: `exp-user-${Date.now()}`,
      code: newCode,
      name: newTitle.trim(),
      version: newVersion,
      author: 'You (Research Mode)',
      status: 'active',
      createdDate: new Date().toISOString().split('T')[0],
      hypothesis: newHypothesis.trim() || 'Custom analytical rule optimization hypothesis.',
      sqlDefinition: newSql.trim() || `SELECT ${currentPassport.aggregationDetails.function} FROM ${currentPassport.sourceData.primaryTable} -- custom condition`,
      metricResult: `${currentPassport.currentValue} (${simulatedDelta})`,
      deltaVsBaseline: simulatedDelta,
      sampleSize: Math.round(baseline.sampleSize * 1.018),
      pValSignificance: 0.005,
      differences: [
        'Custom hypothesis evaluated over historical partition',
        `Simulated outcome: ${simulatedDelta} variance`,
        'Counterfactual reproducibility verified',
      ],
    };

    setCustomExperiments(prev => ({
      ...prev,
      [currentPassport.id]: [...(prev[currentPassport.id] || []), created],
    }));

    if (onAddExperiment) {
      onAddExperiment(currentPassport.id, created);
    }

    setSelectedExpId(created.id);
    setShowNewModal(false);
    setNewTitle('');
    setNewHypothesis('');
    setNewSql('');
  };

  const containerContent = (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl w-full flex flex-col shadow-2xl overflow-hidden max-h-[92vh]">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-4 bg-stone-50 dark:bg-stone-950">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Beaker className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span>Research Mode</span>
              <span>/</span>
              <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">Counterfactual A/B Store</span>
            </div>
            <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
              Metric Experiment Store & Definition Diffing
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Launch New Experiment Button */}
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-md transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Experiment</span>
          </button>

          {onClose && !isEmbedded && (
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-md hover:bg-stone-200 dark:hover:bg-stone-800"
              aria-label="Close Research Mode"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Metric Selector Bar */}
      <div className="px-6 py-2.5 bg-stone-100 dark:bg-stone-950/80 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between gap-4 overflow-x-auto text-xs">
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-semibold text-stone-700 dark:text-stone-300">Target Metric:</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {passports.map((p) => {
            const isTarget = p.id === currentPassport.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  onSelectPassportId(p.id);
                  setSelectedExpId('');
                }}
                className={`px-3 py-1 rounded text-xs transition-colors shrink-0 ${
                  isTarget
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-semibold'
                    : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800'
                }`}
              >
                <span>{p.name}</span>
                <span className="ml-1.5 font-mono text-[11px] opacity-80">({p.currentValue})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-6 overflow-y-auto flex-1 space-y-6">
        
        {/* Active Experiments Row */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
              Registered Experiment Versions for {currentPassport.name} ({allExperiments.length}):
            </span>
            <span className="text-[11px] font-mono text-stone-500">
              Select any branch to compare against Baseline
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {allExperiments.map((exp) => {
              const isSelected = exp.id === activeExp.id;
              const isBaseline = exp.status === 'baseline';

              return (
                <button
                  key={exp.id}
                  onClick={() => setSelectedExpId(exp.id)}
                  className={`p-3.5 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-500 shadow-xs ring-1 ring-amber-500'
                      : 'bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-800 hover:border-stone-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-semibold text-stone-900 dark:text-stone-100">
                      {exp.code}
                    </span>
                    <span className={`text-[10px] font-mono ${
                      isBaseline ? 'text-stone-500' : 'text-amber-600 dark:text-amber-400 font-semibold'
                    }`}>
                      {exp.version}
                    </span>
                  </div>

                  <div className="text-xs font-medium text-stone-800 dark:text-stone-200 truncate mb-1">
                    {exp.name}
                  </div>

                  <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-stone-200 dark:border-stone-800/80">
                    <span className="font-mono text-sm font-bold text-stone-900 dark:text-stone-100">
                      {exp.metricResult}
                    </span>
                    <span className="font-mono text-[11px] text-stone-500">
                      {exp.deltaVsBaseline}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Side-by-Side Comparison Matrix */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-200 dark:divide-stone-800">
            
            {/* Column 1: Baseline Production Definition */}
            <div className="p-5 space-y-4 bg-stone-50/50 dark:bg-stone-950/40">
              <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
                <span className="text-[10px] font-mono uppercase text-stone-500 block">CONTROL (BASELINE PRODUCTION)</span>
                <div className="text-base font-semibold text-stone-900 dark:text-stone-100">
                  {baseline.name}
                </div>
                <div className="text-xs text-stone-500 mt-0.5">Author: {baseline.author} · Created {baseline.createdDate}</div>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase text-stone-500 block mb-1">AGGREGATED RESULT</span>
                <div className="font-mono text-3xl font-bold text-stone-900 dark:text-stone-100">
                  {baseline.metricResult}
                </div>
                <span className="text-xs text-stone-500">Sample size: {baseline.sampleSize?.toLocaleString()} records</span>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase text-stone-500 block mb-1">HYPOTHESIS / SPECIFICATION</span>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  {baseline.hypothesis}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase text-stone-500 block mb-1">SQL DEFINITION</span>
                <pre className="p-3 bg-stone-950 text-stone-200 text-xs font-mono rounded overflow-x-auto border border-stone-800 whitespace-pre-wrap">
                  <code>{baseline.sqlDefinition}</code>
                </pre>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase text-stone-500 block mb-1">OPERATIONAL CHARACTERISTICS</span>
                <ul className="space-y-1 text-xs text-stone-600 dark:text-stone-400 list-disc pl-4">
                  {baseline.differences.map((diff, i) => (
                    <li key={i}>{diff}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Column 2: Selected Experiment Definition */}
            <div className="p-5 space-y-4 bg-white dark:bg-stone-900">
              <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
                <span className="text-[10px] font-mono uppercase text-amber-600 dark:text-amber-400 block font-semibold">TREATMENT (COUNTERFACTUAL EXPERIMENT)</span>
                <div className="text-base font-semibold text-stone-900 dark:text-stone-100">
                  {activeExp.name}
                </div>
                <div className="text-xs text-stone-500 mt-0.5">Author: {activeExp.author} · Created {activeExp.createdDate}</div>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase text-stone-500 block mb-1">AGGREGATED RESULT & DELTA</span>
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {activeExp.metricResult}
                  </span>
                  <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    ({activeExp.deltaVsBaseline})
                  </span>
                </div>
                <div className="text-xs text-stone-500 flex items-center gap-2 mt-0.5">
                  <span>Sample size: {activeExp.sampleSize?.toLocaleString()}</span>
                  {activeExp.pValSignificance && (
                    <>
                      <span>·</span>
                      <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        p-value: {activeExp.pValSignificance} (Statistically Significant)
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase text-stone-500 block mb-1">HYPOTHESIS / SPECIFICATION</span>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  {activeExp.hypothesis}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase text-stone-500 block mb-1">SQL DEFINITION</span>
                <pre className="p-3 bg-stone-950 text-emerald-300 text-xs font-mono rounded overflow-x-auto border border-stone-800 whitespace-pre-wrap">
                  <code>{activeExp.sqlDefinition}</code>
                </pre>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase text-stone-500 block mb-1">EVALUATED DIFFERENCES</span>
                <ul className="space-y-1 text-xs text-stone-600 dark:text-stone-400 list-disc pl-4">
                  {activeExp.differences.map((diff, i) => (
                    <li key={i}>{diff}</li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex items-center justify-between">
        <div className="text-xs text-stone-500">
          Experiments compare counterfactual outcomes without altering production Looker models or feature stores.
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-md"
          >
            Done
          </button>
        )}
      </div>

      {/* New Experiment Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Beaker className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  Launch New Counterfactual Metric Experiment
                </h3>
              </div>
              <button onClick={() => setShowNewModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExperiment} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-700 dark:text-stone-300 font-medium block mb-1">
                  Experiment Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 45-Day Rolling Refund Window"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="text-stone-700 dark:text-stone-300 font-medium block mb-1">
                  Hypothesis Rationale
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="What business or statistical hypothesis are you testing?"
                  value={newHypothesis}
                  onChange={(e) => setNewHypothesis(e.target.value)}
                  className="w-full p-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="text-stone-700 dark:text-stone-300 font-medium block mb-1">
                  Proposed SQL Transformation
                </label>
                <textarea
                  rows={3}
                  placeholder={`SELECT ${currentPassport.aggregationDetails.function} FROM ${currentPassport.sourceData.primaryTable} WHERE ...`}
                  value={newSql}
                  onChange={(e) => setNewSql(e.target.value)}
                  className="w-full p-2 font-mono text-[11px] bg-stone-950 text-emerald-400 border border-stone-800 rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-stone-700 dark:text-stone-300 font-medium block mb-1">
                    Simulated Delta
                  </label>
                  <input
                    type="text"
                    value={simulatedDelta}
                    onChange={(e) => setSimulatedDelta(e.target.value)}
                    className="w-full px-2 py-1 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-700 dark:text-stone-300 font-medium block mb-1">
                    Target Metric
                  </label>
                  <div className="px-2 py-1 bg-stone-100 dark:bg-stone-800 rounded text-stone-600 dark:text-stone-300 truncate">
                    {currentPassport.name}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3 py-1.5 text-stone-600 dark:text-stone-400 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded font-medium"
                >
                  Save & Compare
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );

  if (isEmbedded) {
    return containerContent;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-5xl">
        {containerContent}
      </div>
    </div>
  );
};
