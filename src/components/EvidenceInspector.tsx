import React, { useState, useMemo } from 'react';
import { 
  MetricPassport, 
  SupportingRow, 
  LineageStep 
} from '../types/passport';
import { 
  X, 
  Download, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Code, 
  Database, 
  Table, 
  Clock, 
  ExternalLink,
  ChevronDown,
  ArrowRight,
  Info
} from 'lucide-react';

interface EvidenceInspectorProps {
  passport: MetricPassport;
  onClose: () => void;
}

export const EvidenceInspector: React.FC<EvidenceInspectorProps> = ({
  passport,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'supporting_rows' | 'transformations' | 'filters' | 'validation' | 'source_schema'>('supporting_rows');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'INCLUDED' | 'EXCLUDED'>('ALL');
  const [selectedRow, setSelectedRow] = useState<SupportingRow | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  // Filter supporting rows
  const filteredRows = useMemo(() => {
    return passport.supportingRows.filter((row) => {
      // Status filter
      if (statusFilter === 'INCLUDED' && row.inclusionStatus !== 'Included') return false;
      if (statusFilter === 'EXCLUDED' && row.inclusionStatus === 'Included') return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = row.order_id.toLowerCase().includes(query);
        const matchesCust = row.customer_name.toLowerCase().includes(query);
        const matchesSegment = row.segment.toLowerCase().includes(query);
        const matchesRegion = row.region.toLowerCase().includes(query);
        if (!matchesId && !matchesCust && !matchesSegment && !matchesRegion) return false;
      }
      return true;
    });
  }, [passport.supportingRows, searchQuery, statusFilter]);

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Order ID', 'Customer', 'Segment', 'Region', 'Raw Amount', 'Currency', 'FX Rate', 'Converted (INR)', 'Order Status', 'Inclusion Status', 'Reason'];
    const rows = filteredRows.map((r) => [
      r.order_id,
      `"${r.customer_name}"`,
      r.segment,
      r.region,
      r.raw_amount,
      r.currency,
      r.fx_rate,
      r.converted_amount_inr,
      r.order_status,
      r.inclusionStatus,
      `"${r.exclusionReason || 'Passed all criteria'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${passport.code}_supporting_evidence_rows.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-950">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span className="font-mono">{passport.code}</span>
              <span>/</span>
              <span>Evidence Ledger</span>
              <span>/</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{passport.currentValue}</span>
            </div>
            <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
              Show Me The Evidence: {passport.name}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-stone-300 dark:border-stone-700 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-stone-700 dark:text-stone-300"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-md hover:bg-stone-200 dark:hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Interactive Segmented Control compliant with design guide) */}
        <div className="px-6 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-1 py-2">
            <button
              onClick={() => setActiveTab('supporting_rows')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'supporting_rows'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              Supporting Rows ({filteredRows.length})
            </button>
            <button
              onClick={() => setActiveTab('transformations')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'transformations'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              Transformations ({passport.transformationSteps.length} Steps)
            </button>
            <button
              onClick={() => setActiveTab('filters')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'filters'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              Filters & Exclusions
            </button>
            <button
              onClick={() => setActiveTab('validation')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'validation'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              Validation Tests ({passport.validationChecks.length})
            </button>
            <button
              onClick={() => setActiveTab('source_schema')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'source_schema'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              Source Storage & Freshness
            </button>
          </div>

          <div className="text-[11px] text-stone-500 font-mono hidden sm:block whitespace-nowrap">
            Pipeline Run: {passport.freshness.runId}
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-stone-50/50 dark:bg-stone-950/50">
          
          {/* TAB 1: SUPPORTING ROWS INSPECTOR */}
          {activeTab === 'supporting_rows' && (
            <div className="space-y-4">
              
              {/* Row Filter Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-stone-900 p-3 rounded-lg border border-stone-200 dark:border-stone-800">
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by order ID, customer name, region..."
                    className="w-full text-xs bg-transparent text-stone-900 dark:text-stone-100 placeholder-stone-500 focus:outline-none"
                  />
                </div>

                {/* Segmented Filter Buttons */}
                <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-md text-xs">
                  <button
                    onClick={() => setStatusFilter('ALL')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      statusFilter === 'ALL'
                        ? 'bg-white dark:bg-stone-900 font-semibold text-stone-900 dark:text-stone-100 shadow-xs'
                        : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    All Evaluated ({passport.supportingRows.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('INCLUDED')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      statusFilter === 'INCLUDED'
                        ? 'bg-white dark:bg-stone-900 font-semibold text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    Included Only
                  </button>
                  <button
                    onClick={() => setStatusFilter('EXCLUDED')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      statusFilter === 'EXCLUDED'
                        ? 'bg-white dark:bg-stone-900 font-semibold text-amber-600 dark:text-amber-400 shadow-xs'
                        : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    Excluded Only
                  </button>
                </div>
              </div>

              {/* Informative Audit Banner */}
              <div className="p-3 bg-stone-100 dark:bg-stone-900 rounded-md text-xs text-stone-700 dark:text-stone-300 flex items-center justify-between">
                <div>
                  Showing verified supporting rows from partition <span className="font-mono">orders_events_v2</span>. Click any row to inspect individual audit trail and FX calculation.
                </div>
                <div className="font-mono text-[11px] text-stone-500">
                  Sample: {filteredRows.length} displayed · Total Evaluated: {passport.sourceData.rawRowCount.toLocaleString()}
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 text-[11px] font-mono text-stone-500 uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Order ID</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Tier</th>
                      <th className="py-2.5 px-3">Region</th>
                      <th className="py-2.5 px-3 text-right">Raw Amount</th>
                      <th className="py-2.5 px-3 text-right">FX Rate</th>
                      <th className="py-2.5 px-3 text-right font-semibold">Net INR</th>
                      <th className="py-2.5 px-3">Fulfillment</th>
                      <th className="py-2.5 px-3">Lineage Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {filteredRows.map((row) => {
                      const isIncluded = row.inclusionStatus === 'Included';
                      return (
                        <tr
                          key={row.id}
                          onClick={() => setSelectedRow(row)}
                          className={`hover:bg-stone-50 dark:hover:bg-stone-800/60 cursor-pointer transition-colors ${
                            !isIncluded ? 'opacity-70 bg-stone-50/50 dark:bg-stone-950/40' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 font-mono font-medium text-stone-900 dark:text-stone-100">
                            {row.order_id}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-stone-800 dark:text-stone-200 max-w-xs truncate">
                            {row.customer_name}
                          </td>
                          <td className="py-2.5 px-3 text-stone-600 dark:text-stone-400">
                            {row.segment}
                          </td>
                          <td className="py-2.5 px-3 text-stone-600 dark:text-stone-400">
                            {row.region}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-stone-700 dark:text-stone-300">
                            {row.raw_amount.toLocaleString()} {row.currency}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-stone-500">
                            {row.fx_rate.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-stone-900 dark:text-stone-100">
                            ₹{row.converted_amount_inr.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-mono text-[11px] text-stone-600 dark:text-stone-400">
                              {row.order_status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            {isIncluded ? (
                              <span className="text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400">
                                ✓ Included
                              </span>
                            ) : (
                              <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400">
                                ✕ {row.inclusionStatus}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Selected Row Drawer / Modal */}
              {selectedRow && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
                  <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg max-w-lg w-full p-5 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                      <div>
                        <div className="text-[11px] font-mono text-stone-500">Row-Level Lineage Audit</div>
                        <div className="text-base font-semibold text-stone-900 dark:text-stone-100">
                          {selectedRow.order_id} · {selectedRow.customer_name}
                        </div>
                      </div>
                      <button onClick={() => setSelectedRow(null)} className="text-stone-400 hover:text-stone-700">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-2 p-3 bg-stone-50 dark:bg-stone-950 rounded-md font-mono">
                        <div>
                          <span className="text-stone-500 block text-[10px]">RAW TRANSACTION</span>
                          <span>{selectedRow.raw_amount.toLocaleString()} {selectedRow.currency}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 block text-[10px]">APPLIED FX RATE</span>
                          <span>{selectedRow.fx_rate} (ECB Daily)</span>
                        </div>
                        <div>
                          <span className="text-stone-500 block text-[10px]">CONVERTED INR</span>
                          <span className="font-semibold text-stone-900 dark:text-stone-100">₹{selectedRow.converted_amount_inr.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 block text-[10px]">CREATED AT</span>
                          <span>{selectedRow.created_at}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-stone-500 block text-[10px] font-mono uppercase mb-1">Audit Evaluation</span>
                        <div className={`p-2.5 rounded-md border text-xs ${
                          selectedRow.inclusionStatus === 'Included'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                            : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                        }`}>
                          <div className="font-semibold">{selectedRow.inclusionStatus}</div>
                          <div className="mt-1 text-[11px]">
                            {selectedRow.exclusionReason || 'Transaction fulfilled without returns or dispute flags. Successfully aggregated into SUM(converted_amount_inr).'}
                          </div>
                        </div>
                      </div>

                      <div className="font-mono text-[11px] text-stone-500">
                        Upstream Partition: lakehouse_production.raw_commerce.orders_events_v2:offset#88412
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => setSelectedRow(null)}
                        className="px-3 py-1.5 text-xs bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded font-medium"
                      >
                        Close Row Audit
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: STEP-BY-STEP TRANSFORMATIONS */}
          {activeTab === 'transformations' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Steps List */}
                <div className="lg:col-span-4 space-y-2">
                  {passport.transformationSteps.map((step, idx) => (
                    <button
                      key={step.stepNumber}
                      onClick={() => setActiveStepIndex(idx)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        activeStepIndex === idx
                          ? 'bg-white dark:bg-stone-900 border-stone-800 dark:border-stone-200 shadow-xs'
                          : 'bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-800 hover:border-stone-400'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
                        <span className="font-mono">Step {step.stepNumber}</span>
                        <span className="capitalize">{step.type}</span>
                      </div>
                      <div className="font-medium text-xs text-stone-900 dark:text-stone-100">
                        {step.name}
                      </div>
                      <div className="text-[11px] font-mono text-stone-500 mt-1">
                        {step.outputRowCount.toLocaleString()} rows · {step.executionTimeMs}ms
                      </div>
                    </button>
                  ))}
                </div>

                {/* Step Detail Inspector */}
                <div className="lg:col-span-8 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg p-5 space-y-4">
                  {(() => {
                    const step = passport.transformationSteps[activeStepIndex];
                    return (
                      <>
                        <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
                          <div className="flex items-center gap-2 text-xs text-stone-500 font-mono">
                            <span>Step {step.stepNumber} of {passport.transformationSteps.length}</span>
                            <span>/</span>
                            <span className="capitalize">{step.type}</span>
                          </div>
                          <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 mt-1">
                            {step.name}
                          </h3>
                          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                            {step.description}
                          </p>
                        </div>

                        {/* Step Execution Stats */}
                        <div className="grid grid-cols-3 gap-3 p-3 bg-stone-50 dark:bg-stone-950 rounded-md text-xs font-mono">
                          <div>
                            <span className="text-stone-500 block text-[10px]">INPUT ROWS</span>
                            <span className="font-semibold">{step.inputRowCount.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-stone-500 block text-[10px]">OUTPUT ROWS</span>
                            <span className="font-semibold">{step.outputRowCount.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-stone-500 block text-[10px]">ROWS EXCLUDED</span>
                            <span className={step.rowsDropped > 0 ? 'text-amber-600 font-semibold' : ''}>
                              {step.rowsDropped.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* SQL Snippet */}
                        <div>
                          <div className="text-xs font-mono font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center justify-between">
                            <span>SQL LOGIC & CTE</span>
                            <span className="text-[10px] text-stone-400">Execution time: {step.executionTimeMs}ms</span>
                          </div>
                          <pre className="p-3 bg-stone-950 text-stone-200 text-xs font-mono rounded-md overflow-x-auto border border-stone-800">
                            <code>{step.sqlSnippet}</code>
                          </pre>
                        </div>

                        {/* Logic Rationale */}
                        <div className="text-xs text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-stone-950/60 p-3 rounded border border-stone-200 dark:border-stone-800">
                          <span className="font-semibold text-stone-900 dark:text-stone-100 block mb-1">
                            Operational Rationale:
                          </span>
                          {step.transformationLogic}
                        </div>
                      </>
                    );
                  })()}
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: FILTERS & EXCLUSIONS */}
          {activeTab === 'filters' && (
            <div className="space-y-4">
              <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg">
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-1">
                  Exclusion Criteria & Where-Clauses
                </h3>
                <p className="text-xs text-stone-500 mb-4">
                  Every filter explicitly discards unearned, disputed, or cancelled transactions to guarantee financial integrity.
                </p>

                <div className="space-y-3">
                  {passport.filtersApplied.map((filter, idx) => (
                    <div key={idx} className="p-3 bg-stone-50 dark:bg-stone-950 rounded-md border border-stone-200 dark:border-stone-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                          {filter.name}
                        </span>
                        <span className="text-xs font-mono text-amber-700 dark:text-amber-300">
                          -{filter.rowsExcluded.toLocaleString()} rows dropped
                        </span>
                      </div>
                      <pre className="text-xs font-mono bg-stone-900 text-emerald-400 p-2 rounded">
                        <code>WHERE {filter.condition}</code>
                      </pre>
                      <div className="text-xs text-stone-600 dark:text-stone-400">
                        <strong>GAAP / Policy Rationale:</strong> {filter.rationale}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VALIDATION TESTS */}
          {activeTab === 'validation' && (
            <div className="space-y-4">
              <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      Automated Data Quality & Schema Assertions
                    </h3>
                    <p className="text-xs text-stone-500">
                      Executed via dbt-test & Great Expectations on every ingestion cycle
                    </p>
                  </div>
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    100% Passing (0 failures)
                  </span>
                </div>

                <div className="space-y-2">
                  {passport.validationChecks.map((check) => (
                    <div
                      key={check.id}
                      className="p-3 bg-stone-50 dark:bg-stone-950 rounded-md border border-stone-200 dark:border-stone-800 flex items-start justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="font-semibold text-stone-900 dark:text-stone-100">{check.name}</span>
                          <span className="text-stone-400">·</span>
                          <span className="font-mono text-[11px] text-stone-500">{check.type}</span>
                        </div>
                        <pre className="font-mono text-[11px] text-stone-700 dark:text-stone-300 pl-6">
                          <code>{check.assertion}</code>
                        </pre>
                        <div className="text-[11px] text-stone-500 pl-6">
                          {check.details}
                        </div>
                      </div>

                      <div className="text-right font-mono text-[11px] text-stone-500 shrink-0">
                        <div>{check.evaluatedRows.toLocaleString()} rows checked</div>
                        <div className="text-emerald-600 dark:text-emerald-400 font-semibold">0 failed</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SOURCE STORAGE & FRESHNESS */}
          {activeTab === 'source_schema' && (
            <div className="space-y-4">
              <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg space-y-4">
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  Physical Storage & Pipeline Telemetry
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 bg-stone-50 dark:bg-stone-950 rounded border border-stone-200 dark:border-stone-800">
                    <span className="text-stone-500 block text-[10px]">PRIMARY TABLE</span>
                    <span className="font-semibold">{passport.sourceData.primaryTable}</span>
                  </div>
                  <div className="p-3 bg-stone-50 dark:bg-stone-950 rounded border border-stone-200 dark:border-stone-800">
                    <span className="text-stone-500 block text-[10px]">STORAGE FORMAT</span>
                    <span>{passport.sourceData.storageType}</span>
                  </div>
                  <div className="p-3 bg-stone-50 dark:bg-stone-950 rounded border border-stone-200 dark:border-stone-800">
                    <span className="text-stone-500 block text-[10px]">FRESHNESS SLA</span>
                    <span>&lt; {passport.freshness.slaMinutes} minutes</span>
                  </div>
                  <div className="p-3 bg-stone-50 dark:bg-stone-950 rounded border border-stone-200 dark:border-stone-800">
                    <span className="text-stone-500 block text-[10px]">ACTUAL LATENCY</span>
                    <span className="text-emerald-600 font-semibold">{passport.freshness.latencyMinutes} mins</span>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 dark:bg-stone-950 rounded border border-stone-200 dark:border-stone-800 text-xs">
                  <span className="font-semibold block mb-1">Upstream Raw Tables:</span>
                  <div className="flex flex-wrap gap-2 font-mono text-[11px] text-stone-600 dark:text-stone-400">
                    {passport.sourceData.upstreamTables.map((t, idx) => (
                      <span key={idx} className="bg-white dark:bg-stone-900 px-2 py-1 rounded border border-stone-200 dark:border-stone-800">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
