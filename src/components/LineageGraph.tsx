import React, { useState } from 'react';
import { 
  MetricPassport, 
  LineageStep 
} from '../types/passport';
import { 
  X, 
  Database, 
  Filter, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Eye, 
  ExternalLink,
  ChevronRight,
  Maximize2
} from 'lucide-react';

interface LineageGraphProps {
  passport: MetricPassport;
  onClose: () => void;
}

interface DagNode {
  id: string;
  label: string;
  type: 'source' | 'filter' | 'transformation' | 'aggregation' | 'passport' | 'consumer';
  category: string;
  rowCount?: string;
  description: string;
  sql?: string;
  stage: number;
}

export const LineageGraph: React.FC<LineageGraphProps> = ({
  passport,
  onClose,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-passport');

  // Build DAG nodes
  const dagNodes: DagNode[] = [
    {
      id: 'node-raw-source',
      label: passport.sourceData.primaryTable,
      type: 'source',
      category: 'Lakehouse Ingestion',
      rowCount: `${passport.sourceData.rawRowCount.toLocaleString()} rows`,
      description: `Primary transactional partition stored on ${passport.sourceData.storageType}. Synced via Kafka connector.`,
      sql: `SELECT * FROM ${passport.sourceData.database}.${passport.sourceData.schema}.${passport.sourceData.primaryTable}`,
      stage: 1,
    },
    {
      id: 'node-filter-status',
      label: 'Fulfillment Filter',
      type: 'filter',
      category: 'Data Cleansing',
      rowCount: '1,164,300 rows',
      description: "Drops pending, aborted, and user-cancelled carts. WHERE status IN ('COMPLETED', 'DELIVERED')",
      sql: "WHERE status IN ('COMPLETED', 'DELIVERED') AND payment_status = 'SUCCESS'",
      stage: 2,
    },
    {
      id: 'node-fx-conversion',
      label: 'ECB FX Normalization',
      type: 'transformation',
      category: 'Reference Enrichment',
      rowCount: '1,164,300 rows',
      description: 'Daily mid-market rates from European Central Bank applied to convert USD, EUR, GBP to INR.',
      sql: 'LEFT JOIN reference.ecb_exchange_rates_daily fx ON fx.rate_date = DATE(orders.created_at)',
      stage: 3,
    },
    {
      id: 'node-filter-refunds',
      label: 'Refund & Dispute Exclusion',
      type: 'filter',
      category: 'GAAP Compliance',
      rowCount: '1,123,100 rows',
      description: 'Eliminates 41,200 refunded transactions totaling ₹4.2M per US GAAP / IFRS 15.',
      sql: 'WHERE refund_status IS NULL AND chargeback_flag = FALSE',
      stage: 4,
    },
    {
      id: 'node-aggregation',
      label: passport.aggregationDetails.function,
      type: 'aggregation',
      category: 'Metric Synthesis',
      rowCount: '1 scalar row',
      description: 'Sum of normalized converted amounts over trailing 30-day reporting window.',
      sql: `SELECT ${passport.aggregationDetails.function} AS metric_value FROM filtered_dataset`,
      stage: 5,
    },
    {
      id: 'node-passport',
      label: `${passport.name} (${passport.currentValue})`,
      type: 'passport',
      category: 'Official Metric Passport',
      rowCount: 'Certified',
      description: `Machine-readable passport v${passport.version} minted. Trust score: ${passport.trustScore.totalScore}/100.`,
      sql: `-- MINTED PASSPORT ${passport.code} --`,
      stage: 6,
    },
    {
      id: 'node-consumer-looker',
      label: 'Executive Looker Cockpit',
      type: 'consumer',
      category: 'BI Dashboard',
      description: 'C-suite morning KPI dashboard viewed daily by CEO, CFO, VP Growth.',
      stage: 7,
    },
    {
      id: 'node-consumer-ml',
      label: 'Feast Feature Store (feat_user_spend)',
      type: 'consumer',
      category: 'ML Pipeline',
      description: 'Powers customer churn risk model v3 and CLV propensity classifier.',
      stage: 7,
    },
    {
      id: 'node-consumer-10q',
      label: 'SEC Form 10-Q Statutory Filing',
      type: 'consumer',
      category: 'Financial Report',
      description: 'Audited statutory report signed by PwC accounting auditors.',
      stage: 7,
    },
  ];

  const selectedNode = dagNodes.find((n) => n.id === selectedNodeId) || dagNodes[5];

  const getNodeIcon = (type: DagNode['type']) => {
    switch (type) {
      case 'source':
        return <Database className="w-4 h-4 text-blue-500" />;
      case 'filter':
        return <Filter className="w-4 h-4 text-amber-500" />;
      case 'transformation':
        return <Cpu className="w-4 h-4 text-purple-500" />;
      case 'aggregation':
        return <Layers className="w-4 h-4 text-indigo-500" />;
      case 'passport':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'consumer':
        return <ExternalLink className="w-4 h-4 text-stone-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-950">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span>DAG Traversal</span>
              <span>/</span>
              <span className="font-mono text-stone-900 dark:text-stone-100 font-semibold">{passport.code}</span>
            </div>
            <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
              Interactive Lineage DAG: {passport.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-md hover:bg-stone-200 dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual DAG Canvas Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-stone-50/50 dark:bg-stone-950/50">
          
          <div className="text-xs text-stone-600 dark:text-stone-400 flex items-center justify-between">
            <span>Click any node in the upstream pipeline or downstream consumers to inspect its schema and logic.</span>
            <span className="font-mono text-[11px] text-stone-500">7 Stages · 9 Verified Nodes</span>
          </div>

          {/* Interactive DAG Pipeline Flow */}
          <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-x-auto shadow-xs">
            <div className="min-w-[900px] flex items-center justify-between gap-4 py-4">
              
              {/* Upstream & Transformation Flow (Stages 1 - 6) */}
              <div className="flex items-center gap-3">
                {dagNodes.filter(n => n.stage <= 6).map((node, index) => {
                  const isSelected = node.id === selectedNodeId;

                  return (
                    <React.Fragment key={node.id}>
                      <button
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`p-3 rounded-lg border text-left transition-all w-40 shrink-0 ${
                          isSelected
                            ? 'bg-stone-100 dark:bg-stone-800 border-stone-800 dark:border-stone-200 shadow-sm ring-1 ring-stone-800 dark:ring-stone-200'
                            : 'bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-800 hover:border-stone-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-mono text-stone-500 uppercase">{node.category}</span>
                          {getNodeIcon(node.type)}
                        </div>

                        <div className="font-medium text-xs text-stone-900 dark:text-stone-100 truncate mb-1">
                          {node.label}
                        </div>

                        {node.rowCount && (
                          <div className="font-mono text-[11px] text-stone-500">
                            {node.rowCount}
                          </div>
                        )}
                      </button>

                      {index < 5 && (
                        <div className="text-stone-400 shrink-0">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Branching to Downstream Consumers */}
              <div className="flex items-center gap-3">
                <div className="text-stone-400 shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>

                <div className="flex flex-col gap-2 shrink-0 w-52">
                  <span className="text-[10px] font-mono uppercase text-stone-400 tracking-wider">
                    Downstream Consumers
                  </span>
                  {dagNodes.filter(n => n.stage === 7).map((consumer) => (
                    <button
                      key={consumer.id}
                      onClick={() => setSelectedNodeId(consumer.id)}
                      className={`p-2.5 rounded border text-left text-xs transition-all ${
                        selectedNodeId === consumer.id
                          ? 'bg-stone-100 dark:bg-stone-800 border-stone-800 dark:border-stone-200 font-medium'
                          : 'bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-800 hover:border-stone-400'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-stone-500 mb-0.5">
                        <span>{consumer.category}</span>
                        <ExternalLink className="w-3 h-3 text-stone-400" />
                      </div>
                      <div className="truncate text-stone-800 dark:text-stone-200">
                        {consumer.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Node Inspection Panel */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-3">
                {getNodeIcon(selectedNode.type)}
                <div>
                  <div className="text-[11px] font-mono text-stone-500 uppercase">{selectedNode.category}</div>
                  <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                    {selectedNode.label}
                  </h3>
                </div>
              </div>

              <div className="font-mono text-xs text-stone-500">
                Node ID: {selectedNode.id}
              </div>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400">
              {selectedNode.description}
            </p>

            {selectedNode.sql && (
              <div>
                <span className="text-xs font-mono font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  TRANSFORMATION LOGIC / QUERY SPECIFICATION:
                </span>
                <pre className="p-3 bg-stone-950 text-stone-200 text-xs font-mono rounded-md overflow-x-auto border border-stone-800">
                  <code>{selectedNode.sql}</code>
                </pre>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-md"
          >
            Close DAG View
          </button>
        </div>

      </div>
    </div>
  );
};
