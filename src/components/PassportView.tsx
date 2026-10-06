import React from 'react';
import { 
  MetricPassport, 
  Role 
} from '../types/passport';
import { 
  ShieldCheck, 
  Clock, 
  GitCommit, 
  User, 
  Hash, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Database, 
  Filter, 
  Cpu, 
  DollarSign, 
  FileText, 
  Download, 
  GitCompare, 
  Activity, 
  Zap,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface PassportViewProps {
  passport: MetricPassport;
  currentRole: Role;
  onOpenEvidence: () => void;
  onOpenImpact: () => void;
  onOpenTrustDetail: () => void;
  onOpenLineageGraph: () => void;
  onOpenAnomalyDetector: () => void;
  onExportJson: () => void;
}

export const PassportView: React.FC<PassportViewProps> = ({
  passport,
  currentRole,
  onOpenEvidence,
  onOpenImpact,
  onOpenTrustDetail,
  onOpenLineageGraph,
  onOpenAnomalyDetector,
  onExportJson,
}) => {
  const trust = passport.trustScore;

  // Role-specific highlight banner
  const getRoleLensNote = () => {
    switch (currentRole) {
      case 'Data Engineer':
        return `Data Engineer View: Partitioned on S3 Parquet. dbt run ID: ${passport.freshness.runId}. Freshness SLA: ${passport.freshness.slaMinutes}m.`;
      case 'Data Analyst':
        return `Data Analyst View: Standard aggregation on ${passport.aggregationDetails.targetColumn}. Zero nulls detected in primary grain.`;
      case 'Data Scientist':
        return `Data Scientist View: Trailing 90-day z-scores within normal distribution (1.1σ). Ready for feature store export.`;
      case 'ML Engineer':
        return `ML Engineer View: Mapped to Feast feature store ('feat_user_spend_30d'). Downstream model: churn_risk_v3.`;
      case 'Business Analyst':
        return `Business Analyst View: Multi-currency converted via daily ECB mid-market fix. GAAP & IFRS 15 compliant.`;
      case 'AI Engineer':
        return `AI Engineer View: Semantic layer certified. Deterministic execution endpoint active for RAG context.`;
      case 'Backend Engineer':
        return `Backend Engineer View: Lineage API cache TTL 300s. p99 response time: 24ms.`;
      case 'Platform Engineer':
        return `Platform Engineer View: Cluster uptime: ${trust.factors.sourceReliability.value}. Contract certified with SHA256.`;
      case 'Research Engineer':
        return `Research Engineer View: 3 active experiment definitions logged. A/B delta test available.`;
    }
  };

  return (
    <div className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-xs">
      
      {/* Top Formal Passport Bar */}
      <div className="bg-stone-900 text-stone-100 dark:bg-stone-900 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-stone-800 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono text-stone-400">{passport.code}</span>
              <span className="text-stone-600">/</span>
              <span className="text-emerald-400 font-medium">{passport.status}</span>
              <span className="text-stone-600">/</span>
              <span className="font-mono text-stone-300">{passport.version}</span>
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              Official Metric Passport
            </h1>
          </div>
        </div>

        {/* Passport Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-stone-800 hover:bg-stone-700 text-stone-200 rounded transition-colors"
            title="Download machine-readable Passport JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>passport.json</span>
          </button>
          
          <button
            onClick={onOpenImpact}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded transition-colors"
            title="Simulate rule changes and downstream impact"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Simulate Impact</span>
          </button>

          <button
            onClick={onOpenEvidence}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-500 hover:bg-emerald-600 text-stone-950 font-semibold rounded transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Show Me The Evidence</span>
          </button>
        </div>
      </div>

      {/* Role Lens Notice */}
      <div className="bg-stone-100 dark:bg-stone-900/60 border-b border-stone-200 dark:border-stone-800/80 px-6 py-2 flex items-center justify-between text-xs text-stone-700 dark:text-stone-300">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-stone-900 dark:text-stone-100 font-mono text-[11px] uppercase tracking-wider">
            {currentRole}:
          </span>
          <span>{getRoleLensNote()}</span>
        </div>
        <div className="text-[11px] text-stone-600 dark:text-stone-400 font-mono hidden md:block">
          Commit: {passport.gitCommit}
        </div>
      </div>

      {/* Main Passport Content Body */}
      <div className="p-6">
        
        {/* Core Value & Primary Metadata Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6 border-b border-stone-200 dark:border-stone-800">
          
          {/* Main Metric Value & Description */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
              <span>{passport.category}</span>
              <span aria-hidden="true">·</span>
              <span>{passport.period}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{passport.sourceData.primaryTable}</span>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="font-mono text-4xl sm:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
                {passport.currentValue}
              </span>
              <span className="text-sm font-mono text-stone-500 dark:text-stone-400">
                ({passport.unit})
              </span>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400 max-w-xl">
              Machine-audited aggregated metric representing realized top-line revenue after multi-currency normalization, delivered order validation, and exclusion of chargebacks and returns.
            </p>

            {/* Owner & Freshness Inline Data */}
            <div className="flex flex-wrap items-center gap-4 text-xs pt-2">
              <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                <User className="w-3.5 h-3.5 text-stone-400" />
                <span>Owner: <strong>{passport.owner.name}</strong> ({passport.owner.team})</span>
              </div>
              <span className="text-stone-300 dark:text-stone-700">·</span>
              <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>Freshness: <strong>{passport.freshness.lastUpdated}</strong></span>
                <span className="text-stone-500 font-mono">(SLA: &lt;{passport.freshness.slaMinutes}m)</span>
              </div>
            </div>
          </div>

          {/* Explainable Trust Score Box */}
          <div className="lg:col-span-5 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                  Explainable Metric Trust Score
                </span>
              </div>
              <button
                onClick={onOpenTrustDetail}
                className="text-[11px] font-mono text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 underline decoration-dotted"
              >
                Inspect Formula →
              </button>
            </div>

            <div className="flex items-baseline gap-3 mb-3">
              <span className="font-mono text-3xl font-bold text-stone-900 dark:text-stone-100">
                {trust.totalScore}
              </span>
              <span className="text-xs font-mono text-stone-500">/ 100</span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {trust.rating}
              </span>
            </div>

            {/* Transparent Factor Mini-Bars */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-600 dark:text-stone-400">Freshness (20%)</span>
                <span className="font-mono text-stone-800 dark:text-stone-200">{trust.factors.freshness.score}/100</span>
              </div>
              <div className="w-full bg-stone-200 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${trust.factors.freshness.score}%` }} />
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-600 dark:text-stone-400">Validation Tests (25%)</span>
                <span className="font-mono text-stone-800 dark:text-stone-200">{trust.factors.validation.score}/100</span>
              </div>
              <div className="w-full bg-stone-200 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${trust.factors.validation.score}%` }} />
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-600 dark:text-stone-400">Lineage Completeness (20%)</span>
                <span className="font-mono text-stone-800 dark:text-stone-200">{trust.factors.lineageCompleteness.score}/100</span>
              </div>
              <div className="w-full bg-stone-200 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${trust.factors.lineageCompleteness.score}%` }} />
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-stone-200 dark:border-stone-800/80 flex items-center justify-between text-[11px] text-stone-500">
              <span>0% Black-box AI · 100% Mathematical</span>
              <button onClick={onOpenTrustDetail} className="hover:underline">
                View weights
              </button>
            </div>
          </div>

        </div>

        {/* The Signature Machine-Readable Lineage Ribbon */}
        <div className="py-6 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                End-to-End Transformation Pipeline
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Exact derivation path from raw ingestion to the final certified number
              </p>
            </div>
            <button
              onClick={onOpenLineageGraph}
              className="text-xs text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1 font-medium"
            >
              <span>Explore Visual DAG</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sequential Step Cards with Arrows */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            {passport.transformationSteps.map((step, idx) => (
              <div
                key={step.stepNumber}
                onClick={onOpenEvidence}
                className="bg-stone-50 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 rounded-lg p-3 hover:border-stone-400 dark:hover:border-stone-700 cursor-pointer transition-all group relative"
              >
                <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 mb-1">
                  <span className="font-mono">Step {step.stepNumber}</span>
                  <span className="capitalize">{step.type}</span>
                </div>

                <div className="font-medium text-xs text-stone-900 dark:text-stone-100 mb-1 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {step.name}
                </div>

                <div className="text-[11px] font-mono text-stone-600 dark:text-stone-300">
                  {step.outputRowCount.toLocaleString()} rows
                </div>

                {step.rowsDropped > 0 && (
                  <div className="text-[10px] text-amber-700 dark:text-amber-300 mt-1">
                    -{step.rowsDropped.toLocaleString()} excluded
                  </div>
                )}

                {/* Connection Arrow indicator on desktop */}
                {idx < passport.transformationSteps.length - 1 && (
                  <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-stone-400">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* The Prompt's Exact Signature Representation */}
          <div className="mt-4 p-3 bg-stone-100 dark:bg-stone-900 rounded-md font-mono text-xs text-stone-700 dark:text-stone-300 flex flex-wrap items-center gap-2">
            <span className="font-semibold text-stone-900 dark:text-stone-100">Lineage:</span>
            <span>{passport.name}</span>
            <span className="text-stone-400">↓</span>
            <span>Orders Table ({passport.sourceData.rawRowCount.toLocaleString()} rows)</span>
            <span className="text-stone-400">↓</span>
            <span>Completed Orders (1,164,300)</span>
            <span className="text-stone-400">↓</span>
            <span>Currency Conversion (ECB fx)</span>
            <span className="text-stone-400">↓</span>
            <span>Refund Exclusion (-41,200 rows)</span>
            <span className="text-stone-400">↓</span>
            <span>SUM(amount)</span>
            <span className="text-stone-400">↓</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{passport.currentValue}</span>
          </div>
        </div>

        {/* Bottom Three Evidence Cards: Filters, Validation, Anomaly Status */}
        <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Active Exclusion Filters */}
          <div className="p-4 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-stone-500" />
                Active Filters ({passport.filtersApplied.length})
              </span>
              <button onClick={onOpenEvidence} className="text-[11px] text-stone-500 hover:underline">
                View SQL
              </button>
            </div>
            <ul className="space-y-2 text-xs">
              {passport.filtersApplied.map((filter, i) => (
                <li key={i} className="text-stone-600 dark:text-stone-400 border-l-2 border-stone-300 dark:border-stone-700 pl-2">
                  <div className="font-mono text-[11px] text-stone-900 dark:text-stone-200">{filter.condition}</div>
                  <div className="text-[10px] text-stone-500">{filter.rowsExcluded.toLocaleString()} rows dropped</div>
                </li>
              ))}
            </ul>
          </div>

          {/* Validation Suite Health */}
          <div className="p-4 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Data Quality Suite
              </span>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                {passport.validationChecks.length}/{passport.validationChecks.length} Passing
              </span>
            </div>
            <ul className="space-y-2 text-xs">
              {passport.validationChecks.slice(0, 3).map((check) => (
                <li key={check.id} className="flex items-start justify-between gap-2 text-stone-600 dark:text-stone-400">
                  <span className="text-[11px] truncate">{check.name}</span>
                  <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">PASSED</span>
                </li>
              ))}
            </ul>
            <button
              onClick={onOpenEvidence}
              className="mt-3 text-[11px] text-stone-500 hover:underline block"
            >
              + {passport.validationChecks.length - 3} more automated assertions →
            </button>
          </div>

          {/* Statistical Anomaly Monitor */}
          <div className="p-4 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-stone-500" />
                Time-Series Outliers
              </span>
              <button onClick={onOpenAnomalyDetector} className="text-[11px] text-stone-500 hover:underline">
                View Curve
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="text-stone-600 dark:text-stone-400">
                Current value is <strong className="text-stone-900 dark:text-stone-100 font-mono">0.01σ</strong> from the 30-day rolling expectation.
              </div>
              <div className="text-[11px] text-stone-500">
                Zero unexplained statistical anomalies detected in the last 14 days.
              </div>
              <button
                onClick={onOpenAnomalyDetector}
                className="mt-2 w-full py-1.5 text-xs text-center border border-stone-200 dark:border-stone-800 rounded hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors font-medium text-stone-700 dark:text-stone-300"
              >
                Inspect 3-Sigma Anomaly Bands
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
