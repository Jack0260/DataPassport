import React, { useState } from 'react';
import { 
  MetricPassport, 
  ArchitectureDecisionRecord, 
  AuditLogEntry 
} from '../types/passport';
import { 
  MOCK_ADRS, 
  MOCK_AUDIT_LOGS 
} from '../data/mockData';
import { 
  X, 
  FileCode2, 
  Terminal, 
  Database, 
  ShieldCheck, 
  FileText, 
  History, 
  Users, 
  BookOpen, 
  Copy, 
  Check, 
  ExternalLink,
  Cpu
} from 'lucide-react';

interface SeniorModeViewProps {
  passport: MetricPassport;
  onClose: () => void;
}

export const SeniorModeView: React.FC<SeniorModeViewProps> = ({
  passport,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'contracts' | 'lineage_api' | 'large_dataset' | 'slas' | 'audit_logs' | 'rbac' | 'adrs'>('contracts');
  const [copiedContract, setCopiedContract] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const contract = passport.contract;

  const handleCopyContract = () => {
    navigator.clipboard.writeText(contract.schemaContractYaml);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  const sampleCurl = `curl -X GET "https://api.datapassport.internal/v1/passports/${passport.code}" \\
  -H "Authorization: Bearer dpp_sec_9941a82f" \\
  -H "Accept: application/json"`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(sampleCurl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center">
              <FileCode2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span>Enterprise Architecture</span>
                <span>/</span>
                <span className="font-mono text-stone-900 dark:text-stone-100 font-semibold">Senior Mode</span>
              </div>
              <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                Data Contracts, Lineage APIs & Governance: {passport.name}
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

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center gap-1 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('contracts')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'contracts'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            Data Contract (YAML)
          </button>
          <button
            onClick={() => setActiveTab('lineage_api')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'lineage_api'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            Lineage REST API
          </button>
          <button
            onClick={() => setActiveTab('large_dataset')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'large_dataset'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            Large-Dataset Architecture
          </button>
          <button
            onClick={() => setActiveTab('slas')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'slas'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            Data-Quality SLAs
          </button>
          <button
            onClick={() => setActiveTab('audit_logs')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'audit_logs'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            Audit Logs ({MOCK_AUDIT_LOGS.length})
          </button>
          <button
            onClick={() => setActiveTab('rbac')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'rbac'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            RBAC Matrix
          </button>
          <button
            onClick={() => setActiveTab('adrs')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'adrs'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            Architecture Decision Records ({MOCK_ADRS.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-stone-50/50 dark:bg-stone-950/50">
          
          {/* TAB 1: DATA CONTRACTS */}
          {activeTab === 'contracts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    Formal Machine-Readable Data Contract
                  </h3>
                  <p className="text-xs text-stone-500">
                    Cryptographically signed schema guarantee binding producer and consumer teams
                  </p>
                </div>

                <button
                  onClick={handleCopyContract}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-stone-200 dark:border-stone-800 rounded-md hover:bg-white dark:hover:bg-stone-900 text-stone-700 dark:text-stone-300"
                >
                  {copiedContract ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedContract ? 'Copied YAML' : 'Copy Contract'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 bg-white dark:bg-stone-900 rounded border border-stone-200 dark:border-stone-800">
                  <span className="text-stone-500 block text-[10px]">CONTRACT ID</span>
                  <span className="font-semibold">{contract.contractId}</span>
                </div>
                <div className="p-3 bg-white dark:bg-stone-900 rounded border border-stone-200 dark:border-stone-800">
                  <span className="text-stone-500 block text-[10px]">SERVICE TIER</span>
                  <span className="text-emerald-600 font-semibold">{contract.serviceTier}</span>
                </div>
                <div className="p-3 bg-white dark:bg-stone-900 rounded border border-stone-200 dark:border-stone-800">
                  <span className="text-stone-500 block text-[10px]">CERTIFIED DATE</span>
                  <span>{contract.certifiedDate}</span>
                </div>
                <div className="p-3 bg-white dark:bg-stone-900 rounded border border-stone-200 dark:border-stone-800">
                  <span className="text-stone-500 block text-[10px]">OWNER CHANNEL</span>
                  <span>{contract.slackContact}</span>
                </div>
              </div>

              <pre className="p-4 bg-stone-950 text-emerald-400 font-mono text-xs rounded-lg overflow-x-auto border border-stone-800 leading-relaxed">
                <code>{contract.schemaContractYaml}</code>
              </pre>

              <div className="text-[11px] font-mono text-stone-500 p-2 bg-stone-100 dark:bg-stone-900 rounded">
                Signature: {contract.signatureHash}
              </div>
            </div>
          )}

          {/* TAB 2: LINEAGE REST API */}
          {activeTab === 'lineage_api' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  Lineage & Blast-Radius REST APIs
                </h3>
                <p className="text-xs text-stone-500">
                  Programmatic endpoints for CI/CD gates, dbt pull request validation, and orchestrators
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-mono text-[11px] font-bold">GET</span>
                      <span className="font-mono">/v1/passports/{`{metric_code}`}</span>
                    </span>
                    <button
                      onClick={handleCopyCurl}
                      className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 flex items-center gap-1"
                    >
                      {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy cURL</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-stone-950 text-stone-200 font-mono text-xs rounded overflow-x-auto border border-stone-800">
                    <code>{sampleCurl}</code>
                  </pre>
                </div>

                <div className="p-4 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 font-mono text-[11px] font-bold">POST</span>
                      <span className="font-mono">/v1/lineage/simulate-diff</span>
                    </span>
                  </div>
                  <pre className="p-3 bg-stone-950 text-stone-200 font-mono text-xs rounded overflow-x-auto border border-stone-800">
                    <code>{`curl -X POST "https://api.datapassport.internal/v1/lineage/simulate-diff" \\
  -H "Content-Type: application/json" \\
  -d '{"metric_code": "${passport.code}", "sql_diff_after": "WHERE refund_status IS NULL OR refund_delay > 14"}'`}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LARGE-DATASET ARCHITECTURE */}
          {activeTab === 'large_dataset' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  Large-Dataset Handling & Partitioning Pruning
                </h3>
                <p className="text-xs text-stone-500">
                  Techniques employed to calculate passports across 100M+ rows with sub-second SLA
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 space-y-1">
                  <div className="font-semibold text-stone-900 dark:text-stone-100">Iceberg / Parquet Partitions</div>
                  <p className="text-stone-600 dark:text-stone-400 text-[11px]">
                    Partitioned on <code>created_date</code> with Z-Order clustering on <code>customer_id</code> and <code>status</code>.
                  </p>
                </div>
                <div className="p-3.5 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 space-y-1">
                  <div className="font-semibold text-stone-900 dark:text-stone-100">Incremental Materialization</div>
                  <p className="text-stone-600 dark:text-stone-400 text-[11px]">
                    dbt incremental model using <code>unique_key='order_id'</code> scanning only the last 3 days for late-arriving events.
                  </p>
                </div>
                <div className="p-3.5 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 space-y-1">
                  <div className="font-semibold text-stone-900 dark:text-stone-100">Pre-aggregated Rollups</div>
                  <p className="text-stone-600 dark:text-stone-400 text-[11px]">
                    HyperLogLog sketches and hourly intermediate sums reduce final passport evaluation to 14ms.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DATA-QUALITY SLAS */}
          {activeTab === 'slas' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  Service Level Agreement (SLA) Matrix
                </h3>
                <p className="text-xs text-stone-500">
                  Contractual uptime and latency thresholds enforced via Datadog & Monte Carlo monitors
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-stone-200 dark:border-stone-800 text-[11px] font-mono text-stone-500">
                    <tr>
                      <th className="py-2">Dimension</th>
                      <th className="py-2">Contract Target</th>
                      <th className="py-2">Current Actual</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-mono text-xs">
                    <tr>
                      <td className="py-2 font-sans font-medium text-stone-900 dark:text-stone-100">Data Freshness</td>
                      <td className="py-2">&lt; 60 minutes</td>
                      <td className="py-2">{passport.freshness.latencyMinutes} minutes</td>
                      <td className="py-2 text-emerald-600">✓ Healthy</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-sans font-medium text-stone-900 dark:text-stone-100">Source Cluster Uptime</td>
                      <td className="py-2">&gt; 99.95%</td>
                      <td className="py-2">99.98%</td>
                      <td className="py-2 text-emerald-600">✓ Healthy</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-sans font-medium text-stone-900 dark:text-stone-100">Assertion Pass Rate</td>
                      <td className="py-2">100% (Zero tolerance)</td>
                      <td className="py-2">100% (6/6)</td>
                      <td className="py-2 text-emerald-600">✓ Certified</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-sans font-medium text-stone-900 dark:text-stone-100">Mean Time to Resolve (MTTR)</td>
                      <td className="py-2">&lt; 30 minutes</td>
                      <td className="py-2">14 minutes</td>
                      <td className="py-2 text-emerald-600">✓ Within Limit</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT LOGS */}
          {activeTab === 'audit_logs' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  Immutable Governance Audit Trail
                </h3>
                <p className="text-xs text-stone-500">
                  Append-only ledger of metric definition updates, certifications, and overrides
                </p>
              </div>

              <div className="space-y-2">
                {MOCK_AUDIT_LOGS.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-semibold text-stone-900 dark:text-stone-100">
                          {log.action}
                        </span>
                        <span className="text-stone-400">·</span>
                        <span className="text-stone-600 dark:text-stone-400">{log.actor} ({log.actorRole})</span>
                      </div>
                      <span className="font-mono text-[11px] text-stone-500">{log.timestamp}</span>
                    </div>

                    <p className="text-stone-700 dark:text-stone-300">
                      {log.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 pt-1">
                      <span>Diff: {log.diffSummary}</span>
                      <span>Commit: {log.commitHash}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: RBAC MATRIX */}
          {activeTab === 'rbac' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  Role-Based Access Control (RBAC) Governance Matrix
                </h3>
                <p className="text-xs text-stone-500">
                  Operational boundaries preventing unauthorized alterations to certified GAAP metrics
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-stone-200 dark:border-stone-800 text-[11px] font-mono text-stone-500">
                    <tr>
                      <th className="py-2">Role</th>
                      <th className="py-2">View Passport</th>
                      <th className="py-2">Inspect Rows</th>
                      <th className="py-2">Simulate Diffs</th>
                      <th className="py-2">Propose RFC</th>
                      <th className="py-2">Sign Contract</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
                    <tr>
                      <td className="py-2.5 font-medium">Data Analyst / Business Analyst</td>
                      <td className="py-2 text-emerald-600">✓ Yes</td>
                      <td className="py-2 text-emerald-600">✓ Masked</td>
                      <td className="py-2 text-emerald-600">✓ Yes</td>
                      <td className="py-2 text-emerald-600">✓ Yes</td>
                      <td className="py-2 text-stone-400">✕ No</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium">Data Engineer / Platform Lead</td>
                      <td className="py-2 text-emerald-600">✓ Yes</td>
                      <td className="py-2 text-emerald-600">✓ Full</td>
                      <td className="py-2 text-emerald-600">✓ Yes</td>
                      <td className="py-2 text-emerald-600">✓ Yes</td>
                      <td className="py-2 text-emerald-600">✓ Yes</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium">Data Scientist / ML Engineer</td>
                      <td className="py-2 text-emerald-600">✓ Yes</td>
                      <td className="py-2 text-emerald-600">✓ Masked</td>
                      <td className="py-2 text-emerald-600">✓ Yes</td>
                      <td className="py-2 text-emerald-600">✓ Yes</td>
                      <td className="py-2 text-stone-400">✕ No</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium">Statutory Auditor (PwC / Big4)</td>
                      <td className="py-2 text-emerald-600">✓ Yes</td>
                      <td className="py-2 text-emerald-600">✓ Full Audit</td>
                      <td className="py-2 text-emerald-600">✓ Yes</td>
                      <td className="py-2 text-stone-400">✕ No</td>
                      <td className="py-2 text-emerald-600">✓ Sign-off</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: ADRs */}
          {activeTab === 'adrs' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  Architecture Decision Records (ADRs)
                </h3>
                <p className="text-xs text-stone-500">
                  Formal engineering records explaining key technical decisions and trade-offs
                </p>
              </div>

              <div className="space-y-3">
                {MOCK_ADRS.map((adr) => (
                  <div
                    key={adr.id}
                    className="p-4 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-stone-900 dark:text-stone-100">{adr.id}</span>
                        <span className="text-stone-400">·</span>
                        <span className="font-semibold text-stone-800 dark:text-stone-200">{adr.title}</span>
                      </div>
                      <span className="font-mono text-[10px] text-emerald-600 font-semibold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 rounded">
                        {adr.status}
                      </span>
                    </div>

                    <div className="text-stone-500 text-[11px]">
                      Date: {adr.date} · Author: {adr.author}
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div>
                        <strong className="text-stone-800 dark:text-stone-200">Context:</strong>
                        <p className="text-stone-600 dark:text-stone-400 mt-0.5">{adr.context}</p>
                      </div>
                      <div>
                        <strong className="text-stone-800 dark:text-stone-200">Decision:</strong>
                        <p className="text-stone-600 dark:text-stone-400 mt-0.5">{adr.decision}</p>
                      </div>
                      <div>
                        <strong className="text-stone-800 dark:text-stone-200">Consequences:</strong>
                        <p className="text-stone-600 dark:text-stone-400 mt-0.5">{adr.consequences}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
