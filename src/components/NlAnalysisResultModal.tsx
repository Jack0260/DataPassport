import React from 'react';
import { StructuredAnalysisRequest } from '../utils/queryParser';
import { 
  X, 
  Sparkles, 
  Code, 
  CheckCircle2, 
  Layers, 
  Terminal, 
  Copy, 
  Check, 
  ExternalLink 
} from 'lucide-react';

interface NlAnalysisResultModalProps {
  request: StructuredAnalysisRequest | null;
  onClose: () => void;
  onViewPassport: () => void;
}

export const NlAnalysisResultModal: React.FC<NlAnalysisResultModalProps> = ({
  request,
  onClose,
  onViewPassport,
}) => {
  const [copiedSql, setCopiedSql] = React.useState(false);

  if (!request) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(request.deterministicSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span>Natural Language Compiler</span>
                <span>/</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Deterministic Execution</span>
              </div>
              <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                Structured Analysis Request: &quot;{request.rawQuery}&quot;
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
          
          {/* Resulting Value Banner */}
          <div className="p-5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono text-stone-500 block uppercase">
                DETERMINISTIC ANALYSIS OUTPUT
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="font-mono text-4xl font-bold text-stone-900 dark:text-stone-50">
                  {request.calculatedValueFormatted}
                </span>
                <span className="text-xs text-stone-500">
                  ({request.matchingRowsCount} matching rows / {request.totalRowsEvaluated} evaluated)
                </span>
              </div>
            </div>

            <button
              onClick={onViewPassport}
              className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors flex items-center gap-1.5"
            >
              <span>Inspect Supporting Evidence</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Structured Analysis JSON Schema Spec */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 bg-white dark:bg-stone-900 rounded border border-stone-200 dark:border-stone-800">
              <span className="text-stone-500 block text-[10px]">TARGET METRIC</span>
              <span className="font-semibold text-stone-900 dark:text-stone-100">{request.targetMetricName}</span>
            </div>
            <div className="p-3 bg-white dark:bg-stone-900 rounded border border-stone-200 dark:border-stone-800">
              <span className="text-stone-500 block text-[10px]">TIME GRANULARITY</span>
              <span className="text-stone-900 dark:text-stone-100">{request.timeGranularity}</span>
            </div>
            <div className="p-3 bg-white dark:bg-stone-900 rounded border border-stone-200 dark:border-stone-800">
              <span className="text-stone-500 block text-[10px]">AGGREGATION</span>
              <span className="text-stone-900 dark:text-stone-100">{request.aggregationFunction}</span>
            </div>
          </div>

          {/* Deterministic Execution Trace */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 block">
              Compiler Execution Plan:
            </span>
            <div className="space-y-1.5 bg-stone-50 dark:bg-stone-950 p-3.5 rounded-lg border border-stone-200 dark:border-stone-800 text-xs">
              {request.executionSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-stone-700 dark:text-stone-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deterministic Generated SQL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                Compiled Deterministic SQL Query
              </span>
              <button
                onClick={handleCopySql}
                className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 flex items-center gap-1 font-mono"
              >
                {copiedSql ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
              </button>
            </div>
            <pre className="p-3 bg-stone-950 text-emerald-400 font-mono text-xs rounded-lg overflow-x-auto border border-stone-800">
              <code>{request.deterministicSql}</code>
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-md"
          >
            Close Query Result
          </button>
        </div>

      </div>
    </div>
  );
};
