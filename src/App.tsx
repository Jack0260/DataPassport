import React, { useState, useEffect } from 'react';
import { 
  MetricPassport, 
  Role,
  ExperimentVersion
} from './types/passport';
import { MOCK_PASSPORTS } from './data/mockData';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { PassportView } from './components/PassportView';
import { EvidenceInspector } from './components/EvidenceInspector';
import { ImpactSimulator } from './components/ImpactSimulator';
import { TrustScoreDetail } from './components/TrustScoreDetail';
import { LineageGraph } from './components/LineageGraph';
import { AnomalyDetector } from './components/AnomalyDetector';
import { ResearchModeView } from './components/ResearchModeView';
import { SeniorModeView } from './components/SeniorModeView';
import { CustomMetricBuilder } from './components/CustomMetricBuilder';
import { NlAnalysisResultModal } from './components/NlAnalysisResultModal';
import { 
  parseNaturalLanguageQueryDeterministically, 
  StructuredAnalysisRequest 
} from './utils/queryParser';
import { 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  HelpCircle, 
  CheckCircle2, 
  Terminal,
  ExternalLink,
  Beaker,
  FileCode2,
  FileText
} from 'lucide-react';

export default function App() {
  const [passports, setPassports] = useState<MetricPassport[]>(MOCK_PASSPORTS);
  const [selectedId, setSelectedId] = useState<string>('metric-net-revenue');
  const [currentRole, setCurrentRole] = useState<Role>('Data Analyst');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Active top-level page tab: 'passport' | 'research' | 'senior'
  const [activeMainTab, setActiveMainTab] = useState<'passport' | 'research' | 'senior'>('passport');

  // Modals & Panels
  const [showEvidence, setShowEvidence] = useState<boolean>(false);
  const [showImpact, setShowImpact] = useState<boolean>(false);
  const [showTrustDetail, setShowTrustDetail] = useState<boolean>(false);
  const [showLineageGraph, setShowLineageGraph] = useState<boolean>(false);
  const [showAnomalyDetector, setShowAnomalyDetector] = useState<boolean>(false);
  const [showResearchMode, setShowResearchMode] = useState<boolean>(false);
  const [showSeniorMode, setShowSeniorMode] = useState<boolean>(false);
  const [showCustomBuilder, setShowCustomBuilder] = useState<boolean>(false);
  const [nlResult, setNlResult] = useState<StructuredAnalysisRequest | null>(null);

  // Manage dark mode class on <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const selectedPassport = passports.find(p => p.id === selectedId) || passports[0];

  // Handle Natural Language query execution
  const handleExecuteNlQuery = (query: string) => {
    const result = parseNaturalLanguageQueryDeterministically(query, selectedPassport.supportingRows);
    setNlResult(result);
  };

  // Export full machine-readable passport as JSON
  const handleExportPassportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(selectedPassport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${selectedPassport.code}_metric_passport.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Mint new custom passport
  const handleMintCustomPassport = (newPassport: MetricPassport) => {
    setPassports(prev => [newPassport, ...prev]);
    setSelectedId(newPassport.id);
  };

  // Add experiment to metric
  const handleAddExperiment = (metricId: string, experiment: ExperimentVersion) => {
    setPassports(prev => prev.map(p => {
      if (p.id === metricId) {
        return {
          ...p,
          experiments: [...(p.experiments || []), experiment],
        };
      }
      return p;
    }));
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans transition-colors selection:bg-emerald-500 selection:text-white">
      
      {/* Top Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        seniorMode={activeMainTab === 'senior' || showSeniorMode}
        onToggleSeniorMode={() => {
          if (activeMainTab === 'senior') {
            setActiveMainTab('passport');
          } else {
            setActiveMainTab('senior');
          }
        }}
        researchMode={activeMainTab === 'research' || showResearchMode}
        onToggleResearchMode={() => {
          if (activeMainTab === 'research') {
            setActiveMainTab('passport');
          } else {
            setActiveMainTab('research');
          }
        }}
        onOpenCustomBuilder={() => setShowCustomBuilder(true)}
        onExecuteNlQuery={handleExecuteNlQuery}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Core Question & Navigation Tab Ribbon */}
        <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Machine-Readable Metric Provenance
              </div>
              <h2 className="text-sm sm:text-base font-semibold text-stone-900 dark:text-stone-100">
                &ldquo;Exactly where did this number come from?&rdquo;
              </h2>
              <p className="text-xs text-stone-600 dark:text-stone-400 max-w-2xl">
                Every critical KPI possesses a machine-verifiable passport containing exact SQL lineage, transformation filters, GAAP refund exclusions, data quality test results, and row-level evidence.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowEvidence(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors shadow-xs"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Show Me The Evidence</span>
              </button>
              <button
                onClick={() => setShowImpact(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-md transition-colors"
              >
                <span>Metric Change Impact</span>
              </button>
            </div>
          </div>

          {/* Primary View Mode Switcher: Passport vs Research vs Senior Architecture */}
          <div className="flex items-center justify-between border-t border-stone-100 dark:border-stone-800 pt-3">
            <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-950 rounded-lg text-xs">
              <button
                onClick={() => setActiveMainTab('passport')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-colors font-medium ${
                  activeMainTab === 'passport'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Metric Passport</span>
              </button>

              <button
                onClick={() => setActiveMainTab('research')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-colors font-medium ${
                  activeMainTab === 'research'
                    ? 'bg-white dark:bg-stone-800 text-amber-700 dark:text-amber-300 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                <Beaker className="w-4 h-4 text-amber-500" />
                <span>Research Mode (Experiments)</span>
              </button>

              <button
                onClick={() => setActiveMainTab('senior')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-colors font-medium ${
                  activeMainTab === 'senior'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                <FileCode2 className="w-4 h-4 text-stone-400" />
                <span>Senior Architecture</span>
              </button>
            </div>

            <div className="text-[11px] font-mono text-stone-500 hidden sm:block">
              {activeMainTab === 'passport' && `Active: ${selectedPassport.name} (${selectedPassport.version})`}
              {activeMainTab === 'research' && `Researching: ${selectedPassport.name} Counterfactuals`}
              {activeMainTab === 'senior' && `Contract SLA: <${selectedPassport.freshness.slaMinutes}m · SHA256`}
            </div>
          </div>
        </div>

        {/* VIEW 1: METRIC PASSPORT VIEW */}
        {activeMainTab === 'passport' && (
          <div className="space-y-6">
            {/* Metric Switcher Cards */}
            <section aria-label="Metric Selection Cards">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Active Enterprise Metrics
                </span>
                <span className="text-[11px] font-mono text-stone-500">
                  {passports.length} Certified Passports
                </span>
              </div>
              <MetricCards
                passports={passports}
                selectedId={selectedId}
                onSelectMetric={setSelectedId}
              />
            </section>

            {/* The Signature "Metric Passport" */}
            <section aria-label="Signature Metric Passport">
              <PassportView
                passport={selectedPassport}
                currentRole={currentRole}
                onOpenEvidence={() => setShowEvidence(true)}
                onOpenImpact={() => setShowImpact(true)}
                onOpenTrustDetail={() => setShowTrustDetail(true)}
                onOpenLineageGraph={() => setShowLineageGraph(true)}
                onOpenAnomalyDetector={() => setShowAnomalyDetector(true)}
                onExportJson={handleExportPassportJson}
              />
            </section>
          </div>
        )}

        {/* VIEW 2: DEDICATED RESEARCH PAGE */}
        {activeMainTab === 'research' && (
          <section aria-label="Research and Experiment Comparison">
            <ResearchModeView
              passports={passports}
              selectedPassportId={selectedId}
              onSelectPassportId={setSelectedId}
              onAddExperiment={handleAddExperiment}
              isEmbedded={true}
            />
          </section>
        )}

        {/* VIEW 3: DEDICATED SENIOR ARCHITECTURE PAGE */}
        {activeMainTab === 'senior' && (
          <section aria-label="Senior Architecture & Governance">
            <SeniorModeView
              passport={selectedPassport}
              onClose={() => setActiveMainTab('passport')}
            />
          </section>
        )}

        {/* Quick Lens Switcher Bar */}
        <div className="p-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600 dark:text-stone-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-900 dark:text-stone-100">Role Coverage:</span>
            <span>Current view customized for <strong>{currentRole}</strong> lens.</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(['Data Engineer', 'Data Analyst', 'Data Scientist', 'Business Analyst', 'Research Engineer'] as Role[]).map(role => (
              <button
                key={role}
                onClick={() => setCurrentRole(role)}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  currentRole === role
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-semibold'
                    : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

      </main>

      {/* MODALS */}

      {/* 1. Evidence Inspector Modal */}
      {showEvidence && (
        <EvidenceInspector
          passport={selectedPassport}
          onClose={() => setShowEvidence(false)}
        />
      )}

      {/* 2. Metric Change Impact Simulator */}
      {showImpact && (
        <ImpactSimulator
          passport={selectedPassport}
          onClose={() => setShowImpact(false)}
        />
      )}

      {/* 3. Explainable Trust Score Breakdown */}
      {showTrustDetail && (
        <TrustScoreDetail
          passport={selectedPassport}
          onClose={() => setShowTrustDetail(false)}
        />
      )}

      {/* 4. Lineage DAG Graph */}
      {showLineageGraph && (
        <LineageGraph
          passport={selectedPassport}
          onClose={() => setShowLineageGraph(false)}
        />
      )}

      {/* 5. Anomaly Detector */}
      {showAnomalyDetector && (
        <AnomalyDetector
          passport={selectedPassport}
          onClose={() => setShowAnomalyDetector(false)}
        />
      )}

      {/* 6. Research Mode Modal (if triggered via shortcut or modal state) */}
      {showResearchMode && activeMainTab !== 'research' && (
        <ResearchModeView
          passports={passports}
          selectedPassportId={selectedId}
          onSelectPassportId={setSelectedId}
          onClose={() => setShowResearchMode(false)}
          onAddExperiment={handleAddExperiment}
          isEmbedded={false}
        />
      )}

      {/* 7. Senior Mode Modal */}
      {showSeniorMode && activeMainTab !== 'senior' && (
        <SeniorModeView
          passport={selectedPassport}
          onClose={() => setShowSeniorMode(false)}
        />
      )}

      {/* 8. Custom Metric Builder */}
      {showCustomBuilder && (
        <CustomMetricBuilder
          onClose={() => setShowCustomBuilder(false)}
          onMintPassport={handleMintCustomPassport}
        />
      )}

      {/* 9. Natural Language Query Analysis Result */}
      {nlResult && (
        <NlAnalysisResultModal
          request={nlResult}
          onClose={() => setNlResult(null)}
          onViewPassport={() => {
            setNlResult(null);
            setShowEvidence(true);
          }}
        />
      )}

    </div>
  );
}
