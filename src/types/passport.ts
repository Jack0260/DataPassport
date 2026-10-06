export type Role = 
  | 'Data Engineer'
  | 'Data Analyst'
  | 'Data Scientist'
  | 'ML Engineer'
  | 'Business Analyst'
  | 'AI Engineer'
  | 'Backend Engineer'
  | 'Platform Engineer'
  | 'Research Engineer';

export interface DataQualityCheck {
  id: string;
  name: string;
  assertion: string;
  type: 'null_check' | 'range_check' | 'foreign_key' | 'uniqueness' | 'freshness' | 'schema_drift';
  status: 'passed' | 'failed' | 'warning';
  evaluatedRows: number;
  failedRows: number;
  lastRun: string;
  details: string;
}

export interface LineageStep {
  stepNumber: number;
  name: string;
  type: 'source' | 'filter' | 'transformation' | 'join' | 'aggregation';
  description: string;
  sqlSnippet: string;
  inputRowCount: number;
  outputRowCount: number;
  rowsDropped: number;
  executionTimeMs: number;
  transformationLogic: string;
  fieldsAffected: string[];
}

export interface SupportingRow {
  id: string;
  order_id: string;
  customer_id: string;
  customer_name: string;
  segment: 'Enterprise' | 'Mid-Market' | 'SMB' | 'Consumer';
  region: 'APAC' | 'EMEA' | 'NA' | 'LATAM';
  raw_amount: number;
  currency: string;
  fx_rate: number;
  converted_amount_inr: number;
  order_status: 'COMPLETED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED' | 'DISPUTED';
  refund_flag: boolean;
  refund_amount?: number;
  created_at: string;
  inclusionStatus: 'Included' | 'Excluded: Status' | 'Excluded: Refunded' | 'Excluded: Disputed';
  exclusionReason?: string;
  [key: string]: any;
}

export interface TrustScoreBreakdown {
  totalScore: number; // 0 - 100
  rating: 'High Trust' | 'Medium Trust' | 'Low Trust' | 'Degraded';
  factors: {
    freshness: {
      score: number;
      weight: number;
      maxScore: number;
      explanation: string;
      value: string;
      slaTarget: string;
      status: 'healthy' | 'warning' | 'critical';
    };
    validation: {
      score: number;
      weight: number;
      maxScore: number;
      explanation: string;
      value: string;
      totalChecks: number;
      passedChecks: number;
      status: 'healthy' | 'warning' | 'critical';
    };
    lineageCompleteness: {
      score: number;
      weight: number;
      maxScore: number;
      explanation: string;
      value: string;
      mappedNodes: number;
      totalNodes: number;
      status: 'healthy' | 'warning' | 'critical';
    };
    sourceReliability: {
      score: number;
      weight: number;
      maxScore: number;
      explanation: string;
      value: string;
      uptimePercent: number;
      status: 'healthy' | 'warning' | 'critical';
    };
    recentAnomalies: {
      score: number;
      weight: number;
      maxScore: number;
      explanation: string;
      value: string;
      zScore: number;
      anomalyCount: number;
      status: 'healthy' | 'warning' | 'critical';
    };
    transformationStability: {
      score: number;
      weight: number;
      maxScore: number;
      explanation: string;
      value: string;
      daysSinceBreakingChange: number;
      status: 'healthy' | 'warning' | 'critical';
    };
  };
  mathematicalFormula: string;
  lastCalculated: string;
}

export interface ImpactedEntity {
  id: string;
  name: string;
  type: 'metric' | 'report' | 'dashboard' | 'ml_feature' | 'downstream_consumer';
  owner: string;
  currentValue?: string;
  projectedValue?: string;
  projectedDelta?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
}

export interface MetricImpactScenario {
  id: string;
  title: string;
  ruleChangeDescription: string;
  sqlDiff: {
    before: string;
    after: string;
  };
  simulatedMetricDelta: string;
  simulatedDeltaPercent: string;
  metricsAffected: ImpactedEntity[];
  reportsAffected: ImpactedEntity[];
  dashboardsAffected: ImpactedEntity[];
  mlFeaturesAffected: ImpactedEntity[];
  downstreamConsumers: ImpactedEntity[];
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
  expectedMean: number;
  upperBound2Sigma: number;
  lowerBound2Sigma: number;
  upperBound3Sigma: number;
  lowerBound3Sigma: number;
  isAnomaly: boolean;
  zScore: number;
  note?: string;
}

export interface DataContract {
  contractId: string;
  version: string;
  metricName: string;
  serviceTier: 'Tier 1 - Mission Critical' | 'Tier 2 - Operational' | 'Tier 3 - Analytical';
  ownerTeam: string;
  slackContact: string;
  schemaContractYaml: string;
  slas: {
    freshnessMinutes: number;
    availabilityPercent: number;
    errorRateThreshold: number;
    maxSchemaDriftDays: number;
  };
  consumers: string[];
  signatureHash: string;
  certifiedDate: string;
}

export interface ExperimentVersion {
  id: string;
  code: string;
  name: string;
  version: string;
  author: string;
  status: 'active' | 'baseline' | 'deprecated';
  createdDate: string;
  hypothesis: string;
  sqlDefinition: string;
  metricResult: string;
  deltaVsBaseline: string;
  sampleSize: number;
  pValSignificance?: number;
  differences: string[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: 'METRIC_DEFINITION_UPDATED' | 'CONTRACT_APPROVED' | 'RULE_OVERRIDDEN' | 'SLA_BREACH_LOGGED' | 'PASSPORT_MINTED';
  description: string;
  diffSummary: string;
  commitHash: string;
}

export interface ArchitectureDecisionRecord {
  id: string;
  title: string;
  status: 'Accepted' | 'Proposed' | 'Superseded';
  date: string;
  author: string;
  context: string;
  decision: string;
  consequences: string;
}

export interface MetricPassport {
  id: string;
  code: string;
  name: string;
  category: 'Financial' | 'Growth' | 'Engagement' | 'Operational' | 'Unit Economics';
  currentValue: string;
  numericValue: number;
  unit: string;
  period: string;
  status: 'Certified' | 'Under Review' | 'Deprecated';
  version: string;
  gitCommit: string;
  owner: {
    name: string;
    team: string;
    email: string;
    slackChannel: string;
  };
  freshness: {
    lastUpdated: string;
    updateFrequency: string;
    nextExpectedRun: string;
    pipelineName: string;
    runId: string;
    latencyMinutes: number;
    slaMinutes: number;
  };
  sourceData: {
    database: string;
    schema: string;
    primaryTable: string;
    upstreamTables: string[];
    rawRowCount: number;
    storageType: string;
    retentionDays: number;
  };
  transformationSteps: LineageStep[];
  filtersApplied: {
    name: string;
    condition: string;
    rationale: string;
    rowsExcluded: number;
  }[];
  aggregationDetails: {
    function: string;
    targetColumn: string;
    groupByColumns: string[];
    nullHandling: string;
  };
  validationChecks: DataQualityCheck[];
  trustScore: TrustScoreBreakdown;
  impactScenarios: MetricImpactScenario[];
  timeSeriesData: TimeSeriesPoint[];
  contract: DataContract;
  experiments: ExperimentVersion[];
  supportingRows: SupportingRow[];
}
