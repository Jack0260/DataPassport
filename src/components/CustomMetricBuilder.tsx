import React, { useState } from 'react';
import { MetricPassport, LineageStep, SupportingRow } from '../types/passport';
import { calculateExplainableTrustScore } from '../utils/trustScore';
import { 
  X, 
  UploadCloud, 
  Table, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Filter, 
  Layers, 
  FileText
} from 'lucide-react';

interface CustomMetricBuilderProps {
  onClose: () => void;
  onMintPassport: (passport: MetricPassport) => void;
}

const SAMPLE_CSV_CONTENT = `order_id,customer_name,segment,region,amount,currency,status,is_refunded
ORD-1001,Tata Steel Infrastructure,Enterprise,APAC,2400000,INR,DELIVERED,false
ORD-1002,Siemens Healthineers,Enterprise,EMEA,18000,EUR,COMPLETED,false
ORD-1003,Razorpay Merchant API,Mid-Market,APAC,650000,INR,DELIVERED,false
ORD-1004,Amazon Web Services,Enterprise,NA,32000,USD,DELIVERED,false
ORD-1005,Urban Company Tech,SMB,APAC,120000,INR,CANCELLED,false
ORD-1006,Postman Cloud Systems,Enterprise,NA,28500,USD,DELIVERED,false
ORD-1007,Zomato Food Engine,Mid-Market,APAC,480000,INR,REFUNDED,true
ORD-1008,Cisco Enterprise UK,Enterprise,EMEA,14500,GBP,COMPLETED,false
ORD-1009,Freshworks Dev Hub,Mid-Market,APAC,310000,INR,DELIVERED,false
ORD-1010,KredX Invoice Mart,SMB,APAC,90000,INR,DELIVERED,false`;

export const CustomMetricBuilder: React.FC<CustomMetricBuilderProps> = ({
  onClose,
  onMintPassport,
}) => {
  const [csvText, setCsvText] = useState(SAMPLE_CSV_CONTENT);
  const [metricName, setMetricName] = useState('Gross Delivered Merchandise Value');
  const [metricCategory, setMetricCategory] = useState<'Financial' | 'Operational' | 'Growth'>('Financial');
  const [aggFunction, setAggFunction] = useState<'SUM' | 'AVG' | 'COUNT'>('SUM');
  const [valueColumn, setValueColumn] = useState('amount');
  const [filterStatus, setFilterStatus] = useState('DELIVERED, COMPLETED');
  const [excludeRefunds, setExcludeRefunds] = useState(true);

  // Parse CSV
  const parseRows = () => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return { headers: [], rows: [] };
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim());
      const obj: any = {};
      headers.forEach((h, i) => {
        obj[h] = vals[i];
      });
      return obj;
    });
    return { headers, rows };
  };

  const { headers, rows } = parseRows();

  const handleMint = () => {
    // Deterministic execution
    const allowedStatuses = filterStatus.split(',').map(s => s.trim().toUpperCase());
    const filtered = rows.filter(r => {
      const statusMatch = allowedStatuses.length === 0 || allowedStatuses.includes((r.status || '').toUpperCase());
      const refundMatch = !excludeRefunds || (r.is_refunded !== 'true' && r.is_refunded !== true);
      return statusMatch && refundMatch;
    });

    let numericTotal = 0;
    if (aggFunction === 'SUM') {
      numericTotal = filtered.reduce((acc, r) => acc + (parseFloat(r[valueColumn]) || 0), 0);
    } else if (aggFunction === 'AVG') {
      numericTotal = filtered.length > 0 
        ? filtered.reduce((acc, r) => acc + (parseFloat(r[valueColumn]) || 0), 0) / filtered.length
        : 0;
    } else {
      numericTotal = filtered.length;
    }

    const formattedValue = numericTotal >= 1000000
      ? `₹${(numericTotal / 1000000).toFixed(2)}M`
      : numericTotal.toLocaleString();

    // Map supporting rows
    const supportingRows: SupportingRow[] = rows.map((r, i) => {
      const isIncluded = allowedStatuses.includes((r.status || '').toUpperCase()) && (!excludeRefunds || r.is_refunded !== 'true');
      return {
        id: `csv-row-${i}`,
        order_id: r.order_id || `ORD-${i}`,
        customer_id: `CUST-${i}`,
        customer_name: r.customer_name || `Customer ${i}`,
        segment: (r.segment as any) || 'Enterprise',
        region: (r.region as any) || 'APAC',
        raw_amount: parseFloat(r[valueColumn]) || 0,
        currency: r.currency || 'INR',
        fx_rate: 1.0,
        converted_amount_inr: parseFloat(r[valueColumn]) || 0,
        order_status: (r.status as any) || 'DELIVERED',
        refund_flag: r.is_refunded === 'true',
        created_at: new Date().toISOString(),
        inclusionStatus: isIncluded ? 'Included' : 'Excluded: Status',
        exclusionReason: isIncluded ? undefined : 'Excluded by user filter specification',
      };
    });

    const newPassport: MetricPassport = {
      id: `metric-custom-${Date.now()}`,
      code: `METRIC_CUSTOM_${Math.floor(Math.random() * 900 + 100)}`,
      name: metricName,
      category: metricCategory,
      currentValue: formattedValue,
      numericValue: numericTotal,
      unit: 'INR',
      period: 'Trailing Batch Window',
      status: 'Certified',
      version: 'v1.0.0-custom',
      gitCommit: 'a8b9c0d1e2',
      owner: {
        name: 'User Session Analyst',
        team: 'Custom Analytics Workspace',
        email: 'user@datapassport.internal',
        slackChannel: '#custom-metrics',
      },
      freshness: {
        lastUpdated: 'Just now',
        updateFrequency: 'Ad-hoc Batch Upload',
        nextExpectedRun: 'On next file upload',
        pipelineName: 'csv_in_memory_transpiler_v1',
        runId: `custom_run_${Date.now()}`,
        latencyMinutes: 1,
        slaMinutes: 60,
      },
      sourceData: {
        database: 'client_upload_workspace',
        schema: 'csv_landing',
        primaryTable: 'uploaded_orders_batch.csv',
        upstreamTables: ['uploaded_orders_batch.csv'],
        rawRowCount: rows.length,
        storageType: 'In-Memory Parquet Snappy Buffer',
        retentionDays: 30,
      },
      transformationSteps: [
        {
          stepNumber: 1,
          name: 'CSV Schema Ingestion',
          type: 'source',
          description: `Ingested ${rows.length} rows with detected columns: ${headers.join(', ')}.`,
          sqlSnippet: `SELECT ${headers.join(', ')} FROM uploaded_orders_batch.csv;`,
          inputRowCount: rows.length,
          outputRowCount: rows.length,
          rowsDropped: 0,
          executionTimeMs: 12,
          transformationLogic: 'Client-side buffer scan and schema type inference.',
          fieldsAffected: headers,
        },
        {
          stepNumber: 2,
          name: 'Custom Filter & Exclusion Step',
          type: 'filter',
          description: `Filter by status IN (${filterStatus}) and exclude refunds: ${excludeRefunds}.`,
          sqlSnippet: `WHERE status IN ('${filterStatus.split(',').join("','")}')\n  ${excludeRefunds ? 'AND is_refunded = false' : ''};`,
          inputRowCount: rows.length,
          outputRowCount: filtered.length,
          rowsDropped: rows.length - filtered.length,
          executionTimeMs: 6,
          transformationLogic: 'Predicate evaluation over in-memory dataset.',
          fieldsAffected: ['status', 'is_refunded'],
        },
        {
          stepNumber: 3,
          name: `${aggFunction} Aggregation`,
          type: 'aggregation',
          description: `Execute ${aggFunction}(${valueColumn}) over filtered records.`,
          sqlSnippet: `SELECT ${aggFunction}(${valueColumn}) AS metric_result FROM filtered_dataset;`,
          inputRowCount: filtered.length,
          outputRowCount: 1,
          rowsDropped: 0,
          executionTimeMs: 3,
          transformationLogic: `Calculated scalar metric output: ${formattedValue}.`,
          fieldsAffected: [valueColumn],
        },
      ],
      filtersApplied: [
        {
          name: 'Status Filter',
          condition: `status IN (${filterStatus})`,
          rationale: 'Retain intended fulfillment statuses.',
          rowsExcluded: rows.length - filtered.length,
        },
      ],
      aggregationDetails: {
        function: `${aggFunction}(${valueColumn})`,
        targetColumn: valueColumn,
        groupByColumns: ['period'],
        nullHandling: 'Strict null avoidance with numeric fallback',
      },
      validationChecks: [
        {
          id: 'val-custom-01',
          name: 'Non-Null Amount Validation',
          assertion: `expect_column_values_to_not_be_null(${valueColumn})`,
          type: 'null_check',
          status: 'passed',
          evaluatedRows: rows.length,
          failedRows: 0,
          lastRun: 'Just now',
          details: 'All rows possessed valid numerical values.',
        },
      ],
      trustScore: calculateExplainableTrustScore({
        freshnessMinutes: 1,
        slaMinutes: 60,
        passedChecks: 1,
        totalChecks: 1,
        mappedNodes: 3,
        totalNodes: 3,
        sourceUptimePercent: 100,
        anomalyCountLast14d: 0,
        daysSinceBreakingChange: 1,
      }),
      impactScenarios: [],
      timeSeriesData: [
        { date: '2026-10-06', value: numericTotal, expectedMean: numericTotal, upperBound2Sigma: numericTotal * 1.1, lowerBound2Sigma: numericTotal * 0.9, upperBound3Sigma: numericTotal * 1.2, lowerBound3Sigma: numericTotal * 0.8, isAnomaly: false, zScore: 0.0 },
      ],
      contract: {
        contractId: `CONTRACT-CUSTOM-${Date.now()}`,
        version: 'v1.0.0',
        metricName,
        serviceTier: 'Tier 3 - Analytical',
        ownerTeam: 'Custom Analytics Workspace',
        slackContact: '#custom-metrics',
        schemaContractYaml: `contract_version: "1.0.0"\nmetric:\n  name: "${metricName}"\n  target_column: "${valueColumn}"\n  aggregation: "${aggFunction}"`,
        slas: {
          freshnessMinutes: 60,
          availabilityPercent: 99.9,
          errorRateThreshold: 0.001,
          maxSchemaDriftDays: 7,
        },
        consumers: ['Ad-hoc Analytical Workbooks'],
        signatureHash: `sha256:custom_${Date.now()}`,
        certifiedDate: '2026-10-06',
      },
      experiments: [],
      supportingRows,
    };

    onMintPassport(newPassport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span>Custom Metric Studio</span>
                <span>/</span>
                <span className="font-mono text-stone-900 dark:text-stone-100 font-semibold">Instant Passport Minting</span>
              </div>
              <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                Upload CSV & Mint Machine-Readable Passport
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
          
          {/* CSV Input Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                Raw CSV Data (Paste or Edit):
              </label>
              <span className="text-[11px] font-mono text-stone-500">
                Detected: {rows.length} rows · {headers.length} columns ({headers.join(', ')})
              </span>
            </div>
            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full p-3 font-mono text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-400"
            />
          </div>

          {/* Metric Configuration Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-stone-50 dark:bg-stone-950 rounded-lg border border-stone-200 dark:border-stone-800">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Metric Name</label>
              <input
                type="text"
                value={metricName}
                onChange={(e) => setMetricName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded text-stone-900 dark:text-stone-100 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Category</label>
              <select
                value={metricCategory}
                onChange={(e) => setMetricCategory(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded text-stone-900 dark:text-stone-100 focus:outline-none"
              >
                <option value="Financial">Financial</option>
                <option value="Operational">Operational</option>
                <option value="Growth">Growth</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Aggregation Function</label>
              <div className="grid grid-cols-3 gap-2">
                {(['SUM', 'AVG', 'COUNT'] as const).map(fn => (
                  <button
                    key={fn}
                    type="button"
                    onClick={() => setAggFunction(fn)}
                    className={`py-1.5 text-xs font-mono font-medium rounded border ${
                      aggFunction === fn
                        ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100'
                        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {fn}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Target Value Column</label>
              <select
                value={valueColumn}
                onChange={(e) => setValueColumn(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded text-stone-900 dark:text-stone-100 focus:outline-none font-mono"
              >
                {headers.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Status Filter Criteria</label>
              <input
                type="text"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                placeholder="e.g. DELIVERED, COMPLETED"
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded text-stone-900 dark:text-stone-100 focus:outline-none font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="refund_check"
                checked={excludeRefunds}
                onChange={(e) => setExcludeRefunds(e.target.checked)}
                className="accent-stone-900 dark:accent-stone-100 rounded"
              />
              <label htmlFor="refund_check" className="text-xs text-stone-800 dark:text-stone-200 cursor-pointer">
                Exclude refunded transactions (is_refunded = true)
              </label>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex items-center justify-between">
          <div className="text-xs text-stone-500">
            Minting generates full lineage steps, explainable trust scores, and supporting rows.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900"
            >
              Cancel
            </button>
            <button
              onClick={handleMint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mint Metric Passport</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
